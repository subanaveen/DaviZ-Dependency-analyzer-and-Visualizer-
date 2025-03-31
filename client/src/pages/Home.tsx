import { useState } from "react";
import TargetFeatureInput from "@/components/TargetFeatureInput";
import DependenciesPanel from "@/components/DependenciesPanel";
import DependencyGraph from "@/components/DependencyGraph";
import { RLBDIAgent } from "@/lib/RLBDIAgent";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  Dependencies, 
  Dependency, 
  SelectedDependencies,
  Beliefs,
  Desires,
  Intentions
} from "@/lib/types";
import { BrainCircuit } from "lucide-react";

interface HomeProps {
  globalBeliefs: Beliefs;
  globalDesires: Desires;
  globalIntentions: Intentions;
  setGlobalBeliefs: React.Dispatch<React.SetStateAction<Beliefs>>;
  setGlobalDesires: React.Dispatch<React.SetStateAction<Desires>>;
  setGlobalIntentions: React.Dispatch<React.SetStateAction<Intentions>>;
}

export default function Home({
  globalBeliefs,
  globalDesires,
  globalIntentions,
  setGlobalBeliefs,
  setGlobalDesires,
  setGlobalIntentions
}: HomeProps) {
  const { toast } = useToast();
  const [targetFeature, setTargetFeature] = useState<string>("");
  const [dependencies, setDependencies] = useState<Dependencies>({});
  const [explanations, setExplanations] = useState<Record<string, Record<string, string>>>({});
  const [selectedDependencies, setSelectedDependencies] = useState<SelectedDependencies>({});
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [shouldShowGraph, setShouldShowGraph] = useState(false);
  
  // Use global BDI state 
  const agent = new RLBDIAgent(
    globalBeliefs,
    globalDesires,
    globalIntentions,
    setGlobalBeliefs,
    setGlobalDesires,
    setGlobalIntentions
  );

  const handleGenerateDependencies = async (feature: string) => {
    try {
      const response = await fetch('/api/dependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feature }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dependencies');
      }
      
      const data = await response.json();
      
      // Update state with the fetched dependencies
      setDependencies(prev => ({
        ...prev,
        [feature]: data.dependencies
      }));
      
      setExplanations(prev => ({
        ...prev,
        [feature]: data.explanations
      }));
      
      setSelectedDependencies(prev => ({
        ...prev,
        [feature]: []
      }));
      
      // Update BDI state
      agent.updateBeliefs(feature, data.dependencies);
      agent.refineDesires(feature);
      
      toast({
        title: "Success",
        description: `Dependencies generated for ${feature}`,
      });
      
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate dependencies. Please try again.",
      });
    }
  };

  const handleSelectDependencies = (feature: string, selected: string[]) => {
    setSelectedDependencies(prev => ({
      ...prev,
      [feature]: selected
    }));
  };

  const handleConfirmAndExpand = async (feature: string) => {
    try {
      setExpandedNodes(prev => {
        const newSet = new Set(prev);
        newSet.add(feature);
        return newSet;
      });
      
      // Update AI Intentions
      agent.updateIntentions(feature, selectedDependencies[feature] || []);
      
      // Expand dependencies for selected items
      for (const item of selectedDependencies[feature] || []) {
        if (!dependencies[item]) {
          const response = await fetch('/api/dependencies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              feature: item,
              context: feature 
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch dependencies for ${item}`);
          }
          
          const data = await response.json();
          
          // Update dependencies state
          setDependencies(prev => ({
            ...prev,
            [item]: data.dependencies
          }));
          
          setExplanations(prev => ({
            ...prev,
            [item]: data.explanations
          }));
          
          setSelectedDependencies(prev => ({
            ...prev,
            [item]: []
          }));
          
          // Update BDI
          agent.updateBeliefs(item, data.dependencies);
          agent.refineDesires(item);
        }
      }
      
      toast({
        title: "Success",
        description: `${feature} expanded successfully!`,
      });
      
    } catch (error) {
      console.error('Error expanding dependencies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to expand ${feature}. Please try again.`,
      });
    }
  };

  const handleGenerateGraph = () => {
    setIsGeneratingGraph(true);
    setTimeout(() => {
      setShouldShowGraph(true);
      setIsGeneratingGraph(false);
      toast({
        title: "Success",
        description: "Graph generated successfully!",
      });
    }, 1000);
  };

  // Check if we have BDI data to show the notification
  const hasBDIData = Object.keys(globalBeliefs).length > 0 || 
                    Object.keys(globalDesires).length > 0 || 
                    Object.keys(globalIntentions).length > 0;

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dependency Analysis Dashboard</h1>
        
        {hasBDIData && (
          <Link href="/bdi" className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors text-sm font-medium flex items-center">
            <BrainCircuit className="h-4 w-4 mr-2" />
            View AI Agent State
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TargetFeatureInput 
            targetFeature={targetFeature}
            setTargetFeature={setTargetFeature}
            onGenerateDependencies={handleGenerateDependencies}
          />
          
          {Object.keys(dependencies).length > 0 && (
            <DependenciesPanel 
              dependencies={dependencies}
              explanations={explanations}
              selectedDependencies={selectedDependencies}
              expandedNodes={expandedNodes}
              onSelectDependencies={handleSelectDependencies}
              onConfirmAndExpand={handleConfirmAndExpand}
            />
          )}
        </div>
        
        <div className="lg:col-span-1">
          <DependencyGraph 
            dependencies={dependencies}
            selectedDependencies={selectedDependencies}
            expandedNodes={expandedNodes}
            isGenerating={isGeneratingGraph}
            showGraph={shouldShowGraph}
            onGenerateGraph={handleGenerateGraph}
          />
        </div>
      </div>
    </div>
  );
}
