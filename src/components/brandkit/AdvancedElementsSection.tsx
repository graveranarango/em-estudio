import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Volume2,
  Zap,
  Globe,
  Camera,
  Paintbrush,
  Music,
  Languages,
  Play,
  Download
} from "lucide-react";
import { useBrandKit } from "../../contexts/BrandKitContext";

const AdvancedElementsSection: React.FC = () => {
  const { brandKit } = useBrandKit();

  if (!brandKit) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Elementos Avanzados</h3>
          <p className="text-sm text-muted-foreground">
            Audio, motion, fotografía e internacionalización
          </p>
        </div>
      </div>

      <Tabs defaultValue="audio" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Audio
          </TabsTrigger>
          <TabsTrigger value="motion" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Motion
          </TabsTrigger>
          <TabsTrigger value="photography" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Fotografía
          </TabsTrigger>
          <TabsTrigger value="illustrations" className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            Ilustraciones
          </TabsTrigger>
          <TabsTrigger value="i18n" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Idiomas
          </TabsTrigger>
        </TabsList>

        {/* Audio Tab */}
        <TabsContent value="audio">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5" />
                Elementos de Audio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brandKit.audio ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Estilo de Audio</h4>
                    <p className="text-sm text-muted-foreground">{brandKit.audio.style}</p>
                  </div>

                  {brandKit.audio.jingles && brandKit.audio.jingles.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Jingles Disponibles</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {brandKit.audio.jingles.map((jingle, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <Music className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{jingle}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Play className="w-3 h-3" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {brandKit.audio.rules && brandKit.audio.rules.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Reglas de Uso</h4>
                      <ul className="space-y-1">
                        {brandKit.audio.rules.map((rule, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-green-600 mt-1">•</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay elementos de audio definidos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Motion Tab */}
        <TabsContent value="motion">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Animaciones y Motion
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brandKit.motion ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Velocidad</h4>
                      <Badge variant="outline" className="capitalize">{brandKit.motion.speed}</Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Transiciones Permitidas</h4>
                      <div className="flex flex-wrap gap-1">
                        {brandKit.motion.transitions?.map((transition, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {transition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {brandKit.motion.rules && brandKit.motion.rules.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Reglas de Motion</h4>
                      <ul className="space-y-1">
                        {brandKit.motion.rules.map((rule, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay reglas de motion definidas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photography Tab */}
        <TabsContent value="photography">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Fotografía
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brandKit.photography ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Estilo Fotográfico</h4>
                    <p className="text-sm text-muted-foreground">{brandKit.photography.style}</p>
                  </div>

                  {brandKit.photography.filters && brandKit.photography.filters.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Filtros Recomendados</h4>
                      <div className="flex flex-wrap gap-1">
                        {brandKit.photography.filters.map((filter, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {brandKit.photography.examples && brandKit.photography.examples.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Ejemplos de Referencia</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {brandKit.photography.examples.map((example, index) => (
                          <div key={index} className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Camera className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">{example}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay directrices fotográficas definidas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Illustrations Tab */}
        <TabsContent value="illustrations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paintbrush className="w-5 h-5" />
                Ilustraciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brandKit.illustrations ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Estilo de Ilustración</h4>
                    <p className="text-sm text-muted-foreground">{brandKit.illustrations.style}</p>
                  </div>

                  {brandKit.illustrations.examples && brandKit.illustrations.examples.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Ejemplos Disponibles</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {brandKit.illustrations.examples.map((example, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg mb-2 flex items-center justify-center">
                              <Paintbrush className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-center font-medium">{example}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Paintbrush className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay ejemplos de ilustraciones</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internationalization Tab */}
        <TabsContent value="i18n">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Internacionalización
              </CardTitle>
            </CardHeader>
            <CardContent>
              {brandKit.internationalization ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Idiomas Soportados</h4>
                    <div className="flex flex-wrap gap-2">
                      {brandKit.internationalization.supportedLanguages?.map((lang, index) => (
                        <Badge key={index} variant="outline" className="uppercase">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {brandKit.internationalization.sloganTranslations && (
                    <div>
                      <h4 className="font-medium mb-2">Traducciones del Slogan</h4>
                      <div className="space-y-2">
                        {Object.entries(brandKit.internationalization.sloganTranslations).map(([lang, translation]) => (
                          <div key={lang} className="flex items-center justify-between p-2 rounded border">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="uppercase text-xs">
                                {lang}
                              </Badge>
                              <span className="text-sm">{translation}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {brandKit.internationalization.cultureNotes && brandKit.internationalization.cultureNotes.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Notas Culturales</h4>
                      <ul className="space-y-1">
                        {brandKit.internationalization.cultureNotes.map((note, index) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-yellow-600 mt-1">•</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay configuración de internacionalización</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { AdvancedElementsSection };