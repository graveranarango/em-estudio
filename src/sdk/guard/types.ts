// Frontend types for Brand Guard integration

export type BrandKit = {
  tone: {
    do: string[];
    dont: string[];
    readingLevel?: 'simple' | 'neutral' | 'formal';
  };
  lexicon: {
    preferred: string[];
    avoid: string[];
    banned?: string[];
  };
  style: {
    emoji: boolean;
    exclamationMax?: number;
    linksPolicy?: 'allowed' | 'need-disclaimer' | 'forbidden';
  };
  claims: {
    allowed: string[];
    forbidden: string[];
    needsDisclaimer?: string[];
  };
  disclaimers: {
    standard: string;
    legal?: string;
  };
  locales?: string[];
};

export type GuardInput = {
  text: string;
  role: 'user' | 'assistant';
  locale?: string;
  brand: BrandKit;
  context?: {
    objective?: string;
    audience?: string;
  };
};

export type GuardFinding = {
  type: 'tone' | 'lexicon' | 'claim' | 'compliance' | 'format';
  severity: 'info' | 'warn' | 'block';
  message: string;
  span?: [number, number];
  suggestion?: string;
};

export type GuardReport = {
  score: number; // 0-100
  findings: GuardFinding[];
  suggestedText?: string;
  disclaimerNeeded?: boolean;
  disclaimerText?: string;
};

export type GuardCheckResponse = {
  report: GuardReport;
};

export type BrandGuardMetrics = {
  totalChecks: number;
  averageScore: number;
  findingsCount: number;
  suggestionsApplied: number;
};