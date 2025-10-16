import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  Star,
  Hash
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { useBrandKit } from "../../contexts/BrandKitContext";

const MessagingSection: React.FC = () => {
  const { brandKit, updateBrandKit } = useBrandKit();
  const messaging = brandKit?.messaging || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Mensajes Clave</h3>
          <p className="text-sm text-muted-foreground">
            Define los mensajes principales que representan tu marca
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Taglines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="w-5 h-5" />
              Taglines
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messaging.taglines && messaging.taglines.length > 0 ? (
              <div className="space-y-2">
                {messaging.taglines.map((tagline, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{tagline}</span>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Tagline
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No hay taglines definidos</p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Primer Tagline
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slogans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Slogans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messaging.slogans && messaging.slogans.length > 0 ? (
              <div className="space-y-2">
                {messaging.slogans.map((slogan, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm font-medium">{slogan}</span>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Slogan
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="mb-2">No hay slogans definidos</p>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Añadir Primer Slogan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Mensajes Principales</CardTitle>
        </CardHeader>
        <CardContent>
          {messaging.keyMessages && messaging.keyMessages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {messaging.keyMessages.map((message, index) => (
                <div key={index} className="p-4 rounded-lg border bg-muted/20">
                  <p className="text-sm">{message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="mb-2">No hay mensajes clave definidos</p>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Mensaje Clave
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Differentiators */}
      <Card>
        <CardHeader>
          <CardTitle>Diferenciadores</CardTitle>
        </CardHeader>
        <CardContent>
          {messaging.differentiators && messaging.differentiators.length > 0 ? (
            <div className="space-y-2">
              {messaging.differentiators.map((diff, index) => (
                <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <span className="text-sm">{diff}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p className="mb-2">No hay diferenciadores definidos</p>
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Diferenciador
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export { MessagingSection };