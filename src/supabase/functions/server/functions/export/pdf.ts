// PDF Export Function for Chat Maestro
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { ExportRequest, ProcessedThread } from '../../shared/export.types.ts';
import { serializeToHTML, generateFilename } from '../../shared/export.serializer.ts';
import { truncateForLog } from '../../shared/export.pii.ts';
import * as kv from '../../kv_store.tsx';

export async function exportToPDF(
  request: Request,
  supabase: ReturnType<typeof createClient>
): Promise<Response> {
  try {
    const body = await request.json();
    const exportReq: ExportRequest = body.req;
    
    console.log(`[PDF Export] Starting export for thread ${exportReq.threadId}, range: ${exportReq.range}`);
    
    // Validate request
    if (!exportReq.threadId || !exportReq.range) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: threadId, range' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user from auth
    const accessToken = request.headers.get('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    
    if (!user?.id || authError) {
      console.log(`[PDF Export] Auth error: ${authError?.message}`);
      return new Response('Unauthorized', { status: 401 });
    }
    
    // Fetch thread data from KV store
    const threadKey = `thread:${exportReq.threadId}`;
    const threadData = await kv.get(threadKey);
    
    if (!threadData) {
      console.log(`[PDF Export] Thread not found: ${exportReq.threadId}`);
      return new Response(
        JSON.stringify({ error: 'Thread not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user owns this thread
    if (threadData.userId !== user.id) {
      console.log(`[PDF Export] Access denied for user ${user.id} to thread ${exportReq.threadId}`);
      return new Response('Forbidden', { status: 403 });
    }
    
    // Process thread data
    const processedThread: ProcessedThread = {
      id: threadData.id,
      title: threadData.title || 'Chat sin título',
      system: threadData.system || '',
      messages: threadData.messages || [],
      createdAt: threadData.createdAt,
      updatedAt: threadData.updatedAt
    };
    
    // Filter messages if selection is specified
    let selectionIds: string[] | undefined;
    if (exportReq.range === 'selection' && exportReq.selectionIds) {
      selectionIds = exportReq.selectionIds;
    }
    
    // Generate HTML content optimized for PDF
    const htmlContent = serializeToHTML(
      processedThread,
      exportReq.cleanup,
      exportReq.range,
      selectionIds
    );
    
    // Add PDF-specific styling
    const pdfOptimizedHTML = addPDFStyling(htmlContent);
    
    // Generate PDF using Puppeteer (would require Puppeteer to be available)
    // For this implementation, we'll simulate PDF generation
    const pdfBuffer = await generatePDFFromHTML(pdfOptimizedHTML);
    
    // Generate filename
    const filename = generateFilename(
      processedThread.title,
      'pdf',
      exportReq.range
    );
    
    // Create exports bucket if it doesn't exist
    const bucketName = 'make-ecf7df64-exports';
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: bucketError } = await supabase.storage.createBucket(bucketName, {
        public: false,
        allowedMimeTypes: ['application/pdf']
      });
      
      if (bucketError) {
        console.error(`[PDF Export] Bucket creation failed: ${bucketError.message}`);
        throw new Error('Failed to create storage bucket');
      }
    }
    
    // Upload PDF to Supabase Storage
    const filePath = `${user.id}/${filename}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600' // 1 hour cache
      });
    
    if (uploadError) {
      console.error(`[PDF Export] Upload failed: ${uploadError.message}`);
      throw new Error('Failed to upload PDF');
    }
    
    // Generate signed URL with 24 hour expiration
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 86400); // 24 hours
    
    if (urlError || !signedUrlData?.signedUrl) {
      console.error(`[PDF Export] Signed URL creation failed: ${urlError?.message}`);
      throw new Error('Failed to create download URL');
    }
    
    console.log(`[PDF Export] Generated PDF file: ${filename} (${pdfBuffer.length} bytes)`);
    
    // Log event for analytics
    try {
      await kv.set(`event:export:${Date.now()}:${user.id}`, {
        stage: 'export',
        format: 'pdf',
        range: exportReq.range,
        threadId: exportReq.threadId,
        size_kb: Math.round(pdfBuffer.length / 1024),
        success: true,
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    } catch (eventError) {
      console.log(`[PDF Export] Event logging failed: ${eventError}`);
    }
    
    return new Response(
      JSON.stringify({
        filename,
        url: signedUrlData.signedUrl
      }),
      {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
    
  } catch (error) {
    console.error(`[PDF Export] Error during export: ${error}`);
    
    // Log failed event
    try {
      const accessToken = request.headers.get('Authorization')?.split(' ')[1];
      const { data: { user } } = await supabase.auth.getUser(accessToken);
      
      if (user?.id) {
        await kv.set(`event:export:${Date.now()}:${user.id}`, {
          stage: 'export',
          format: 'pdf',
          success: false,
          error: truncateForLog(error.toString()),
          timestamp: new Date().toISOString(),
          userId: user.id
        });
      }
    } catch (eventError) {
      console.log(`[PDF Export] Event logging failed: ${eventError}`);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'PDF export failed',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Adds PDF-specific styling to HTML
 */
function addPDFStyling(html: string): string {
  const pdfStyles = `
    <style>
      @page {
        size: A4;
        margin: 2cm;
      }
      
      body {
        font-size: 12pt;
        line-height: 1.4;
      }
      
      .message {
        page-break-inside: avoid;
        margin-bottom: 1.5rem;
      }
      
      .message-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        font-weight: 600;
        page-break-after: avoid;
      }
      
      .brand-guard-findings {
        page-break-inside: avoid;
      }
      
      @media print {
        .no-print { display: none !important; }
      }
    </style>
  `;
  
  return html.replace('</head>', pdfStyles + '</head>');
}

/**
 * Simulates PDF generation from HTML
 * In a real implementation, this would use Puppeteer or Playwright
 */
async function generatePDFFromHTML(html: string): Promise<Uint8Array> {
  // This is a simulation - in production you would use:
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();
  // await page.setContent(html);
  // const pdf = await page.pdf({ format: 'A4' });
  // await browser.close();
  // return pdf;
  
  // For now, we'll create a simple PDF-like buffer
  const encoder = new TextEncoder();
  const pdfHeader = '%PDF-1.4\n';
  const pdfContent = `1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length ${html.length}
>>
stream
${html}
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000189 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${html.length + 300}
%%EOF`;
  
  return encoder.encode(pdfHeader + pdfContent);
}