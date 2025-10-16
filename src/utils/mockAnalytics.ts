export interface AnalyticsAsset {
  id: string;
  type: "post" | "story" | "video" | "podcast";
  title: string;
  platform: string[];
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
    videoViews?: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  date: string;
  brandkitApplied: boolean;
  performance: "high" | "medium" | "low";
  timeSeriesData: {
    date: string;
    reach: number;
    engagement: number;
    conversions: number;
  }[];
}

export interface OverallMetrics {
  totalReach: number;
  avgEngagementRate: number;
  totalVideoViews: number;
  totalConversions: number;
  weeklyGrowth: {
    reach: number;
    engagement: number;
    conversions: number;
  };
}

export interface AIRecommendation {
  id: string;
  category: "content" | "timing" | "platform" | "brandkit";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  action: string;
}

// Mock data
export const mockAnalyticsAssets: AnalyticsAsset[] = [
  {
    id: "1",
    type: "post",
    title: "Lanzamiento de Producto Q4",
    platform: ["Instagram", "LinkedIn"],
    metrics: {
      reach: 12500,
      engagement: 8.5,
      conversions: 145,
      likes: 890,
      comments: 67,
      shares: 23,
      saves: 156
    },
    date: "2024-03-15",
    brandkitApplied: true,
    performance: "high",
    timeSeriesData: [
      { date: "2024-03-15", reach: 2500, engagement: 7.2, conversions: 25 },
      { date: "2024-03-16", reach: 5200, engagement: 8.1, conversions: 58 },
      { date: "2024-03-17", reach: 8900, engagement: 8.5, conversions: 98 },
      { date: "2024-03-18", reach: 11200, engagement: 8.3, conversions: 125 },
      { date: "2024-03-19", reach: 12500, engagement: 8.5, conversions: 145 }
    ]
  },
  {
    id: "2",
    type: "story",
    title: "Behind the Scenes - Oficina",
    platform: ["Instagram", "TikTok"],
    metrics: {
      reach: 8900,
      engagement: 12.3,
      conversions: 67,
      likes: 1200,
      comments: 45,
      shares: 78,
      saves: 89
    },
    date: "2024-03-12",
    brandkitApplied: true,
    performance: "high",
    timeSeriesData: [
      { date: "2024-03-12", reach: 3200, engagement: 11.5, conversions: 18 },
      { date: "2024-03-13", reach: 6400, engagement: 12.1, conversions: 38 },
      { date: "2024-03-14", reach: 8900, engagement: 12.3, conversions: 67 }
    ]
  },
  {
    id: "3",
    type: "video",
    title: "Tutorial: Configuración Rápida",
    platform: ["YouTube", "TikTok", "Instagram"],
    metrics: {
      reach: 25600,
      engagement: 6.8,
      conversions: 289,
      videoViews: 18900,
      likes: 1450,
      comments: 234,
      shares: 167,
      saves: 445
    },
    date: "2024-03-10",
    brandkitApplied: false,
    performance: "medium",
    timeSeriesData: [
      { date: "2024-03-10", reach: 5600, engagement: 5.2, conversions: 45 },
      { date: "2024-03-11", reach: 12300, engagement: 6.1, conversions: 123 },
      { date: "2024-03-12", reach: 19800, engagement: 6.5, conversions: 198 },
      { date: "2024-03-13", reach: 23400, engagement: 6.7, conversions: 245 },
      { date: "2024-03-14", reach: 25600, engagement: 6.8, conversions: 289 }
    ]
  },
  {
    id: "4",
    type: "podcast",
    title: "Episodio 12: Estrategias de Marketing",
    platform: ["Spotify", "YouTube", "Apple Podcasts"],
    metrics: {
      reach: 4500,
      engagement: 15.6,
      conversions: 78,
      likes: 267,
      comments: 89,
      shares: 45,
      saves: 123
    },
    date: "2024-03-08",
    brandkitApplied: true,
    performance: "high",
    timeSeriesData: [
      { date: "2024-03-08", reach: 1200, engagement: 14.2, conversions: 18 },
      { date: "2024-03-09", reach: 2800, engagement: 15.1, conversions: 42 },
      { date: "2024-03-10", reach: 3900, engagement: 15.4, conversions: 65 },
      { date: "2024-03-11", reach: 4500, engagement: 15.6, conversions: 78 }
    ]
  },
  {
    id: "5",
    type: "post",
    title: "Consejos de Productividad",
    platform: ["LinkedIn", "Instagram"],
    metrics: {
      reach: 6700,
      engagement: 4.2,
      conversions: 23,
      likes: 234,
      comments: 12,
      shares: 8,
      saves: 45
    },
    date: "2024-03-05",
    brandkitApplied: false,
    performance: "low",
    timeSeriesData: [
      { date: "2024-03-05", reach: 2100, engagement: 3.8, conversions: 8 },
      { date: "2024-03-06", reach: 4200, engagement: 4.0, conversions: 15 },
      { date: "2024-03-07", reach: 6700, engagement: 4.2, conversions: 23 }
    ]
  }
];

export const mockOverallMetrics: OverallMetrics = {
  totalReach: 58200,
  avgEngagementRate: 9.5,
  totalVideoViews: 18900,
  totalConversions: 602,
  weeklyGrowth: {
    reach: 12.5,
    engagement: 8.3,
    conversions: 15.7
  }
};

export const mockRecommendations: AIRecommendation[] = [
  {
    id: "1",
    category: "brandkit",
    priority: "high",
    title: "Aplicar BrandKit consistentemente",
    description: "Los assets con BrandKit aplicado tienen un 35% más de engagement que los que no lo tienen.",
    impact: "+35% engagement promedio",
    action: "Revisar y aplicar BrandKit a 2 assets sin marca"
  },
  {
    id: "2",
    category: "content",
    priority: "high",
    title: "Crear más videos cortos",
    description: "Los videos de menos de 30 segundos en TikTok aumentan la retención en un 40%.",
    impact: "+40% retención en TikTok",
    action: "Planificar 3 videos cortos para la próxima semana"
  },
  {
    id: "3",
    category: "timing",
    priority: "medium",
    title: "Optimizar horarios de publicación",
    description: "Las stories publicadas entre 7-9 PM tienen 25% más engagement.",
    impact: "+25% engagement en stories",
    action: "Reprogramar stories para horario óptimo"
  },
  {
    id: "4",
    category: "platform",
    priority: "medium",
    title: "Expandir presencia en LinkedIn",
    description: "Los posts educativos en LinkedIn generan 3x más conversiones B2B.",
    impact: "3x más conversiones B2B",
    action: "Crear 2 posts educativos semanales para LinkedIn"
  },
  {
    id: "5",
    category: "content",
    priority: "low",
    title: "Experimentar con carruseles",
    description: "Los carruseles en Instagram tienen 1.4x más alcance que las imágenes simples.",
    impact: "+40% alcance promedio",
    action: "Convertir próximo post en formato carrusel"
  }
];

// Utility functions
export const getAssetsByType = (type: string) => {
  return mockAnalyticsAssets.filter(asset => asset.type === type);
};

export const getTopPerformingAssets = (limit = 3) => {
  return mockAnalyticsAssets
    .filter(asset => asset.performance === "high")
    .slice(0, limit);
};

export const getLowPerformingAssets = (limit = 3) => {
  return mockAnalyticsAssets
    .filter(asset => asset.performance === "low")
    .slice(0, limit);
};

export const getBrandKitCompliance = () => {
  const total = mockAnalyticsAssets.length;
  const compliant = mockAnalyticsAssets.filter(asset => asset.brandkitApplied).length;
  return {
    percentage: Math.round((compliant / total) * 100),
    compliant,
    total
  };
};

export const getMetricsByPlatform = () => {
  const platformData: Record<string, { reach: number; engagement: number; conversions: number; count: number }> = {};
  
  mockAnalyticsAssets.forEach(asset => {
    asset.platform.forEach(platform => {
      if (!platformData[platform]) {
        platformData[platform] = { reach: 0, engagement: 0, conversions: 0, count: 0 };
      }
      platformData[platform].reach += asset.metrics.reach;
      platformData[platform].engagement += asset.metrics.engagement;
      platformData[platform].conversions += asset.metrics.conversions;
      platformData[platform].count += 1;
    });
  });

  // Calculate averages
  Object.keys(platformData).forEach(platform => {
    const data = platformData[platform];
    data.engagement = data.engagement / data.count;
  });

  return platformData;
};