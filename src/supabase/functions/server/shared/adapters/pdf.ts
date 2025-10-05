// PDF Reading Adapter - Live Implementation
// Extracts text, structure, and metadata from PDF documents

export interface PDFPage {
  pageNumber: number;
  text: string;
  images?: number;
  tables?: PDFTable[];
}

export interface PDFTable {
  rows: string[][];
  headers?: string[];
  pageNumber: number;
}

export interface PDFOutlineItem {
  title: string;
  level: number;
  pageNumber?: number;
  children?: PDFOutlineItem[];
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
}

export interface PDFResponse {
  pages: PDFPage[];
  outline: PDFOutlineItem[];
  metadata: PDFMetadata;
  text: string; // Full extracted text
  processingTime: number;
  source: string;
}

export class PDFAdapter {
  private timeout: number;
  private retries: number;
  private backoffMs: number;

  constructor(config = { timeout: 20000, retries: 1, backoffMs: 800 }) {
    this.timeout = config.timeout;
    this.retries = config.retries;
    this.backoffMs = config.backoffMs;
  }

  async execute(input: { url?: string; buffer?: ArrayBuffer; extractTables?: boolean }): Promise<PDFResponse> {
    const { url, buffer, extractTables = true } = input;
    const startTime = Date.now();

    if (!url && !buffer) {
      throw new Error('Either URL or buffer must be provided');
    }

    try {
      // Try PDF processing with retry logic
      const result = await this.processWithRetry(async () => {
        if (buffer) {
          return await this.processPDFBuffer(buffer, extractTables);
        } else if (url) {
          return await this.processPDFFromURL(url, extractTables);
        }
        throw new Error('No valid input provided');
      });

      return {
        ...result,
        processingTime: Date.now() - startTime,
        source: 'PDF.js + Custom Parser'
      };

    } catch (error) {
      console.error('PDF processing failed:', error);
      
      // Return error response with what we can extract
      return {
        pages: [],
        outline: [],
        metadata: { pageCount: 0 },
        text: `Error processing PDF: ${error.message}`,
        processingTime: Date.now() - startTime,
        source: 'Error Response'
      };
    }
  }

  private async processWithRetry<T>(processFn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        try {
          const result = await processFn();
          clearTimeout(timeoutId);
          return result;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`PDF processing attempt ${attempt + 1} failed:`, error);
        
        if (attempt < this.retries) {
          const delay = this.backoffMs * Math.pow(2, attempt);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError || new Error('PDF processing failed after all retry attempts');
  }

  private async processPDFFromURL(url: string, extractTables: boolean): Promise<Omit<PDFResponse, 'processingTime' | 'source'>> {
    console.log('Fetching PDF from URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    return await this.processPDFBuffer(buffer, extractTables);
  }

  private async processPDFBuffer(buffer: ArrayBuffer, extractTables: boolean): Promise<Omit<PDFResponse, 'processingTime' | 'source'>> {
    console.log('Processing PDF buffer, size:', buffer.byteLength);

    try {
      // Try PDF.js first
      return await this.processPDFWithPDFJS(buffer, extractTables);
    } catch (error) {
      console.warn('PDF.js processing failed, trying fallback:', error);
      
      try {
        // Fallback to external PDF service
        return await this.processPDFWithExternalService(buffer, extractTables);
      } catch (fallbackError) {
        console.error('External PDF service also failed:', fallbackError);
        
        // Last resort: basic text extraction
        return await this.basicPDFExtraction(buffer);
      }
    }
  }

  private async processPDFWithPDFJS(buffer: ArrayBuffer, extractTables: boolean): Promise<Omit<PDFResponse, 'processingTime' | 'source'>> {
    // Import PDF.js dynamically
    const pdfjs = await import('npm:pdfjs-dist@4.0.379');
    
    // Configure PDF.js worker
    const workerSrc = 'https://unpkg.com/pdfjs-dist@4.0.379/build/pdf.worker.min.js';
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

    const pdf = await pdfjs.getDocument({ data: buffer }).promise;
    const metadata = await pdf.getMetadata();
    
    const pages: PDFPage[] = [];
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
      
      const pdfPage: PDFPage = {
        pageNumber: pageNum,
        text: pageText,
        images: 0 // PDF.js doesn't easily extract image count
      };

      // Extract tables if requested (basic implementation)
      if (extractTables) {
        pdfPage.tables = await this.extractTablesFromPage(page, pageNum);
      }

      pages.push(pdfPage);
    }

    // Extract outline/bookmarks
    const outline = await this.extractOutline(pdf);

    // Process metadata
    const processedMetadata: PDFMetadata = {
      title: metadata.info?.Title,
      author: metadata.info?.Author,
      subject: metadata.info?.Subject,
      creator: metadata.info?.Creator,
      producer: metadata.info?.Producer,
      creationDate: metadata.info?.CreationDate ? new Date(metadata.info.CreationDate) : undefined,
      modificationDate: metadata.info?.ModDate ? new Date(metadata.info.ModDate) : undefined,
      pageCount: pdf.numPages
    };

    return {
      pages,
      outline,
      metadata: processedMetadata,
      text: fullText.trim()
    };
  }

  private async extractTablesFromPage(page: any, pageNum: number): Promise<PDFTable[]> {
    // This is a simplified table extraction
    // In production, you'd use a more sophisticated table detection algorithm
    const textContent = await page.getTextContent();
    const tables: PDFTable[] = [];
    
    // Simple heuristic: look for text items that might form table structures
    const items = textContent.items;
    const lines: any[][] = [];
    let currentLine: any[] = [];
    let lastY = -1;
    
    for (const item of items) {
      if (lastY !== -1 && Math.abs(item.transform[5] - lastY) > 5) {
        if (currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
        }
      }
      currentLine.push(item);
      lastY = item.transform[5];
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }

    // Look for table-like patterns (multiple columns, consistent spacing)
    const potentialTables = lines.filter(line => 
      line.length > 2 && 
      line.some(item => /^\s*\|\s*/.test(item.str) || /\s*\|\s*$/.test(item.str))
    );

    if (potentialTables.length > 0) {
      const tableRows = potentialTables.map(line => 
        line.map(item => item.str.trim()).filter(text => text.length > 0)
      );

      if (tableRows.length > 1) {
        tables.push({
          rows: tableRows.slice(1), // Skip potential header
          headers: tableRows[0],
          pageNumber: pageNum
        });
      }
    }

    return tables;
  }

  private async extractOutline(pdf: any): Promise<PDFOutlineItem[]> {
    try {
      const outline = await pdf.getOutline();
      if (!outline) return [];

      return this.processOutlineItems(outline);
    } catch (error) {
      console.warn('Failed to extract PDF outline:', error);
      return [];
    }
  }

  private processOutlineItems(items: any[], level = 0): PDFOutlineItem[] {
    return items.map(item => ({
      title: item.title,
      level,
      pageNumber: item.dest ? this.getPageNumberFromDest(item.dest) : undefined,
      children: item.items ? this.processOutlineItems(item.items, level + 1) : undefined
    }));
  }

  private getPageNumberFromDest(dest: any): number | undefined {
    // Simplified page number extraction from destination
    if (Array.isArray(dest) && dest.length > 0) {
      return typeof dest[0] === 'number' ? dest[0] + 1 : undefined;
    }
    return undefined;
  }

  private async processPDFWithExternalService(buffer: ArrayBuffer, extractTables: boolean): Promise<Omit<PDFResponse, 'processingTime' | 'source'>> {
    const pdfServiceUrl = Deno.env.get('PDF_SERVICE_URL');
    const pdfApiKey = Deno.env.get('PDF_TOOL_KEY');
    
    if (!pdfServiceUrl || !pdfApiKey) {
      throw new Error('External PDF service not configured');
    }

    const formData = new FormData();
    formData.append('pdf', new Blob([buffer], { type: 'application/pdf' }));
    formData.append('extractTables', extractTables.toString());

    const response = await fetch(pdfServiceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pdfApiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PDF service error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    return {
      pages: result.pages || [],
      outline: result.outline || [],
      metadata: result.metadata || { pageCount: 0 },
      text: result.text || ''
    };
  }

  private async basicPDFExtraction(buffer: ArrayBuffer): Promise<Omit<PDFResponse, 'processingTime' | 'source'>> {
    // Very basic fallback - just return buffer size info
    console.warn('Using basic PDF extraction fallback');
    
    return {
      pages: [{
        pageNumber: 1,
        text: `PDF document (${buffer.byteLength} bytes) - text extraction failed. Please try with a different PDF or check the document format.`
      }],
      outline: [],
      metadata: {
        pageCount: 1
      },
      text: 'PDF processing failed - content not available'
    };
  }
}