// PII Masking utilities for Chat Maestro exports
import { CleanupOpts } from './export.types.ts';

// PII detection patterns
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
  creditCard: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  url: /(https?:\/\/[^\s]+)/g,
};

/**
 * Masks PII in text content
 */
export function maskPII(content: string, aggressive = false): string {
  if (!content) return content;
  
  let masked = content;
  
  // Always mask these sensitive patterns
  masked = masked.replace(PII_PATTERNS.email, (match) => {
    const [user, domain] = match.split('@');
    return `${user.slice(0, 2)}***@${domain}`;
  });
  
  masked = masked.replace(PII_PATTERNS.phone, '***-***-****');
  masked = masked.replace(PII_PATTERNS.creditCard, '**** **** **** ****');
  masked = masked.replace(PII_PATTERNS.ssn, '***-**-****');
  
  if (aggressive) {
    // In aggressive mode, also mask UUIDs, IPs, and URLs
    masked = masked.replace(PII_PATTERNS.uuid, (match) => 
      `${match.slice(0, 8)}...${match.slice(-4)}`
    );
    masked = masked.replace(PII_PATTERNS.ipAddress, '***.***.***.**');
    masked = masked.replace(PII_PATTERNS.url, '[URL_REDACTED]');
  }
  
  return masked;
}

/**
 * Creates a hash-like short identifier from text
 */
export function createShortHash(text: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  let result = '';
  let num = Math.abs(hash);
  for (let i = 0; i < 6; i++) {
    result += chars[num % chars.length];
    num = Math.floor(num / chars.length);
  }
  
  return result;
}

/**
 * Masks usernames and personal identifiers
 */
export function maskUsernames(content: string): string {
  // Replace @mentions with generic format
  return content.replace(/@[\w.-]+/g, '@user');
}

/**
 * Sanitizes content based on cleanup options
 */
export function sanitizeContent(content: string, cleanup: CleanupOpts = {}): string {
  let sanitized = content;
  
  if (cleanup.maskPII) {
    sanitized = maskPII(sanitized, true);
  }
  
  if (cleanup.hideChips) {
    // Remove brand guard chips and findings
    sanitized = sanitized.replace(/\[BRAND_GUARD:.*?\]/g, '');
    sanitized = sanitized.replace(/🛡️.*?(?=\n|$)/g, '');
  }
  
  if (cleanup.hideMeta) {
    // Remove metadata markers
    sanitized = sanitized.replace(/\[META:.*?\]/g, '');
    sanitized = sanitized.replace(/<!--.*?-->/gs, '');
  }
  
  return sanitized.trim();
}

/**
 * Truncates content for logging (security measure)
 */
export function truncateForLog(content: string, maxLength = 1024): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength - 3) + '...';
}

/**
 * Validates that content doesn't contain sensitive information
 */
export function validateContentSafety(content: string): {
  safe: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Check for potential PII
  if (PII_PATTERNS.email.test(content)) {
    warnings.push('Email addresses detected');
  }
  if (PII_PATTERNS.phone.test(content)) {
    warnings.push('Phone numbers detected');
  }
  if (PII_PATTERNS.creditCard.test(content)) {
    warnings.push('Credit card patterns detected');
  }
  if (PII_PATTERNS.ssn.test(content)) {
    warnings.push('SSN patterns detected');
  }
  
  return {
    safe: warnings.length === 0,
    warnings
  };
}