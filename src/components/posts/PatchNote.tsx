import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PatchNoteProps {
  content: string;
  badge?: string;
}

export function PatchNote({ content, badge = "patch JSON (diseño)" }: PatchNoteProps) {
  return (
    <div className="my-3">
      <Card className="bg-gray-50 border border-gray-200 shadow-sm">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">{badge}</Badge>
          </div>
          <pre className="text-xs font-mono text-gray-700 bg-white/50 p-2 rounded border overflow-x-auto">
            {content}
          </pre>
        </div>
      </Card>
    </div>
  );
}
