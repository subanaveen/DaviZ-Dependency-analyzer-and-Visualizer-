import { Card, CardContent } from "@/components/ui/card";
import DependencyItem from "./DependencyItem";
import { Dependencies, SelectedDependencies } from "@/lib/types";

interface DependenciesPanelProps {
  dependencies: Dependencies;
  explanations: Record<string, Record<string, string>>;
  selectedDependencies: SelectedDependencies;
  expandedNodes: Set<string>;
  onSelectDependencies: (feature: string, selected: string[]) => void;
  onConfirmAndExpand: (feature: string) => void;
}

export default function DependenciesPanel({
  dependencies,
  explanations,
  selectedDependencies,
  expandedNodes,
  onSelectDependencies,
  onConfirmAndExpand
}: DependenciesPanelProps) {
  const expandedCount = expandedNodes.size;
  const totalSelected = Object.values(selectedDependencies).reduce(
    (count, deps) => count + deps.length, 0
  );

  return (
    <Card className="rounded-lg border border-slate-200 bg-white shadow-sm mb-8">
      <CardContent className="pt-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Step 2: Select & Expand Dependencies</h2>
        
        {Object.keys(dependencies).map((feature) => (
          <DependencyItem
            key={feature}
            feature={feature}
            dependencies={dependencies[feature]}
            explanations={explanations[feature] || {}}
            selectedDependencies={selectedDependencies[feature] || []}
            isExpanded={expandedNodes.has(feature)}
            onSelect={onSelectDependencies}
            onConfirmAndExpand={onConfirmAndExpand}
            borderColor={expandedNodes.has(feature) ? "emerald" : "blue"}
          />
        ))}
        
        {expandedCount > 0 && (
          <p className="text-sm text-slate-500 mb-6">
            Showing {expandedCount} expanded node{expandedCount !== 1 ? 's' : ''} out of {totalSelected} selected dependencies
          </p>
        )}
      </CardContent>
    </Card>
  );
}
