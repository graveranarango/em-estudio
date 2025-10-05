import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../../index.tsx';
import { DatabaseService } from '../../shared/db.ts';
import { RateLimiter } from '../../shared/rate_limit.ts';

export async function handleThreadSave(request: Request): Promise<Response> {
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

    // 2. Rate limiting check
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

    // 3. Parse request body
    const body = await request.text();
    console.log('Thread save request body:', body);

    let threadData: { 
      id?: string; 
      title?: string; 
      objective?: string; 
      system?: string;
      settings?: any;
      meta?: any;
    };

    try {
      threadData = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response('Invalid JSON in request body', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 4. Initialize database service
    const db = new DatabaseService();
    const startTime = Date.now();

    // 5. Create or update thread
    let thread;
    let isNew = false;

    if (threadData.id) {
      // Update existing thread
      const existingThread = await db.getThread(threadData.id, userId);
      
      if (!existingThread) {
        return new Response('Thread not found or access denied', { 
          status: 404,
          headers: corsHeaders 
        });
      }

      // Prepare updates
      const updates: any = {};
      if (threadData.title !== undefined) updates.title = threadData.title;
      if (threadData.objective !== undefined) updates.objective = threadData.objective;
      if (threadData.system !== undefined) updates.system = threadData.system;
      if (threadData.settings !== undefined) updates.settings = threadData.settings;
      if (threadData.meta !== undefined) {
        updates.meta = { ...existingThread.meta, ...threadData.meta };
      }

      if (Object.keys(updates).length === 0) {
        return new Response('No updates provided', { 
          status: 400,
          headers: corsHeaders 
        });
      }

      thread = await db.updateThread(threadData.id, userId, updates);

      await db.logEvent({
        user_id: userId,
        thread_id: thread.id,
        stage: 'thread_update',
        latency_ms: Date.now() - startTime,
        tokens: 0,
        info: {
          updates: Object.keys(updates),
          fieldsChanged: Object.keys(updates).length
        }
      });

    } else {
      // Create new thread
      isNew = true;
      
      thread = await db.createThread(userId, {
        title: threadData.title || 'New Chat',
        objective: threadData.objective,
        system: threadData.system || 'You are a helpful AI assistant.',
        settings: threadData.settings || { 
          model: 'gpt-5', 
          temperature: 0.3, 
          persona: 'mentor',
          brandGuard: true 
        },
        meta: threadData.meta || {}
      });

      await db.logEvent({
        user_id: userId,
        thread_id: thread.id,
        stage: 'thread_create',
        latency_ms: Date.now() - startTime,
        tokens: 0,
        info: {
          title: thread.title,
          hasObjective: !!thread.objective,
          hasCustomSystem: !!threadData.system,
          hasCustomSettings: !!threadData.settings
        }
      });
    }

    // 6. Log the operation
    const latency = Date.now() - startTime;
    await rateLimiter.logRequest(
      userId,
      thread.id,
      isNew ? 'thread_create' : 'thread_update',
      latency,
      0, // No tokens for thread operations
      isNew ? 'create' : 'update'
    );

    // 7. Return success response
    return new Response(JSON.stringify({
      success: true,
      thread: {
        id: thread.id,
        title: thread.title,
        objective: thread.objective,
        system: thread.system,
        settings: thread.settings,
        meta: thread.meta,
        created_at: thread.created_at,
        updated_at: thread.updated_at
      },
      operation: isNew ? 'created' : 'updated',
      savedAt: new Date().toISOString()
    }), {
      status: isNew ? 201 : 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }
    });

  } catch (error) {
    console.error('Thread save error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to save thread',
      message: error.message
    }), { 
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}