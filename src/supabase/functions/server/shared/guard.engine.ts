import type { GuardInput, GuardReport, GuardFinding } from './brandkit.types.ts';
import { GuardHeuristics } from './guard.heuristics.ts';
import { GuardPrompt } from './guard.prompt.ts';

export class GuardEngine {
  private static readonly MAX_CHARS = 6000;
  private static readonly TIMEOUT_MS = 3000;

  static async analyze(input: GuardInput): Promise<GuardReport> {
    const startTime = Date.now();
    
    try {
      // Validate input length
      if (input.text.length > this.MAX_CHARS) {
        return {
          score: 50,
          findings: [{
            type: 'format',
            severity: 'warn',
            message: `Texto demasiado largo (${input.text.length}/${this.MAX_CHARS} caracteres)`,
            suggestion: 'Considera dividir en mensajes más cortos'
          }],
          disclaimerNeeded: false
        };
      }

      // Step 1: Heuristic analysis (fast)
      const heuristicFindings = await this.runHeuristicAnalysis(input);
      
      // Check timeout
      if (Date.now() - startTime > this.TIMEOUT_MS / 2) {
        return this.buildHeuristicOnlyReport(input, heuristicFindings);
      }

      // Step 2: LLM analysis (slower but more nuanced)
      const llmFindings = await this.runLLMAnalysis(input, heuristicFindings);
      
      // Step 3: Merge and finalize
      return this.mergeAnalysis(input, heuristicFindings, llmFindings);
      
    } catch (error) {
      console.error('Guard analysis error:', error);
      return {
        score: 75, // Neutral score on error
        findings: [{
          type: 'compliance',
          severity: 'info',
          message: 'Análisis de marca no disponible temporalmente',
          suggestion: 'Revisa manualmente según directrices de marca'
        }],
        disclaimerNeeded: false
      };
    }
  }

  private static async runHeuristicAnalysis(input: GuardInput): Promise<GuardFinding[]> {
    const findings: GuardFinding[] = [];
    
    // Format analysis
    findings.push(...GuardHeuristics.analyzeFormat(input.text, input.brand));
    
    // Lexicon analysis
    findings.push(...GuardHeuristics.analyzeLexicon(input.text, input.brand));
    
    // Claims analysis
    findings.push(...GuardHeuristics.analyzeClaims(input.text, input.brand));
    
    return findings;
  }

  private static async runLLMAnalysis(input: GuardInput, heuristicFindings: GuardFinding[]): Promise<any> {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.warn('OpenAI API key not available for LLM analysis');
      return null;
    }

    try {
      // Tone analysis
      const tonePrompt = GuardPrompt.buildToneAnalysisPrompt(input);
      const toneAnalysis = await this.callOpenAI(tonePrompt, openaiApiKey);
      
      // Claims analysis if needed
      let claimsAnalysis = null;
      if (input.brand.claims.forbidden.length > 0 || input.brand.claims.needsDisclaimer?.length) {
        const claimsPrompt = GuardPrompt.buildClaimsAnalysisPrompt(input);
        claimsAnalysis = await this.callOpenAI(claimsPrompt, openaiApiKey);
      }
      
      // Comprehensive rewrite if issues found
      let rewriteAnalysis = null;
      if (heuristicFindings.length > 0) {
        const rewritePrompt = GuardPrompt.buildComprehensiveRewritePrompt(input, heuristicFindings);
        rewriteAnalysis = await this.callOpenAI(rewritePrompt, openaiApiKey);
      }

      return {
        tone: toneAnalysis,
        claims: claimsAnalysis,
        rewrite: rewriteAnalysis
      };
      
    } catch (error) {
      console.warn('LLM analysis failed:', error);
      return null;
    }
  }

  private static async callOpenAI(prompt: string, apiKey: string): Promise<any> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto en análisis de marca y comunicación. Responde siempre en JSON válido según el formato solicitado.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    try {
      return JSON.parse(content);
    } catch {
      console.warn('Failed to parse LLM response as JSON:', content);
      return null;
    }
  }

  private static buildHeuristicOnlyReport(input: GuardInput, findings: GuardFinding[]): GuardReport {
    const score = GuardHeuristics.calculateHeuristicScore(findings);
    const disclaimerNeeded = this.checkDisclaimerNeeded(input.text, input.brand);
    
    return {
      score,
      findings,
      disclaimerNeeded,
      disclaimerText: disclaimerNeeded ? this.buildDisclaimerText(input.brand) : undefined
    };
  }

  private static mergeAnalysis(input: GuardInput, heuristicFindings: GuardFinding[], llmAnalysis: any): GuardReport {
    const allFindings = [...heuristicFindings];
    let suggestedText: string | undefined;
    let finalScore = GuardHeuristics.calculateHeuristicScore(heuristicFindings);

    // Merge LLM findings
    if (llmAnalysis?.tone?.findings) {
      allFindings.push(...llmAnalysis.tone.findings);
      finalScore = Math.min(finalScore, llmAnalysis.tone.toneScore || finalScore);
    }

    if (llmAnalysis?.claims?.findings) {
      allFindings.push(...llmAnalysis.claims.findings);
      finalScore = Math.min(finalScore, llmAnalysis.claims.claimsScore || finalScore);
    }

    // Use LLM rewrite if available and score is low
    if (llmAnalysis?.rewrite?.rewrittenText && finalScore < 80) {
      suggestedText = llmAnalysis.rewrite.rewrittenText;
      finalScore = Math.max(finalScore, llmAnalysis.rewrite.improvementScore || finalScore);
    }

    // Check disclaimer needs
    const disclaimerNeeded = this.checkDisclaimerNeeded(input.text, input.brand) || 
                           llmAnalysis?.claims?.disclaimerNeeded || false;

    return {
      score: finalScore,
      findings: allFindings,
      suggestedText,
      disclaimerNeeded,
      disclaimerText: disclaimerNeeded ? this.buildDisclaimerText(input.brand) : undefined
    };
  }

  private static checkDisclaimerNeeded(text: string, brand: any): boolean {
    if (!brand.claims.needsDisclaimer) return false;
    
    return brand.claims.needsDisclaimer.some((claim: string) => {
      const regex = new RegExp(claim, 'gi');
      return regex.test(text);
    });
  }

  private static buildDisclaimerText(brand: any): string {
    return brand.disclaimers.legal || brand.disclaimers.standard || 
           'Esta información se proporciona solo con fines informativos.';
  }
}