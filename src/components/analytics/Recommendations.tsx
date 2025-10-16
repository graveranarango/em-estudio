import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Palette,
  ArrowRight,
  Lightbulb,
  CheckCircle
} from "lucide-react";
import { AIRecommendation } from "../../utils/mockAnalytics";
import { useBrandKit } from "../../contexts/BrandKitContext";

interface RecommendationsProps {
  recommendations: AIRecommendation[];
}

const categoryIcons = {
  content: TrendingUp,
  timing: Clock,
  platform: Target,
  brandkit: Palette
};

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: "bg-green-100 text-green-800 border-green-200"
};

export const Recommendations: React.FC<RecommendationsProps> = ({ 
  recommendations 
}) => {
  const { brandKit } = useBrandKit();

  const handleApplyRecommendation = (recommendation: AIRecommendation) => {
    console.log('Aplicando recomendación:', recommendation.title);
    // Aquí se implementaría la lógica para aplicar la recomendación
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" style={{ color: brandKit?.colors?.primary || '#030213' }} />
          <CardTitle>Recomendaciones IA</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Sugerencias inteligentes para optimizar tu contenido
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((recommendation) => {
          const IconComponent = categoryIcons[recommendation.category];
          const priorityClass = priorityColors[recommendation.priority];
          
          return (
            <div
              key={recommendation.id}
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-muted-foreground" />
                  <h4 className="font-medium text-sm">{recommendation.title}</h4>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${priorityClass}`}
                >
                  {recommendation.priority}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">
                {recommendation.description}
              </p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium" style={{ color: brandKit?.colors?.primary || '#030213' }}>
                    {recommendation.impact}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {recommendation.action}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApplyRecommendation(recommendation)}
                  className="text-xs h-7"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Aplicar
                </Button>
              </div>
            </div>
          );
        })}
        
        <div className="mt-6 pt-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full text-sm"
            style={{ color: brandKit?.colors?.primary || '#030213' }}
          >
            Ver todas las recomendaciones
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};