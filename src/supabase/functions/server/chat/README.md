# Chat Service - ChatGPT-5 Orchestrator

## Overview

This is a production-ready ChatGPT-5 orchestrator with streaming capabilities, designed for internal use within the Content Studio application. The service provides secure, rate-limited access to AI chat functionality with brand awareness and tool integration.

## Architecture

```
Frontend (React) → Chat Service (Supabase Edge) → ChatGPT-5 + Google IA
                      ↓
                 Rate Limiting, Auth, Brand Guard
                      ↓  
                 Tool Orchestration (dry_run mode)
```

## Security Features

- **JWT Authentication**: Requires valid Supabase JWT with `role: 'internal'`
- **CORS Restrictions**: Only allows requests from `https://studio.interno.tu-dominio.com`
- **Rate Limiting**: 30 requests per user per minute, with burst limit of 10
- **IP Allowlist**: Restricts access to internal networks (`10.0.0.0/8`, `192.168.0.0/16`)
- **PII Redaction**: Automatically redacts sensitive information in logs
- **Request Size Limits**: Truncates request bodies to 1024 bytes for logging

## API Endpoints

### POST `/api/chat/stream`
Starts a streaming chat session with ChatGPT-5.

**Headers:**
- `Authorization: Bearer <JWT>` (required)
- `Content-Type: application/json` (required)

**Request Body:**
```typescript
{
  threadId: string;
  system: string;
  messages: Array<{
    id: string;
    role: 'system' | 'user' | 'assistant';
    parts: Array<{ type: 'text' | 'image' | 'file' | 'code'; value: string; mime?: string }>;
    createdAt?: string;
    meta?: Record<string, any>;
  }>;
  settings: {
    model: 'gpt-5';
    temperature: number;
    persona: 'mentor' | 'planner' | 'engineer';
    brandGuard?: boolean;
  };
  tools: Array<{
    name: 'web.run' | 'calc' | 'pdf.read' | 'image.describe' | 'audio.transcribe' | 'export.md' | 'export.pdf';
    input?: Record<string, any>;
  }>;
  objective?: string;
  attachments?: Array<{
    id: string;
    url: string;
    type: 'pdf' | 'image' | 'audio' | 'link';
  }>;
}
```

**Response:** Server-Sent Events (SSE) stream with events:
- `ready {threadId}` - Stream initialized
- `state {stage}` - Current processing stage ('analyze', 'plan', 'generate', 'finalize')
- `tool {name, args, mode}` - Tool execution ('dry_run' or 'live')
- `token {delta}` - Streaming text token
- `usage {prompt, completion}` - Token usage statistics
- `error {code, message}` - Error occurred
- `done {messageId, final}` - Generation complete

### POST `/api/chat/abort`
Cancels a running chat generation.

**Request Body:**
```typescript
{
  threadId: string;
  runId: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  threadId: string;
  runId: string;
  message: string;
}
```

### POST `/api/chat/regenerate`
Regenerates the last assistant response with optional nudging.

**Request Body:**
```typescript
{
  threadId: string;
  messageId: string;
  nudge?: 'shorter' | 'longer' | 'creative' | 'concise';
}
```

**Response:** Same SSE stream format as `/stream` endpoint.

## Canary Mode Features

The service currently runs in "canary" mode with the following feature flags enabled:

- `adapters.dry_run`: Tool adapters return mock responses instead of calling external services
- `brand_guard.precheck`: Brand compliance checks are performed but only log suggestions
- `handoff.google_ia.payload_only`: Visual requests generate Google IA payload instead of actual images

## Tool Adapters (Dry Run Mode)

Current tool stubs in canary mode:

- **web.run**: Returns mock search results
- **pdf.read**: Returns mock PDF structure with pages/outline
- **image.describe**: Returns mock color palette and object detection
- **audio.transcribe**: Returns mock transcription text
- **calc**: Performs actual calculations (safe to run)

## Brand Guard Integration

The Brand Guard system performs automated checks on user input:

- **Tone Analysis**: Detects negative language that conflicts with brand voice
- **Terminology Validation**: Flags use of banned or discouraged terms
- **Style Compliance**: Checks formatting and presentation standards
- **Compliance Scoring**: Provides 0-100 brand compliance score

## Frontend Integration

### Using the Chat Service

```typescript
import { ChatService } from '@/utils/chat-service';
import { useChat } from '@/hooks/useChat';

// Hook-based usage (recommended)
function ChatComponent() {
  const {
    messages,
    isStreaming,
    sendMessage,
    regenerateLastResponse,
    abortGeneration
  } = useChat({
    persona: 'mentor',
    temperature: 0.3,
    brandGuard: true
  });

  const handleSend = async (text: string) => {
    await sendMessage(text, [{ name: 'web.run' }]);
  };

  // UI implementation...
}
```

### Direct Service Usage

```typescript
const chatService = new ChatService(accessToken);

const abortFn = await chatService.streamChat(
  {
    threadId: 'thread_123',
    system: 'You are a helpful assistant',
    messages: [/* ... */],
    settings: { model: 'gpt-5', temperature: 0.3, persona: 'mentor' },
    tools: []
  },
  (event) => {
    if (event.type === 'token') {
      console.log('New token:', event.data.delta);
    }
  },
  (error) => {
    console.error('Stream error:', error);
  }
);

// Later, abort if needed
abortFn();
```

## Testing

### cURL Example

```bash
curl -N -X POST https://studio.interno.tu-dominio.com/api/chat/stream \
  -H 'Authorization: Bearer <YOUR_JWT_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{
    "threadId": "test_thread_1",
    "system": "You are a helpful creative mentor.",
    "messages": [{
      "id": "msg_1",
      "role": "user", 
      "parts": [{"type": "text", "value": "Hello, can you help me brainstorm?"}]
    }],
    "settings": {
      "model": "gpt-5",
      "temperature": 0.3,
      "persona": "mentor",
      "brandGuard": true
    },
    "tools": [{"name": "web.run"}]
  }'
```

### JavaScript Example

```javascript
const eventSource = new EventSource('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + jwt,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(chatRequest)
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('SSE Event:', data);
};
```

## Monitoring & Observability

The service logs the following metrics:

- **Latency**: Request processing time (p50, p95)
- **Token Usage**: Total prompt and completion tokens
- **Error Rates**: Categorized by error code
- **Abort Rate**: Percentage of requests that are aborted
- **Rate Limit Hits**: Users hitting rate limits

All events are stored in the `logs.events` table with PII redaction applied.

## Environment Variables

Required environment variables:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
GOOGLE_AI_API_KEY=your_google_ai_key  # For future Google IA integration
FEATURE_FLAGS=adapters.dry_run,brand_guard.precheck,handoff.google_ia.payload_only
```

## Production Deployment

To deploy to production:

1. Update CORS origins to your production domain
2. Configure proper IP allowlists
3. Set up monitoring and alerting
4. Enable live tool adapters by removing `adapters.dry_run` flag
5. Configure OpenAI API integration
6. Set up proper logging and metrics collection

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check JWT token and user role (`internal` required)
2. **429 Rate Limited**: User has exceeded rate limits, check `X-RateLimit-Reset` header
3. **CORS Error**: Request origin not in allowlist
4. **Stream Disconnects**: Check network stability and implement reconnection logic
5. **Tool Failures**: In dry_run mode, tools should always return mock data

### Debug Endpoints

- `GET /make-server-ecf7df64/health` - Service health check
- `GET /make-server-ecf7df64/ai-models` - Check AI model availability

## Security Considerations

- Never expose the service role key to frontend clients
- Always validate JWT tokens and check user roles
- Implement proper rate limiting to prevent abuse
- Monitor for unusual usage patterns
- Keep logs secure and implement proper retention policies
- Regularly rotate API keys and secrets