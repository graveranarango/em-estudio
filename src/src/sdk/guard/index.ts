import { projectId, publicAnonKey } from '@/utils/supabase/info';
import type { GuardInput, GuardCheckResponse, BrandKit } from './types';

export class BrandGuardSDK {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64`;
    this.headers = {
      'Authorization': `Bearer ${publicAnonKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Check text against brand guidelines
   */
  async checkText(input: GuardInput): Promise<GuardCheckResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/guard/check`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ input }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Brand guard check failed: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Brand Guard SDK] Check error:', error);
      
      // Return graceful fallback
      return {
        report: {
          score: 75,
          findings: [{
            type: 'compliance',
            severity: 'info',
            message: 'Análisis de marca no disponible temporalmente',
            suggestion: 'Revisa manualmente según directrices de marca'
          }],
          disclaimerNeeded: false
        }
      };
    }
  }

  /**
   * Quick pre-check for user input before sending to chat
   */
  async preCheckUserMessage(text: string, brand: BrandKit, context?: { objective?: string; audience?: string }): Promise<GuardCheckResponse> {
    return this.checkText({
      text,
      role: 'user',
      brand,
      context
    });
  }

  /**
   * Post-check for assistant response before displaying
   */
  async postCheckAssistantMessage(text: string, brand: BrandKit, context?: { objective?: string; audience?: string }): Promise<GuardCheckResponse> {
    return this.checkText({
      text,
      role: 'assistant',
      brand,
      context
    });
  }

  /**
   * Update brand guard rules (admin only)
   */
  async updateRules(patch: Partial<BrandKit>, adminToken: string): Promise<{ ok: boolean; updated?: BrandKit }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/guard/rules/update`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ patch }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Rules update failed: ${errorData.error || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Brand Guard SDK] Rules update error:', error);
      throw error;
    }
  }

  /**
   * Convert BrandKit context data to Brand Guard format
   */
  convertBrandKitToBrandGuard(brandKitData: any): BrandKit {
    // Extract tone guidelines from voice tone
    const voiceToneStyle = brandKitData.voiceTone?.style || '';
    const correctExamples = brandKitData.voiceTone?.examples?.correct || [];
    const incorrectExamples = brandKitData.voiceTone?.examples?.incorrect || [];
    
    // Default tone guidelines based on voice tone
    let toneDoList = ['profesional', 'claro', 'consistente'];
    let toneDontList = ['agresivo', 'confuso', 'inconsistente'];
    
    if (voiceToneStyle.toLowerCase().includes('profesional')) {
      toneDoList.push('formal', 'cortés');
    }
    if (voiceToneStyle.toLowerCase().includes('cercano') || voiceToneStyle.toLowerCase().includes('amigable')) {
      toneDoList.push('cercano', 'amigable');
      toneDontList.push('frío', 'distante');
    }

    return {
      tone: {
        do: toneDoList,
        dont: toneDontList,
        readingLevel: 'neutral'
      },
      lexicon: {
        preferred: brandKitData.messaging?.differentiators || [],
        avoid: incorrectExamples.map((ex: string) => ex.split(' ').slice(0, 2).join(' ')).filter(Boolean),
        banned: ['spam', 'scam', 'fake', 'gratis!!!']
      },
      style: {
        emoji: true, // Allow by default
        exclamationMax: voiceToneStyle.toLowerCase().includes('enérgico') ? 3 : 1,
        linksPolicy: 'need-disclaimer'
      },
      claims: {
        allowed: [
          ...(brandKitData.messaging?.slogans || []),
          ...(brandKitData.messaging?.differentiators || []),
          brandKitData.messaging?.tagline
        ].filter(Boolean),
        forbidden: [
          'el mejor del mundo',
          '100% garantizado',
          'imposible de fallar',
          'nunca falla'
        ],
        needsDisclaimer: [
          'resultados pueden variar',
          'sujeto a términos',
          'disponibilidad limitada'
        ]
      },
      disclaimers: {
        standard: 'Esta información se proporciona solo con fines informativos.',
        legal: 'Consulte los términos y condiciones completos.'
      },
      locales: brandKitData.internationalization?.supportedLanguages || ['es']
    };
  }
}

// Export singleton instance
export const brandGuardSDK = new BrandGuardSDK();

// Export types
export * from './types';