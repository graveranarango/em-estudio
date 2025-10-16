import { useState } from "react";
import { Card } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Slider } from "./components/ui/slider";
import { Label } from "./components/ui/label";

export function TestComponent() {
  const [value, setValue] = useState<number[]>([50]);
  
  return (
    <div className="p-4">
      <Card className="p-4">
        <h3>Test Component</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Test Slider</Label>
            <Slider
              value={value}
              onValueChange={setValue}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-right">
              {value[0]}%
            </div>
          </div>
          <Button>Test Button</Button>
        </div>
      </Card>
    </div>
  );
}