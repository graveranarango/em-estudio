import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../../index.tsx';
import { DatabaseService } from '../../shared/db.ts';

export async function handleAttachmentSign(request: Request): Promise<Response> {
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

    // 2. Parse request body
    const body = await request.text();
    console.log('Attachment sign request body:', body);

    let requestData: { 
      mime: string; 
      threadId: string; 
      filename?: string; 
      size?: number; 
    };

    try {
      requestData = JSON.parse(body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response('Invalid JSON in request body', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 3. Validate request
    if (!requestData.mime || !requestData.threadId) {
      return new Response('Missing required fields: mime, threadId', { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 4. Validate MIME type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/m4a',
      'audio/ogg'
    ];

    if (!allowedMimeTypes.includes(requestData.mime)) {
      return new Response(`Unsupported file type: ${requestData.mime}`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 5. Check file size limit (if provided)
    const maxSizeMB = 50; // 50MB limit
    if (requestData.size && requestData.size > maxSizeMB * 1024 * 1024) {
      return new Response(`File too large. Maximum size: ${maxSizeMB}MB`, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    // 6. Initialize database service
    const db = new DatabaseService();

    // 7. Verify user owns the thread
    const thread = await db.getThread(requestData.threadId, userId);
    if (!thread) {
      return new Response('Thread not found or access denied', { 
        status: 404,
        headers: corsHeaders 
      });
    }

    // 8. Check quota
    const quotaCheck = await db.checkQuota(userId);
    const fileSizeMB = (requestData.size || 0) / (1024 * 1024);
    
    if (!quotaCheck.allowed || quotaCheck.limits.attachmentsMbRemaining < fileSizeMB) {
      return new Response('Quota exceeded for attachments', { 
        status: 429,
        headers: corsHeaders 
      });
    }

    // 9. Generate file path
    const fileExtension = getFileExtension(requestData.mime);
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().substring(0, 8);
    const filePath = `${userId}/${requestData.threadId}/${timestamp}_${randomId}${fileExtension}`;

    // 10. Create signed upload URL
    try {
      const { url, fields } = await db.createSignedUploadUrl(
        'chat-uploads',
        filePath,
        300 // 5 minutes
      );

      // 11. Create attachment record (pending upload)
      const attachment = await db.createAttachment({
        thread_id: requestData.threadId,
        url: filePath, // Store path, not signed URL
        filename: requestData.filename || `attachment_${timestamp}${fileExtension}`,
        kind: getAttachmentKind(requestData.mime),
        mime_type: requestData.mime,
        size_bytes: requestData.size,
        meta: {
          status: 'pending',
          uploadExpires: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        }
      });

      // 12. Update quota (reserve space)
      await db.updateQuota(userId, 0, 0, fileSizeMB);

      // 13. Log upload initiation
      await db.logEvent({
        user_id: userId,
        thread_id: requestData.threadId,
        stage: 'attachment_sign',
        tool: 'upload',
        latency_ms: 0,
        tokens: 0,
        info: {
          attachmentId: attachment.id,
          mime: requestData.mime,
          size: requestData.size,
          filename: requestData.filename
        }
      });

      return new Response(JSON.stringify({
        success: true,
        uploadUrl: url,
        fields,
        attachmentId: attachment.id,
        filePath,
        expiresIn: 300
      }), {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });

    } catch (storageError) {
      console.error('Failed to create signed upload URL:', storageError);
      
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to create upload URL'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

  } catch (error) {
    console.error('Attachment sign error:', error);
    
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

function getFileExtension(mimeType: string): string {
  const extensions: Record<string, string> = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/m4a': '.m4a',
    'audio/ogg': '.ogg'
  };
  
  return extensions[mimeType] || '.bin';
}

function getAttachmentKind(mimeType: string): 'pdf' | 'image' | 'audio' | 'link' {
  if (mimeType.startsWith('application/pdf') || mimeType.includes('document')) {
    return 'pdf';
  } else if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('audio/')) {
    return 'audio';
  } else {
    return 'link'; // Default for unknown types
  }
}