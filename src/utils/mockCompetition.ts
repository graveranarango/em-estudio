export interface SocialPlatform {
  name: string;
  handle: string;
  url: string;
  followers: number;
  engagement: number;
  postsPerWeek: number;
  lastActive: string;
  verified: boolean;
}

export interface Competitor {
  id: string;
  name: string;
  website: string;
  logo?: string;
  industry: string;
  description: string;
  socialPlatforms: SocialPlatform[];
  metrics: {
    totalFollowers: number;
    avgEngagement: number;
    postsPerWeek: number;
    contentFormats: {
      posts: number;
      stories: number;
      videos: number;
      podcasts: number;
    };
    estimatedReach: number;
    brandConsistency: number;
  };
  addedDate: string;
  lastUpdated: string;
}

export interface BrandMetrics {
  website: {
    url: string;
    traffic: number;
    bounceRate: number;
    avgSessionDuration: string;
  };
  socialPlatforms: SocialPlatform[];
  totalFollowers: number;
  avgEngagement: number;
  postsPerWeek: number;
  contentFormats: {
    posts: number;
    stories: number;
    videos: number;
    podcasts: number;
  };
  estimatedReach: number;
  brandConsistency: number;
}

export interface ComparisonInsight {
  id: string;
  type: "opportunity" | "strength" | "weakness" | "recommendation";
  title: string;
  description: string;
  metric: string;
  ourValue: number | string;
  competitorValue: number | string;
  improvement: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
  automationSuggestion?: string;
}

// Mock data para nuestra marca (basado en mockAnalytics)
export const ourBrandMetrics: BrandMetrics = {
  website: {
    url: "https://mibrand.com",
    traffic: 15420,
    bounceRate: 32.5,
    avgSessionDuration: "2m 45s"
  },
  socialPlatforms: [
    {
      name: "Instagram",
      handle: "@mibrand",
      url: "https://instagram.com/mibrand",
      followers: 24800,
      engagement: 4.2,
      postsPerWeek: 5,
      lastActive: "2024-03-20",
      verified: false
    },
    {
      name: "TikTok",
      handle: "@mibrand",
      url: "https://tiktok.com/@mibrand",
      followers: 18500,
      engagement: 6.8,
      postsPerWeek: 3,
      lastActive: "2024-03-19",
      verified: false
    },
    {
      name: "LinkedIn",
      handle: "Mi Brand",
      url: "https://linkedin.com/company/mibrand",
      followers: 5200,
      engagement: 3.1,
      postsPerWeek: 4,
      lastActive: "2024-03-20",
      verified: true
    },
    {
      name: "YouTube",
      handle: "Mi Brand",
      url: "https://youtube.com/@mibrand",
      followers: 8900,
      engagement: 5.5,
      postsPerWeek: 1,
      lastActive: "2024-03-18",
      verified: false
    }
  ],
  totalFollowers: 57400,
  avgEngagement: 4.9,
  postsPerWeek: 13,
  contentFormats: {
    posts: 45,
    stories: 30,
    videos: 20,
    podcasts: 5
  },
  estimatedReach: 285000,
  brandConsistency: 87
};

// Mock data para competidores
export const mockCompetitors: Competitor[] = [
  {
    id: "1",
    name: "Competidor Alpha",
    website: "https://alpha-brand.com",
    industry: "Tecnología",
    description: "Startup de SaaS enfocada en productividad empresarial",
    socialPlatforms: [
      {
        name: "Instagram",
        handle: "@alphabrand",
        url: "https://instagram.com/alphabrand",
        followers: 42000,
        engagement: 5.8,
        postsPerWeek: 7,
        lastActive: "2024-03-20",
        verified: true
      },
      {
        name: "LinkedIn",
        handle: "Alpha Brand",
        url: "https://linkedin.com/company/alphabrand",
        followers: 12500,
        engagement: 4.2,
        postsPerWeek: 5,
        lastActive: "2024-03-20",
        verified: true
      },
      {
        name: "TikTok",
        handle: "@alphabrand",
        url: "https://tiktok.com/@alphabrand",
        followers: 28000,
        engagement: 8.1,
        postsPerWeek: 4,
        lastActive: "2024-03-19",
        verified: false
      },
      {
        name: "YouTube",
        handle: "Alpha Brand",
        url: "https://youtube.com/@alphabrand",
        followers: 15600,
        engagement: 6.9,
        postsPerWeek: 2,
        lastActive: "2024-03-17",
        verified: true
      }
    ],
    metrics: {
      totalFollowers: 98100,
      avgEngagement: 6.3,
      postsPerWeek: 18,
      contentFormats: {
        posts: 40,
        stories: 35,
        videos: 20,
        podcasts: 5
      },
      estimatedReach: 620000,
      brandConsistency: 92
    },
    addedDate: "2024-03-15",
    lastUpdated: "2024-03-20"
  },
  {
    id: "2",
    name: "Beta Solutions",
    website: "https://betasolutions.co",
    industry: "Consultoría",
    description: "Consultora especializada en transformación digital",
    socialPlatforms: [
      {
        name: "LinkedIn",
        handle: "Beta Solutions",
        url: "https://linkedin.com/company/betasolutions",
        followers: 8900,
        engagement: 3.8,
        postsPerWeek: 6,
        lastActive: "2024-03-20",
        verified: true
      },
      {
        name: "Instagram",
        handle: "@betasolutions",
        url: "https://instagram.com/betasolutions",
        followers: 15200,
        engagement: 4.1,
        postsPerWeek: 4,
        lastActive: "2024-03-19",
        verified: false
      },
      {
        name: "YouTube",
        handle: "Beta Solutions",
        url: "https://youtube.com/@betasolutions",
        followers: 6800,
        engagement: 5.2,
        postsPerWeek: 1,
        lastActive: "2024-03-16",
        verified: false
      }
    ],
    metrics: {
      totalFollowers: 30900,
      avgEngagement: 4.4,
      postsPerWeek: 11,
      contentFormats: {
        posts: 55,
        stories: 25,
        videos: 15,
        podcasts: 5
      },
      estimatedReach: 185000,
      brandConsistency: 78
    },
    addedDate: "2024-03-10",
    lastUpdated: "2024-03-19"
  },
  {
    id: "3",
    name: "Gamma Innovate",
    website: "https://gammainnovate.io",
    industry: "Tecnología",
    description: "Plataforma de IA para optimización de procesos",
    socialPlatforms: [
      {
        name: "Instagram",
        handle: "@gammainnovate",
        url: "https://instagram.com/gammainnovate",
        followers: 35600,
        engagement: 7.2,
        postsPerWeek: 6,
        lastActive: "2024-03-20",
        verified: false
      },
      {
        name: "TikTok",
        handle: "@gammainnovate",
        url: "https://tiktok.com/@gammainnovate",
        followers: 52000,
        engagement: 9.5,
        postsPerWeek: 5,
        lastActive: "2024-03-20",
        verified: true
      },
      {
        name: "LinkedIn",
        handle: "Gamma Innovate",
        url: "https://linkedin.com/company/gammainnovate",
        followers: 7200,
        engagement: 5.1,
        postsPerWeek: 3,
        lastActive: "2024-03-19",
        verified: false
      },
      {
        name: "YouTube",
        handle: "Gamma Innovate",
        url: "https://youtube.com/@gammainnovate",
        followers: 11400,
        engagement: 6.8,
        postsPerWeek: 2,
        lastActive: "2024-03-18",
        verified: false
      }
    ],
    metrics: {
      totalFollowers: 106200,
      avgEngagement: 7.2,
      postsPerWeek: 16,
      contentFormats: {
        posts: 30,
        stories: 40,
        videos: 25,
        podcasts: 5
      },
      estimatedReach: 760000,
      brandConsistency: 85
    },
    addedDate: "2024-03-12",
    lastUpdated: "2024-03-20"
  }
];

// Insights de comparación generados por IA
export const mockComparisonInsights: ComparisonInsight[] = [
  {
    id: "1",
    type: "opportunity",
    title: "Brecha en TikTok",
    description: "Gamma Innovate tiene 2.8x más seguidores en TikTok y publica más frecuentemente",
    metric: "TikTok Followers",
    ourValue: "18.5K",
    competitorValue: "52K",
    improvement: "Aumentar frecuencia de publicación en TikTok a 5 posts/semana",
    priority: "high",
    actionable: true,
    automationSuggestion: "Activar regla de reutilización automática para crear clips de TikTok"
  },
  {
    id: "2",
    type: "strength",
    title: "Engagement superior en LinkedIn",
    description: "Nuestro engagement en LinkedIn es superior al promedio de competidores",
    metric: "LinkedIn Engagement",
    ourValue: "3.1%",
    competitorValue: "4.4% promedio",
    improvement: "Mantener estrategia actual en LinkedIn",
    priority: "low",
    actionable: false
  },
  {
    id: "3",
    type: "weakness",
    title: "Frecuencia de publicación baja en YouTube",
    description: "Competidores publican 2x más contenido de video",
    metric: "YouTube Posts/Week",
    ourValue: "1",
    competitorValue: "1.7 promedio",
    improvement: "Incrementar publicaciones de YouTube a 2-3 por semana",
    priority: "medium",
    actionable: true,
    automationSuggestion: "Crear regla para generar clips cortos automáticamente de podcasts"
  },
  {
    id: "4",
    type: "recommendation",
    title: "Optimizar horarios de publicación",
    description: "Alpha Brand publica consistentemente en horarios de mayor engagement",
    metric: "Publishing Schedule",
    ourValue: "Inconsistente",
    competitorValue: "Optimizado",
    improvement: "Implementar calendario de publicación basado en analítica",
    priority: "high",
    actionable: true,
    automationSuggestion: "Activar detección de mejor horario en automatización"
  },
  {
    id: "5",
    type: "opportunity",
    title: "Potencial en Stories",
    description: "Gamma Innovate dedica 40% de su contenido a Stories vs nuestro 30%",
    metric: "Stories Content %",
    ourValue: "30%",
    competitorValue: "40%",
    improvement: "Aumentar producción de Stories a 35-40%",
    priority: "medium",
    actionable: true,
    automationSuggestion: "Configurar reutilización automática de posts como Stories"
  }
];

// Utility functions
export const getCompetitorById = (id: string): Competitor | undefined => {
  return mockCompetitors.find(comp => comp.id === id);
};

export const getTopCompetitorsByFollowers = (limit = 3): Competitor[] => {
  return [...mockCompetitors]
    .sort((a, b) => b.metrics.totalFollowers - a.metrics.totalFollowers)
    .slice(0, limit);
};

export const getTopCompetitorsByEngagement = (limit = 3): Competitor[] => {
  return [...mockCompetitors]
    .sort((a, b) => b.metrics.avgEngagement - a.metrics.avgEngagement)
    .slice(0, limit);
};

export const getCompetitorsByIndustry = (industry: string): Competitor[] => {
  return mockCompetitors.filter(comp => 
    comp.industry.toLowerCase().includes(industry.toLowerCase())
  );
};

export const calculateIndustryAverage = () => {
  const total = mockCompetitors.length;
  if (total === 0) return null;

  const totals = mockCompetitors.reduce((acc, comp) => ({
    followers: acc.followers + comp.metrics.totalFollowers,
    engagement: acc.engagement + comp.metrics.avgEngagement,
    postsPerWeek: acc.postsPerWeek + comp.metrics.postsPerWeek,
    reach: acc.reach + comp.metrics.estimatedReach,
    consistency: acc.consistency + comp.metrics.brandConsistency
  }), {
    followers: 0,
    engagement: 0,
    postsPerWeek: 0,
    reach: 0,
    consistency: 0
  });

  return {
    avgFollowers: Math.round(totals.followers / total),
    avgEngagement: Math.round((totals.engagement / total) * 10) / 10,
    avgPostsPerWeek: Math.round((totals.postsPerWeek / total) * 10) / 10,
    avgReach: Math.round(totals.reach / total),
    avgConsistency: Math.round(totals.consistency / total)
  };
};

export const compareWithCompetitor = (competitorId: string) => {
  const competitor = getCompetitorById(competitorId);
  if (!competitor) return null;

  return {
    competitor,
    comparison: {
      followers: {
        ours: ourBrandMetrics.totalFollowers,
        theirs: competitor.metrics.totalFollowers,
        difference: competitor.metrics.totalFollowers - ourBrandMetrics.totalFollowers,
        percentageDiff: Math.round(((competitor.metrics.totalFollowers - ourBrandMetrics.totalFollowers) / ourBrandMetrics.totalFollowers) * 100)
      },
      engagement: {
        ours: ourBrandMetrics.avgEngagement,
        theirs: competitor.metrics.avgEngagement,
        difference: Math.round((competitor.metrics.avgEngagement - ourBrandMetrics.avgEngagement) * 10) / 10,
        percentageDiff: Math.round(((competitor.metrics.avgEngagement - ourBrandMetrics.avgEngagement) / ourBrandMetrics.avgEngagement) * 100)
      },
      postsPerWeek: {
        ours: ourBrandMetrics.postsPerWeek,
        theirs: competitor.metrics.postsPerWeek,
        difference: competitor.metrics.postsPerWeek - ourBrandMetrics.postsPerWeek,
        percentageDiff: Math.round(((competitor.metrics.postsPerWeek - ourBrandMetrics.postsPerWeek) / ourBrandMetrics.postsPerWeek) * 100)
      },
      reach: {
        ours: ourBrandMetrics.estimatedReach,
        theirs: competitor.metrics.estimatedReach,
        difference: competitor.metrics.estimatedReach - ourBrandMetrics.estimatedReach,
        percentageDiff: Math.round(((competitor.metrics.estimatedReach - ourBrandMetrics.estimatedReach) / ourBrandMetrics.estimatedReach) * 100)
      },
      consistency: {
        ours: ourBrandMetrics.brandConsistency,
        theirs: competitor.metrics.brandConsistency,
        difference: competitor.metrics.brandConsistency - ourBrandMetrics.brandConsistency,
        percentageDiff: Math.round(((competitor.metrics.brandConsistency - ourBrandMetrics.brandConsistency) / ourBrandMetrics.brandConsistency) * 100)
      }
    }
  };
};

export const getPlatformComparison = (competitorId: string, platform: string) => {
  const competitor = getCompetitorById(competitorId);
  if (!competitor) return null;

  const ourPlatform = ourBrandMetrics.socialPlatforms.find(p => 
    p.name.toLowerCase() === platform.toLowerCase()
  );
  const theirPlatform = competitor.socialPlatforms.find(p => 
    p.name.toLowerCase() === platform.toLowerCase()
  );

  if (!ourPlatform || !theirPlatform) return null;

  return {
    platform,
    ours: ourPlatform,
    theirs: theirPlatform,
    comparison: {
      followers: {
        difference: theirPlatform.followers - ourPlatform.followers,
        percentageDiff: Math.round(((theirPlatform.followers - ourPlatform.followers) / ourPlatform.followers) * 100)
      },
      engagement: {
        difference: Math.round((theirPlatform.engagement - ourPlatform.engagement) * 10) / 10,
        percentageDiff: Math.round(((theirPlatform.engagement - ourPlatform.engagement) / ourPlatform.engagement) * 100)
      },
      frequency: {
        difference: theirPlatform.postsPerWeek - ourPlatform.postsPerWeek,
        percentageDiff: Math.round(((theirPlatform.postsPerWeek - ourPlatform.postsPerWeek) / ourPlatform.postsPerWeek) * 100)
      }
    }
  };
};

export const getInsightsByPriority = (priority: "high" | "medium" | "low") => {
  return mockComparisonInsights.filter(insight => insight.priority === priority);
};

export const getActionableInsights = () => {
  return mockComparisonInsights.filter(insight => insight.actionable);
};