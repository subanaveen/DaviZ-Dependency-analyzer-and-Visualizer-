import DependencyItem from './DependencyItem';
import DependencyGraph from './DependencyGraph';
import { Dependencies, SelectedDependencies } from '../lib/types';

interface DependencyLayoutProps {
  feature: string;
  dependencies: Dependencies;
  explanations: Record<string, string>;
  selectedDependencies: SelectedDependencies;
  isExpanded: boolean;
  onSelect: (feature: string, selected: string[]) => void;
  onConfirmAndExpand: (feature: string) => void;
  expandedNodes: Set<string>;
  isGenerating: boolean;
  showGraph: boolean;
  onGenerateGraph: () => void;
}

export default function DependencyLayout({
  feature,
  dependencies,
  explanations,
  selectedDependencies,
  isExpanded,
  onSelect,
  onConfirmAndExpand,
  expandedNodes,
  isGenerating,
  showGraph,
  onGenerateGraph,
}: DependencyLayoutProps) {
  return (
    <div className="flex">
      <div className="overflow-y-auto h-full w-1/3 p-4 border-r border-slate-200">
        <DependencyItem
          feature={feature}
          dependencies={dependencies}
          explanations={explanations}
          selectedDependencies={selectedDependencies[feature] || []} // Pass the correct selected dependencies for the feature
          isExpanded={isExpanded}
          onSelect={onSelect}
          onConfirmAndExpand={onConfirmAndExpand}
        />
      </div>
      <div className="h-screen w-2/3 p-4">
        <DependencyGraph
          dependencies={dependencies}
          selectedDependencies={selectedDependencies[feature] || []} // Pass the correct selected dependencies for the feature
          expandedNodes={expandedNodes}
          isGenerating={isGenerating}
          showGraph={showGraph}
          onGenerateGraph={onGenerateGraph}
        />
      </div>
    </div>
  );
}
