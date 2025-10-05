import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Users,
  TrendingUp,
  Globe,
  BarChart3,
  Target,
  Eye,
  Plus,
  Settings
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { calculateIndustryAverage } from "../../utils/mockCompetition";
import OurBrandView from "./OurBrandView";
import CompetitorsView from "./CompetitorsView";
import ComparisonView from "./ComparisonView";

const CompetitionModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState("our-brand");
  const { brandKit } = useBrandKit();
  
  const industryAverage = calculateIndustryAverage();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Análisis de Competencia</h1>
          <p className="text-muted-foreground">
            Monitorea, compara y optimiza tu presencia frente a la competencia
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configurar
          </Button>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Añadir competidor
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {industryAverage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Promedio Industria</p>
                  <p className="text-lg font-semibold">
                    {(industryAverage.avgFollowers / 1000).toFixed(1)}K
                  </p>
                </div>
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">seguidores</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engagement Promedio</p>
                  <p className="text-lg font-semibold">{industryAverage.avgEngagement}%</p>
                </div>
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">tasa de interacción</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Posts por Semana</p>
                  <p className="text-lg font-semibold">{industryAverage.avgPostsPerWeek}</p>
                </div>
                <BarChart3 className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">frecuencia promedio</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Alcance Promedio</p>
                  <p className="text-lg font-semibold">
                    {(industryAverage.avgReach / 1000).toFixed(0)}K
                  </p>
                </div>
                <Eye className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">impresiones mensuales</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content - Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" style={{ color: brandKit?.colors?.primary || '#030213' }} />
            Centro de Inteligencia Competitiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="our-brand" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Nuestra Marca
              </TabsTrigger>
              <TabsTrigger value="competitors" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Competencia
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Comparación
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="our-brand" className="space-y-6">
                <OurBrandView />
              </TabsContent>

              <TabsContent value="competitors" className="space-y-6">
                <CompetitorsView />
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6">
                <ComparisonView />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitionModule;