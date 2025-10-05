export interface AutomationRule {
  id: string;
  type: "best_time" | "format" | "creative" | "auto_reuse";
  name: string;
  description: string;
  active: boolean;
  lastUpdated: string;
  confidence: number; // 0-100
  suggestions: string[];
  impact: string;
  category: "timing" | "content" | "creative" | "efficiency";
}

export interface TimeRecommendation {
  platform: string;
  day: string;
  time: string;
  engagement: number;
  confidence: number;
  reason: string;
}

export interface FormatRecommendation {
  format: "post" | "story" | "video" | "podcast";
  platform: string;
  expectedEngagement: number;
  reasoning: string;
  confidence: number;
}

export interface CreativeOptimization {
  element: "colors" | "typography" | "copy" | "layout";
  recommendation: string;
  impact: string;
  examples: string[];
  confidence: number;
}

export interface AutoReuseOpportunity {
  assetId: string;
  assetTitle: string;
  type: "post" | "story" | "video" | "podcast";
  reuseType: "repurpose" | "variation" | "adaptation" | "series";
  suggestedFormat: string;
  expectedImprovement: string;
  priority: "high" | "medium" | "low";
}

export interface AutomationInsight {
  id: string;
  type: "success" | "opportunity" | "warning" | "info";
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
  priority: "high" | "medium" | "low";
  timestamp: string;
}

// Mock data
export const mockAutomationRules: AutomationRule[] = [
  {
    id: "1",
    type: "best_time",
    name: "Detección de Mejor Horario",
    description: "Analiza patrones de engagement para publicar en horarios óptimos",
    active: true,
    lastUpdated: "2024-03-20",
    confidence: 89,
    suggestions: [
      "Instagram: Martes 11:00 AM (+24% engagement)",
      "TikTok: Viernes 7:00 PM (+31% engagement)",
      "LinkedIn: Miércoles 2:00 PM (+18% engagement)"
    ],
    impact: "+23% engagement promedio",
    category: "timing"
  },
  {
    id: "2",
    type: "format",
    name: "Recomendación de Formato",
    description: "Sugiere el mejor formato de contenido según la audiencia y plataforma",
    active: true,
    lastUpdated: "2024-03-19",
    confidence: 76,
    suggestions: [
      "Videos cortos (+40% retención en TikTok)",
      "Carruseles educativos (+25% saves en IG)",
      "Posts de tips (+35% shares en LinkedIn)"
    ],
    impact: "+28% retención promedio",
    category: "content"
  },
  {
    id: "3",
    type: "creative",
    name: "Optimización Creativa",
    description: "Analiza elementos visuales y de copy con mejor rendimiento",
    active: false,
    lastUpdated: "2024-03-18",
    confidence: 82,
    suggestions: [
      "Paleta secundaria rinde +20% mejor en LinkedIn",
      "Tipografía bold aumenta CTR en 15%",
      "CTAs cortos mejoran conversión en 22%"
    ],
    impact: "+19% conversión promedio",
    category: "creative"
  },
  {
    id: "4",
    type: "auto_reuse",
    name: "Reutilización Automática",
    description: "Identifica y reutiliza automáticamente contenido con alto rendimiento",
    active: true,
    lastUpdated: "2024-03-20",
    confidence: 71,
    suggestions: [
      "3 podcasts listos para clips cortos",
      "2 posts exitosos para versiones carrusel",
      "1 tutorial para serie de stories"
    ],
    impact: "+45% eficiencia de contenido",
    category: "efficiency"
  }
];

export const mockTimeRecommendations: TimeRecommendation[] = [
  {
    platform: "Instagram",
    day: "Martes",
    time: "11:00 AM",
    engagement: 8.4,
    confidence: 89,
    reason: "Mayor actividad de tu audiencia objetivo (25-34 años)"
  },
  {
    platform: "TikTok",
    day: "Viernes",
    time: "7:00 PM",
    engagement: 12.1,
    confidence: 92,
    reason: "Pico de uso en horario de relajación post-trabajo"
  },
  {
    platform: "LinkedIn",
    day: "Miércoles",
    time: "2:00 PM",
    engagement: 6.8,
    confidence: 76,
    reason: "Momento de pausa durante jornada laboral"
  },
  {
    platform: "YouTube",
    day: "Domingo",
    time: "8:00 PM",
    engagement: 9.3,
    confidence: 84,
    reason: "Tiempo libre para contenido largo educativo"
  }
];

export const mockFormatRecommendations: FormatRecommendation[] = [
  {
    format: "video",
    platform: "TikTok",
    expectedEngagement: 11.5,
    reasoning: "Videos de 15-30 segundos tienen 40% más retención",
    confidence: 88
  },
  {
    format: "post",
    platform: "LinkedIn",
    expectedEngagement: 7.2,
    reasoning: "Posts educativos generan 3x más conversiones B2B",
    confidence: 79
  },
  {
    format: "story",
    platform: "Instagram",
    expectedEngagement: 9.8,
    reasoning: "Stories con polls aumentan interacción en 35%",
    confidence: 85
  }
];

export const mockCreativeOptimizations: CreativeOptimization[] = [
  {
    element: "colors",
    recommendation: "Usar paleta secundaria en contenido de LinkedIn",
    impact: "+20% engagement en público profesional",
    examples: ["Posts educativos", "Infografías", "Citas motivacionales"],
    confidence: 82
  },
  {
    element: "typography",
    recommendation: "Aplicar tipografía bold en CTAs",
    impact: "+15% click-through rate",
    examples: ["Botones de acción", "Llamadas importantes", "Precios"],
    confidence: 76
  },
  {
    element: "copy",
    recommendation: "Acortar CTAs a máximo 3 palabras",
    impact: "+22% conversión",
    examples: ["Compra ahora", "Ver más", "Únete hoy"],
    confidence: 91
  }
];

export const mockAutoReuseOpportunities: AutoReuseOpportunity[] = [
  {
    assetId: "3",
    assetTitle: "Tutorial: Configuración Rápida",
    type: "video",
    reuseType: "variation",
    suggestedFormat: "Serie de 3 clips cortos para TikTok",
    expectedImprovement: "+40% reach total",
    priority: "high"
  },
  {
    assetId: "1",
    assetTitle: "Lanzamiento de Producto Q4",
    type: "post",
    reuseType: "adaptation",
    suggestedFormat: "Carrusel de 5 slides con detalles",
    expectedImprovement: "+25% saves",
    priority: "medium"
  },
  {
    assetId: "4",
    assetTitle: "Episodio 12: Estrategias de Marketing",
    type: "podcast",
    reuseType: "repurpose",
    suggestedFormat: "Quotes para stories + audiogramas",
    expectedImprovement: "+60% cross-platform reach",
    priority: "high"
  }
];

export const mockAutomationInsights: AutomationInsight[] = [
  {
    id: "1",
    type: "success",
    title: "Horario óptimo funcionando",
    description: "Las publicaciones automáticas en martes 11 AM han aumentado engagement en 24%",
    actionable: false,
    priority: "low",
    timestamp: "2024-03-20T10:30:00Z"
  },
  {
    id: "2",
    type: "opportunity",
    title: "Nueva oportunidad de reutilización",
    description: "El tutorial de configuración puede generar 3 clips virales para TikTok",
    actionable: true,
    action: "Crear clips automáticamente",
    priority: "high",
    timestamp: "2024-03-20T09:15:00Z"
  },
  {
    id: "3",
    type: "warning",
    title: "Decline en engagement de videos",
    description: "Los videos largos han perdido 15% de engagement en la última semana",
    actionable: true,
    action: "Activar optimización creativa",
    priority: "medium",
    timestamp: "2024-03-19T16:45:00Z"
  },
  {
    id: "4",
    type: "info",
    title: "Nuevo patrón detectado",
    description: "Audiencia está más activa los domingos por la tarde",
    actionable: true,
    action: "Ajustar calendario",
    priority: "medium",
    timestamp: "2024-03-19T14:20:00Z"
  }
];

// Utility functions
export const getActiveRules = () => {
  return mockAutomationRules.filter(rule => rule.active);
};

export const getInactiveRules = () => {
  return mockAutomationRules.filter(rule => !rule.active);
};

export const getRulesByCategory = (category: string) => {
  return mockAutomationRules.filter(rule => rule.category === category);
};

export const getHighPriorityOpportunities = () => {
  return mockAutoReuseOpportunities.filter(opp => opp.priority === "high");
};

export const getRecentInsights = (limit = 5) => {
  return mockAutomationInsights
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
};

export const calculateAutomationImpact = () => {
  const activeRules = getActiveRules();
  const totalConfidence = activeRules.reduce((sum, rule) => sum + rule.confidence, 0);
  const avgConfidence = activeRules.length > 0 ? totalConfidence / activeRules.length : 0;
  
  return {
    rulesActive: activeRules.length,
    totalRules: mockAutomationRules.length,
    avgConfidence: Math.round(avgConfidence),
    estimatedTimesSaved: "4.2 horas/semana",
    engagementIncrease: "+23%"
  };
};