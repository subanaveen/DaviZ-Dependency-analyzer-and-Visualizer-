import { useState } from "react";
import TargetFeatureInput from "@/components/TargetFeatureInput";
import DependenciesPanel from "@/components/DependenciesPanel";
import BDIStateDisplay from "@/components/BDIStateDisplay";
import DependencyGraph from "@/components/DependencyGraph";
import { RLBDIAgent } from "@/lib/RLBDIAgent";
import { useToast } from "@/hooks/use-toast";
import { 
  Dependencies, 
  Dependency, 
  Beliefs, 
  Desires, 
  Intentions, 
  SelectedDependencies 
} from "@/lib/types";

export default function Home() {
  const { toast } = useToast();
  const [targetFeature, setTargetFeature] = useState<string>("");
  const [dependencies, setDependencies] = useState<Dependencies>({});
  const [explanations, setExplanations] = useState<Record<string, Record<string, string>>>({});
  const [selectedDependencies, setSelectedDependencies] = useState<SelectedDependencies>({});
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [beliefs, setBeliefs] = useState<Beliefs>({});
  const [desires, setDesires] = useState<Desires>({});
  const [intentions, setIntentions] = useState<Intentions>({});
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [shouldShowGraph, setShouldShowGraph] = useState(false);

  const agent = new RLBDIAgent(
    beliefs,
    desires,
    intentions,
    setBeliefs,
    setDesires,
    setIntentions
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
      setExpandedNodes(prev => new Set([...prev, feature]));
      
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

  return (
    <>
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
      
      {Object.keys(beliefs).length > 0 && (
        <BDIStateDisplay 
          beliefs={beliefs}
          desires={desires}
          intentions={intentions}
        />
      )}
      
      <DependencyGraph 
        dependencies={dependencies}
        selectedDependencies={selectedDependencies}
        expandedNodes={expandedNodes}
        isGenerating={isGeneratingGraph}
        showGraph={shouldShowGraph}
        onGenerateGraph={handleGenerateGraph}
      />
    </>
  );
}
