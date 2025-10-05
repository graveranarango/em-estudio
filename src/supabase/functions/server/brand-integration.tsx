// Servicio para integrar el BrandKit en otros módulos del AI Content Studio

// Complete BrandKitData structure that matches the frontend and analyzer
interface BrandKitData {
  id: string;
  meta: {
    brandName: string;
    lastUpdated: string;
    version: number;
  };
  colors: {
    primary: string[];
    secondary: string[];
    alternatives: string[];
    gradients: Array<{
      name: string;
      from: string;
      to: string;
    }>;
    rules: {
      allowedCombinations: string[][];
      forbiddenColors: string[];
    };
  };
  typography: {
    primary: {
      name: string;
      weights: string[];
    };
    secondary: {
      name: string;
      weights: string[];
    };
    hierarchy: {
      h1: { font: string; size: number };
      h2: { font: string; size: number };
      body: { font: string; size: number };
      caption: { font: string; size: number };
    };
  };
  logos: Array<{
    name: string;
    formats: string[];
    url: string;
    usage: string;
  }>;
  iconography: {
    style: string;
    examples: string[];
    rules: string[];
  };
  illustrations: {
    style: string;
    examples: string[];
  };
  photography: {
    style: string;
    filters: string[];
    examples: string[];
  };
  motion: {
    speed: string;
    transitions: string[];
    rules: string[];
  };
  audio: {
    jingles: string[];
    style: string;
    rules: string[];
  };
  voiceTone: {
    style: string;
    examples: {
      correct: string[];
      incorrect: string[];
    };
  };
  messaging: {
    tagline: string;
    slogans: string[];
    differentiators: string[];
  };
  storytelling: {
    mission: string;
    vision: string;
    values: string[];
  };
  usageGuidelines: {
    posts: {
      formats: string[];
      rules: string[];
    };
    stories: {
      formats: string[];
      rules: string[];
    };
    videos: {
      formats: string[];
      rules: string[];
    };
    podcasts: {
      coverFormat: string;
      rules: string[];
    };
  };
  examples: {
    do: string[];
    dont: string[];
  };
  accessibility: {
    contrastRatio: string;
    minFontSize: number;
    videoSubtitles: boolean;
    altTextRequired: boolean;
  };
  internationalization: {
    supportedLanguages: string[];
    sloganTranslations: Record<string, string>;
    cultureNotes: string[];
  };
  validation: {
    coherenceReport: {
      lastScan: string;
      complianceRate: string;
      issues: string[];
    };
  };
}

export class BrandIntegration {
  
  static async getBrandKit(): Promise<BrandKitData | null> {
    try {
      const { get } = await import("./kv_store.tsx");
      const brandKitData = await get("brandkit_data");
      
      if (!brandKitData) {
        return null;
      }

      return JSON.parse(brandKitData);
    } catch (error) {
      console.error("Error retrieving brand kit:", error);
      return null;
    }
  }

  static async applyBrandToContent(content: string, contentType: 'post' | 'video' | 'story' | 'chat'): Promise<string> {
    const brandKit = await this.getBrandKit();
    
    if (!brandKit) {
      return content;
    }

    // Generar instrucciones específicas para aplicar el brand
    const brandInstructions = this.generateBrandInstructions(brandKit, contentType);
    
    return `${brandInstructions}\n\n${content}`;
  }

  static generateBrandInstructions(brandKit: BrandKitData, contentType: string): string {
    let instructions = `# INSTRUCCIONES DE MARCA - ${contentType.toUpperCase()}\n\n`;
    
    // Información de marca
    if (brandKit.meta) {
      instructions += `## MARCA: ${brandKit.meta.brandName}\n\n`;
    }

    // Colores
    if (brandKit.colors) {
      instructions += `## COLORES AUTORIZADOS:\n`;
      
      if (brandKit.colors.primary && brandKit.colors.primary.length > 0) {
        instructions += `### Colores Primarios:\n`;
        brandKit.colors.primary.forEach((color, index) => {
          instructions += `- Color Primario ${index + 1}: ${color}\n`;
        });
      }
      
      if (brandKit.colors.secondary && brandKit.colors.secondary.length > 0) {
        instructions += `### Colores Secundarios:\n`;
        brandKit.colors.secondary.forEach((color, index) => {
          instructions += `- Color Secundario ${index + 1}: ${color}\n`;
        });
      }
      
      if (brandKit.colors.alternatives && brandKit.colors.alternatives.length > 0) {
        instructions += `### Colores Alternativos:\n`;
        brandKit.colors.alternatives.forEach((color, index) => {
          instructions += `- Color Alternativo ${index + 1}: ${color}\n`;
        });
      }
      
      if (brandKit.colors.rules?.forbiddenColors && brandKit.colors.rules.forbiddenColors.length > 0) {
        instructions += `### ❌ COLORES PROHIBIDOS:\n`;
        brandKit.colors.rules.forbiddenColors.forEach(color => {
          instructions += `- ${color}\n`;
        });
      }
      instructions += `\n`;
    }

    // Tipografía
    if (brandKit.typography) {
      instructions += `## TIPOGRAFÍAS:\n`;
      
      if (brandKit.typography.primary) {
        instructions += `### Tipografía Primaria:\n`;
        instructions += `- ${brandKit.typography.primary.name} (Pesos: ${brandKit.typography.primary.weights.join(', ')})\n`;
      }
      
      if (brandKit.typography.secondary) {
        instructions += `### Tipografía Secundaria:\n`;
        instructions += `- ${brandKit.typography.secondary.name} (Pesos: ${brandKit.typography.secondary.weights.join(', ')})\n`;
      }
      
      if (brandKit.typography.hierarchy) {
        instructions += `### Jerarquía Tipográfica:\n`;
        instructions += `- H1: ${brandKit.typography.hierarchy.h1.font} ${brandKit.typography.hierarchy.h1.size}px\n`;
        instructions += `- H2: ${brandKit.typography.hierarchy.h2.font} ${brandKit.typography.hierarchy.h2.size}px\n`;
        instructions += `- Body: ${brandKit.typography.hierarchy.body.font} ${brandKit.typography.hierarchy.body.size}px\n`;
        instructions += `- Caption: ${brandKit.typography.hierarchy.caption.font} ${brandKit.typography.hierarchy.caption.size}px\n`;
      }
      instructions += `\n`;
    }

    // Tono de voz
    if (brandKit.voiceTone) {
      instructions += `## TONO DE VOZ:\n`;
      instructions += `- Estilo: ${brandKit.voiceTone.style}\n`;
      
      if (brandKit.voiceTone.examples?.correct && brandKit.voiceTone.examples.correct.length > 0) {
        instructions += `\n✅ Ejemplos CORRECTOS:\n`;
        brandKit.voiceTone.examples.correct.forEach(example => {
          instructions += `- "${example}"\n`;
        });
      }
      
      if (brandKit.voiceTone.examples?.incorrect && brandKit.voiceTone.examples.incorrect.length > 0) {
        instructions += `\n❌ Ejemplos INCORRECTOS:\n`;
        brandKit.voiceTone.examples.incorrect.forEach(example => {
          instructions += `- "${example}"\n`;
        });
      }
      instructions += `\n`;
    }

    // Messaging
    if (brandKit.messaging) {
      instructions += `## MENSAJES CLAVE:\n`;
      if (brandKit.messaging.tagline) {
        instructions += `- Tagline: "${brandKit.messaging.tagline}"\n`;
      }
      if (brandKit.messaging.slogans && brandKit.messaging.slogans.length > 0) {
        instructions += `- Slogans: ${brandKit.messaging.slogans.join(', ')}\n`;
      }
      if (brandKit.messaging.differentiators && brandKit.messaging.differentiators.length > 0) {
        instructions += `- Diferenciadores: ${brandKit.messaging.differentiators.join(', ')}\n`;
      }
      instructions += `\n`;
    }

    // Reglas de uso
    if (brandKit.examples) {
      instructions += `## REGLAS DE USO:\n`;
      
      if (brandKit.examples.do && brandKit.examples.do.length > 0) {
        instructions += `\n✅ QUÉ SÍ HACER:\n`;
        brandKit.examples.do.forEach(rule => {
          instructions += `- ${rule}\n`;
        });
      }
      
      if (brandKit.examples.dont && brandKit.examples.dont.length > 0) {
        instructions += `\n❌ QUÉ NO HACER:\n`;
        brandKit.examples.dont.forEach(rule => {
          instructions += `- ${rule}\n`;
        });
      }
      instructions += `\n`;
    }

    // Guidelines específicas por tipo de contenido
    if (brandKit.usageGuidelines) {
      switch (contentType) {
        case 'post':
          instructions += `## ESPECÍFICO PARA POSTS:\n`;
          if (brandKit.usageGuidelines.posts) {
            instructions += `- Formatos: ${brandKit.usageGuidelines.posts.formats.join(', ')}\n`;
            brandKit.usageGuidelines.posts.rules.forEach(rule => {
              instructions += `- ${rule}\n`;
            });
          }
          break;
          
        case 'video':
          instructions += `## ESPECÍFICO PARA VIDEOS:\n`;
          if (brandKit.usageGuidelines.videos) {
            instructions += `- Formatos: ${brandKit.usageGuidelines.videos.formats.join(', ')}\n`;
            brandKit.usageGuidelines.videos.rules.forEach(rule => {
              instructions += `- ${rule}\n`;
            });
          }
          break;
          
        case 'story':
          instructions += `## ESPECÍFICO PARA HISTORIAS:\n`;
          if (brandKit.usageGuidelines.stories) {
            instructions += `- Formatos: ${brandKit.usageGuidelines.stories.formats.join(', ')}\n`;
            brandKit.usageGuidelines.stories.rules.forEach(rule => {
              instructions += `- ${rule}\n`;
            });
          }
          break;
          
        case 'podcast':
          instructions += `## ESPECÍFICO PARA PODCASTS:\n`;
          if (brandKit.usageGuidelines.podcasts) {
            instructions += `- Formato de portada: ${brandKit.usageGuidelines.podcasts.coverFormat}\n`;
            brandKit.usageGuidelines.podcasts.rules.forEach(rule => {
              instructions += `- ${rule}\n`;
            });
          }
          if (brandKit.audio) {
            instructions += `- Estilo de audio: ${brandKit.audio.style}\n`;
            if (brandKit.audio.rules) {
              brandKit.audio.rules.forEach(rule => {
                instructions += `- ${rule}\n`;
              });
            }
          }
          break;
          
        case 'chat':
        default:
          instructions += `## ESPECÍFICO PARA CHAT:\n`;
          instructions += `- Mantener personalidad de marca\n`;
          instructions += `- Usar ejemplos de comunicación como referencia\n`;
          instructions += `- Ser consistente con el tono definido\n`;
          break;
      }
    }

    instructions += `\n## IMPORTANTE:\n`;
    instructions += `- SIEMPRE verificar que el contenido cumpla con las reglas de marca\n`;
    instructions += `- Si hay conflicto entre creatividad y brand guidelines, priorizar las guidelines\n`;
    instructions += `- Alertar si se detecta uso incorrecto de elementos de marca\n`;

    return instructions;
  }

  static async validateContentAgainstBrand(content: string): Promise<{
    isValid: boolean;
    violations: string[];
    suggestions: string[];
  }> {
    const brandKit = await this.getBrandKit();
    
    if (!brandKit) {
      return {
        isValid: true,
        violations: [],
        suggestions: ["No hay BrandKit configurado para validar"]
      };
    }

    const violations: string[] = [];
    const suggestions: string[] = [];

    // Validar tono de voz
    if (brandKit.voiceTone) {
      // Aquí se podría integrar con un LLM para análisis más sofisticado
      const contentLower = content.toLowerCase();
      
      // Ejemplos básicos de validación
      if (brandKit.voiceTone.style.toLowerCase().includes('profesional') && 
          (contentLower.includes('jaja') || contentLower.includes('xd'))) {
        violations.push("El contenido parece muy informal para una marca profesional");
        suggestions.push("Usar un lenguaje más profesional acorde a la personalidad de marca");
      }
      
      if (brandKit.voiceTone.style.toLowerCase().includes('claro') && content.length > 500) {
        suggestions.push("El mensaje es muy largo; considera hacerlo más conciso según el estilo de marca");
      }
    }

    // Validar reglas específicas usando la nueva estructura
    if (brandKit.examples && brandKit.examples.dont) {
      brandKit.examples.dont.forEach(rule => {
        // Validaciones básicas basadas en palabras clave
        if (rule.toLowerCase().includes('colores') && 
            content.includes('#') && 
            !this.containsBrandColors(content, brandKit.colors)) {
          violations.push(`Posible uso de colores no autorizados: ${rule}`);
        }
      });
    }

    return {
      isValid: violations.length === 0,
      violations,
      suggestions
    };
  }

  private static containsBrandColors(content: string, brandColors: any): boolean {
    if (!brandColors) return true;
    
    const hexMatches = content.match(/#[0-9A-Fa-f]{6}/g);
    if (!hexMatches) return true;
    
    // Extract all brand colors from the new structure
    const allBrandColors = [
      ...(brandColors.primary || []),
      ...(brandColors.secondary || []),
      ...(brandColors.alternatives || [])
    ];
    
    const brandHexCodes = allBrandColors.map(color => color.toUpperCase());
    
    return hexMatches.every(hex => brandHexCodes.includes(hex.toUpperCase()));
  }
}