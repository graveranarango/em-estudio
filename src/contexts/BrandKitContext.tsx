import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';

// Real BrandKit data structure based on company_001 JSON
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

interface BrandKitContextType {
  brandKit: BrandKitData | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  lastUpdated: string | null;
  hasBrandKit: boolean;
  refreshBrandKit: () => Promise<void>;
  updateBrandKit: (updates: Partial<BrandKitData>) => Promise<void>;
  uploadAndAnalyzeManual: (file: File) => Promise<void>;
  saveBrandKit: (brandKitData: BrandKitData) => Promise<void>;
  // Helpers for quick access
  getPrimaryColors: () => Array<{ name: string; hex: string; usage: string; type: string }>;
  getSecondaryColors: () => Array<{ name: string; hex: string; usage: string; type: string }>;
  getPrimaryFont: () => { name: string; font: string; weight: string; type: string } | null;
  getSecondaryFont: () => { name: string; font: string; weight: string; type: string } | null;
  getPrimaryLogo: () => { id: string; name: string; url: string; type: string } | null;
  getVoiceToneInstructions: () => string;
  getBrandInstructions: (moduleType?: 'post' | 'video' | 'story' | 'chat' | 'podcast') => Promise<string>;
  validateBrandColor: (hexColor: string) => boolean;
  getBrandCompliance: () => { score: number; missing: string[]; recommendations: string[] };
}

const BrandKitContext = createContext<BrandKitContextType | undefined>(undefined);

interface BrandKitProviderProps {
  children: ReactNode;
}

export function BrandKitProvider({ children }: BrandKitProviderProps) {
  const [brandKit, setBrandKit] = useState<BrandKitData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadBrandKitData = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);

      // Real BrandKit data from company_001
      const realBrandKit: BrandKitData = {
        id: "company_001",
        meta: {
          brandName: "Tu Marca",
          lastUpdated: "2025-09-28T15:30:00Z",
          version: 1
        },
        colors: {
          primary: ["#21EDE7", "#112846"],
          secondary: ["#FC9528"],
          alternatives: ["#F4F6F8", "#000000"],
          gradients: [
            { name: "Sunset", from: "#21EDE7", to: "#FC9528" }
          ],
          rules: {
            allowedCombinations: [["#21EDE7", "#112846"]],
            forbiddenColors: ["#FF0000"]
          }
        },
        typography: {
          primary: { name: "Montserrat", weights: ["Regular", "Bold", "ExtraBold"] },
          secondary: { name: "Inter", weights: ["Regular", "Medium"] },
          hierarchy: {
            h1: { font: "Montserrat", size: 48 },
            h2: { font: "Montserrat", size: 32 },
            body: { font: "Inter", size: 16 },
            caption: { font: "Inter", size: 12 }
          }
        },
        logos: [
          {
            name: "main",
            formats: ["svg", "png"],
            url: "https://storage.brandkit/logo_main.svg",
            usage: "default"
          },
          {
            name: "negative",
            formats: ["svg"],
            url: "https://storage.brandkit/logo_negative.svg",
            usage: "darkBackground"
          }
        ],
        iconography: {
          style: "outline",
          examples: ["download", "share", "arrow"],
          rules: ["usar solo íconos de la librería oficial"]
        },
        illustrations: {
          style: "flat",
          examples: ["people_teamwork.png", "delivery_box.svg"]
        },
        photography: {
          style: "natural_light",
          filters: ["bright", "highContrast"],
          examples: ["office_team.jpg", "warehouse.jpg"]
        },
        motion: {
          speed: "fast",
          transitions: ["fade", "slide"],
          rules: ["no usar animaciones rebote"]
        },
        audio: {
          jingles: ["intro.mp3", "outro.mp3"],
          style: "corporate_but_friendly",
          rules: ["usar en todos los podcasts y reels educativos"]
        },
        voiceTone: {
          style: "Profesional pero cercano",
          examples: {
            correct: ["Bienvenido a la familia, estamos contigo"],
            incorrect: ["Compra YA o te lo pierdes!!!"]
          }
        },
        messaging: {
          tagline: "Conectando tu mundo",
          slogans: ["Más cerca de ti", "Rápido y seguro"],
          differentiators: ["Atención personalizada", "Cobertura internacional"]
        },
        storytelling: {
          mission: "Facilitar la conexión entre personas y países",
          vision: "Ser la plataforma líder en envíos internacionales",
          values: ["Transparencia", "Rapidez", "Cercanía"]
        },
        usageGuidelines: {
          posts: { formats: ["1:1", "4:5"], rules: ["usar logo en esquina superior"] },
          stories: { formats: ["9:16"], rules: ["CTA obligatorio"] },
          videos: { formats: ["16:9", "9:16"], rules: ["subtítulos obligatorios"] },
          podcasts: { coverFormat: "3000x3000px", rules: ["logo siempre visible"] }
        },
        examples: {
          do: [
            "Usar tipografía oficial",
            "Mantener contraste alto",
            "Respetar márgenes del logo"
          ],
          dont: [
            "Deformar el logo",
            "Usar colores no autorizados",
            "Cambiar tipografía"
          ]
        },
        accessibility: {
          contrastRatio: "AA",
          minFontSize: 14,
          videoSubtitles: true,
          altTextRequired: true
        },
        internationalization: {
          supportedLanguages: ["es", "en"],
          sloganTranslations: {
            en: "Connecting your world",
            es: "Conectando tu mundo"
          },
          cultureNotes: ["Evitar modismos locales en inglés"]
        },
        validation: {
          coherenceReport: {
            lastScan: "2025-09-28",
            complianceRate: "92%",
            issues: ["3 assets con colores fuera de paleta"]
          }
        }
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBrandKit(realBrandKit);
      setLastUpdated('hace unos minutos');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error cargando BrandKit';
      console.error('Error loading BrandKit:', err);
      setError(errorMessage);
      setBrandKit(null);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const refreshBrandKit = async () => {
    await loadBrandKitData(false);
  };

  const updateBrandKit = async (updates: Partial<BrandKitData>) => {
    try {
      if (!brandKit) return;
      
      const updatedBrandKit = {
        ...brandKit,
        ...updates,
        metadata: {
          ...brandKit.metadata,
          updatedAt: new Date()
        }
      };
      
      setBrandKit(updatedBrandKit);
      setLastUpdated('hace unos momentos');
      
      // In a real implementation, save to Supabase here
      console.log('BrandKit updated:', updatedBrandKit);
    } catch (err) {
      console.error('Error updating BrandKit:', err);
      setError('Error actualizando BrandKit');
    }
  };

  const uploadAndAnalyzeManual = async (file: File) => {
    const startTime = Date.now();
    
    try {
      setIsAnalyzing(true);
      setError(null);
      
      console.log('=== Starting Brand Manual Analysis ===');
      console.log(`File: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      // Validate file before sending
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`Archivo demasiado grande (${Math.round(file.size / 1024 / 1024)}MB). Máximo permitido: 10MB`);
      }

      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'image/webp'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error(`Tipo de archivo no soportado: ${file.type}. Soportados: PDF, DOCX, PNG, JPG`);
      }
      
      // Create FormData para enviar el archivo
      const formData = new FormData();
      formData.append('file', file);
      
      // Call the backend to analyze with Gemini
      console.log('Calling backend analysis service...');
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64/analyze-brand-manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log(`Backend response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Backend error details:', errorData);
        } catch (e) {
          console.error('Failed to parse error response');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Backend response received:', {
        success: result.success,
        processingTime: result.processingTime,
        extractedBy: result.extractedBy
      });
      
      if (!result.success) {
        throw new Error(result.error || 'El análisis no fue exitoso');
      }

      // Use the normalized BrandKitData structure from Gemini
      const normalizedBrandKit: BrandKitData = result.analysis;
      
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      console.log('=== Analysis Completed Successfully ===');
      console.log(`Total time: ${totalTime}s`);
      console.log(`Brand: ${normalizedBrandKit.meta.brandName}`);
      console.log(`Colors: ${normalizedBrandKit.colors.primary.length} primary, ${normalizedBrandKit.colors.secondary.length} secondary`);
      console.log(`Typography: ${normalizedBrandKit.typography.primary.name}`);
      console.log(`Logos: ${normalizedBrandKit.logos.length}`);

      // Update the context with the normalized data
      setBrandKit(normalizedBrandKit);
      setLastUpdated('hace unos momentos');
      
      // Save to persistent storage using the context method
      console.log('Saving to persistent storage...');
      await saveBrandKit(normalizedBrandKit);
      
    } catch (err) {
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error('=== Analysis Failed ===');
      console.error(`Total time: ${totalTime}s`);
      console.error('Error details:', err);
      
      let errorMessage = 'Error analizando el manual de marca';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'El análisis tardó demasiado tiempo (timeout). Intenta con un archivo más pequeño.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Add saveBrandKit method for persistent storage
  const saveBrandKit = async (brandKitData: BrandKitData) => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-ecf7df64/save-brandkit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(brandKitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error saving BrandKit');
      }

      const result = await response.json();
      console.log('BrandKit saved successfully:', result);
      
    } catch (err) {
      console.error('Error saving BrandKit:', err);
      // Don't throw error here as it's not critical for the UI
    }
  };

  // Cargar BrandKit al inicializar
  useEffect(() => {
    loadBrandKitData();
  }, []);

  // Helper functions for quick access (memoized for performance)
  const getPrimaryColors = useCallback(() => {
    if (!brandKit?.colors?.primary) return [];
    return brandKit.colors.primary.map((hex, index) => ({
      name: `Color Primario ${index + 1}`,
      hex,
      usage: 'Color principal de marca',
      type: 'primary'
    }));
  }, [brandKit?.colors]);

  const getSecondaryColors = useCallback(() => {
    if (!brandKit?.colors) return [];
    const colors = [];
    
    // Add secondary colors
    if (brandKit.colors.secondary) {
      colors.push(...brandKit.colors.secondary.map((hex, index) => ({
        name: `Color Secundario ${index + 1}`,
        hex,
        usage: 'Color secundario de marca',
        type: 'secondary'
      })));
    }
    
    // Add alternative colors
    if (brandKit.colors.alternatives) {
      colors.push(...brandKit.colors.alternatives.map((hex, index) => ({
        name: `Color Alternativo ${index + 1}`,
        hex,
        usage: 'Color alternativo',
        type: 'alternative'
      })));
    }
    
    return colors;
  }, [brandKit?.colors]);

  const getPrimaryFont = useCallback(() => {
    if (!brandKit?.typography?.primary) return null;
    return {
      name: brandKit.typography.primary.name,
      font: brandKit.typography.primary.name,
      weight: brandKit.typography.primary.weights[0] || 'Regular',
      type: 'primary'
    };
  }, [brandKit?.typography]);

  const getSecondaryFont = useCallback(() => {
    if (!brandKit?.typography?.secondary) return null;
    return {
      name: brandKit.typography.secondary.name,
      font: brandKit.typography.secondary.name,
      weight: brandKit.typography.secondary.weights[0] || 'Regular',
      type: 'secondary'
    };
  }, [brandKit?.typography]);

  const getPrimaryLogo = useCallback(() => {
    if (!brandKit?.logos?.length) return null;
    const mainLogo = brandKit.logos.find(logo => logo.name === 'main') || brandKit.logos[0];
    return {
      id: mainLogo.name,
      name: mainLogo.name,
      url: mainLogo.url,
      type: mainLogo.usage
    };
  }, [brandKit?.logos]);

  const getVoiceToneInstructions = useCallback(() => {
    if (!brandKit?.voiceTone) return '';
    
    let instructions = `Estilo: ${brandKit.voiceTone.style}. `;
    
    if (brandKit.voiceTone.examples?.correct?.length > 0) {
      instructions += `Ejemplos correctos: ${brandKit.voiceTone.examples.correct.join(', ')}. `;
    }
    
    if (brandKit.voiceTone.examples?.incorrect?.length > 0) {
      instructions += `Evitar: ${brandKit.voiceTone.examples.incorrect.join(', ')}. `;
    }
    
    return instructions.trim();
  }, [brandKit?.voiceTone]);

  const getBrandInstructions = useCallback(async (moduleType: 'post' | 'video' | 'story' | 'chat' | 'podcast' = 'post') => {
    if (!brandKit) return '';
    
    const baseInstructions = getVoiceToneInstructions();
    const colorInstructions = getPrimaryColors().map(c => c.hex).join(', ');
    const fontInstructions = getPrimaryFont()?.name || 'Fuente por defecto';
    const guidelines = brandKit.usageGuidelines;
    
    switch (moduleType) {
      case 'post':
        return `${baseInstructions} Formatos: ${guidelines?.posts?.formats?.join(', ') || '1:1, 4:5'}. Reglas: ${guidelines?.posts?.rules?.join(', ') || 'Usar logo discreto'}. Colores: ${colorInstructions}. Tipografía: ${fontInstructions}.`;
      case 'video':
        return `${baseInstructions} Formatos: ${guidelines?.videos?.formats?.join(', ') || '16:9, 9:16'}. Reglas: ${guidelines?.videos?.rules?.join(', ') || 'Subtítulos obligatorios'}. Colores: ${colorInstructions}. Tipografía: ${fontInstructions}.`;
      case 'story':
        return `${baseInstructions} Formatos: ${guidelines?.stories?.formats?.join(', ') || '9:16'}. Reglas: ${guidelines?.stories?.rules?.join(', ') || 'CTA obligatorio'}. Colores: ${colorInstructions}. Tipografía: ${fontInstructions}.`;
      case 'podcast':
        return `${baseInstructions} Formato de portada: ${guidelines?.podcasts?.coverFormat || '3000x3000px'}. Reglas: ${guidelines?.podcasts?.rules?.join(', ') || 'Logo visible'}. Audio: ${brandKit.audio?.style || 'Estilo corporativo amigable'}.`;
      case 'chat':
        return `${baseInstructions} Mantén el tono de voz consistente en todas las respuestas.`;
      default:
        return baseInstructions;
    }
  }, [getVoiceToneInstructions, getPrimaryColors, getPrimaryFont, brandKit]);

  const validateBrandColor = useCallback((hexColor: string) => {
    if (!brandKit?.colors) return true; // Si no hay colores definidos, permitir cualquiera
    
    const allColors = [
      ...(brandKit.colors.primary || []),
      ...(brandKit.colors.secondary || []),
      ...(brandKit.colors.alternatives || [])
    ];
    
    // Check if color is in the allowed palette
    const isAllowed = allColors.some(color => color.toUpperCase() === hexColor.toUpperCase());
    
    // Check if color is explicitly forbidden
    const isForbidden = brandKit.colors.rules?.forbiddenColors?.some(
      color => color.toUpperCase() === hexColor.toUpperCase()
    );
    
    return isAllowed && !isForbidden;
  }, [brandKit?.colors]);

  const getBrandCompliance = useCallback(() => {
    if (!brandKit) return { score: 0, missing: [], recommendations: [] };
    
    // Use the real validation data if available
    if (brandKit.validation?.coherenceReport) {
      const complianceRate = parseInt(brandKit.validation.coherenceReport.complianceRate.replace('%', ''));
      const issues = brandKit.validation.coherenceReport.issues || [];
      
      const recommendations = [];
      if (complianceRate < 95 && issues.length > 0) {
        recommendations.push(`Corrige los siguientes problemas: ${issues.join(', ')}`);
      }
      if (complianceRate < 85) {
        recommendations.push('Revisa la consistencia en todos los assets');
      }
      
      return {
        score: complianceRate,
        missing: issues,
        recommendations
      };
    }
    
    // Fallback calculation
    const sections = [
      { key: 'colors', weight: 15, exists: !!brandKit.colors?.primary?.length },
      { key: 'typography', weight: 15, exists: !!brandKit.typography?.primary },
      { key: 'logos', weight: 15, exists: !!brandKit.logos?.length },
      { key: 'voiceTone', weight: 10, exists: !!brandKit.voiceTone?.style },
      { key: 'messaging', weight: 10, exists: !!brandKit.messaging?.tagline },
      { key: 'storytelling', weight: 10, exists: !!brandKit.storytelling?.mission },
      { key: 'guidelines', weight: 10, exists: !!brandKit.usageGuidelines?.posts },
      { key: 'accessibility', weight: 5, exists: !!brandKit.accessibility?.contrastRatio },
      { key: 'internationalization', weight: 5, exists: !!brandKit.internationalization?.supportedLanguages?.length },
      { key: 'audio', weight: 5, exists: !!brandKit.audio?.style }
    ];
    
    const totalScore = sections.reduce((acc, section) => 
      acc + (section.exists ? section.weight : 0), 0
    );
    
    const missing = sections
      .filter(section => !section.exists)
      .map(section => {
        switch (section.key) {
          case 'colors': return 'Paleta de colores';
          case 'typography': return 'Tipografías';
          case 'logos': return 'Logos';
          case 'voiceTone': return 'Tono de voz';
          case 'messaging': return 'Mensajes clave';
          case 'storytelling': return 'Historia de marca';
          case 'guidelines': return 'Guías de aplicación';
          case 'accessibility': return 'Reglas de accesibilidad';
          case 'internationalization': return 'Internacionalización';
          case 'audio': return 'Elementos de audio';
          default: return section.key;
        }
      });
    
    const recommendations = [];
    if (totalScore < 60) {
      recommendations.push('Completa los elementos básicos: colores, tipografías y logos');
    }
    if (totalScore < 80) {
      recommendations.push('Añade tono de voz y mensajes clave para mayor consistencia');
    }
    if (totalScore < 95) {
      recommendations.push('Completa elementos avanzados: audio, internacionalización');
    }
    
    return { score: totalScore, missing, recommendations };
  }, [brandKit]);

  const contextValue: BrandKitContextType = useMemo(() => ({
    brandKit,
    isLoading,
    isAnalyzing,
    error,
    lastUpdated,
    hasBrandKit: !!brandKit,
    refreshBrandKit,
    updateBrandKit,
    uploadAndAnalyzeManual,
    saveBrandKit,
    getPrimaryColors,
    getSecondaryColors,
    getPrimaryFont,
    getSecondaryFont,
    getPrimaryLogo,
    getVoiceToneInstructions,
    getBrandInstructions,
    validateBrandColor,
    getBrandCompliance
  }), [
    brandKit,
    isLoading,
    isAnalyzing,
    error,
    lastUpdated,
    refreshBrandKit,
    updateBrandKit,
    uploadAndAnalyzeManual,
    saveBrandKit,
    getPrimaryColors,
    getSecondaryColors,
    getPrimaryFont,
    getSecondaryFont,
    getPrimaryLogo,
    getVoiceToneInstructions,
    getBrandInstructions,
    validateBrandColor,
    getBrandCompliance
  ]);

  return (
    <BrandKitContext.Provider value={contextValue}>
      {children}
    </BrandKitContext.Provider>
  );
}

export function useBrandKit() {
  const context = useContext(BrandKitContext);
  if (context === undefined) {
    throw new Error('useBrandKit must be used within a BrandKitProvider');
  }
  return context;
}

// Hook específico para obtener solo los colores (útil para componentes que solo necesitan colores)
export function useBrandColors() {
  const { getPrimaryColors, getSecondaryColors, brandKit } = useBrandKit();
  return {
    primaryColors: getPrimaryColors(),
    secondaryColors: getSecondaryColors(),
    allColors: brandKit?.colors || [],
    hasColors: !!(brandKit?.colors?.length)
  };
}

// Hook específico para tipografías
export function useBrandTypography() {
  const { getPrimaryFont, getSecondaryFont, brandKit } = useBrandKit();
  return {
    primaryFont: getPrimaryFont(),
    secondaryFont: getSecondaryFont(),
    allFonts: brandKit?.typography || [],
    hasFonts: !!(brandKit?.typography?.length)
  };
}

// Hook específico para tono de voz
export function useBrandVoice() {
  const { getVoiceToneInstructions, brandKit } = useBrandKit();
  return {
    voiceTone: brandKit?.voiceTone,
    instructions: getVoiceToneInstructions(),
    hasVoiceTone: !!(brandKit?.voiceTone?.personality)
  };
}