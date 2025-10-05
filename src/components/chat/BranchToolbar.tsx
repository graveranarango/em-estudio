import React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { GitBranch, Plus } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  isDefault: boolean;
}

interface BranchToolbarProps {
  threadId: string;
  currentBranchId?: string;
  branches: Branch[];
  compact?: boolean;
  className?: string;
}

export function BranchToolbar({
  threadId,
  currentBranchId,
  branches,
  compact = false,
  className = ""
}: BranchToolbarProps) {
  const currentBranch = branches.find(b => b.id === currentBranchId);

  if (branches.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`} data-testid="branch-toolbar">
        <GitBranch className="h-3 w-3 text-muted-foreground" />
        <Badge variant="secondary" className="text-xs">
          {currentBranch?.name || 'Principal'}
        </Badge>
        {branches.length > 1 && (
          <Badge variant="outline" className="text-xs">
            +{branches.length - 1}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="branch-toolbar">
      <GitBranch className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Rama:</span>
      
      <div className="flex items-center gap-1">
        {branches.map((branch) => (
          <Badge
            key={branch.id}
            variant={branch.id === currentBranchId ? "default" : "secondary"}
            className="text-xs cursor-pointer hover:bg-accent"
          >
            {branch.name}
            {branch.isDefault && " (principal)"}
          </Badge>
        ))}
      </div>

      <Button size="sm" variant="outline" className="h-6 px-2">
        <Plus className="h-3 w-3 mr-1" />
        Nueva
      </Button>
    </div>
  );
}