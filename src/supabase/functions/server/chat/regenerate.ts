import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../index.tsx';
import { RegenerateRequest, ChatRequest, SSEEvent } from '../shared/contracts.ts';
import { FeatureFlags, CANARY_FLAGS } from '../shared/flags.ts';
import { RateLimiter } from '../shared/rate_limit.ts';
import { BrandGuard } from '../shared/guard.brand.ts';
import { ChatOrchestrator } from '../shared/orchestrator.ts';
import * as kv from '../kv_store.tsx';

export async function handleChatRegenerate(request: Request): Promise<Response> {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Security: Only allow POST
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  let userId: string;
  let regenerateRequest: RegenerateRequest;

  try {
    // 1. Auth: Validate JWT and role
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response('Missing or invalid Authorization header', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    const jwt = authHeader.substring(7);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    if (authError || !user) {
      console.log('Auth error:', authError?.message);
      return new Response('Invalid or expired token', { 
        status: 401,
        headers: corsHeaders 
      });
    }

    // Check for internal role
    const userMetadata = user.user_metadata || {};
    if (userMetadata.role !== 'internal') {
      console.log('Access denied for user:', user.id, 'role:', userMetadata.role);
      return new Response('Access denied: internal role required', { 
        status: 403,
        headers: corsHeaders 
      });
    }

    userId = user.id;

    // 2. Parse request body
    const body = await request.text();
    const truncatedBody = body.length > 1024 ? body.substring(0, 1024) + '...' : body;
    console.log('Regenerate request body (truncated):', truncatedBody);

    try {
      regenerateRequest = JSON.parse(body) as RegenerateRequest;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response('Invalid JSON in request body', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 3. Validate request
    if (!regenerateRequest.threadId || !regenerateRequest.messageId) {
      return new Response('Missing required fields: threadId, messageId', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 4. Rate limiting
    const rateLimiter = new RateLimiter();
    const rateLimitResult = await rateLimiter.checkRateLimit(userId);
    
    if (!rateLimitResult.allowed) {
      return new Response('Rate limit exceeded', { 
        status: 429,
        headers: {
          ...corsHeaders,
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      });
    }

    // 5. Retrieve original chat context
    const contextKey = `chat_context:${regenerateRequest.threadId}`;
    const originalContext = await kv.get(contextKey);
    
    if (!originalContext) {
      return new Response('Thread context not found', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // 6. Modify request based on nudge
    const modifiedRequest = this.applyRegenerateNudge(originalContext as ChatRequest, regenerateRequest.nudge);

    // 7. Initialize services
    const flags = new FeatureFlags(CANARY_FLAGS);
    const brandGuard = new BrandGuard();
    const orchestrator = new ChatOrchestrator(flags, brandGuard);

    // 8. Set up SSE stream for regeneration
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Send SSE formatted events
    const sendEvent = (event: SSEEvent) => {
      const sseData = `data: ${JSON.stringify(event)}\n\n`;
      writer.write(new TextEncoder().encode(sseData));
    };

    // Start regeneration orchestration in background
    const startTime = Date.now();
    orchestrator.orchestrate(modifiedRequest, sendEvent).then(async () => {
      // Log successful regeneration
      const latency = Date.now() - startTime;
      await rateLimiter.logRequest(
        userId,
        regenerateRequest.threadId,
        'regenerate',
        latency,
        100, // Mock token count
        regenerateRequest.nudge || 'none'
      );
      
      // Close the stream
      await writer.close();
    }).catch(async (error) => {
      console.error('Regeneration error:', error);
      
      // Send final error event
      sendEvent({
        type: 'error',
        data: {
          code: 'REGENERATION_FAILED',
          message: 'Internal server error during regeneration'
        }
      });

      // Log error
      const latency = Date.now() - startTime;
      await rateLimiter.logRequest(
        userId,
        regenerateRequest.threadId,
        'regenerate_error',
        latency,
        0,
        error.message
      );

      await writer.close();
    });

    // Return SSE response
    return new Response(readable, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Regenerate request error:', error);
    
    // PII redaction for logging
    const brandGuard = new BrandGuard();
    const redactedError = brandGuard.redactPII(error.message || 'Unknown error');
    console.error('Redacted error:', redactedError);

    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

function applyRegenerateNudge(originalRequest: ChatRequest, nudge?: string): ChatRequest {
  const modifiedRequest = { ...originalRequest };
  
  // Add system message with nudge instruction
  let nudgeInstruction = '';
  
  switch (nudge) {
    case 'shorter':
      nudgeInstruction = 'Please provide a more concise response, focusing on the key points.';
      break;
    case 'longer':
      nudgeInstruction = 'Please provide a more detailed and comprehensive response with examples and explanations.';
      break;
    case 'creative':
      nudgeInstruction = 'Please provide a more creative and innovative response with fresh perspectives.';
      break;
    case 'concise':
      nudgeInstruction = 'Please provide a brief, to-the-point response without unnecessary details.';
      break;
    default:
      nudgeInstruction = 'Please regenerate the response with a fresh perspective.';
  }

  // Inject nudge as system instruction
  modifiedRequest.system = `${originalRequest.system}\n\nRegeneration instruction: ${nudgeInstruction}`;
  
  // Slightly adjust temperature for variation
  if (nudge === 'creative') {
    modifiedRequest.settings.temperature = Math.min(1.0, modifiedRequest.settings.temperature + 0.2);
  } else if (nudge === 'concise') {
    modifiedRequest.settings.temperature = Math.max(0.0, modifiedRequest.settings.temperature - 0.1);
  }

  return modifiedRequest;
}