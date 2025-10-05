import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import {
  Plus,
  ExternalLink,
  Trash2,
  Edit,
  Globe,
  Users,
  TrendingUp,
  BarChart3,
  Instagram,
  Linkedin,
  Youtube,
  CheckCircle
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";
import { mockCompetitors, Competitor, SocialPlatform } from "../../utils/mockCompetition";

// TikTok icon as SVG
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const CompetitorsView: React.FC = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>(mockCompetitors);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<Competitor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    industry: "",
    description: ""
  });
  const { brandKit } = useBrandKit();

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return Instagram;
      case 'linkedin': return Linkedin;
      case 'youtube': return Youtube;
      case 'tiktok': return TikTokIcon;
      default: return Globe;
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 6) return "text-green-600";
    if (engagement >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  const handleAddCompetitor = () => {
    if (!formData.name || !formData.website) return;

    const newCompetitor: Competitor = {
      id: Date.now().toString(),
      name: formData.name,
      website: formData.website,
      industry: formData.industry || "No especificado",
      description: formData.description || "",
      socialPlatforms: [], // Se añadirían manualmente después
      metrics: {
        totalFollowers: 0,
        avgEngagement: 0,
        postsPerWeek: 0,
        contentFormats: {
          posts: 0,
          stories: 0,
          videos: 0,
          podcasts: 0
        },
        estimatedReach: 0,
        brandConsistency: 0
      },
      addedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setCompetitors([...competitors, newCompetitor]);
    setFormData({ name: "", website: "", industry: "", description: "" });
    setShowAddDialog(false);
  };

  const handleEditCompetitor = (competitor: Competitor) => {
    setEditingCompetitor(competitor);
    setFormData({
      name: competitor.name,
      website: competitor.website,
      industry: competitor.industry,
      description: competitor.description
    });
    setShowAddDialog(true);
  };

  const handleUpdateCompetitor = () => {
    if (!editingCompetitor || !formData.name || !formData.website) return;

    setCompetitors(competitors.map(comp => 
      comp.id === editingCompetitor.id 
        ? {
            ...comp,
            name: formData.name,
            website: formData.website,
            industry: formData.industry || "No especificado",
            description: formData.description || "",
            lastUpdated: new Date().toISOString().split('T')[0]
          }
        : comp
    ));

    setEditingCompetitor(null);
    setFormData({ name: "", website: "", industry: "", description: "" });
    setShowAddDialog(false);
  };

  const handleDeleteCompetitor = (id: string) => {
    setCompetitors(competitors.filter(comp => comp.id !== id));
  };

  const resetForm = () => {
    setFormData({ name: "", website: "", industry: "", description: "" });
    setEditingCompetitor(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Competidores Monitoreados</h3>
          <p className="text-sm text-muted-foreground">
            {competitors.length} competidores en seguimiento
          </p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir Competidor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCompetitor ? "Editar Competidor" : "Añadir Nuevo Competidor"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la empresa *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Alpha Brand"
                />
              </div>
              
              <div>
                <Label htmlFor="website">Sitio web *</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  placeholder="https://ejemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industria</Label>
                <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una industria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Consultoría">Consultoría</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="E-commerce">E-commerce</SelectItem>
                    <SelectItem value="Fintech">Fintech</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Educación">Educación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Breve descripción de la empresa y su enfoque..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={editingCompetitor ? handleUpdateCompetitor : handleAddCompetitor}>
                  {editingCompetitor ? "Actualizar" : "Añadir"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Competitors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {competitors.map((competitor) => (
          <Card key={competitor.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                    {competitor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{competitor.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {competitor.industry}
                    </Badge>
                  </div>
                </CardTitle>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditCompetitor(competitor)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar competidor?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará {competitor.name} de tu lista de competidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteCompetitor(competitor.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Website */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sitio web</span>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a href={competitor.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>

              {/* Description */}
              {competitor.description && (
                <p className="text-sm text-muted-foreground">{competitor.description}</p>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Seguidores</span>
                  </div>
                  <p className="font-semibold">{formatNumber(competitor.metrics.totalFollowers)}</p>
                </div>

                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Engagement</span>
                  </div>
                  <p className={`font-semibold ${getEngagementColor(competitor.metrics.avgEngagement)}`}>
                    {competitor.metrics.avgEngagement}%
                  </p>
                </div>
              </div>

              {/* Social Platforms */}
              <div>
                <h4 className="text-sm font-medium mb-2">Plataformas Activas</h4>
                <div className="flex flex-wrap gap-2">
                  {competitor.socialPlatforms.map((platform, idx) => {
                    const IconComponent = getPlatformIcon(platform.name);
                    return (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
                        <IconComponent className="w-3 h-3" />
                        <span className="text-xs">{formatNumber(platform.followers)}</span>
                        {platform.verified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground">Posts/semana</p>
                  <p className="font-medium">{competitor.metrics.postsPerWeek}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Alcance est.</p>
                  <p className="font-medium">{formatNumber(competitor.metrics.estimatedReach)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Consistencia</p>
                  <p className="font-medium">{competitor.metrics.brandConsistency}%</p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>Añadido: {new Date(competitor.addedDate).toLocaleDateString('es-ES')}</span>
                <span>Actualizado: {new Date(competitor.lastUpdated).toLocaleDateString('es-ES')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {competitors.length === 0 && (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay competidores añadidos</h3>
            <p className="text-muted-foreground mb-4">
              Comienza añadiendo competidores para monitorear su actividad y comparar métricas.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Añadir primer competidor
            </Button>
          </div>
        </Card>
      )}

      {/* Quick Insights */}
      {competitors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Insights Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Top Performer
                  </span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {competitors.sort((a, b) => b.metrics.totalFollowers - a.metrics.totalFollowers)[0]?.name} 
                  lidera en seguidores totales
                </p>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Engagement Líder
                  </span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {competitors.sort((a, b) => b.metrics.avgEngagement - a.metrics.avgEngagement)[0]?.name} 
                  tiene el mejor engagement
                </p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    Más Activo
                  </span>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {competitors.sort((a, b) => b.metrics.postsPerWeek - a.metrics.postsPerWeek)[0]?.name} 
                  publica más frecuentemente
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompetitorsView;