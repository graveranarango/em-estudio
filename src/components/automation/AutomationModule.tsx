import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Bot,
  Clock,
  TrendingUp,
  Palette,
  Zap,
  Settings,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Info,
  Lightbulb,
  Play,
  Pause,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import {
  mockAutomationRules,
  mockTimeRecommendations,
  mockFormatRecommendations,
  mockCreativeOptimizations,
  mockAutoReuseOpportunities,
  mockAutomationInsights,
  getActiveRules,
  getHighPriorityOpportunities,
  getRecentInsights,
  calculateAutomationImpact,
  AutomationRule,
  AutomationInsight
} from "../../utils/mockAutomation";
import { useBrandKit } from "../../contexts/BrandKitContext";

const AutomationModule: React.FC = () => {
  const [rules, setRules] = useState(mockAutomationRules);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const { brandKit } = useBrandKit();

  const automationImpact = useMemo(() => calculateAutomationImpact(), [rules]);
  const activeRules = useMemo(() => getActiveRules(), [rules]);
  const highPriorityOpportunities = useMemo(() => getHighPriorityOpportunities(), []);
  const recentInsights = useMemo(() => getRecentInsights(), []);

  const toggleRule = (ruleId: string) => {
    setRules(prevRules =>
      prevRules.map(rule =>
        rule.id === ruleId
          ? { ...rule, active: !rule.active, lastUpdated: new Date().toISOString().split('T')[0] }
          : rule
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'best_time': return Clock;
      case 'format': return TrendingUp;
      case 'creative': return Palette;
      case 'auto_reuse': return RefreshCw;
      default: return Bot;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'opportunity': return Lightbulb;
      default: return Info;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-orange-500';
      case 'opportunity': return 'text-blue-500';
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Automatización Inteligente</h1>
          <p className="text-muted-foreground">
            Optimiza y automatiza tu estrategia de contenido con IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-2" />
            Ver calendario
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Reglas Activas</p>
                <p className="text-2xl font-semibold">
                  {automationImpact.rulesActive}/{automationImpact.totalRules}
                </p>
              </div>
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <Progress 
                value={(automationImpact.rulesActive / automationImpact.totalRules) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confianza IA</p>
                <p className="text-2xl font-semibold">{automationImpact.avgConfidence}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="mt-2">
              <Progress value={automationImpact.avgConfidence} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Ahorrado</p>
                <p className="text-2xl font-semibold">{automationImpact.estimatedTimesSaved}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">por semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mejora Engagement</p>
                <p className="text-2xl font-semibold">{automationImpact.engagementIncrease}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-green-500 mt-2">vs manual</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Reglas (izquierda) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: brandKit?.colors?.primary || '#030213' }} />
                Centro de Control de Automatización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.map((rule) => {
                const IconComponent = getRuleIcon(rule.type);
                return (
                  <div
                    key={rule.id}
                    className={`p-4 rounded-lg border transition-all ${
                      rule.active 
                        ? 'bg-card border-border shadow-sm' 
                        : 'bg-muted/30 border-muted-foreground/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <IconComponent 
                          className={`w-5 h-5 ${
                            rule.active 
                              ? 'text-foreground' 
                              : 'text-muted-foreground'
                          }`} 
                        />
                        <div>
                          <h4 className={`font-medium ${
                            rule.active ? 'text-foreground' : 'text-muted-foreground'
                          }`}>
                            {rule.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {rule.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={rule.active}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                    </div>
                    
                    {rule.active && (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              Confianza: {rule.confidence}%
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Actualizado: {formatDate(rule.lastUpdated)}
                            </span>
                          </div>
                          <span 
                            className="text-sm font-medium"
                            style={{ color: brandKit?.colors?.primary || '#030213' }}
                          >
                            {rule.impact}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {rule.suggestions.slice(0, 2).map((suggestion, index) => (
                            <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {suggestion}
                            </div>
                          ))}
                          {rule.suggestions.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 p-0 text-xs"
                              onClick={() => setSelectedRule(rule)}
                            >
                              Ver {rule.suggestions.length - 2} más...
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recomendaciones de Horarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horarios Óptimos Detectados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTimeRecommendations.map((time, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{time.platform}</h4>
                      <Badge variant="outline" className="text-xs">
                        {time.confidence}% precisión
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">{time.day} a las {time.time}</div>
                      <div className="text-muted-foreground">{time.engagement}% engagement promedio</div>
                      <div className="text-xs text-muted-foreground mt-1">{time.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel derecho - Insights y Oportunidades */}
        <div className="space-y-6">
          {/* Insights Recientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Insights Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentInsights.map((insight) => {
                const IconComponent = getInsightIcon(insight.type);
                const iconColor = getInsightColor(insight.type);
                
                return (
                  <div key={insight.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-4 h-4 mt-0.5 ${iconColor}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {insight.description}
                        </p>
                        {insight.actionable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 mt-2 p-0 text-xs"
                            style={{ color: brandKit?.colors?.primary || '#030213' }}
                          >
                            {insight.action}
                            <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        )}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPriorityColor(insight.priority)}`}
                      >
                        {insight.priority}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Oportunidades de Reutilización */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Oportunidades de Reutilización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highPriorityOpportunities.map((opportunity, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{opportunity.assetTitle}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(opportunity.priority)}`}
                    >
                      {opportunity.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {opportunity.suggestedFormat}
                  </p>
                  <div className="flex items-center justify-between">
                    <span 
                      className="text-xs font-medium"
                      style={{ color: brandKit?.colors?.primary || '#030213' }}
                    >
                      {opportunity.expectedImprovement}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      Crear automáticamente
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Optimizaciones Creativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Optimizaciones Creativas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockCreativeOptimizations.map((optimization, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase font-medium text-muted-foreground">
                      {optimization.element}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {optimization.confidence}% confianza
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{optimization.recommendation}</p>
                  <p 
                    className="text-xs font-medium mb-2"
                    style={{ color: brandKit?.colors?.primary || '#030213' }}
                  >
                    {optimization.impact}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    Ejemplos: {optimization.examples.join(", ")}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutomationModule;