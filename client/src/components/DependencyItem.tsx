import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dependencies } from "@/lib/types";

interface DependencyItemProps {
  feature: string;
  dependencies: Record<string, string[]>;
  explanations: Record<string, string>;
  selectedDependencies: string[];
  isExpanded: boolean;
  onSelect: (feature: string, selected: string[]) => void;
  onConfirmAndExpand: (feature: string) => void;
  borderColor?: string;
}

export default function DependencyItem({
  feature,
  dependencies,
  explanations,
  selectedDependencies,
  isExpanded,
  onSelect,
  onConfirmAndExpand,
  borderColor = "blue"
}: DependencyItemProps) {
  const [customDependency, setCustomDependency] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleCheckboxChange = (dependency: string, checked: boolean) => {
    if (checked) {
      onSelect(feature, [...selectedDependencies, dependency]);
    } else {
      onSelect(feature, selectedDependencies.filter(d => d !== dependency));
    }
  };
  
  const handleAddCustomDependency = () => {
    if (customDependency.trim() && !dependencies.Primary.includes(customDependency)) {
      onSelect(feature, [...selectedDependencies, customDependency]);
      setCustomDependency("");
    }
  };
  
  const handleConfirmAndExpand = async () => {
    setIsLoading(true);
    try {
      await onConfirmAndExpand(feature);
    } finally {
      setIsLoading(false);
    }
  };

  const borderColorClass = borderColor === "blue" ? "border-blue-400" : "border-emerald-400";

  return (
    <div className="mb-8 pb-6 border-b border-slate-200">
      <h3 className="text-md font-medium text-slate-800 mb-2">Dependencies for: {feature}</h3>
      
      {Object.entries(dependencies).map(([category, items]) => (
        items.length > 0 && (
          <div key={category} className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2">🔹 {category} Dependencies:</h4>
            <ul className="space-y-3">
              {items.map((dependency, index) => {
                // Clean up dependency name from context info
                const cleanDependencyName = dependency.split(" (for ")[0];
                const explanation = explanations[dependency] || "No explanation provided.";
                
                return (
                  <li key={index} className={`pl-4 border-l-2 ${borderColorClass}`}>
                    <div className="flex items-start">
                      <Checkbox
                        id={`${feature}-dep-${index}`}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedDependencies.includes(cleanDependencyName)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange(cleanDependencyName, checked === true)
                        }
                      />
                      <div className="ml-2">
                        <Label 
                          htmlFor={`${feature}-dep-${index}`}
                          className="block text-sm font-medium text-slate-900"
                        >
                          {cleanDependencyName}
                        </Label>
                        <p className="text-sm text-slate-600">{explanation}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )
      ))}
      
      <div className="mt-4">
        <Label htmlFor={`custom-dependency-${feature}`} className="block text-sm font-medium text-slate-700 mb-1">
          Add a custom dependency (optional):
        </Label>
        <div className="flex gap-3">
          <Input
            id={`custom-dependency-${feature}`}
            type="text"
            className="px-3 py-2 rounded-md border border-slate-300 flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter custom dependency..."
            value={customDependency}
            onChange={(e) => setCustomDependency(e.target.value)}
          />
          <Button
            className="px-3 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium"
            onClick={handleAddCustomDependency}
            disabled={!customDependency.trim()}
          >
            Add
          </Button>
        </div>
      </div>
      
      <div className="mt-6">
        <Button
          className="px-4 py-2 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
          onClick={handleConfirmAndExpand}
          disabled={isLoading || selectedDependencies.length === 0}
        >
          {isLoading ? "Processing..." : `✅ Confirm & Expand ${feature}`}
        </Button>
      </div>
    </div>
  );
}
