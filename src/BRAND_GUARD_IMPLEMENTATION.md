# Brand Guard Middleware - Implementación Completa

## Resumen
Se ha implementado completamente el Brand Guard Middleware para el Chat Maestro, un sistema híbrido que evalúa cada mensaje (user→pre, assistant→post) contra las reglas del BrandKit y proporciona sugerencias sin bloquear el flujo.

## Componentes Implementados

### Backend
- **Guard Engine** (`/supabase/functions/server/shared/guard.engine.ts`): Motor principal híbrido (heurísticas + LLM)
- **Guard Heuristics** (`/supabase/functions/server/shared/guard.heuristics.ts`): Análisis rápido de formato, léxico y claims
- **Guard Prompts** (`/supabase/functions/server/shared/guard.prompt.ts`): Prompts para análisis LLM con ChatGPT-4
- **API Endpoints**:
  - `POST /api/guard/check`: Análisis de texto
  - `POST /api/guard/rules/update`: Actualización de reglas (admin)

### Frontend SDK
- **BrandGuardSDK** (`/src/sdk/guard/index.ts`): SDK tipado para interactuar con Brand Guard
- **Hook personalizado** (`/hooks/useBrandGuard.ts`): Hook React para gestión de estado
- **Tipos compartidos** (`/src/sdk/guard/types.ts`): Contratos TypeScript

### Componentes UI
- **BrandGuardChip** (`/components/chat/BrandGuardChip.tsx`): Chip compacto con popover
- **BrandGuardPanel** (`/components/chat/BrandGuardPanel.tsx`): Panel detallado de findings

### Integración en Chat
- **Pre-check**: Análisis automático de mensajes del usuario antes del envío
- **Post-check**: Análisis de respuestas del asistente tras completarse
- **UI integrada**: Chips en mensajes, panel expandible, estado en tiempo real

## Características Principales

### Motor Híbrido
1. **Heurísticas rápidas**: Conteo de signos, vocabulario, formato
2. **LLM inteligente**: Análisis de tono y claims con ChatGPT-4
3. **Merge optimizado**: Combina resultados y genera score 0-100

### Reglas de Evaluación
- **Tono**: Respeta readingLevel, emoji policy, exclamation limits
- **Léxico**: Preferred/avoid/banned terms con sugerencias
- **Claims**: Forbidden claims, disclaimer requirements
- **Formato**: Links policy, structural compliance

### UX No-Blocking
- **Solo sugerencias**: No bloquea el flujo, solo advierte
- **Aplicación opcional**: Usuario puede aplicar sugerencia con un click
- **Disclaimers automáticos**: Se añaden cuando son requeridos
- **Métricas internas**: Tracking de score, aplicación de sugerencias

## Configuración por Defecto
Cuando no hay BrandKit configurado, se usan reglas sensatas:
- Tono profesional, claro, consistente
- Evitar términos negativos o spam
- Máximo 1 exclamación, emojis deshabilitados
- Disclaimer estándar para claims dudosos

## Modo Demo
- Análisis en tiempo real del texto mientras se escribe
- Simulación completa sin dependencia del backend
- Muestra todas las capacidades del sistema

## Observabilidad
- Eventos de telemetría (`stage='brand_guard'`)
- Métricas: avg_score, warn_rate, suggestion_apply_rate
- Logs detallados para debugging

## Estado Actual
✅ Backend completamente funcional
✅ SDK frontend integrado
✅ UI components implementados
✅ Integración en ChatModuleUpdated
✅ Modo demo funcional
✅ Reglas por defecto configuradas
✅ Integración con BrandKitContext

## Próximos Pasos Opcionales
- [ ] Panel de administración para rules/update
- [ ] Métricas dashboard
- [ ] Integración con otros módulos (Posts, Videos, etc.)
- [ ] Reglas avanzadas personalizables por proyecto