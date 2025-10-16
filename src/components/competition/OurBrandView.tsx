import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  ExternalLink,
  TrendingUp,
  Users,
  BarChart3,
  Clock,
  CheckCircle,
  MousePointer
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { ourBrandMetrics } from "../../utils/mockCompetition";

// TikTok icon as SVG since it's not in lucide-react
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const OurBrandView: React.FC = () => {
  const { brandKit } = useBrandKit();

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'youtube': return Youtube;
      case 'tiktok': return TikTokIcon;
      default: return Globe;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 6) return "text-green-600";
    if (engagement >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const getEngagementLabel = (engagement: number) => {
    if (engagement >= 6) return "Excelente";
    if (engagement >= 4) return "Bueno";
    if (engagement >= 2) return "Regular";
    return "Bajo";
  };

  return (
    <div className="space-y-6">
      {/* Website Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Sitio Web Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-medium">{ourBrandMetrics.website.url}</h3>
                  <p className="text-sm text-muted-foreground">Sitio web principal</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={ourBrandMetrics.website.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tráfico Mensual</span>
                  </div>
                  <p className="text-xl font-semibold">
                    {formatNumber(ourBrandMetrics.website.traffic)}
                  </p>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 mb-1">
                    <MousePointer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Tasa de Rebote</span>
                  </div>
                  <p className="text-xl font-semibold">{ourBrandMetrics.website.bounceRate}%</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card">
                <h4 className="font-medium mb-3">Métricas de Sesión</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duración promedio</span>
                    <span className="text-sm font-medium">{ourBrandMetrics.website.avgSessionDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Páginas por sesión</span>
                    <span className="text-sm font-medium">3.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Usuarios nuevos</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ourBrandMetrics.socialPlatforms.map((platform, index) => {
          const IconComponent = getPlatformIcon(platform.name);
          
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    <span>{platform.name}</span>
                    {platform.verified && (
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={platform.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Handle</span>
                  <span className="text-sm font-medium">{platform.handle}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Seguidores</span>
                    </div>
                    <p className="font-semibold">{formatNumber(platform.followers)}</p>
                  </div>

                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Engagement</span>
                    </div>
                    <p className={`font-semibold ${getEngagementColor(platform.engagement)}`}>
                      {platform.engagement}%
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Posts/semana</span>
                    <span className="font-medium">{platform.postsPerWeek}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Último post</span>
                    <span className="font-medium">
                      {new Date(platform.lastActive).toLocaleDateString('es-ES')}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estado</span>
                    <Badge 
                      variant="outline" 
                      className={getEngagementColor(platform.engagement)}
                    >
                      {getEngagementLabel(platform.engagement)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Audiencia Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-semibold">
                  {formatNumber(ourBrandMetrics.totalFollowers)}
                </p>
                <p className="text-sm text-muted-foreground">seguidores en todas las plataformas</p>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">75% del objetivo anual</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Engagement Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-semibold">{ourBrandMetrics.avgEngagement}%</p>
                <p className="text-sm text-muted-foreground">tasa de interacción general</p>
              </div>
              <Progress value={ourBrandMetrics.avgEngagement * 10} className="h-2" />
              <p className="text-xs text-green-600">+12% vs mes anterior</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4" />
              Consistencia de Marca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-semibold">{ourBrandMetrics.brandConsistency}%</p>
                <p className="text-sm text-muted-foreground">aplicación del BrandKit</p>
              </div>
              <Progress value={ourBrandMetrics.brandConsistency} className="h-2" />
              <p className="text-xs text-blue-600">Excelente aplicación</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Distribución de Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(ourBrandMetrics.contentFormats).map(([format, percentage]) => (
              <div key={format} className="text-center p-4 rounded-lg bg-muted/50">
                <div className="mb-2">
                  <p className="text-2xl font-semibold" style={{ color: brandKit?.colors?.primary || '#030213' }}>
                    {percentage}%
                  </p>
                </div>
                <p className="text-sm font-medium capitalize">{format}</p>
                <Progress value={percentage} className="h-2 mt-2" />
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Recomendación IA
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Los posts están funcionando muy bien. Considera aumentar la frecuencia de videos cortos 
              para TikTok e Instagram, ya que tienen el mayor potencial de engagement.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OurBrandView;