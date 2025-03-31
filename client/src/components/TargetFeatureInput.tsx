import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TargetFeatureInputProps {
  targetFeature: string;
  setTargetFeature: (feature: string) => void;
  onGenerateDependencies: (feature: string) => void;
}

export default function TargetFeatureInput({
  targetFeature,
  setTargetFeature,
  onGenerateDependencies
}: TargetFeatureInputProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!targetFeature.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await onGenerateDependencies(targetFeature);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-lg border border-slate-200 bg-white shadow-sm mb-8">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Step 1: Enter a Target Feature</h2>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="target-feature" className="block text-sm font-medium text-slate-700 mb-1">
              Enter the Target Feature (e.g., AI recruiter agent):
            </Label>
            <Input
              id="target-feature"
              type="text"
              className="px-3 py-2 rounded-md border border-slate-300 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter feature name..."
              value={targetFeature}
              onChange={(e) => setTargetFeature(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <Button 
              type="submit" 
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
              disabled={isLoading || !targetFeature.trim()}
            >
              {isLoading ? "Generating..." : "Generate Dependencies"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
