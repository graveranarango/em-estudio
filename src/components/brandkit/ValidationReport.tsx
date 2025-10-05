import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  TrendingUp,
  Calendar,
  FileSearch
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";

const ValidationReport: React.FC = () => {
  const { brandKit } = useBrandKit();

  if (!brandKit?.validation) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No hay reportes de validación</h3>
          <p className="text-muted-foreground mb-4">
            Ejecuta un escaneo para validar la coherencia de tu BrandKit
          </p>
          <Button>
            <FileSearch className="w-4 h-4 mr-2" />
            Iniciar Validación
          </Button>
        </div>
      </div>
    );
  }

  const validation = brandKit.validation;
  const complianceRate = parseInt(validation.coherenceReport.complianceRate.replace('%', ''));
  
  const getComplianceStatus = (rate: number) => {
    if (rate >= 95) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    if (rate >= 85) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' };
    if (rate >= 70) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20' };
    return { status: 'critical', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20' };
  };

  const complianceStatus = getComplianceStatus(complianceRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Reporte de Validación</h3>
          <p className="text-sm text-muted-foreground">
            Análisis de coherencia y cumplimiento del BrandKit
          </p>
        </div>
        <Button size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualizar Reporte
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cumplimiento General</p>
                <p className={`text-3xl font-bold ${complianceStatus.color}`}>
                  {validation.coherenceReport.complianceRate}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${complianceStatus.bgColor}`}>
                <TrendingUp className={`w-6 h-6 ${complianceStatus.color}`} />
              </div>
            </div>
            <Progress value={complianceRate} className="mt-3 h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {complianceStatus.status === 'excellent' && 'Excelente cumplimiento'}
              {complianceStatus.status === 'good' && 'Buen cumplimiento'}
              {complianceStatus.status === 'warning' && 'Necesita mejoras'}
              {complianceStatus.status === 'critical' && 'Requiere atención'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Último Escaneo</p>
                <p className="text-lg font-bold">{validation.coherenceReport.lastScan}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Hace {Math.floor((new Date().getTime() - new Date(validation.coherenceReport.lastScan).getTime()) / (1000 * 60 * 60 * 24))} días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Problemas Detectados</p>
                <p className="text-lg font-bold text-orange-600">
                  {validation.coherenceReport.issues?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {validation.coherenceReport.issues?.length === 0 ? 'Todo perfecto' : 'Requieren revisión'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issues List */}
      {validation.coherenceReport.issues && validation.coherenceReport.issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Problemas Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validation.coherenceReport.issues.map((issue, index) => (
                <Alert key={index} className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/10">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 dark:text-orange-200">
                    {issue}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Elementos Validados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Colores de marca', status: 'valid', description: 'Paleta consistente aplicada' },
                { name: 'Tipografías', status: 'valid', description: 'Fuentes oficiales utilizadas' },
                { name: 'Logos', status: 'valid', description: 'Versiones correctas implementadas' },
                { name: 'Tono de voz', status: 'valid', description: 'Mensajes alineados con el estilo' },
                { name: 'Formatos', status: 'valid', description: 'Dimensiones según guidelines' }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-800 dark:text-green-200">{item.name}</p>
                    <p className="text-sm text-green-700 dark:text-green-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Métricas de Calidad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Consistencia de colores</span>
                <div className="flex items-center gap-2">
                  <Progress value={95} className="w-20 h-2" />
                  <span className="text-sm font-medium">95%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Uso de tipografías</span>
                <div className="flex items-center gap-2">
                  <Progress value={88} className="w-20 h-2" />
                  <span className="text-sm font-medium">88%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Aplicación de logos</span>
                <div className="flex items-center gap-2">
                  <Progress value={92} className="w-20 h-2" />
                  <span className="text-sm font-medium">92%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Coherencia del tono</span>
                <div className="flex items-center gap-2">
                  <Progress value={94} className="w-20 h-2" />
                  <span className="text-sm font-medium">94%</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Cumplimiento de accesibilidad</span>
                <div className="flex items-center gap-2">
                  <Progress value={86} className="w-20 h-2" />
                  <span className="text-sm font-medium">86%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recomendaciones de Mejora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                Corregir colores no autorizados
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                Se detectaron 3 assets usando colores fuera de la paleta oficial
              </p>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                Ver Assets Afectados
              </Button>
            </div>
            
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                Mejorar contraste en elementos de texto
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                Algunos textos no cumplen los estándares de accesibilidad AA
              </p>
              <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300">
                Revisar Accesibilidad
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ValidationReport };