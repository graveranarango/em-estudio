import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Edit2, Plus, X, CheckCircle, XCircle } from "lucide-react";

interface UsageRules {
  dos: string[];
  donts: string[];
}

interface UsageRulesSectionProps {
  usageRules: UsageRules;
  onUsageRulesChange: (usageRules: UsageRules) => void;
  isEditable?: boolean;
}

export function UsageRulesSection({ usageRules, onUsageRulesChange, isEditable = true }: UsageRulesSectionProps) {
  const [editingDo, setEditingDo] = useState<number | null>(null);
  const [editingDont, setEditingDont] = useState<number | null>(null);

  const addRule = (type: 'dos' | 'donts') => {
    const newRule = type === 'dos' ? "Nueva regla a seguir" : "Nueva regla a evitar";
    const updatedRules = {
      ...usageRules,
      [type]: [...usageRules[type], newRule]
    };
    onUsageRulesChange(updatedRules);
    
    if (type === 'dos') {
      setEditingDo(usageRules.dos.length);
    } else {
      setEditingDont(usageRules.donts.length);
    }
  };

  const updateRule = (type: 'dos' | 'donts', index: number, value: string) => {
    const updatedRules = { ...usageRules };
    updatedRules[type][index] = value;
    onUsageRulesChange(updatedRules);
  };

  const removeRule = (type: 'dos' | 'donts', index: number) => {
    const updatedRules = {
      ...usageRules,
      [type]: usageRules[type].filter((_, i) => i !== index)
    };
    onUsageRulesChange(updatedRules);
    
    if (type === 'dos') {
      setEditingDo(null);
    } else {
      setEditingDont(null);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="mb-1">Reglas de Uso</h3>
          <p className="text-sm text-muted-foreground">
            Directrices sobre qué hacer y qué evitar con tu marca
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QUÉ SÍ HACER */}
        <Card className="p-4 border-green-200 bg-green-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">Qué SÍ hacer</h4>
            </div>
            {isEditable && (
              <Button 
                onClick={() => addRule('dos')} 
                size="sm" 
                variant="outline"
                className="border-green-300 hover:bg-green-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {usageRules.dos.map((rule, index) => (
              <div key={index} className="group relative">
                {editingDo === index ? (
                  <div className="flex gap-2">
                    <Input
                      value={rule}
                      onChange={(e) => updateRule('dos', index, e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingDo(null);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => setEditingDo(null)}
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={`flex items-start gap-2 p-2 rounded ${
                      isEditable ? 'hover:bg-green-100/50 cursor-pointer' : ''
                    } group`}
                    onClick={() => isEditable && setEditingDo(index)}
                  >
                    <span className="text-green-600 mt-0.5">•</span>
                    <span className="flex-1 text-sm text-green-800">{rule}</span>
                    {isEditable && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDo(index);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRule('dos', index);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {usageRules.dos.length === 0 && (
              <div className="text-center py-4 text-green-600/60">
                <p className="text-sm">No hay reglas positivas definidas aún.</p>
              </div>
            )}
          </div>
        </Card>

        {/* QUÉ NO HACER */}
        <Card className="p-4 border-red-200 bg-red-50/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-red-800">Qué NO hacer</h4>
            </div>
            {isEditable && (
              <Button 
                onClick={() => addRule('donts')} 
                size="sm" 
                variant="outline"
                className="border-red-300 hover:bg-red-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {usageRules.donts.map((rule, index) => (
              <div key={index} className="group relative">
                {editingDont === index ? (
                  <div className="flex gap-2">
                    <Input
                      value={rule}
                      onChange={(e) => updateRule('donts', index, e.target.value)}
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setEditingDont(null);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => setEditingDont(null)}
                    >
                      ✓
                    </Button>
                  </div>
                ) : (
                  <div 
                    className={`flex items-start gap-2 p-2 rounded ${
                      isEditable ? 'hover:bg-red-100/50 cursor-pointer' : ''
                    } group`}
                    onClick={() => isEditable && setEditingDont(index)}
                  >
                    <span className="text-red-600 mt-0.5">•</span>
                    <span className="flex-1 text-sm text-red-800">{rule}</span>
                    {isEditable && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingDont(index);
                          }}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRule('donts', index);
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {usageRules.donts.length === 0 && (
              <div className="text-center py-4 text-red-600/60">
                <p className="text-sm">No hay reglas restrictivas definidas aún.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Aplicación en la IA */}
      <Card className="p-4 mt-6 bg-blue-50/50">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Integración con IA
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          Estas reglas se aplicarán automáticamente en todos los módulos de generación de contenido:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Chat Maestro
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Posts/Carrousels
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Videos
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            Historias
          </div>
        </div>
      </Card>
    </Card>
  );
}