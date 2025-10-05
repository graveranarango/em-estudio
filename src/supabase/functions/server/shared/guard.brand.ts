import { ChatRequest, Msg } from './contracts.ts';

export interface BrandGuardCheck {
  passed: boolean;
  suggestions: string[];
  score: number; // 0-100
  violations: {
    type: 'tone' | 'terminology' | 'style' | 'compliance';
    message: string;
    severity: 'low' | 'medium' | 'high';
  }[];
}

export class BrandGuard {
  private brandContext: any = null;

  constructor(brandContext?: any) {
    this.brandContext = brandContext;
  }

  async precheck(request: ChatRequest): Promise<BrandGuardCheck> {
    // In canary mode, this is a mock implementation
    const userMessages = request.messages.filter(m => m.role === 'user');
    const lastMessage = userMessages[userMessages.length - 1];
    
    if (!lastMessage) {
      return {
        passed: true,
        suggestions: [],
        score: 100,
        violations: []
      };
    }

    // Extract text content
    const textContent = lastMessage.parts
      .filter(p => p.type === 'text')
      .map(p => p.value)
      .join(' ');

    // Mock brand analysis
    const suggestions = this.analyzeBrandCompliance(textContent);
    const violations = this.detectViolations(textContent);
    const score = this.calculateScore(violations);

    return {
      passed: violations.length === 0 || violations.every(v => v.severity === 'low'),
      suggestions,
      score,
      violations
    };
  }

  private analyzeBrandCompliance(text: string): string[] {
    const suggestions: string[] = [];
    const lowerText = text.toLowerCase();

    // Mock brand compliance checks
    if (lowerText.includes('competidor') || lowerText.includes('competitor')) {
      suggestions.push('Consider focusing on our unique value proposition rather than competitive comparisons');
    }

    if (lowerText.includes('cheap') || lowerText.includes('barato')) {
      suggestions.push('Use "accessible" or "value-driven" instead of price-focused language');
    }

    if (!lowerText.includes('innovador') && !lowerText.includes('innovative') && text.length > 100) {
      suggestions.push('Consider incorporating our core value of innovation');
    }

    return suggestions;
  }

  private detectViolations(text: string): BrandGuardCheck['violations'] {
    const violations: BrandGuardCheck['violations'] = [];
    const lowerText = text.toLowerCase();

    // Tone violations
    if (lowerText.includes('terrible') || lowerText.includes('awful') || lowerText.includes('horrible')) {
      violations.push({
        type: 'tone',
        message: 'Negative language detected that may not align with brand voice',
        severity: 'medium'
      });
    }

    // Terminology violations
    const bannedTerms = ['obsolete', 'outdated', 'legacy system'];
    for (const term of bannedTerms) {
      if (lowerText.includes(term)) {
        violations.push({
          type: 'terminology',
          message: `Avoid using "${term}" - consider more positive alternatives`,
          severity: 'high'
        });
      }
    }

    // Style violations
    if (text.length > 0 && text === text.toUpperCase()) {
      violations.push({
        type: 'style',
        message: 'All caps text detected - use sentence case for better readability',
        severity: 'low'
      });
    }

    return violations;
  }

  private calculateScore(violations: BrandGuardCheck['violations']): number {
    let score = 100;
    
    for (const violation of violations) {
      switch (violation.severity) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    }

    return Math.max(0, score);
  }

  redactPII(text: string): string {
    // Simple PII redaction for logging
    return text
      .replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL]')
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD]')
      .replace(/\b\d{3}[\s.-]?\d{3}[\s.-]?\d{4}\b/g, '[PHONE]');
  }
}