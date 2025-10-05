import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../index.tsx';
import { AbortRequest } from '../shared/contracts.ts';
import { RateLimiter } from '../shared/rate_limit.ts';
import * as kv from '../kv_store.tsx';

export async function handleChatAbort(request: Request): Promise<Response> {
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
  let abortRequest: AbortRequest;

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
    console.log('Abort request body:', body);

    try {
      abortRequest = JSON.parse(body) as AbortRequest;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response('Invalid JSON in request body', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 3. Validate request
    if (!abortRequest.threadId || !abortRequest.runId) {
      return new Response('Missing required fields: threadId, runId', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 4. Rate limiting check
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

    // 5. Process abort request
    const startTime = Date.now();
    
    try {
      // Set abort flag in KV store
      const abortKey = `abort_request:${abortRequest.threadId}:${abortRequest.runId}`;
      await kv.set(abortKey, {
        userId,
        threadId: abortRequest.threadId,
        runId: abortRequest.runId,
        timestamp: new Date().toISOString(),
        status: 'aborted'
      }, { ttl: 300 }); // Keep abort signal for 5 minutes

      console.log('Abort signal set for:', abortRequest.threadId, abortRequest.runId);

      // Log the abort event
      const latency = Date.now() - startTime;
      await rateLimiter.logRequest(
        userId,
        abortRequest.threadId,
        'abort',
        latency,
        0,
        'user_requested'
      );

      return new Response(JSON.stringify({
        success: true,
        threadId: abortRequest.threadId,
        runId: abortRequest.runId,
        message: 'Chat generation aborted successfully'
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      });

    } catch (abortError) {
      console.error('Failed to process abort request:', abortError);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to abort chat generation'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Abort request error:', error);
    
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
}