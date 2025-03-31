import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Dependencies, SelectedDependencies } from "@/lib/types";

interface DependencyGraphProps {
  dependencies: Dependencies;
  selectedDependencies: SelectedDependencies;
  expandedNodes: Set<string>;
  isGenerating: boolean;
  showGraph: boolean;
  onGenerateGraph: () => void;
}

export default function DependencyGraph({
  dependencies,
  selectedDependencies,
  expandedNodes,
  isGenerating,
  showGraph,
  onGenerateGraph
}: DependencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // This is a simplified representation for demonstration
  // In a real application, you would use a proper graph visualization library
  // like React Force Graph, D3.js, or VivaGraph
  
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const resetView = () => {
    setZoomLevel(1);
  };
  
  // This simulates creating a graph from our dependency data
  const renderGraph = () => {
    if (!svgRef.current || !showGraph) return;
    
    // In a real implementation, this would create a force-directed graph
    // using the dependencies and selected dependencies
  };
  
  useEffect(() => {
    if (showGraph) {
      renderGraph();
    }
  }, [showGraph, zoomLevel, dependencies, selectedDependencies, expandedNodes]);

  return (
    <Card className="rounded-lg border border-slate-200 bg-white shadow-sm mb-8">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Dependency Graph Visualization</h2>
          <Button
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2"
            onClick={onGenerateGraph}
            disabled={isGenerating || Object.keys(dependencies).length === 0}
          >
            <RefreshCw className="h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Interactive Graph"}
          </Button>
        </div>
        
        <div className="graph-container relative w-full h-[700px]">
          <div className="graph-controls absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-md bg-white text-slate-800 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
              onClick={zoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-md bg-white text-slate-800 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
              onClick={zoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="p-2 rounded-md bg-white text-slate-800 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
              onClick={resetView}
              title="Reset View"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="network-graph h-[700px] w-full bg-slate-50 border border-slate-200 rounded-lg">
            {showGraph ? (
              <svg 
                ref={svgRef} 
                width="100%" 
                height="100%" 
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
              >
                {/* Root node example */}
                <g className="node" transform="translate(100, 350)">
                  <rect width="180" height="40" rx="5" ry="5" className="fill-blue-200 stroke-blue-600 stroke-2"></rect>
                  <text x="90" y="25" textAnchor="middle" className="text-sm font-medium fill-slate-800">
                    {Object.keys(dependencies)[0] || "No target feature"}
                  </text>
                </g>
                
                {/* The graph is dynamically generated here */}
                {Object.keys(selectedDependencies).length > 0 && Object.keys(dependencies).length > 0 && (
                  <>
                    {/* First level nodes */}
                    {(() => {
                      const rootFeature = Object.keys(dependencies)[0];
                      if (!rootFeature || !selectedDependencies[rootFeature]) return null;
                      
                      return selectedDependencies[rootFeature].map((dep, index) => {
                        // Check if this node is expanded in our Set
                        const isExpanded = Array.from(expandedNodes).includes(dep);
                        
                        return (
                          <g key={`node-${dep}-${index}`}>
                            <g 
                              className={`node ${isExpanded ? "expanded" : ""}`} 
                              transform={`translate(400, ${200 + index * 100})`}
                            >
                              <rect 
                                width="180" 
                                height="40" 
                                rx="5" 
                                ry="5" 
                                className={isExpanded ? "fill-green-200 stroke-green-600" : "fill-blue-200 stroke-blue-600"}
                                strokeWidth="2"
                              ></rect>
                              <text x="90" y="25" textAnchor="middle" className="text-sm font-medium fill-slate-800">
                                {dep}
                              </text>
                            </g>
                            
                            {/* Edge connecting to parent */}
                            <path 
                              d={`M280,350 C340,350 340,${200 + index * 100} 400,${200 + index * 100}`} 
                              className="stroke-blue-800 stroke-2 fill-none"
                            ></path>
                            
                            {/* If this node is expanded and has children, render them */}
                            {isExpanded && dependencies[dep] && selectedDependencies[dep] && 
                              selectedDependencies[dep].map((childDep, childIndex) => (
                                <g key={`child-${childDep}-${childIndex}`}>
                                  <g 
                                    className="node" 
                                    transform={`translate(700, ${180 + index * 100 + childIndex * 60})`}
                                  >
                                    <rect 
                                      width="160" 
                                      height="36" 
                                      rx="5" 
                                      ry="5" 
                                      className="fill-blue-100 stroke-blue-400"
                                      strokeWidth="2"
                                    ></rect>
                                    <text x="80" y="22" textAnchor="middle" className="text-sm fill-slate-800">
                                      {childDep}
                                    </text>
                                  </g>
                                  
                                  {/* Edge connecting to parent */}
                                  <path 
                                    d={`M580,${200 + index * 100} C640,${200 + index * 100} 640,${180 + index * 100 + childIndex * 60} 700,${180 + index * 100 + childIndex * 60}`} 
                                    className="stroke-blue-600 fill-none"
                                    strokeWidth="1.5"
                                  ></path>
                                </g>
                              ))
                            }
                          </g>
                        );
                      });
                    })()}
                  </>
                )}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Generate a graph to visualize dependencies</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
