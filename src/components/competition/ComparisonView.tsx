import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from "recharts";
import {
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Lightbulb,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { 
  mockCompetitors, 
  ourBrandMetrics, 
  compareWithCompetitor,
  mockComparisonInsights,
  getPlatformComparison,
  ComparisonInsight
} from "../../utils/mockCompetition";

const ComparisonView: React.FC = () => {
  const [selectedCompetitor, setSelectedCompetitor] = useState<string>(mockCompetitors[0]?.id || "");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const { brandKit } = useBrandKit();

  const comparisonData = useMemo(() => {
    if (!selectedCompetitor) return null;
    return compareWithCompetitor(selectedCompetitor);
  }, [selectedCompetitor]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <ArrowUp className="w-4 h-4 text-red-500" />;
    if (value < 0) return <ArrowDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (value: number, isPositiveGood = false) => {
    if (value > 0) return isPositiveGood ? "text-green-600" : "text-red-600";
    if (value < 0) return isPositiveGood ? "text-red-600" : "text-green-600";
    return "text-gray-600";
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Lightbulb;
      case 'strength': return CheckCircle;
      case 'weakness': return AlertTriangle;
      case 'recommendation': return Target;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'opportunity': return 'text-blue-500';
      case 'strength': return 'text-green-500';
      case 'weakness': return 'text-red-500';
      case 'recommendation': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Prepare data for charts
  const chartData = comparisonData ? [
    {
      metric: 'Seguidores',
      Nosotros: comparisonData.comparison.followers.ours,
      [comparisonData.competitor.name]: comparisonData.comparison.followers.theirs
    },
    {
      metric: 'Engagement %',
      Nosotros: comparisonData.comparison.engagement.ours,
      [comparisonData.competitor.name]: comparisonData.comparison.engagement.theirs
    },
    {
      metric: 'Posts/Semana',
      Nosotros: comparisonData.comparison.postsPerWeek.ours,
      [comparisonData.competitor.name]: comparisonData.comparison.postsPerWeek.theirs
    },
    {
      metric: 'Consistencia %',
      Nosotros: comparisonData.comparison.consistency.ours,
      [comparisonData.competitor.name]: comparisonData.comparison.consistency.theirs
    }
  ] : [];

  const radarData = comparisonData ? [
    {
      metric: 'Seguidores',
      Nosotros: Math.min((comparisonData.comparison.followers.ours / 100000) * 100, 100),
      [comparisonData.competitor.name]: Math.min((comparisonData.comparison.followers.theirs / 100000) * 100, 100)
    },
    {
      metric: 'Engagement',
      Nosotros: comparisonData.comparison.engagement.ours * 10,
      [comparisonData.competitor.name]: comparisonData.comparison.engagement.theirs * 10
    },
    {
      metric: 'Frecuencia',
      Nosotros: (comparisonData.comparison.postsPerWeek.ours / 20) * 100,
      [comparisonData.competitor.name]: (comparisonData.comparison.postsPerWeek.theirs / 20) * 100
    },
    {
      metric: 'Consistencia',
      Nosotros: comparisonData.comparison.consistency.ours,
      [comparisonData.competitor.name]: comparisonData.comparison.consistency.theirs
    },
    {
      metric: 'Alcance',
      Nosotros: Math.min((comparisonData.comparison.reach.ours / 1000000) * 100, 100),
      [comparisonData.competitor.name]: Math.min((comparisonData.comparison.reach.theirs / 1000000) * 100, 100)
    }
  ] : [];

  if (!comparisonData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Selecciona un competidor para comenzar la comparación</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Competitor Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Análisis Comparativo</h3>
          <p className="text-sm text-muted-foreground">
            Compara métricas clave con tu competencia seleccionada
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Comparar con:</span>
            <Select value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecciona competidor" />
              </SelectTrigger>
              <SelectContent>
                {mockCompetitors.map((competitor) => (
                  <SelectItem key={competitor.id} value={competitor.id}>
                    {competitor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "Seguidores Totales",
            ours: comparisonData.comparison.followers.ours,
            theirs: comparisonData.comparison.followers.theirs,
            difference: comparisonData.comparison.followers.difference,
            percentage: comparisonData.comparison.followers.percentageDiff,
            icon: Users
          },
          {
            title: "Engagement Promedio",
            ours: `${comparisonData.comparison.engagement.ours}%`,
            theirs: `${comparisonData.comparison.engagement.theirs}%`,
            difference: `${comparisonData.comparison.engagement.difference}%`,
            percentage: comparisonData.comparison.engagement.percentageDiff,
            icon: TrendingUp
          },
          {
            title: "Posts por Semana",
            ours: comparisonData.comparison.postsPerWeek.ours,
            theirs: comparisonData.comparison.postsPerWeek.theirs,
            difference: comparisonData.comparison.postsPerWeek.difference,
            percentage: comparisonData.comparison.postsPerWeek.percentageDiff,
            icon: BarChart3
          },
          {
            title: "Alcance Estimado",
            ours: formatNumber(comparisonData.comparison.reach.ours),
            theirs: formatNumber(comparisonData.comparison.reach.theirs),
            difference: formatNumber(comparisonData.comparison.reach.difference),
            percentage: comparisonData.comparison.reach.percentageDiff,
            icon: Target
          }
        ].map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{metric.title}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Nosotros</span>
                    <span className="text-sm font-semibold">{metric.ours}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{comparisonData.competitor.name}</span>
                    <span className="text-sm font-semibold">{metric.theirs}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-1 border-t">
                    <span className="text-xs text-muted-foreground">Diferencia</span>
                    <div className="flex items-center gap-1">
                      {getChangeIcon(metric.percentage)}
                      <span className={`text-xs font-medium ${getChangeColor(metric.percentage)}`}>
                        {Math.abs(metric.percentage)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativa de Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="Nosotros" 
                  fill={brandKit?.colors?.primary || '#030213'} 
                  name="Nosotros"
                />
                <Bar 
                  dataKey={comparisonData.competitor.name} 
                  fill="#8884d8" 
                  name={comparisonData.competitor.name}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Perfil Competitivo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Nosotros"
                  dataKey="Nosotros"
                  stroke={brandKit?.colors?.primary || '#030213'}
                  fill={brandKit?.colors?.primary || '#030213'}
                  fillOpacity={0.2}
                />
                <Radar
                  name={comparisonData.competitor.name}
                  dataKey={comparisonData.competitor.name}
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.2}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform-specific Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Análisis por Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {ourBrandMetrics.socialPlatforms.map((ourPlatform) => {
              const competitorPlatform = comparisonData.competitor.socialPlatforms.find(
                p => p.name.toLowerCase() === ourPlatform.name.toLowerCase()
              );
              
              if (!competitorPlatform) return null;
              
              return (
                <div key={ourPlatform.name} className="p-4 rounded-lg border bg-card">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <span>{ourPlatform.name}</span>
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seguidores:</span>
                      <div className="text-right">
                        <div>{formatNumber(ourPlatform.followers)} vs {formatNumber(competitorPlatform.followers)}</div>
                        <div className={`text-xs ${getChangeColor(
                          ((competitorPlatform.followers - ourPlatform.followers) / ourPlatform.followers) * 100
                        )}`}>
                          {Math.abs(Math.round(((competitorPlatform.followers - ourPlatform.followers) / ourPlatform.followers) * 100))}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Engagement:</span>
                      <div className="text-right">
                        <div>{ourPlatform.engagement}% vs {competitorPlatform.engagement}%</div>
                        <div className={`text-xs ${getChangeColor(
                          ((competitorPlatform.engagement - ourPlatform.engagement) / ourPlatform.engagement) * 100,
                          true
                        )}`}>
                          {Math.abs(Math.round(((competitorPlatform.engagement - ourPlatform.engagement) / ourPlatform.engagement) * 100))}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posts/sem:</span>
                      <div className="text-right">
                        <div>{ourPlatform.postsPerWeek} vs {competitorPlatform.postsPerWeek}</div>
                        <div className={`text-xs ${getChangeColor(
                          ((competitorPlatform.postsPerWeek - ourPlatform.postsPerWeek) / ourPlatform.postsPerWeek) * 100
                        )}`}>
                          {Math.abs(Math.round(((competitorPlatform.postsPerWeek - ourPlatform.postsPerWeek) / ourPlatform.postsPerWeek) * 100))}%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Insights y Recomendaciones IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockComparisonInsights.map((insight) => {
              const IconComponent = getInsightIcon(insight.type);
              const iconColor = getInsightColor(insight.type);
              
              return (
                <div key={insight.id} className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start gap-3">
                    <IconComponent className={`w-5 h-5 mt-0.5 ${iconColor}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{insight.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(insight.priority)}`}
                        >
                          {insight.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">
                        {insight.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nosotros:</span>
                          <span className="font-medium">{insight.ourValue}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Competidor:</span>
                          <span className="font-medium">{insight.competitorValue}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Recomendación:
                        </p>
                        <p className="text-sm">{insight.improvement}</p>
                      </div>
                      
                      {insight.automationSuggestion && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          style={{ borderColor: brandKit?.colors?.primary || '#030213' }}
                        >
                          <Target className="w-3 h-3 mr-2" />
                          Aplicar en Automatización
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonView;