import type { GuardInput, GuardCheckResponse, BrandKit } from './types';

export class BrandGuardSDK {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = ``; // Removed Supabase URL
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Check text against brand guidelines
   */
  async checkText(input: GuardInput): Promise<GuardCheckResponse> {
    console.log('[Brand Guard SDK] checkText called with:', input);
    // Return mock data
    return {
      report: {
        score: 85,
        findings: [],
        disclaimerNeeded: false
      }
    };
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
    console.log('[Brand Guard SDK] updateRules called with:', patch, adminToken);
    // Return mock data
    return { ok: true };
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