import { GoogleGenerativeAI } from "npm:@google/generative-ai";

// Complete BrandKitData structure that matches the frontend
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

export class BrandAnalyzer {
  private genAI: GoogleGenerativeAI | null;
  private availableModels: string[] = [];

  constructor() {
    const apiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!apiKey) {
      console.warn("GOOGLE_AI_API_KEY not found, AI analysis will be disabled");
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.initializeModels();
    }
  }

  private async initializeModels() {
    if (!this.genAI) return;
    
    try {
      // List of models to try, in order of preference (using correct library names)
      const potentialModels = [
        "gemini-1.5-flash",      // Fastest, good for most tasks
        "gemini-1.5-pro",        // More capable, slower  
        "gemini-1.5-pro-vision"  // For image analysis (may not be available in all regions)
      ];
      
      this.availableModels = potentialModels;
      console.log("Initialized BrandAnalyzer with correct model names:", this.availableModels);
    } catch (error) {
      console.warn("Error during model initialization:", error);
      this.availableModels = ["gemini-1.5-pro"]; // Conservative fallback
    }
  }

  private async getWorkingModel(requiresVision: boolean = false): Promise<string> {
    if (!this.genAI) throw new Error("Google AI not available");

    // For vision tasks, prioritize models that can handle images
    const modelsPriority = requiresVision 
      ? ["gemini-1.5-pro", "gemini-1.5-flash"]  // All these models support vision
      : ["gemini-1.5-flash", "gemini-1.5-pro"];

    let lastError: any;
    
    for (const modelName of modelsPriority) {
      try {
        // Test with a minimal request to validate the model actually works
        const testModel = this.genAI.getGenerativeModel({ model: modelName });
        
        // Don't test here - just return the model name if it can be created
        console.log(`✅ Selected model: ${modelName} (vision: ${requiresVision})`);
        return modelName;
        
      } catch (error) {
        lastError = error;
        console.warn(`❌ Model ${modelName} not accessible: ${error.message}`);
        continue;
      }
    }

    // If no models work, throw error with details
    const errorMsg = `No working Gemini models found. Check if your API key has access to gemini-1.5-pro or gemini-1.5-flash models. Last error: ${lastError?.message || 'Unknown error'}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  async analyzeFile(file: File): Promise<BrandKitData> {
    const startTime = Date.now();
    
    try {
      console.log(`Starting analysis of file: ${file.name}, type: ${file.type}, size: ${file.size}`);

      // If no AI API available, return fallback analysis
      if (!this.genAI) {
        console.warn("Google AI API not available, returning fallback analysis");
        return this.getFallbackAnalysis(file);
      }

      // Validate file type first
      const supportedTypes = [
        'image/png', 'image/jpeg', 'image/jpg', 'image/webp',
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!supportedTypes.includes(file.type)) {
        console.warn(`Unsupported file type: ${file.type}, using fallback analysis`);
        return this.getFallbackAnalysis(file);
      }

      let analysisPrompt = "";
      let fileContent: any = null;

      // Procesar según el tipo de archivo
      if (file.type.includes('image/')) {
        console.log("Processing as image file...");
        fileContent = await this.processImage(file);
        analysisPrompt = this.getImageAnalysisPrompt();
      } else if (file.type === 'application/pdf') {
        console.log("Processing as PDF file...");
        fileContent = await this.processPDF(file);
        analysisPrompt = this.getPDFAnalysisPrompt();
      } else if (file.type.includes('wordprocessingml')) {
        console.log("Processing as DOCX file...");
        fileContent = await this.processDOCX(file);
        analysisPrompt = this.getDocumentAnalysisPrompt();
      } else {
        throw new Error(`Unsupported file type: ${file.type}`);
      }

      console.log("Sending content to Gemini for analysis...");
      
      // Usar Gemini para analizar el contenido
      const result = await this.analyzeWithGemini(fileContent, analysisPrompt);
      
      console.log("Gemini analysis completed, normalizing structure...");
      
      // Normalize the AI response to the complete BrandKitData structure
      const normalizedResult = this.normalizeToCompleteStructure(result, file);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`Analysis completed successfully in ${processingTime}s`);
      
      return normalizedResult;

    } catch (error) {
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`Error analyzing file after ${processingTime}s:`, error);
      
      // If AI analysis fails, return fallback
      console.warn("AI analysis failed, returning fallback analysis with error details");
      const fallback = this.getFallbackAnalysis(file);
      
      // Add error info to the fallback analysis
      fallback.validation.coherenceReport.issues.push(
        `Error during AI analysis: ${error.message}`,
        `Processing time: ${processingTime}s`,
        `Fallback analysis used`
      );
      
      return fallback;
    }
  }

  private async processImage(file: File): Promise<any> {
    try {
      console.log(`Processing image: ${file.name}, type: ${file.type}, size: ${file.size}`);
      
      // Validate image size (limit to 4MB for Gemini)
      const maxSize = 4 * 1024 * 1024; // 4MB
      if (file.size > maxSize) {
        console.warn(`Image file too large (${file.size} bytes), processing as text description`);
        return `Large image file: ${file.name} (${file.type}). Unable to process directly due to size constraints.`;
      }

      // Convertir imagen a base64 para Gemini Vision
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to base64 more efficiently
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        binary += String.fromCharCode.apply(null, chunk as any);
      }
      const base64 = btoa(binary);
      
      console.log(`Image converted to base64 (${base64.length} characters)`);
      
      return {
        inlineData: {
          data: base64,
          mimeType: file.type
        }
      };
    } catch (error) {
      console.error("Error processing image:", error);
      return `Error processing image file: ${file.name}. ${error.message}`;
    }
  }

  private async processPDF(file: File): Promise<string> {
    // Para PDFs, necesitaríamos una librería de parsing
    // Por ahora, simulamos la extracción de texto
    console.log("Processing PDF file...");
    
    // En una implementación real, usaríamos pdf-parse o similar
    // return await this.extractTextFromPDF(file);
    
    return "PDF content extraction not implemented - using mock analysis";
  }

  private async processDOCX(file: File): Promise<string> {
    // Para DOCX, necesitaríamos una librería como mammoth
    console.log("Processing DOCX file...");
    
    // En una implementación real, usaríamos mammoth.js o similar
    // return await this.extractTextFromDOCX(file);
    
    return "DOCX content extraction not implemented - using mock analysis";
  }

  private async analyzeWithGemini(fileContent: any, prompt: string): Promise<string> {
    if (!this.genAI) {
      throw new Error("Google AI API not available");
    }
    
    try {
      const isVisionContent = fileContent && fileContent.inlineData;
      console.log(`Analyzing with Gemini (vision: ${isVisionContent})`);
      
      // Get appropriate model for the task
      const modelName = await this.getWorkingModel(isVisionContent);
      console.log(`Using model: ${modelName}`);
      
      const model = this.genAI.getGenerativeModel({ model: modelName });
      let parts: any[] = [{ text: prompt }];

      // Handle different content types
      if (isVisionContent) {
        console.log("Adding image content for vision analysis");
        parts.push(fileContent);
      } else if (typeof fileContent === 'string') {
        console.log("Adding text content for analysis");
        parts[0].text += `\n\nContent to analyze:\n${fileContent}`;
      }

      console.log(`Sending request to Gemini (${modelName})...`);
      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ Gemini response received from ${modelName} (${text.length} characters)`);
      return text;
      
    } catch (error) {
      console.error("Error with Gemini analysis:", error);
      
      // Provide more specific error information
      let errorMessage = `Gemini analysis failed: ${error.message}`;
      
      if (error.message.includes('404')) {
        errorMessage += '. The requested model may not be available with your API key.';
      } else if (error.message.includes('403')) {
        errorMessage += '. API key may be invalid or lacking permissions.';
      } else if (error.message.includes('429')) {
        errorMessage += '. Rate limit exceeded. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }
  }

  private getImageAnalysisPrompt(): string {
    return `
Analiza esta imagen de manual de marca y extrae la siguiente información en formato JSON exacto:

{
  "brandName": "Nombre de la marca detectado",
  "colors": {
    "primary": ["#HEX1", "#HEX2"],
    "secondary": ["#HEX3", "#HEX4"],
    "alternatives": ["#HEX5"],
    "gradients": [{"name": "Gradient Name", "from": "#HEX1", "to": "#HEX2"}]
  },
  "typography": {
    "primary": {"name": "Primary Font", "weights": ["Regular", "Bold"]},
    "secondary": {"name": "Secondary Font", "weights": ["Regular", "Medium"]},
    "hierarchy": {
      "h1": {"font": "Font Name", "size": 48},
      "h2": {"font": "Font Name", "size": 32},
      "body": {"font": "Font Name", "size": 16},
      "caption": {"font": "Font Name", "size": 12}
    }
  },
  "logos": [
    {"name": "main", "formats": ["svg", "png"], "usage": "default", "description": "Logo principal"}
  ],
  "iconography": {
    "style": "flat/minimal/outline",
    "examples": ["icon1", "icon2"],
    "rules": ["regla de iconografía"]
  },
  "illustrations": {
    "style": "flat/gradient/realistic",
    "examples": ["illustration1.svg"]
  },
  "photography": {
    "style": "natural/studio/lifestyle",
    "filters": ["bright", "highContrast"],
    "examples": ["photo1.jpg"]
  },
  "voiceTone": {
    "style": "Descripción del tono de voz",
    "examples": {
      "correct": ["Ejemplo correcto 1"],
      "incorrect": ["Ejemplo incorrecto 1"]
    }
  },
  "messaging": {
    "tagline": "Tagline principal",
    "slogans": ["Slogan 1", "Slogan 2"],
    "differentiators": ["Diferenciador 1"]
  },
  "storytelling": {
    "mission": "Misión de la empresa",
    "vision": "Visión de la empresa",
    "values": ["Valor 1", "Valor 2"]
  },
  "usageGuidelines": {
    "posts": {"formats": ["1:1", "4:5"], "rules": ["regla posts"]},
    "stories": {"formats": ["9:16"], "rules": ["regla stories"]},
    "videos": {"formats": ["16:9"], "rules": ["regla videos"]},
    "podcasts": {"coverFormat": "3000x3000px", "rules": ["regla podcasts"]}
  },
  "examples": {
    "do": ["Hacer esto", "Y esto también"],
    "dont": ["No hacer esto", "Evitar esto"]
  },
  "accessibility": {
    "contrastRatio": "AA/AAA",
    "minFontSize": 14,
    "videoSubtitles": true,
    "altTextRequired": true
  },
  "motion": {
    "speed": "fast/medium/slow",
    "transitions": ["fade", "slide"],
    "rules": ["regla motion"]
  },
  "audio": {
    "jingles": ["intro.mp3"],
    "style": "corporate/friendly/energetic",
    "rules": ["regla audio"]
  }
}

INSTRUCCIONES CRÍTICAS:
1. DEBES extraer TODOS los colores visibles como códigos HEX válidos (#RRGGBB)
2. IDENTIFICA todas las fuentes tipográficas y sus pesos
3. BUSCA información de personalidad/tono de voz/messaging
4. EXTRAE reglas de uso, qué hacer y qué no hacer
5. Si NO encuentras información específica, usa placeholders inteligentes basados en el contexto visual
6. Los arrays vacíos DEBEN contener al menos un placeholder ("N/A" o descripción genérica)
7. RESPONDE EXCLUSIVAMENTE CON EL JSON, SIN TEXTO ADICIONAL
`;
  }

  private getPDFAnalysisPrompt(): string {
    return `
Analiza este contenido de manual de marca PDF y extrae la información en el formato JSON exacto del esquema completo:

{
  "brandName": "Nombre de la marca detectado en el manual",
  "colors": {
    "primary": ["#HEX1", "#HEX2"],
    "secondary": ["#HEX3", "#HEX4"], 
    "alternatives": ["#HEX5"],
    "gradients": [{"name": "Gradient Name", "from": "#HEX1", "to": "#HEX2"}]
  },
  "typography": {
    "primary": {"name": "Primary Font", "weights": ["Regular", "Bold"]},
    "secondary": {"name": "Secondary Font", "weights": ["Regular", "Medium"]},
    "hierarchy": {
      "h1": {"font": "Font Name", "size": 48},
      "h2": {"font": "Font Name", "size": 32},
      "body": {"font": "Font Name", "size": 16},
      "caption": {"font": "Font Name", "size": 12}
    }
  },
  "logos": [
    {"name": "main", "formats": ["svg", "png"], "usage": "default", "description": "Logo principal"}
  ],
  "iconography": {
    "style": "outline/filled/minimal",
    "examples": ["icon examples"],
    "rules": ["iconography rules"]
  },
  "illustrations": {
    "style": "illustration style",
    "examples": ["illustration examples"]
  },
  "photography": {
    "style": "photography style",
    "filters": ["filter names"],
    "examples": ["photo examples"]
  },
  "voiceTone": {
    "style": "Brand voice and tone description",
    "examples": {
      "correct": ["Correct voice examples"],
      "incorrect": ["Incorrect voice examples"]
    }
  },
  "messaging": {
    "tagline": "Main tagline",
    "slogans": ["Slogan 1", "Slogan 2"],
    "differentiators": ["Key differentiator 1"]
  },
  "storytelling": {
    "mission": "Company mission",
    "vision": "Company vision",
    "values": ["Core value 1", "Core value 2"]
  },
  "usageGuidelines": {
    "posts": {"formats": ["1:1", "4:5"], "rules": ["Post usage rules"]},
    "stories": {"formats": ["9:16"], "rules": ["Story usage rules"]},
    "videos": {"formats": ["16:9"], "rules": ["Video usage rules"]},
    "podcasts": {"coverFormat": "3000x3000px", "rules": ["Podcast rules"]}
  },
  "examples": {
    "do": ["Do this", "Also do this"],
    "dont": ["Don't do this", "Avoid this"]
  },
  "accessibility": {
    "contrastRatio": "AA or AAA",
    "minFontSize": 14,
    "videoSubtitles": true,
    "altTextRequired": true
  },
  "motion": {
    "speed": "fast/medium/slow",
    "transitions": ["transition types"],
    "rules": ["motion rules"]
  },
  "audio": {
    "jingles": ["audio file names"],
    "style": "audio style description",
    "rules": ["audio usage rules"]
  }
}

BUSCA ESPECÍFICAMENTE EN EL TEXTO:
- Secciones de "Colores", "Palette", "Color Scheme" con códigos HEX/RGB
- Secciones de "Tipografía", "Fonts", "Typography" con nombres y pesos de fuentes
- Secciones de "Logo", "Marca", "Branding" con variantes y usos
- Secciones de "Tono", "Voice", "Personalidad", "Brand Voice"
- Secciones de "Misión", "Visión", "Valores", "Mission", "Vision", "Values"
- Secciones de "Uso", "Guidelines", "Do's and Don'ts", "Rules"
- Información sobre aplicaciones en redes sociales, posts, videos, etc.

NORMALIZACIÓN AUTOMÁTICA:
- Si encuentras arrays planos de colores, conviértelos al formato correcto
- Si solo hay nombres de fuentes, crea la estructura completa con pesos por defecto
- Genera placeholders inteligentes para información faltante
- Asegúrate de que TODOS los campos del esquema estén presentes

RESPONDE EXCLUSIVAMENTE CON EL JSON COMPLETO, SIN TEXTO ADICIONAL.
`;
  }

  private getDocumentAnalysisPrompt(): string {
    return this.getPDFAnalysisPrompt(); // Usar el mismo prompt para documentos
  }

  private normalizeToCompleteStructure(aiResponse: string, file: File): BrandKitData {
    try {
      console.log("Normalizing AI response to complete structure...");
      
      // Clean and extract JSON from AI response
      let jsonString = aiResponse.trim();
      
      // Try to find JSON in the response
      const jsonStart = jsonString.indexOf('{');
      const jsonEnd = jsonString.lastIndexOf('}') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd);
      } else {
        console.warn("No JSON found in AI response, using fallback structure");
        return this.createCompleteStructure({}, file);
      }

      // Try to parse the JSON
      let parsed: any = {};
      try {
        parsed = JSON.parse(jsonString);
        console.log("Successfully parsed AI response JSON");
      } catch (parseError) {
        console.warn("Failed to parse JSON, attempting to clean and retry:", parseError);
        
        // Try to clean common JSON formatting issues
        let cleanedJson = jsonString
          .replace(/,\s*}/g, '}')  // Remove trailing commas
          .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
          .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
          .replace(/:\s*'([^']*)'/g, ': "$1"')  // Replace single quotes with double quotes
          .replace(/\\n/g, ' ')  // Replace newlines
          .replace(/\\/g, '\\\\'); // Escape backslashes
        
        try {
          parsed = JSON.parse(cleanedJson);
          console.log("Successfully parsed cleaned JSON");
        } catch (secondParseError) {
          console.error("Failed to parse even cleaned JSON:", secondParseError);
          console.log("Original response:", aiResponse.substring(0, 500));
          console.log("Cleaned JSON attempt:", cleanedJson.substring(0, 500));
          parsed = {};
        }
      }

      // Normalize the parsed data to the complete BrandKitData structure
      const result = this.createCompleteStructure(parsed, file);
      console.log("Normalization completed successfully");
      return result;

    } catch (error) {
      console.error("Error in normalizeToCompleteStructure:", error);
      console.log("Full AI Response:", aiResponse);
      
      // Return minimal structure with error info
      const fallback = this.createCompleteStructure({}, file);
      fallback.validation.coherenceReport.issues.push(
        `JSON parsing error: ${error.message}`,
        "Using fallback structure"
      );
      return fallback;
    }
  }

  private createCompleteStructure(parsed: any, file: File): BrandKitData {
    const now = new Date().toISOString();
    
    return {
      id: `company_${Date.now()}`,
      meta: {
        brandName: parsed.brandName || "N/A",
        lastUpdated: now,
        version: 1
      },
      colors: {
        primary: this.normalizeColors(parsed.colors?.primary) || ["#21EDE7"],
        secondary: this.normalizeColors(parsed.colors?.secondary) || ["#FC9528"],
        alternatives: this.normalizeColors(parsed.colors?.alternatives) || ["#F4F6F8"],
        gradients: this.normalizeGradients(parsed.colors?.gradients) || [
          { name: "Primary Gradient", from: "#21EDE7", to: "#FC9528" }
        ],
        rules: {
          allowedCombinations: parsed.colors?.rules?.allowedCombinations || [["#21EDE7", "#FC9528"]],
          forbiddenColors: parsed.colors?.rules?.forbiddenColors || ["#FF0000"]
        }
      },
      typography: {
        primary: this.normalizeFont(parsed.typography?.primary) || { name: "Inter", weights: ["Regular", "Bold"] },
        secondary: this.normalizeFont(parsed.typography?.secondary) || { name: "Roboto", weights: ["Regular"] },
        hierarchy: this.normalizeHierarchy(parsed.typography?.hierarchy) || {
          h1: { font: "Inter", size: 48 },
          h2: { font: "Inter", size: 32 },
          body: { font: "Inter", size: 16 },
          caption: { font: "Inter", size: 12 }
        }
      },
      logos: this.normalizeLogos(parsed.logos) || [
        {
          name: "main",
          formats: ["svg", "png"],
          url: "https://placeholder.logo.url",
          usage: "default"
        }
      ],
      iconography: {
        style: parsed.iconography?.style || "N/A",
        examples: Array.isArray(parsed.iconography?.examples) ? parsed.iconography.examples : ["N/A"],
        rules: Array.isArray(parsed.iconography?.rules) ? parsed.iconography.rules : ["N/A"]
      },
      illustrations: {
        style: parsed.illustrations?.style || "N/A",
        examples: Array.isArray(parsed.illustrations?.examples) ? parsed.illustrations.examples : ["N/A"]
      },
      photography: {
        style: parsed.photography?.style || "N/A",
        filters: Array.isArray(parsed.photography?.filters) ? parsed.photography.filters : ["N/A"],
        examples: Array.isArray(parsed.photography?.examples) ? parsed.photography.examples : ["N/A"]
      },
      motion: {
        speed: parsed.motion?.speed || "medium",
        transitions: Array.isArray(parsed.motion?.transitions) ? parsed.motion.transitions : ["fade"],
        rules: Array.isArray(parsed.motion?.rules) ? parsed.motion.rules : ["N/A"]
      },
      audio: {
        jingles: Array.isArray(parsed.audio?.jingles) ? parsed.audio.jingles : ["N/A"],
        style: parsed.audio?.style || "N/A",
        rules: Array.isArray(parsed.audio?.rules) ? parsed.audio.rules : ["N/A"]
      },
      voiceTone: {
        style: parsed.voiceTone?.style || parsed.voice || "N/A",
        examples: {
          correct: Array.isArray(parsed.voiceTone?.examples?.correct) ? parsed.voiceTone.examples.correct : ["N/A"],
          incorrect: Array.isArray(parsed.voiceTone?.examples?.incorrect) ? parsed.voiceTone.examples.incorrect : ["N/A"]
        }
      },
      messaging: {
        tagline: parsed.messaging?.tagline || "N/A",
        slogans: Array.isArray(parsed.messaging?.slogans) ? parsed.messaging.slogans : ["N/A"],
        differentiators: Array.isArray(parsed.messaging?.differentiators) ? parsed.messaging.differentiators : ["N/A"]
      },
      storytelling: {
        mission: parsed.storytelling?.mission || "N/A",
        vision: parsed.storytelling?.vision || "N/A",
        values: Array.isArray(parsed.storytelling?.values) ? parsed.storytelling.values : ["N/A"]
      },
      usageGuidelines: {
        posts: {
          formats: Array.isArray(parsed.usageGuidelines?.posts?.formats) ? parsed.usageGuidelines.posts.formats : ["1:1", "4:5"],
          rules: Array.isArray(parsed.usageGuidelines?.posts?.rules) ? parsed.usageGuidelines.posts.rules : ["N/A"]
        },
        stories: {
          formats: Array.isArray(parsed.usageGuidelines?.stories?.formats) ? parsed.usageGuidelines.stories.formats : ["9:16"],
          rules: Array.isArray(parsed.usageGuidelines?.stories?.rules) ? parsed.usageGuidelines.stories.rules : ["N/A"]
        },
        videos: {
          formats: Array.isArray(parsed.usageGuidelines?.videos?.formats) ? parsed.usageGuidelines.videos.formats : ["16:9", "9:16"],
          rules: Array.isArray(parsed.usageGuidelines?.videos?.rules) ? parsed.usageGuidelines.videos.rules : ["N/A"]
        },
        podcasts: {
          coverFormat: parsed.usageGuidelines?.podcasts?.coverFormat || "3000x3000px",
          rules: Array.isArray(parsed.usageGuidelines?.podcasts?.rules) ? parsed.usageGuidelines.podcasts.rules : ["N/A"]
        }
      },
      examples: {
        do: Array.isArray(parsed.examples?.do) ? parsed.examples.do : Array.isArray(parsed.rules?.do) ? parsed.rules.do : ["N/A"],
        dont: Array.isArray(parsed.examples?.dont) ? parsed.examples.dont : Array.isArray(parsed.rules?.dont) ? parsed.rules.dont : ["N/A"]
      },
      accessibility: {
        contrastRatio: parsed.accessibility?.contrastRatio || "AA",
        minFontSize: typeof parsed.accessibility?.minFontSize === 'number' ? parsed.accessibility.minFontSize : 14,
        videoSubtitles: typeof parsed.accessibility?.videoSubtitles === 'boolean' ? parsed.accessibility.videoSubtitles : true,
        altTextRequired: typeof parsed.accessibility?.altTextRequired === 'boolean' ? parsed.accessibility.altTextRequired : true
      },
      internationalization: {
        supportedLanguages: Array.isArray(parsed.internationalization?.supportedLanguages) ? parsed.internationalization.supportedLanguages : ["es"],
        sloganTranslations: typeof parsed.internationalization?.sloganTranslations === 'object' ? parsed.internationalization.sloganTranslations : {},
        cultureNotes: Array.isArray(parsed.internationalization?.cultureNotes) ? parsed.internationalization.cultureNotes : ["N/A"]
      },
      validation: {
        coherenceReport: {
          lastScan: now,
          complianceRate: "85%",
          issues: [`Análisis inicial del archivo: ${file.name}`]
        }
      }
    };
  }

  // Helper functions for normalization
  private normalizeColors(colors: any): string[] {
    if (Array.isArray(colors)) {
      return colors
        .filter(color => typeof color === 'string')
        .map(color => color.trim())
        .filter(color => /^#[0-9A-Fa-f]{6}$/.test(color));
    }
    return [];
  }

  private normalizeGradients(gradients: any): Array<{name: string, from: string, to: string}> {
    if (Array.isArray(gradients)) {
      return gradients
        .filter(g => g && typeof g.name === 'string' && typeof g.from === 'string' && typeof g.to === 'string')
        .map(g => ({
          name: g.name.trim(),
          from: g.from.trim(),
          to: g.to.trim()
        }));
    }
    return [];
  }

  private normalizeFont(font: any): {name: string, weights: string[]} | null {
    if (typeof font === 'string') {
      // Handle simple font name strings
      return {
        name: font.trim(),
        weights: ["Regular"]
      };
    }
    if (font && typeof font.name === 'string') {
      return {
        name: font.name.trim(),
        weights: Array.isArray(font.weights) ? font.weights.filter(w => typeof w === 'string') : ["Regular"]
      };
    }
    return null;
  }

  private normalizeHierarchy(hierarchy: any): any {
    if (hierarchy && typeof hierarchy === 'object') {
      return {
        h1: this.normalizeHierarchyItem(hierarchy.h1) || { font: "Inter", size: 48 },
        h2: this.normalizeHierarchyItem(hierarchy.h2) || { font: "Inter", size: 32 },
        body: this.normalizeHierarchyItem(hierarchy.body) || { font: "Inter", size: 16 },
        caption: this.normalizeHierarchyItem(hierarchy.caption) || { font: "Inter", size: 12 }
      };
    }
    return null;
  }

  private normalizeHierarchyItem(item: any): {font: string, size: number} | null {
    if (item && typeof item.font === 'string' && typeof item.size === 'number') {
      return {
        font: item.font.trim(),
        size: item.size
      };
    }
    return null;
  }

  private normalizeLogos(logos: any): Array<{name: string, formats: string[], url: string, usage: string}> {
    if (Array.isArray(logos)) {
      return logos
        .filter(logo => logo && typeof logo.name === 'string')
        .map(logo => ({
          name: logo.name.trim(),
          formats: Array.isArray(logo.formats) ? logo.formats.filter(f => typeof f === 'string') : ["svg"],
          url: typeof logo.url === 'string' ? logo.url : "https://placeholder.logo.url",
          usage: typeof logo.usage === 'string' ? logo.usage : "default"
        }));
    }
    return [];
  }

  private async analyzeWithGemini(fileContent: any, prompt: string): Promise<string> {
    try {
      // Determine if we need vision model based on file content type
      const requiresVision = typeof fileContent === 'object' && fileContent.inlineData;
      
      // Get a working model
      const modelName = await this.getWorkingModel(requiresVision);
      const model = this.genAI!.getGenerativeModel({ model: modelName });
      
      let requestParts: any[];
      
      if (requiresVision && fileContent.inlineData) {
        // For image analysis
        requestParts = [
          { text: prompt },
          fileContent
        ];
      } else {
        // For text-based content (PDF, DOCX)
        requestParts = [
          { text: `${prompt}\n\nContenido del archivo:\n${fileContent}` }
        ];
      }
      
      console.log(`Making request to ${modelName} with ${requestParts.length} parts`);
      
      // Generate content with timeout
      const result = await model.generateContent(requestParts);
      const response = result.response;
      const text = response.text();
      
      if (!text || text.trim() === '') {
        throw new Error('Empty response from Gemini');
      }
      
      console.log(`✅ Gemini analysis successful (${text.length} characters)`);
      return text;
      
    } catch (error: any) {
      console.error('Error with Gemini analysis:', error);
      
      // Handle specific error types
      if (error.message?.includes('404') && error.message?.includes('Not Found')) {
        throw new Error(`Gemini model not available. This could be due to: 1) Your API key doesn't have access to Gemini 1.5 models, 2) The model is not available in your region, or 3) The model name is incorrect. Try using a basic Google AI API key. Original error: ${error.message}`);
      }
      
      if (error.message?.includes('403')) {
        throw new Error(`Gemini API access denied. Please check your API key permissions. Original error: ${error.message}`);
      }
      
      if (error.message?.includes('429')) {
        throw new Error(`Gemini API rate limit exceeded. Please try again later. Original error: ${error.message}`);
      }
      
      throw new Error(`Gemini analysis failed: ${error.message}. The requested model may not be available with your API key.`);
    }
  }

  private getFallbackAnalysis(file: File): BrandKitData {
    console.log(`Generating fallback analysis for ${file.name}`);
    
    const now = new Date().toISOString();
    
    // Return a complete BrandKitData structure with fallback data
    return {
      id: `fallback_${Date.now()}`,
      meta: {
        brandName: "Análisis Fallback",
        lastUpdated: now,
        version: 1
      },
      colors: {
        primary: ["#8B5CF6", "#6366F1"],
        secondary: ["#EC4899", "#F59E0B"],
        alternatives: ["#10B981", "#EF4444"],
        gradients: [
          { name: "Primary Gradient", from: "#8B5CF6", to: "#6366F1" }
        ],
        rules: {
          allowedCombinations: [["#8B5CF6", "#6366F1"], ["#EC4899", "#F59E0B"]],
          forbiddenColors: ["#FF0000"]
        }
      },
      typography: {
        primary: { name: "Inter", weights: ["Regular", "Medium", "Bold"] },
        secondary: { name: "Roboto", weights: ["Regular", "Medium"] },
        hierarchy: {
          h1: { font: "Inter", size: 48 },
          h2: { font: "Inter", size: 32 },
          body: { font: "Inter", size: 16 },
          caption: { font: "Inter", size: 12 }
        }
      },
      logos: [
        {
          name: "main",
          formats: ["svg", "png"],
          url: "https://placeholder.logo.url",
          usage: "default"
        }
      ],
      iconography: {
        style: "minimal",
        examples: ["download", "share", "arrow"],
        rules: ["Usar iconos consistentes"]
      },
      illustrations: {
        style: "flat",
        examples: ["illustration1.svg"]
      },
      photography: {
        style: "natural",
        filters: ["bright", "highContrast"],
        examples: ["photo1.jpg"]
      },
      motion: {
        speed: "medium",
        transitions: ["fade", "slide"],
        rules: ["Transiciones suaves"]
      },
      audio: {
        jingles: ["intro.mp3"],
        style: "corporate but friendly",
        rules: ["Usar en contenido educativo"]
      },
      voiceTone: {
        style: "Profesional pero cercano",
        examples: {
          correct: ["Comunica con claridad y profesionalismo", "Mantén un tono cercano pero respetable"],
          incorrect: ["Evitar tono demasiado formal", "No usar jerga técnica excesiva"]
        }
      },
      messaging: {
        tagline: "Análisis generado automáticamente",
        slogans: ["Calidad en cada detalle", "Innovación constante"],
        differentiators: ["Análisis inteligente", "Resultados precisos"]
      },
      storytelling: {
        mission: "Proporcionar análisis de marca precisos y útiles",
        vision: "Ser la herramienta líder en análisis automático de marca",
        values: ["Precisión", "Innovación", "Accesibilidad"]
      },
      usageGuidelines: {
        posts: {
          formats: ["1:1", "4:5"],
          rules: ["Usar colores principales", "Mantener consistencia visual"]
        },
        stories: {
          formats: ["9:16"],
          rules: ["CTA obligatorio", "Branding sutil"]
        },
        videos: {
          formats: ["16:9", "9:16"],
          rules: ["Subtítulos obligatorios", "Logo en esquina"]
        },
        podcasts: {
          coverFormat: "3000x3000px",
          rules: ["Logo siempre visible", "Tipografía legible"]
        }
      },
      examples: {
        do: [
          "Usar siempre los colores principales de la paleta",
          "Mantener consistencia tipográfica en todos los materiales",
          "Aplicar espaciado consistente entre elementos"
        ],
        dont: [
          "No mezclar más de 3 colores por diseño",
          "No usar tipografías fuera de la familia establecida",
          "No distorsionar el logo principal"
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
          "es": "Calidad en cada detalle",
          "en": "Quality in every detail"
        },
        cultureNotes: ["Adaptar mensajes según región"]
      },
      validation: {
        coherenceReport: {
          lastScan: now,
          complianceRate: "70%",
          issues: [`Análisis fallback generado para ${file.name} - API no disponible`]
        }
      }
    };
  }
}