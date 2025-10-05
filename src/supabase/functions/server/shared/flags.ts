// Feature flags for the chat service
export type FeatureFlag = 
  | 'adapters.dry_run'
  | 'brand_guard.precheck'
  | 'handoff.google_ia.payload_only';

export class FeatureFlags {
  private flags: Set<FeatureFlag>;

  constructor(enabledFlags: FeatureFlag[] = []) {
    this.flags = new Set(enabledFlags);
  }

  isEnabled(flag: FeatureFlag): boolean {
    return this.flags.has(flag);
  }

  enable(flag: FeatureFlag): void {
    this.flags.add(flag);
  }

  disable(flag: FeatureFlag): void {
    this.flags.delete(flag);
  }

  getEnabled(): FeatureFlag[] {
    return Array.from(this.flags);
  }

  static fromEnv(): FeatureFlags {
    const flagsEnv = Deno.env.get('FEATURE_FLAGS') || '';
    const enabledFlags = flagsEnv.split(',')
      .map(f => f.trim())
      .filter(f => f.length > 0) as FeatureFlag[];
    
    return new FeatureFlags(enabledFlags);
  }
}

// Default canary configuration
export const CANARY_FLAGS: FeatureFlag[] = [
  'adapters.dry_run',
  'brand_guard.precheck',
  'handoff.google_ia.payload_only'
];

// Production configuration
export const PRODUCTION_FLAGS: FeatureFlag[] = [
  'brand_guard.precheck',
  'handoff.google_ia.payload_only'
];