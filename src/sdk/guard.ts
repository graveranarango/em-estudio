// Stubs para evitar errores de importación. Implementa la lógica real según tus necesidades.

export type GuardReport = {
  score: number;
  findings: GuardFinding[];
  disclaimerNeeded: boolean;
};

export type GuardFinding = {
  type: string;
  severity: string;
  message: string;
  suggestion?: string;
};

export type BrandKit = any;

export const brandGuardSDK = {
  convertBrandKitToBrandGuard: (brandKit: BrandKit) => brandKit,
  preCheckUserMessage: async (text: string, guardBrandKit: BrandKit, context?: object) => ({
    report: { score: 100, findings: [], disclaimerNeeded: false }
  }),
  postCheckAssistantMessage: async (text: string, guardBrandKit: BrandKit, context?: object) => ({
    report: { score: 100, findings: [], disclaimerNeeded: false }
  })
};
