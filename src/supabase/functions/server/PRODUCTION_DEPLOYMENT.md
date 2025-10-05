# Chat Service - Production Deployment Guide

## Overview

Esta es la implementación completa de producción del ChatGPT-5 Orchestrator con persistencia, adapters en vivo, autenticación robusta y observabilidad completa.

## ✅ Características Implementadas

### Backend Core
- ✅ **Base de datos completa** con RLS y políticas de seguridad
- ✅ **Adapters en vivo** para web search, PDF, audio transcription, image analysis, calculator
- ✅ **Persistencia completa** de threads, messages, attachments, events
- ✅ **Sistema de quotas** con límites diarios por usuario
- ✅ **Rate limiting** avanzado (per-user + per-IP)
- ✅ **Signed uploads** para attachments con buckets seguros
- ✅ **Observabilidad completa** con logging y métricas

### Seguridad
- ✅ **JWT obligatorio** con verificación de rol `internal`
- ✅ **RLS activo** en todas las tablas
- ✅ **CORS restrictivo** solo para dominio interno
- ✅ **PII redaction** en logs
- ✅ **IP allowlisting** para redes internas
- ✅ **Feature flags** para control granular

### APIs y Endpoints
- ✅ **POST /api/chat/stream** - Streaming SSE con persistencia
- ✅ **POST /api/chat/abort** - Cancelación de generaciones
- ✅ **POST /api/chat/regenerate** - Regeneración con nudging
- ✅ **POST /api/chat/attach/sign** - Signed uploads para archivos
- ✅ **POST /api/thread/save** - Crear/actualizar threads

## 🚀 Deployment Checklist

### 1. Database Setup
```sql
-- Aplicar migración
psql -h <SUPABASE_HOST> -U postgres -d postgres -f /supabase/migrations/002_chat.sql

-- Verificar tablas creadas
\dt

-- Verificar RLS activo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('threads', 'messages', 'attachments', 'events', 'quotas', 'share_links');
```

### 2. Storage Setup
```bash
# Crear bucket en Supabase Console o CLI
supabase storage create chat-uploads --private

# Configurar políticas de storage
# (se hace automáticamente con RLS)
```

### 3. Environment Variables
```bash
# APIs requeridas
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret

# AI Services
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_cse_id

# Optional services
BING_SEARCH_API_KEY=your_bing_key
AZURE_VISION_ENDPOINT=your_azure_endpoint
AZURE_VISION_API_KEY=your_azure_key
DEEPGRAM_API_KEY=your_deepgram_key

# Feature flags (production)
FEATURE_FLAGS=brand_guard.precheck,handoff.google_ia.payload_only

# Network security (optional)
IP_ALLOWLIST=10.0.0.0/8,192.168.0.0/16
```

### 4. Function Deployment
```bash
# Deploy a Supabase
supabase functions deploy server --no-verify-jwt

# O deploy a Vercel (alternativo)
vercel deploy --prod
```

### 5. Post-Deploy Verification

#### Health Check
```bash
curl -X GET https://your-project.supabase.co/functions/v1/make-server-ecf7df64/health
```

#### AI Models Check
```bash
curl -X GET https://your-project.supabase.co/functions/v1/make-server-ecf7df64/ai-models
```

#### Test Chat Stream
```bash
curl -N -X POST https://your-project.supabase.co/functions/v1/make-server-ecf7df64/api/chat/stream \
  -H 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "threadId": "test_thread_prod",
    "system": "You are a helpful assistant.",
    "messages": [{
      "id": "msg_1",
      "role": "user", 
      "parts": [{"type": "text", "value": "Hello production!"}]
    }],
    "settings": {
      "model": "gpt-5",
      "temperature": 0.3,
      "persona": "mentor",
      "brandGuard": true
    },
    "tools": []
  }'
```

## 📊 Monitoring & Observability

### Database Queries for Monitoring
```sql
-- User activity stats
SELECT 
  user_id,
  COUNT(*) as total_requests,
  SUM(tokens) as total_tokens,
  AVG(latency_ms) as avg_latency
FROM events 
WHERE ts > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY total_requests DESC;

-- Error rate by stage
SELECT 
  stage,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE code LIKE '%error%') as errors,
  ROUND(COUNT(*) FILTER (WHERE code LIKE '%error%') * 100.0 / COUNT(*), 2) as error_rate_pct
FROM events 
WHERE ts > NOW() - INTERVAL '1 hour'
GROUP BY stage
ORDER BY error_rate_pct DESC;

-- Tool performance
SELECT 
  tool,
  COUNT(*) as executions,
  AVG(latency_ms) as avg_latency,
  MAX(latency_ms) as max_latency,
  COUNT(*) FILTER (WHERE stage LIKE '%error%') as failures
FROM events 
WHERE tool IS NOT NULL 
AND ts > NOW() - INTERVAL '24 hours'
GROUP BY tool
ORDER BY executions DESC;

-- Quota usage
SELECT 
  u.email,
  q.tokens_used,
  q.requests_count,
  q.attachments_mb,
  ROUND(q.tokens_used * 100.0 / 200000, 2) as token_usage_pct
FROM quotas q
JOIN auth.users u ON q.user_id = u.id
WHERE q.period_start >= CURRENT_DATE
ORDER BY q.tokens_used DESC;
```

### Alerts to Set Up
- **LLM_FAIL > 5/min** - OpenAI API failures
- **TOOL_FAIL > 5/min** - Tool adapter failures  
- **latency_p95 > 8s** - High response latency
- **quota_exceeded** - Users hitting daily limits
- **storage_quota** - Attachment storage limits

## 🔧 Configuration Options

### Feature Flags
```bash
# Production (live tools, brand guard, Google IA payload only)
FEATURE_FLAGS=brand_guard.precheck,handoff.google_ia.payload_only

# Staging (dry run tools for testing)
FEATURE_FLAGS=adapters.dry_run,brand_guard.precheck,handoff.google_ia.payload_only

# Development (all features enabled)
FEATURE_FLAGS=adapters.dry_run,brand_guard.precheck,handoff.google_ia.payload_only
```

### Rate Limits (configurable in code)
```typescript
// Default production limits
per_user_per_minute: 30
burst: 10
per_ip_per_minute: 60

// Daily quotas
per_user_day_tokens: 200000
per_thread_max_msgs: 500
attachments_max_mb: 500
```

## 🛠️ Troubleshooting

### Common Issues

1. **JWT Authentication Failed**
   - Verificar que el token tenga `role: 'internal'` en user_metadata
   - Verificar SUPABASE_JWT_SECRET correcto

2. **RLS Policy Denied**
   - Verificar que el usuario sea owner del thread
   - Verificar políticas RLS aplicadas correctamente

3. **Tool Failures**
   - Verificar API keys configuradas
   - Verificar timeouts y reintentos en adapters
   - Revisar logs de eventos en tabla `events`

4. **Storage Upload Failures**
   - Verificar bucket `chat-uploads` existe
   - Verificar políticas de storage
   - Verificar signed URL no expirada

5. **Quota Exceeded**
   - Revisar tabla `quotas` para usage actual
   - Ajustar límites si necesario
   - Implementar notificaciones para usuarios

### Debug Commands
```bash
# Ver logs en tiempo real
supabase functions logs server --follow

# Test specific tool
curl -X POST https://your-project.supabase.co/functions/v1/make-server-ecf7df64/test-gemini

# Check database connection
curl -X GET https://your-project.supabase.co/functions/v1/make-server-ecf7df64/health
```

## 🚦 Load Testing

### Basic Load Test
```bash
# Usar Artillery o similar
artillery quick --count 20 --num 10 \
  --output results.json \
  https://your-project.supabase.co/functions/v1/make-server-ecf7df64/api/chat/stream
```

### Performance Benchmarks
- **Response Time**: < 2s para respuestas simples
- **Tool Latency**: < 5s para tools complejos
- **Concurrent Users**: 50+ simultáneos
- **Throughput**: 100+ requests/min

## 📈 Next Steps

1. **Performance Optimization**
   - Implementar connection pooling
   - Optimizar queries de base de datos
   - Cache de respuestas frecuentes

2. **Advanced Features**
   - Streaming de tools en tiempo real
   - Multi-modal attachments
   - Thread branching y versioning

3. **Enterprise Features**
   - SSO integration
   - Advanced analytics dashboard
   - White-label customization

## 🔒 Security Considerations

- Todos los secrets están en variables de entorno
- RLS protege acceso multi-tenant
- Logs tienen PII redaction automática
- Rate limiting previene abuso
- CORS restringe acceso a dominio interno
- Attachments usan signed URLs seguras

---

**Status**: ✅ Production Ready
**Last Updated**: Octubre 2025
**Deployment Environment**: Supabase Edge Functions
**Architecture**: Serverless + PostgreSQL + Storage