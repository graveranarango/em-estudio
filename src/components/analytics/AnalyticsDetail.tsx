import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  MousePointer,
  Eye,
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target
} from "lucide-react";
import { AnalyticsAsset, getMetricsByPlatform } from "../../utils/mockAnalytics";
import { useBrandKit } from "../../contexts/BrandKitContext";

interface AnalyticsDetailProps {
  asset: AnalyticsAsset;
  onBack: () => void;
}

const PLATFORM_COLORS = {
  Instagram: "#E4405F",
  TikTok: "#000000",
  YouTube: "#FF0000",
  LinkedIn: "#0077B5",
  Spotify: "#1DB954",
  "Apple Podcasts": "#9933CC"
};

export const AnalyticsDetail: React.FC<AnalyticsDetailProps> = ({ 
  asset, 
  onBack 
}) => {
  const { brandKit } = useBrandKit();
  const platformData = getMetricsByPlatform();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const platformBreakdown = asset.platform.map(platform => ({
    name: platform,
    reach: platformData[platform]?.reach || 0,
    engagement: platformData[platform]?.engagement || 0,
    conversions: platformData[platform]?.conversions || 0,
    color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || '#8884d8'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{asset.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getPerformanceColor(asset.performance)}>
                {asset.performance === 'high' ? 'Alto rendimiento' : 
                 asset.performance === 'medium' ? 'Rendimiento medio' : 'Bajo rendimiento'}
              </Badge>
              <div className="flex items-center gap-1">
                {asset.brandkitApplied ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                )}
                <span className="text-sm text-muted-foreground">
                  {asset.brandkitApplied ? 'BrandKit aplicado' : 'BrandKit no aplicado'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Publicado</div>
          <div className="font-medium">{formatDate(asset.date)}</div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Alcance</span>
            </div>
            <div className="text-2xl font-semibold">{formatNumber(asset.metrics.reach)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Engagement</span>
            </div>
            <div className="text-2xl font-semibold">{asset.metrics.engagement}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Conversiones</span>
            </div>
            <div className="text-2xl font-semibold">{asset.metrics.conversions}</div>
          </CardContent>
        </Card>

        {asset.metrics.videoViews && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Reproducciones</span>
              </div>
              <div className="text-2xl font-semibold">{formatNumber(asset.metrics.videoViews)}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de rendimiento en el tiempo */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Rendimiento en el tiempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={asset.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value, name) => [
                    name === 'engagement' ? `${value}%` : formatNumber(value as number),
                    name === 'reach' ? 'Alcance' :
                    name === 'engagement' ? 'Engagement' : 'Conversiones'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="reach" 
                  stroke={brandKit?.colors?.primary || '#8884d8'} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="engagement" 
                  stroke={brandKit?.colors?.secondary || '#82ca9d'} 
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="conversions" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Breakdown por plataforma */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por plataforma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformBreakdown.map((platform, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{platform.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(platform.reach)}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        backgroundColor: platform.color,
                        width: `${Math.min((platform.reach / Math.max(...platformBreakdown.map(p => p.reach))) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{platform.engagement.toFixed(1)}% engagement</span>
                    <span>{platform.conversions} conversiones</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas detalladas */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas detalladas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-sm text-muted-foreground">Likes</div>
                <div className="font-semibold">{formatNumber(asset.metrics.likes)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-sm text-muted-foreground">Comentarios</div>
                <div className="font-semibold">{formatNumber(asset.metrics.comments)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Share className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-sm text-muted-foreground">Compartidos</div>
                <div className="font-semibold">{formatNumber(asset.metrics.shares)}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-sm text-muted-foreground">Guardados</div>
                <div className="font-semibold">{formatNumber(asset.metrics.saves)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plataformas */}
      <Card>
        <CardHeader>
          <CardTitle>Plataformas de publicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {asset.platform.map((platform, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-3 py-1"
                style={{
                  borderColor: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS],
                  color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS]
                }}
              >
                {platform}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};