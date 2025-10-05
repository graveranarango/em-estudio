import type { BrandKit, GuardFinding } from './brandkit.types.ts';

export class GuardHeuristics {
  static analyzeFormat(text: string, brand: BrandKit): GuardFinding[] {
    const findings: GuardFinding[] = [];
    
    // Check exclamation marks
    if (brand.style.exclamationMax !== undefined) {
      const exclamationCount = (text.match(/!/g) || []).length;
      if (exclamationCount > brand.style.exclamationMax) {
        findings.push({
          type: 'format',
          severity: 'warn',
          message: `Demasiados signos de exclamación (${exclamationCount}/${brand.style.exclamationMax})`,
          suggestion: text.replace(/!+/g, (match) => match.length > 1 ? '!' : match)
        });
      }
    }

    // Check emoji usage
    if (!brand.style.emoji) {
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
      const emojiMatches = text.match(emojiRegex);
      if (emojiMatches) {
        findings.push({
          type: 'format',
          severity: 'warn',
          message: `Evitar emojis según directrices de marca (${emojiMatches.length} encontrados)`,
          suggestion: text.replace(emojiRegex, '').replace(/\s+/g, ' ').trim()
        });
      }
    }

    // Check links policy
    const linkRegex = /https?:\/\/[^\s]+/g;
    const links = text.match(linkRegex);
    if (links && brand.style.linksPolicy) {
      if (brand.style.linksPolicy === 'forbidden') {
        findings.push({
          type: 'format',
          severity: 'warn',
          message: `Enlaces no permitidos según política de marca (${links.length} encontrados)`,
          suggestion: text.replace(linkRegex, '[enlace removido]')
        });
      } else if (brand.style.linksPolicy === 'need-disclaimer') {
        findings.push({
          type: 'format',
          severity: 'info',
          message: `Enlaces requieren disclaimer según política de marca`,
          suggestion: `${text}\n\n*Los enlaces externos son proporcionados solo para referencia.*`
        });
      }
    }

    return findings;
  }

  static analyzeLexicon(text: string, brand: BrandKit): GuardFinding[] {
    const findings: GuardFinding[] = [];
    const lowerText = text.toLowerCase();

    // Check banned words
    if (brand.lexicon.banned) {
      brand.lexicon.banned.forEach(banned => {
        const regex = new RegExp(`\\b${banned.toLowerCase()}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          const startIndex = lowerText.indexOf(banned.toLowerCase());
          findings.push({
            type: 'lexicon',
            severity: 'warn', // Degraded from 'block'
            message: `Término prohibido: "${banned}"`,
            span: [startIndex, startIndex + banned.length],
            suggestion: `Considera reemplazar "${banned}" con una alternativa más apropiada`
          });
        }
      });
    }

    // Check words to avoid
    brand.lexicon.avoid.forEach(avoid => {
      const regex = new RegExp(`\\b${avoid.toLowerCase()}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        const startIndex = lowerText.indexOf(avoid.toLowerCase());
        findings.push({
          type: 'lexicon',
          severity: 'warn',
          message: `Evitar término: "${avoid}"`,
          span: [startIndex, startIndex + avoid.length],
          suggestion: this.suggestPreferredAlternative(avoid, brand.lexicon.preferred)
        });
      }
    });

    // Check for preferred word opportunities
    const commonSynonyms = this.getCommonSynonyms();
    brand.lexicon.preferred.forEach(preferred => {
      const synonyms = commonSynonyms[preferred.toLowerCase()] || [];
      synonyms.forEach(synonym => {
        const regex = new RegExp(`\\b${synonym}\\b`, 'gi');
        const matches = text.match(regex);
        if (matches) {
          const startIndex = lowerText.indexOf(synonym.toLowerCase());
          findings.push({
            type: 'lexicon',
            severity: 'info',
            message: `Considera usar término preferido: "${preferred}" en lugar de "${synonym}"`,
            span: [startIndex, startIndex + synonym.length],
            suggestion: text.replace(regex, preferred)
          });
        }
      });
    });

    return findings;
  }

  static analyzeClaims(text: string, brand: BrandKit): GuardFinding[] {
    const findings: GuardFinding[] = [];

    // Check forbidden claims
    brand.claims.forbidden.forEach(forbidden => {
      const regex = new RegExp(forbidden, 'gi');
      if (regex.test(text)) {
        findings.push({
          type: 'claim',
          severity: 'warn',
          message: `Afirmación prohibida detectada: "${forbidden}"`,
          suggestion: `Considera reemplazar con una de las afirmaciones permitidas: ${brand.claims.allowed.slice(0, 2).join(', ')}`
        });
      }
    });

    // Check claims that need disclaimers
    if (brand.claims.needsDisclaimer) {
      brand.claims.needsDisclaimer.forEach(claim => {
        const regex = new RegExp(claim, 'gi');
        if (regex.test(text)) {
          findings.push({
            type: 'claim',
            severity: 'info',
            message: `Afirmación requiere disclaimer: "${claim}"`,
            suggestion: 'Se añadirá disclaimer automáticamente'
          });
        }
      });
    }

    return findings;
  }

  private static suggestPreferredAlternative(avoid: string, preferred: string[]): string {
    // Simple matching logic - in production this could be more sophisticated
    const alternatives = preferred.filter(p => 
      p.toLowerCase().includes(avoid.toLowerCase().substring(0, 3)) ||
      avoid.toLowerCase().includes(p.toLowerCase().substring(0, 3))
    );
    
    return alternatives.length > 0 
      ? `Considera usar: ${alternatives[0]}` 
      : `Consulta la lista de términos preferidos de la marca`;
  }

  private static getCommonSynonyms(): Record<string, string[]> {
    return {
      'excelente': ['bueno', 'genial', 'fantástico'],
      'innovador': ['nuevo', 'moderno', 'avanzado'],
      'profesional': ['experto', 'cualificado', 'competente'],
      'calidad': ['bueno', 'excelente', 'superior'],
      'servicio': ['atención', 'soporte', 'ayuda'],
      'solución': ['respuesta', 'alternativa', 'opción']
    };
  }

  static calculateHeuristicScore(findings: GuardFinding[]): number {
    let score = 100;
    
    findings.forEach(finding => {
      switch (finding.severity) {
        case 'block':
          score -= 20;
          break;
        case 'warn':
          score -= 10;
          break;
        case 'info':
          score -= 5;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }
}