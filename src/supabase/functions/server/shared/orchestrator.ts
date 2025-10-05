import { ChatRequest, SSEEvent, Tool, GoogleIARequest } from './contracts.ts';
import { FeatureFlags } from './flags.ts';
import { BrandGuard } from './guard.brand.ts';
import { DatabaseService } from './db.ts';

// Import live adapters
import { WebSearchAdapter } from './adapters/web.ts';
import { PDFAdapter } from './adapters/pdf.ts';
import { AudioTranscriptionAdapter } from './adapters/audio.ts';
import { ImageDescriptionAdapter } from './adapters/image.ts';
import { CalculatorAdapter } from './adapters/calc.ts';

export interface ToolAdapter {
  name: string;
  execute(input: any): Promise<any>;
}

export class ChatOrchestrator {
  private flags: FeatureFlags;
  private brandGuard: BrandGuard;
  private db: DatabaseService;
  private toolAdapters: Map<string, ToolAdapter>;
  private abortController?: AbortController;

  constructor(flags: FeatureFlags, brandGuard: BrandGuard, db: DatabaseService) {
    this.flags = flags;
    this.brandGuard = brandGuard;
    this.db = db;
    this.toolAdapters = this.initializeToolAdapters();
  }

  private initializeToolAdapters(): Map<string, ToolAdapter> {
    const adapters = new Map<string, ToolAdapter>();
    const isDryRun = this.flags.isEnabled('adapters.dry_run');

    if (isDryRun) {
      // Mock adapters for dry run mode
      adapters.set('web.run', {
        name: 'web.run',
        execute: async (input: any) => {
          return {
            query: input.query || 'test query',
            results: [{
              title: 'Resultado simulado',
              url: 'https://example.com/search-result',
              snippet: 'Información relevante encontrada en la búsqueda web simulada'
            }],
            totalResults: 1,
            timeTaken: 150,
            source: 'Mock Search'
          };
        }
      });

      adapters.set('pdf.read', {
        name: 'pdf.read',
        execute: async (input: any) => {
          return {
            pages: [{
              pageNumber: 1,
              text: 'Contenido del PDF simulado...'
            }],
            outline: [{ title: '1.Intro', level: 0 }, { title: '2.Terminos', level: 0 }],
            metadata: { pageCount: 14, title: 'Documento simulado' },
            text: 'Contenido completo del PDF simulado',
            processingTime: 200,
            source: 'Mock PDF Reader'
          };
        }
      });

      adapters.set('image.describe', {
        name: 'image.describe',
        execute: async (input: any) => {
          return {
            description: 'Imagen simulada con elementos de marca',
            colors: [{ hex: '#2563EB', percentage: 35, rgb: [37, 99, 235] }],
            objects: [{ name: 'logo', confidence: 0.9 }],
            text: [],
            metadata: { width: 800, height: 600, format: 'jpeg' },
            tags: ['producto', 'logo', 'marca'],
            faces: 0,
            processingTime: 100,
            source: 'Mock Vision'
          };
        }
      });

      adapters.set('audio.transcribe', {
        name: 'audio.transcribe',
        execute: async (input: any) => {
          return {
            text: 'Transcripción simulada del contenido de audio...',
            segments: [{
              start: 0,
              end: 10,
              text: 'Transcripción simulada del contenido de audio...',
              confidence: 0.95
            }],
            language: 'es',
            confidence: 0.95,
            duration: 120,
            processingTime: 300,
            source: 'Mock ASR',
            wordCount: 8
          };
        }
      });

      adapters.set('calc', {
        name: 'calc',
        execute: async (input: any) => {
          return {
            result: 42,
            expression: input.expression || 'simulación',
            isValid: true,
            processingTime: 10,
            source: 'Mock Calculator'
          };
        }
      });

    } else {
      // Live adapters for production mode
      const webAdapter = new WebSearchAdapter();
      const pdfAdapter = new PDFAdapter();
      const audioAdapter = new AudioTranscriptionAdapter();
      const imageAdapter = new ImageDescriptionAdapter();
      const calcAdapter = new CalculatorAdapter();

      adapters.set('web.run', {
        name: 'web.run',
        execute: async (input: any) => await webAdapter.execute(input)
      });

      adapters.set('pdf.read', {
        name: 'pdf.read',
        execute: async (input: any) => await pdfAdapter.execute(input)
      });

      adapters.set('image.describe', {
        name: 'image.describe',
        execute: async (input: any) => await imageAdapter.execute(input)
      });

      adapters.set('audio.transcribe', {
        name: 'audio.transcribe',
        execute: async (input: any) => await audioAdapter.execute(input)
      });

      adapters.set('calc', {
        name: 'calc',
        execute: async (input: any) => await calcAdapter.execute(input)
      });

      adapters.set('export.md', {
        name: 'export.md',
        execute: async (input: any) => {
          // Simple markdown export
          return {
            content: input.content || 'No content provided',
            format: 'markdown',
            filename: `export_${Date.now()}.md`,
            processingTime: 50,
            source: 'Markdown Exporter'
          };
        }
      });

      adapters.set('export.pdf', {
        name: 'export.pdf',
        execute: async (input: any) => {
          // PDF export would use puppeteer or similar
          return {
            success: true,
            message: 'PDF export functionality would be implemented here',
            processingTime: 100,
            source: 'PDF Exporter'
          };
        }
      });
    }

    return adapters;
  }

  async orchestrate(
    request: ChatRequest,
    userId: string,
    onEvent: (event: SSEEvent) => void
  ): Promise<void> {
    const startTime = Date.now();
    this.abortController = new AbortController();

    let thread: any = null;
    let userMessage: any = null;
    let assistantMessage: any = null;

    try {
      // Check if operation was aborted
      if (this.abortController?.signal.aborted) {
        throw new Error('Operation aborted');
      }

      // 1. Emit ready event
      onEvent({ type: 'ready', data: { threadId: request.threadId } });
      await this.logEvent(userId, request.threadId, 'ready', Date.now() - startTime);

      // 2. Analysis stage
      onEvent({ type: 'state', data: { stage: 'analyze' } });
      await this.logEvent(userId, request.threadId, 'analyze_start', Date.now() - startTime);

      // Get or create thread
      thread = await this.db.getThread(request.threadId, userId);
      if (!thread) {
        thread = await this.db.createThread(userId, {
          id: request.threadId,
          title: request.objective || 'New Chat',
          system: request.system,
          objective: request.objective,
          settings: request.settings
        });
      }

      // Persist user message
      const lastUserMessage = request.messages.filter(m => m.role === 'user').slice(-1)[0];
      if (lastUserMessage) {
        userMessage = await this.db.createMessage(request.threadId, {
          role: 'user',
          parts: lastUserMessage.parts,
          meta: lastUserMessage.meta || {},
          tokens: this.estimateTokens(lastUserMessage.parts.map(p => p.value).join(' '))
        });
      }

      // Brand guard precheck
      if (request.settings.brandGuard && this.flags.isEnabled('brand_guard.precheck')) {
        const brandCheck = await this.brandGuard.precheck(request);
        if (!brandCheck.passed) {
          await this.logEvent(userId, request.threadId, 'brand_guard_violation', Date.now() - startTime, undefined, {
            violations: brandCheck.violations,
            score: brandCheck.score
          });
          
          onEvent({ 
            type: 'error', 
            data: { 
              code: 'BRAND_GUARD_VIOLATION', 
              message: `Brand compliance issues: ${brandCheck.violations.map(v => v.message).join(', ')}` 
            } 
          });
          return;
        }
        
        // Log brand check passed
        await this.logEvent(userId, request.threadId, 'brand_guard_passed', Date.now() - startTime, undefined, {
          score: brandCheck.score,
          suggestions: brandCheck.suggestions
        });
      }

      // 3. Planning stage
      onEvent({ type: 'state', data: { stage: 'plan' } });
      await this.logEvent(userId, request.threadId, 'plan_start', Date.now() - startTime);
      
      const requiredTools = this.planToolUsage(request);
      await this.logEvent(userId, request.threadId, 'plan_complete', Date.now() - startTime, undefined, {
        toolsPlanned: requiredTools.map(t => t.name)
      });

      // 4. Tool execution
      const isDryRun = this.flags.isEnabled('adapters.dry_run');
      const toolResults: any[] = [];

      for (const tool of requiredTools) {
        // Check abort signal
        if (this.abortController?.signal.aborted) {
          throw new Error('Operation aborted during tool execution');
        }

        const toolStartTime = Date.now();
        
        onEvent({ 
          type: 'tool', 
          data: { 
            name: tool.name, 
            args: tool.input || {}, 
            mode: isDryRun ? 'dry_run' : 'live' 
          } 
        });

        const adapter = this.toolAdapters.get(tool.name);
        if (adapter) {
          try {
            const result = await adapter.execute(tool.input);
            const toolLatency = Date.now() - toolStartTime;
            
            toolResults.push({ tool: tool.name, result });
            
            await this.logEvent(userId, request.threadId, 'tool_success', toolLatency, tool.name, {
              input: tool.input,
              output: result,
              mode: isDryRun ? 'dry_run' : 'live'
            });
            
          } catch (error) {
            const toolLatency = Date.now() - toolStartTime;
            console.error(`Tool ${tool.name} failed:`, error);
            
            toolResults.push({ tool: tool.name, error: error.message });
            
            await this.logEvent(userId, request.threadId, 'tool_error', toolLatency, tool.name, {
              input: tool.input,
              error: error.message,
              mode: isDryRun ? 'dry_run' : 'live'
            });
          }
        } else {
          await this.logEvent(userId, request.threadId, 'tool_not_found', 0, tool.name, {
            availableTools: Array.from(this.toolAdapters.keys())
          });
        }
      }

      // 5. Generation stage
      onEvent({ type: 'state', data: { stage: 'generate' } });
      await this.logEvent(userId, request.threadId, 'generate_start', Date.now() - startTime);

      // Create assistant message placeholder
      assistantMessage = await this.db.createMessage(request.threadId, {
        role: 'assistant',
        parts: [{ type: 'text', value: '' }],
        meta: { streaming: true, toolResults },
        tokens: 0
      });

      // Check if this requires visual generation
      const requiresVisual = this.detectVisualRequirement(request);
      let fullResponse = '';
      let responseTokens = 0;
      
      if (requiresVisual && this.flags.isEnabled('handoff.google_ia.payload_only')) {
        // Generate Google IA request payload
        const googleRequest = this.generateGoogleIARequest(request);
        
        // Stream the Google IA request as tokens
        const requestJson = JSON.stringify(googleRequest, null, 2);
        fullResponse = requestJson;
        
        for (const char of requestJson) {
          // Check abort signal
          if (this.abortController?.signal.aborted) {
            throw new Error('Operation aborted during generation');
          }
          
          onEvent({ type: 'token', data: { delta: char } });
          await new Promise(resolve => setTimeout(resolve, 10)); // Simulate streaming
        }
        responseTokens = this.estimateTokens(requestJson);
        
      } else {
        // Generate response using OpenAI or mock
        const response = await this.generateResponse(request, toolResults, userId);
        fullResponse = response.text;
        responseTokens = response.tokens;
        
        // Stream response tokens
        const words = response.text.split(' ');
        for (let i = 0; i < words.length; i++) {
          // Check abort signal
          if (this.abortController?.signal.aborted) {
            throw new Error('Operation aborted during generation');
          }
          
          const token = i === 0 ? words[i] : ' ' + words[i];
          onEvent({ type: 'token', data: { delta: token } });
          await new Promise(resolve => setTimeout(resolve, 30)); // Simulate streaming delay
        }
      }

      // Update assistant message with final content
      await this.db.updateMessage(assistantMessage.id, {
        parts: [{ type: 'text', value: fullResponse }],
        meta: { 
          streaming: false, 
          toolResults,
          generationTime: Date.now() - startTime,
          requiresVisual
        },
        tokens: responseTokens
      });

      await this.logEvent(userId, request.threadId, 'generate_complete', Date.now() - startTime, undefined, {
        responseTokens,
        requiresVisual,
        toolCount: toolResults.length
      });

      // 6. Finalization
      onEvent({ type: 'state', data: { stage: 'finalize' } });
      await this.logEvent(userId, request.threadId, 'finalize_start', Date.now() - startTime);

      // Calculate total tokens
      const promptTokens = this.estimateTokens(request.messages.map(m => m.parts.map(p => p.value).join(' ')).join(' '));
      const completionTokens = responseTokens;
      const totalTokens = promptTokens + completionTokens;

      // Update quota
      await this.db.updateQuota(userId, totalTokens, 1, 0);

      // Usage statistics
      onEvent({ 
        type: 'usage', 
        data: { 
          prompt: promptTokens,
          completion: completionTokens
        } 
      });

      await this.logEvent(userId, request.threadId, 'usage_recorded', Date.now() - startTime, undefined, {
        promptTokens,
        completionTokens,
        totalTokens
      });

      // Done
      onEvent({ 
        type: 'done', 
        data: { 
          messageId: assistantMessage?.id || `msg_${Date.now()}`,
          final: true 
        } 
      });

      await this.logEvent(userId, request.threadId, 'orchestration_complete', Date.now() - startTime, undefined, {
        totalLatency: Date.now() - startTime,
        success: true
      });

    } catch (error) {
      console.error('Orchestration failed:', error);
      
      // Log error
      await this.logEvent(userId, request.threadId, 'orchestration_error', Date.now() - startTime, undefined, {
        error: error.message,
        stack: error.stack
      });

      // Clean up incomplete assistant message
      if (assistantMessage) {
        try {
          await this.db.updateMessage(assistantMessage.id, {
            parts: [{ type: 'text', value: 'Error: Generation failed' }],
            meta: { 
              streaming: false, 
              error: error.message,
              generationTime: Date.now() - startTime
            },
            tokens: 0
          });
        } catch (cleanupError) {
          console.warn('Failed to cleanup assistant message:', cleanupError);
        }
      }

      onEvent({ 
        type: 'error', 
        data: { 
          code: error.name === 'AbortError' ? 'OPERATION_ABORTED' : 'ORCHESTRATION_ERROR', 
          message: error.message 
        } 
      });
    }
  }

  private planToolUsage(request: ChatRequest): Tool[] {
    // Simple tool planning logic
    const userMessage = request.messages
      .filter(m => m.role === 'user')
      .slice(-1)[0];
    
    if (!userMessage) return [];

    const text = userMessage.parts
      .filter(p => p.type === 'text')
      .map(p => p.value.toLowerCase())
      .join(' ');

    const plannedTools: Tool[] = [];

    // Add tools based on content analysis
    if (text.includes('buscar') || text.includes('search') || text.includes('web')) {
      plannedTools.push({ name: 'web.run', input: { query: text } });
    }

    if (text.includes('calcular') || text.includes('calculate') || /\d+[\+\-\*\/]\d+/.test(text)) {
      plannedTools.push({ name: 'calc', input: { expression: text.match(/[\d\+\-\*\/\(\)\s]+/)?.[0] } });
    }

    // Add tools from request.tools
    plannedTools.push(...request.tools);

    return plannedTools;
  }

  private detectVisualRequirement(request: ChatRequest): boolean {
    const userMessage = request.messages
      .filter(m => m.role === 'user')
      .slice(-1)[0];
    
    if (!userMessage) return false;

    const text = userMessage.parts
      .filter(p => p.type === 'text')
      .map(p => p.value.toLowerCase())
      .join(' ');

    const visualKeywords = [
      'imagen', 'image', 'visual', 'diseño', 'design', 'logo', 'banner',
      'infografía', 'infographic', 'layout', 'mockup', 'prototipo', 'prototype'
    ];

    return visualKeywords.some(keyword => text.includes(keyword));
  }

  private generateGoogleIARequest(request: ChatRequest): GoogleIARequest {
    const userMessage = request.messages
      .filter(m => m.role === 'user')
      .slice(-1)[0];
    
    const text = userMessage?.parts
      .filter(p => p.type === 'text')
      .map(p => p.value)
      .join(' ') || '';

    return {
      task: 'image.generate',
      subject: this.extractSubject(text),
      style: this.extractStyle(text),
      palette: 'BrandKit.primary',
      constraints: this.extractConstraints(text),
      sizes: ['1024x1024', '1920x1080']
    };
  }

  private extractSubject(text: string): string {
    // Simple subject extraction
    const subjects = text.match(/(?:crear|generate|diseñar)\s+(?:un|una|a)?\s*([^.!?]+)/i);
    return subjects?.[1]?.trim() || 'Creative visual content';
  }

  private extractStyle(text: string): string {
    const styles = ['minimal', 'modern', 'professional', 'creative', 'bold'];
    const foundStyle = styles.find(style => text.toLowerCase().includes(style));
    return foundStyle || 'professional';
  }

  private extractConstraints(text: string): string[] {
    const constraints: string[] = [];
    
    if (text.includes('logo')) constraints.push('include brand logo');
    if (text.includes('colors') || text.includes('colores')) constraints.push('use brand colors');
    if (text.includes('typography') || text.includes('tipografía')) constraints.push('use brand typography');
    
    return constraints;
  }

  private generateMockResponse(request: ChatRequest, toolResults: any[]): string {
    const persona = request.settings.persona;
    let response = '';

    switch (persona) {
      case 'mentor':
        response = 'Como tu mentor creativo, puedo ayudarte a desarrollar esta idea. ';
        break;
      case 'planner':
        response = 'Analicemos esto paso a paso para crear un plan efectivo. ';
        break;
      case 'engineer':
        response = 'Desde una perspectiva técnica, podemos abordar esto de manera sistemática. ';
        break;
    }

    if (toolResults.length > 0) {
      response += `He utilizado ${toolResults.length} herramientas para obtener información adicional. `;
    }

    response += 'Esta es una respuesta simulada del orquestador ChatGPT-5 en modo canary. ';
    response += 'En producción, aquí recibirías la respuesta real generada por el modelo de lenguaje.';

    return response;
  }

  private estimateTokens(text: string): number {
    // Simple token estimation (approximately 4 characters per token)
    return Math.ceil(text.length / 4);
  }

  private async logEvent(
    userId: string, 
    threadId: string, 
    stage: string, 
    latencyMs: number, 
    tool?: string, 
    info?: any
  ): Promise<void> {
    try {
      await this.db.logEvent({
        user_id: userId,
        thread_id: threadId,
        stage,
        tool,
        latency_ms: latencyMs,
        tokens: 0,
        info: info || {}
      });
    } catch (error) {
      console.warn('Failed to log event:', error);
    }
  }

  private async generateResponse(
    request: ChatRequest, 
    toolResults: any[], 
    userId: string
  ): Promise<{ text: string; tokens: number }> {
    
    const hasOpenAI = !!Deno.env.get('OPENAI_API_KEY');
    
    if (hasOpenAI && !this.flags.isEnabled('adapters.dry_run')) {
      try {
        return await this.generateWithOpenAI(request, toolResults);
      } catch (error) {
        console.error('OpenAI generation failed, using fallback:', error);
        return this.generateMockResponse(request, toolResults);
      }
    } else {
      return this.generateMockResponse(request, toolResults);
    }
  }

  private async generateWithOpenAI(
    request: ChatRequest, 
    toolResults: any[]
  ): Promise<{ text: string; tokens: number }> {
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: request.system
      },
      ...request.messages.map(msg => ({
        role: msg.role,
        content: msg.parts.map(p => p.value).join(' ')
      }))
    ];

    // Add tool results context if available
    if (toolResults.length > 0) {
      const toolContext = toolResults
        .map(tr => `Tool ${tr.tool}: ${JSON.stringify(tr.result || tr.error)}`)
        .join('\n');
      
      messages.push({
        role: 'system',
        content: `Tool execution results:\n${toolContext}`
      });
    }

    const requestBody = {
      model: 'gpt-4', // Use available model
      messages,
      temperature: request.settings.temperature || 0.3,
      max_tokens: 2000,
      stream: false // We handle streaming manually
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    const text = result.choices[0]?.message?.content || 'No response generated';
    const tokens = result.usage?.completion_tokens || this.estimateTokens(text);

    return { text, tokens };
  }

  private generateMockResponse(request: ChatRequest, toolResults: any[]): { text: string; tokens: number } {
    const persona = request.settings.persona;
    let response = '';

    switch (persona) {
      case 'mentor':
        response = 'Como tu mentor creativo, puedo ayudarte a desarrollar esta idea. ';
        break;
      case 'planner':
        response = 'Analicemos esto paso a paso para crear un plan efectivo. ';
        break;
      case 'engineer':
        response = 'Desde una perspectiva técnica, podemos abordar esto de manera sistemática. ';
        break;
    }

    if (toolResults.length > 0) {
      response += `He utilizado ${toolResults.length} herramientas para obtener información adicional:\n\n`;
      
      for (const toolResult of toolResults) {
        if (toolResult.result) {
          response += `**${toolResult.tool}**: `;
          if (typeof toolResult.result === 'object') {
            if (toolResult.tool === 'web.run') {
              response += `Encontré ${toolResult.result.totalResults || 0} resultados relevantes.\n`;
            } else if (toolResult.tool === 'pdf.read') {
              response += `Procesé un documento de ${toolResult.result.metadata?.pageCount || 0} páginas.\n`;
            } else if (toolResult.tool === 'calc') {
              response += `El resultado es: ${toolResult.result.result}\n`;
            } else {
              response += `Procesamiento completado exitosamente.\n`;
            }
          } else {
            response += `${toolResult.result}\n`;
          }
        } else if (toolResult.error) {
          response += `**${toolResult.tool}**: Error - ${toolResult.error}\n`;
        }
      }
      response += '\n';
    }

    const isDryRun = this.flags.isEnabled('adapters.dry_run');
    if (isDryRun) {
      response += 'Esta es una respuesta simulada del orquestador ChatGPT-5 en modo canary. ';
      response += 'En producción, aquí recibirías la respuesta real generada por el modelo de lenguaje.';
    } else {
      response += 'Basándome en el análisis realizado, puedo proporcionarte una respuesta completa y contextual. ';
      response += '¿Hay algún aspecto específico que te gustaría que profundice más?';
    }

    const tokens = this.estimateTokens(response);
    return { text: response, tokens };
  }

  // Public method to abort orchestration
  public abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  // Check if orchestration is aborted
  public isAborted(): boolean {
    return this.abortController?.signal.aborted ?? false;
  }
}