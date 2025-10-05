/**
 * Servicio centralizado para operaciones del BrandKit
 * Este servicio puede ser usado por todos los módulos del AI Content Studio
 * para acceder a los datos del BrandKit almacenados en Firestore
 */

import { BrandKitData, loadBrandKit as firebaseLoadBrandKit, saveBrandKit, brandKitExists } from './brandkit';
import { isFirebaseCompletelyOffline } from './firestore-offline-manager';

class BrandKitService {
  private static instance: BrandKitService;
  private cachedBrandKit: BrandKitData | null = null;
  private lastCacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private isOffline: boolean = false;
  private fallbackBrandKit: BrandKitData | null = null;

  private constructor() {
    // Initialize fallback data in case of offline scenarios
    this.initializeFallbackData();
  }

  static getInstance(): BrandKitService {
    if (!BrandKitService.instance) {
      BrandKitService.instance = new BrandKitService();
    }
    return BrandKitService.instance;
  }

  private initializeFallbackData(): void {
    // Basic fallback BrandKit for offline scenarios
    this.fallbackBrandKit = {
      colors: [
        { name: 'Primary', hex: '#8B5CF6', type: 'primary', usage: 'Principal' },
        { name: 'Secondary', hex: '#EC4899', type: 'secondary', usage: 'Acento' }
      ],
      typography: [
        { name: 'Primary Font', font: 'Inter', weight: '400', usage: 'Títulos y texto principal' }
      ],
      logos: [],
      voiceTone: {
        personality: 'profesional',
        tone: 'amigable',
        language: 'claro'
      },
      usageRules: {
        dos: ['Mantener consistencia visual', 'Usar colores de marca'],
        donts: ['No mezclar tipografías', 'No usar colores fuera de paleta']
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Obtiene el BrandKit actual (con cache)
   */
  async getBrandKit(forceRefresh = false): Promise<BrandKitData | null> {
    const now = Date.now();
    
    // Usar cache si es válido y no se fuerza refresh
    if (!forceRefresh && this.cachedBrandKit && (now - this.lastCacheTime) < this.CACHE_DURATION) {
      return this.cachedBrandKit;
    }

    try {
      // Check if Firebase is completely offline before attempting any operations
      if (isFirebaseCompletelyOffline()) {
        return this.handleOfflineScenario(new Error('Firebase completely offline - using fallback data'));
      }
      
      const brandKit = await firebaseLoadBrandKit();
      if (brandKit) {
        this.cachedBrandKit = brandKit;
        this.lastCacheTime = now;
        this.isOffline = false;
        return brandKit;
      }
      return this.handleOfflineScenario();
    } catch (error) {
      // Don't log errors to console to avoid noise
      return this.handleOfflineScenario(error);
    }
  }

  private handleOfflineScenario(error?: any): BrandKitData | null {
    const isOfflineError = !error || (
      error.message?.includes('offline') ||
      error.message?.includes('unavailable') ||
      error.message?.includes('transport errored') ||
      error.message?.includes('Failed to get document') ||
      error.message?.includes('Firebase completely offline') ||
      error.code === 'unavailable' ||
      error.code === 'failed-precondition'
    );

    // Always switch to offline mode in error scenarios
    this.isOffline = true;
    
    // Always return cached data if available, otherwise fallback
    // This ensures the app continues to work even with connection issues
    return this.cachedBrandKit || this.fallbackBrandKit;
  }

  /**
   * Invalida el cache (útil después de actualizar el BrandKit)
   */
  invalidateCache(): void {
    this.cachedBrandKit = null;
    this.lastCacheTime = 0;
  }

  /**
   * Verifica si existe un BrandKit
   */
  async hasBrandKit(): Promise<boolean> {
    try {
      // If we're offline or have cached/fallback data, return true
      if (this.isOffline || this.cachedBrandKit || this.fallbackBrandKit) {
        return true;
      }
      
      // Try to check existence, but don't wait too long
      return await brandKitExists();
    } catch (error) {
      // Don't log errors to avoid noise
      
      // In offline mode or error cases, check if we have any cached or fallback data
      if (this.isOffline || this.cachedBrandKit || this.fallbackBrandKit) {
        return true;
      }
      return false;
    }
  }

  /**
   * Check if currently in offline mode
   */
  isOfflineMode(): boolean {
    return this.isOffline;
  }

  /**
   * Obtiene solo los colores de la paleta
   */
  async getColors(): Promise<BrandKitData['colors'] | null> {
    const brandKit = await this.getBrandKit();
    return brandKit?.colors || null;
  }

  /**
   * Obtiene solo las tipografías
   */
  async getTypography(): Promise<BrandKitData['typography'] | null> {
    const brandKit = await this.getBrandKit();
    return brandKit?.typography || null;
  }

  /**
   * Obtiene solo el tono de voz
   */
  async getVoiceTone(): Promise<BrandKitData['voiceTone'] | null> {
    const brandKit = await this.getBrandKit();
    return brandKit?.voiceTone || null;
  }

  /**
   * Obtiene solo las reglas de uso
   */
  async getUsageRules(): Promise<BrandKitData['usageRules'] | null> {
    const brandKit = await this.getBrandKit();
    return brandKit?.usageRules || null;
  }

  /**
   * Load BrandKit (wrapper for compatibility)
   */
  async loadBrandKit(): Promise<BrandKitData | null> {
    return await this.getBrandKit();
  }

  /**
   * Obtiene instrucciones de marca formateadas para IA
   */
  async getBrandInstructions(moduleType: 'post' | 'video' | 'story' | 'chat' | 'podcast' = 'post'): Promise<string> {
    const brandKit = await this.getBrandKit();
    
    if (!brandKit) {
      return "No se encontró BrandKit configurado.";
    }

    let instructions = `# INSTRUCCIONES DE MARCA PARA ${moduleType.toUpperCase()}\n\n`;

    // Colores
    if (brandKit.colors && brandKit.colors.length > 0) {
      instructions += `## COLORES AUTORIZADOS:\n`;
      brandKit.colors.forEach(color => {
        instructions += `- ${color.name}: ${color.hex} (${color.usage})\n`;
      });
      instructions += `\n`;
    }

    // Tipografías
    if (brandKit.typography && brandKit.typography.length > 0) {
      instructions += `## TIPOGRAFÍAS:\n`;
      brandKit.typography.forEach(typo => {
        instructions += `- ${typo.name}: ${typo.font} ${typo.weight} (${typo.usage})\n`;
      });
      instructions += `\n`;
    }

    // Tono de voz
    if (brandKit.voiceTone) {
      instructions += `## TONO DE VOZ:\n`;
      instructions += `- Personalidad: ${brandKit.voiceTone.personality}\n`;
      instructions += `- Tono: ${brandKit.voiceTone.tone}\n`;
      instructions += `- Lenguaje: ${brandKit.voiceTone.language}\n`;
      
      if (brandKit.voiceTone.examples && brandKit.voiceTone.examples.length > 0) {
        instructions += `\nEjemplos de comunicación:\n`;
        brandKit.voiceTone.examples.forEach(example => {
          instructions += `- "${example}"\n`;
        });
      }
      instructions += `\n`;
    }

    // Reglas de uso
    if (brandKit.usageRules) {
      instructions += `## REGLAS DE USO:\n`;
      
      if (brandKit.usageRules.dos && brandKit.usageRules.dos.length > 0) {
        instructions += `\n✅ QUÉ SÍ HACER:\n`;
        brandKit.usageRules.dos.forEach(rule => {
          instructions += `- ${rule}\n`;
        });
      }
      
      if (brandKit.usageRules.donts && brandKit.usageRules.donts.length > 0) {
        instructions += `\n❌ QUÉ NO HACER:\n`;
        brandKit.usageRules.donts.forEach(rule => {
          instructions += `- ${rule}\n`;
        });
      }
    }

    instructions += `\n## IMPORTANTE:\n`;
    instructions += `- SIEMPRE aplicar estos elementos de marca al contenido\n`;
    instructions += `- Mantener consistencia visual y de comunicación\n`;
    instructions += `- Si hay conflicto, priorizar las directrices de marca\n`;

    return instructions;
  }

  /**
   * Valida si un color está en la paleta de marca
   */
  async isValidBrandColor(hexColor: string): Promise<boolean> {
    const colors = await this.getColors();
    if (!colors) return true; // Si no hay colores definidos, permitir cualquiera
    
    return colors.some(color => color.hex.toUpperCase() === hexColor.toUpperCase());
  }

  /**
   * Obtiene estadísticas del BrandKit
   */
  async getBrandKitStats(): Promise<{
    hasColors: boolean;
    colorsCount: number;
    hasTypography: boolean;
    typographyCount: number;
    hasLogos: boolean;
    logosCount: number;
    hasVoiceTone: boolean;
    hasUsageRules: boolean;
    completeness: number;
  }> {
    try {
      const brandKit = await this.getBrandKit();
      
      if (!brandKit) {
        // Return basic stats for no BrandKit
        return {
          hasColors: false,
          colorsCount: 0,
          hasTypography: false,
          typographyCount: 0,
          hasLogos: false,
          logosCount: 0,
          hasVoiceTone: false,
          hasUsageRules: false,
          completeness: 0
        };
      }

      const hasColors = brandKit.colors && brandKit.colors.length > 0;
      const hasTypography = brandKit.typography && brandKit.typography.length > 0;
      const hasLogos = brandKit.logos && brandKit.logos.length > 0;
      const hasVoiceTone = brandKit.voiceTone && brandKit.voiceTone.personality;
      const hasUsageRules = brandKit.usageRules && 
        (brandKit.usageRules.dos.length > 0 || brandKit.usageRules.donts.length > 0);

      const completedSections = [hasColors, hasTypography, hasLogos, hasVoiceTone, hasUsageRules]
        .filter(Boolean).length;
      
      const completeness = (completedSections / 5) * 100;

      return {
        hasColors,
        colorsCount: brandKit.colors?.length || 0,
        hasTypography,
        typographyCount: brandKit.typography?.length || 0,
        hasLogos,
        logosCount: brandKit.logos?.length || 0,
        hasVoiceTone,
        hasUsageRules,
        completeness
      };
    } catch (error) {
      // Return safe defaults on any error
      return {
        hasColors: false,
        colorsCount: 0,
        hasTypography: false,
        typographyCount: 0,
        hasLogos: false,
        logosCount: 0,
        hasVoiceTone: false,
        hasUsageRules: false,
        completeness: 0
      };
    }
  }
}

// Exportar instancia singleton
export const brandKitService = BrandKitService.getInstance();

// Exportar también la clase para casos específicos
export { BrandKitService };

// Export a compatible loadBrandKit function for contexts
export const loadBrandKit = () => brandKitService.loadBrandKit();