import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../index.tsx';
import { ChatRequest, SSEEvent } from '../shared/contracts.ts';
import { FeatureFlags } from '../shared/flags.ts';
import { RateLimiter } from '../shared/rate_limit.ts';
import { BrandGuard } from '../shared/guard.brand.ts';
import { ChatOrchestrator } from '../shared/orchestrator.ts';
import { DatabaseService } from '../shared/db.ts';

export async function handleChatStream(request: Request): Promise<Response> {
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

  // Security: Check Content-Type
  const contentType = request.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return new Response('Invalid Content-Type', { 
      status: 400,
      headers: corsHeaders 
    });
  }

  let userId: string;
  let chatRequest: ChatRequest;

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

    // 2. Parse and validate request body
    const body = await request.text();
    const truncatedBody = body.length > 1024 ? body.substring(0, 1024) + '...' : body;
    console.log('Chat request body (truncated):', truncatedBody);

    try {
      chatRequest = JSON.parse(body) as ChatRequest;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response('Invalid JSON in request body', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 3. Validate request schema
    if (!chatRequest.threadId || !chatRequest.messages || !chatRequest.settings) {
      return new Response('Missing required fields: threadId, messages, settings', { 
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

    // 5. Initialize services
    const flags = FeatureFlags.fromEnv();
    const brandGuard = new BrandGuard();
    const db = new DatabaseService();
    const orchestrator = new ChatOrchestrator(flags, brandGuard, db);

    // 6. Check quotas
    const quotaCheck = await db.checkQuota(userId);
    if (!quotaCheck.allowed) {
      return new Response('Daily quota exceeded', { 
        status: 429,
        headers: {
          ...corsHeaders,
          'X-Quota-Remaining-Tokens': quotaCheck.limits.tokensRemaining.toString(),
          'X-Quota-Remaining-Requests': quotaCheck.limits.requestsRemaining.toString()
        }
      });
    }

    // 7. Set up SSE stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Send SSE formatted events
    const sendEvent = (event: SSEEvent) => {
      const sseData = `data: ${JSON.stringify(event)}\n\n`;
      writer.write(new TextEncoder().encode(sseData));
    };

    // Start orchestration in background
    const startTime = Date.now();
    orchestrator.orchestrate(chatRequest, userId, sendEvent).then(async () => {
      // Log successful completion
      const latency = Date.now() - startTime;
      await rateLimiter.logRequest(
        userId, 
        chatRequest.threadId, 
        'complete', 
        latency, 
        100 // Mock token count
      );
      
      // Close the stream
      await writer.close();
    }).catch(async (error) => {
      console.error('Orchestration error:', error);
      
      // Send final error event
      sendEvent({
        type: 'error',
        data: {
          code: 'ORCHESTRATION_FAILED',
          message: 'Internal server error during chat generation'
        }
      });

      // Log error
      const latency = Date.now() - startTime;
      await rateLimiter.logRequest(
        userId, 
        chatRequest.threadId, 
        'error', 
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
    console.error('Chat stream error:', error);
    
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