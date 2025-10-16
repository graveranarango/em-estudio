import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  TrendingUp,
  Users,
  MousePointer,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  mockAnalyticsAssets,
  mockOverallMetrics,
  mockRecommendations,
  getAssetsByType,
  getTopPerformingAssets,
  getLowPerformingAssets,
  getBrandKitCompliance,
  AnalyticsAsset
} from "../../utils/mockAnalytics";
import { AnalyticsDetail } from "./AnalyticsDetail";
import { Recommendations } from "./Recommendations";
import { useBrandKit } from "../../contexts/BrandKitContext";

const AnalyticsModule: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<AnalyticsAsset | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { brandKit } = useBrandKit();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const contentTypeData = useMemo(() => [
    { name: "Posts", value: getAssetsByType("post").length, color: brandKit?.colors?.primary || "#8884d8" },
    { name: "Stories", value: getAssetsByType("story").length, color: brandKit?.colors?.secondary || "#82ca9d" },
    { name: "Videos", value: getAssetsByType("video").length, color: "#ffc658" },
    { name: "Podcasts", value: getAssetsByType("podcast").length, color: "#ff7c7c" }
  ], [brandKit]);

  const performanceData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        reach: Math.floor(Math.random() * 5000) + 3000,
        engagement: Math.floor(Math.random() * 3) + 6,
        conversions: Math.floor(Math.random() * 50) + 20
      };
    });
    return last7Days;
  }, []);

  const brandKitCompliance = getBrandKitCompliance();
  const topAssets = getTopPerformingAssets(3);
  const lowAssets = getLowPerformingAssets(2);

  if (selectedAsset) {
    return (
      <AnalyticsDetail
        asset={selectedAsset}
        onBack={() => setSelectedAsset(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard de Analítica</h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tu contenido y recibe sugerencias inteligentes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alcance Total</p>
                <p className="text-2xl font-semibold">{formatNumber(mockOverallMetrics.totalReach)}</p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+{mockOverallMetrics.weeklyGrowth.reach}%</span>
              <span className="text-muted-foreground ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Engagement Promedio</p>
                <p className="text-2xl font-semibold">{mockOverallMetrics.avgEngagementRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+{mockOverallMetrics.weeklyGrowth.engagement}%</span>
              <span className="text-muted-foreground ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reproducciones Video</p>
                <p className="text-2xl font-semibold">{formatNumber(mockOverallMetrics.totalVideoViews)}</p>
              </div>
              <Eye className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.3%</span>
              <span className="text-muted-foreground ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversiones</p>
                <p className="text-2xl font-semibold">{mockOverallMetrics.totalConversions}</p>
              </div>
              <MousePointer className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+{mockOverallMetrics.weeklyGrowth.conversions}%</span>
              <span className="text-muted-foreground ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráficos principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gráfico de rendimiento */}
          <Card>
            <CardHeader>
              <CardTitle>Rendimiento en los últimos 7 días</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="reach" 
                    stroke={brandKit?.colors?.primary || '#8884d8'} 
                    strokeWidth={2}
                    name="Alcance"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke={brandKit?.colors?.secondary || '#82ca9d'} 
                    strokeWidth={2}
                    name="Engagement %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    name="Conversiones"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribución por tipo de contenido */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Distribución por tipo de contenido</CardTitle>
                <PieChartIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={contentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {contentTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {contentTypeData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mejor y peor rendimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mejor rendimiento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{asset.title}</h4>
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        {asset.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatNumber(asset.metrics.reach)} alcance</span>
                      <span>{asset.metrics.engagement}% engagement</span>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todos
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Necesita optimización</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lowAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{asset.title}</h4>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                        {asset.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatNumber(asset.metrics.reach)} alcance</span>
                      <span>{asset.metrics.engagement}% engagement</span>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todos
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="space-y-6">
          {/* BrandKit Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cumplimiento BrandKit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-3xl font-semibold" style={{ color: brandKit?.colors?.primary || '#030213' }}>
                  {brandKitCompliance.percentage}%
                </div>
                <p className="text-sm text-muted-foreground">
                  {brandKitCompliance.compliant} de {brandKitCompliance.total} assets
                </p>
              </div>
              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: brandKit?.colors?.primary || '#030213',
                    width: `${brandKitCompliance.percentage}%`
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Con BrandKit</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  <span>Sin BrandKit</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recomendaciones IA */}
          <Recommendations recommendations={mockRecommendations} />
        </div>
      </div>

      {/* Tabla de todos los assets */}
      <Card>
        <CardHeader>
          <CardTitle>Todos los contenidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalyticsAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="font-medium">{asset.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{asset.type}</Badge>
                      {asset.brandkitApplied ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(asset.date).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium">{formatNumber(asset.metrics.reach)}</div>
                    <div className="text-muted-foreground">alcance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{asset.metrics.engagement}%</div>
                    <div className="text-muted-foreground">engagement</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">{asset.metrics.conversions}</div>
                    <div className="text-muted-foreground">conversiones</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsModule;