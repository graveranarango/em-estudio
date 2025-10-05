import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { AlertTriangle } from 'lucide-react';

interface ConflictCardProps {
  fieldName: string;
  currentValue: string;
  suggestedValue: string;
  onMaintain?: () => void;
  onReplace?: () => void;
  onMerge?: () => void;
  colorVariant?: 'amber' | 'orange' | 'red';
}

export function ConflictCard({ 
  fieldName, 
  currentValue, 
  suggestedValue, 
  onMaintain, 
  onReplace, 
  onMerge,
  colorVariant = 'amber'
}: ConflictCardProps) {
  const colorClasses = {
    amber: {
      border: 'border-amber-200',
      bg: 'bg-amber-50/30',
      icon: 'text-amber-600',
      text: 'text-amber-800'
    },
    orange: {
      border: 'border-orange-200',
      bg: 'bg-orange-50/30',
      icon: 'text-orange-600',
      text: 'text-orange-800'
    },
    red: {
      border: 'border-red-200',
      bg: 'bg-red-50/30',
      icon: 'text-red-600',
      text: 'text-red-800'
    }
  };

  const colors = colorClasses[colorVariant];

  return (
    <div className="my-4">
      <Card className={`border ${colors.border} ${colors.bg} shadow-sm`}>
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${colors.icon}`} />
            <span className={`text-sm font-medium ${colors.text}`}>Conflicto en {fieldName}</span>
          </div>
          
          {/* Conflict/Diff */}
          <div className="flex gap-3">
            <div className="flex-1">
              {/* Diff/Current */}
              <div className="text-xs text-gray-600 mb-1">Actual</div>
              <div className="bg-white border rounded p-2">
                <code className="text-xs text-red-700">{currentValue}</code>
              </div>
            </div>
            <div className="flex-1">
              {/* Diff/Suggested */}
              <div className="text-xs text-gray-600 mb-1">Sugerido</div>
              <div className="bg-white border rounded p-2">
                <code className="text-xs text-green-700">{suggestedValue}</code>
              </div>
            </div>
          </div>
          
          {/* Conflict/Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={onMaintain}
            >
              Mantener
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="text-xs h-7"
              onClick={onReplace}
            >
              Reemplazar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7"
              onClick={onMerge}
            >
              Fusionar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}