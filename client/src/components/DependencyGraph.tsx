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

// Helper function to calculate node positions and create a balanced tree
function calculateNodePositions(
  dependencies: Dependencies,
  selectedDependencies: SelectedDependencies,
  expandedNodes: Set<string>,
) {
  const nodes: { id: string; level: number; x: number; y: number; parent?: string }[] = [];
  const links: { source: string; target: string; points: [number, number][] }[] = [];
  
  // Start with the root node
  const rootFeature = Object.keys(dependencies)[0];
  if (!rootFeature) return { nodes, links };
  
  // Add root node
  nodes.push({
    id: rootFeature,
    level: 0,
    x: 200,
    y: 300,
  });

  // Function to add nodes and links recursively
  function addNodesAndLinks(
    feature: string,
    level: number,
    parentX: number,
    parentY: number,
    verticalSpacing: number,
    horizontalOffset: number
  ) {
    if (!selectedDependencies[feature] || selectedDependencies[feature].length === 0) return;
    
    const deps = selectedDependencies[feature];
    const isExpanded = expandedNodes.has(feature);
    
    // Calculate the starting Y position for children
    const totalHeight = deps.length * verticalSpacing;
    let startY = parentY - totalHeight / 2 + verticalSpacing / 2;
    
    // If the node is expanded and there are deps, render them
    if (isExpanded) {
      deps.forEach((dep, index) => {
        const childX = parentX + horizontalOffset;
        const childY = startY + index * verticalSpacing;
        
        // Add the child node
        nodes.push({
          id: dep,
          level: level + 1,
          x: childX,
          y: childY,
          parent: feature,
        });
        
        // Add the link between parent and child
        links.push({
          source: feature,
          target: dep,
          points: [
            [parentX, parentY],
            [parentX + horizontalOffset * 0.4, parentY],
            [parentX + horizontalOffset * 0.6, childY],
            [childX, childY],
          ],
        });
        
        // Recursively add child nodes
        if (expandedNodes.has(dep) && selectedDependencies[dep]) {
          addNodesAndLinks(dep, level + 1, childX, childY, verticalSpacing * 0.8, horizontalOffset);
        }
      });
    }
  }
  
  // Always show first level nodes and their children if they're expanded
  if (selectedDependencies[rootFeature] && selectedDependencies[rootFeature].length > 0) {
    const deps = selectedDependencies[rootFeature];
    const totalHeight = deps.length * 80;
    let startY = 300 - totalHeight / 2 + 80 / 2;
    
    deps.forEach((dep, index) => {
      const childX = 200 + 250;
      const childY = startY + index * 80;
      
      // Add the child node
      nodes.push({
        id: dep,
        level: 1,
        x: childX,
        y: childY,
        parent: rootFeature,
      });
      
      // Add the link between parent and child
      links.push({
        source: rootFeature,
        target: dep,
        points: [
          [200, 300],
          [200 + 250 * 0.4, 300],
          [200 + 250 * 0.6, childY],
          [childX, childY],
        ],
      });
      
      // If this node is expanded, add its children recursively
      if (expandedNodes.has(dep) && selectedDependencies[dep]) {
        addNodesAndLinks(dep, 1, childX, childY, 80 * 0.8, 250);
      }
    });
  }
  
  return { nodes, links };
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
  const [viewBox, setViewBox] = useState("0 0 1200 600");
  const [activeNode, setActiveNode] = useState<string | null>(null);

  // Zoom controls
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };
  
  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };
  
  const resetView = () => {
    setZoomLevel(1);
    setViewBox("0 0 1200 600");
  };
  
  // Calculate node positions when dependencies change
  const { nodes, links } = showGraph 
    ? calculateNodePositions(dependencies, selectedDependencies, expandedNodes)
    : { nodes: [], links: [] };
    
  // Update viewbox when graph changes
  useEffect(() => {
    if (!showGraph || nodes.length === 0) return;
    
    // Calculate bounds
    const padding = 100;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + 180); // Node width
      maxY = Math.max(maxY, node.y + 40);  // Node height
    });
    
    // Ensure minimum size
    const width = Math.max(1000, maxX - minX + padding * 2);
    const height = Math.max(500, maxY - minY + padding * 2);
    
    setViewBox(`${minX - padding} ${minY - padding} ${width} ${height}`);
  }, [nodes, showGraph]);

  return (
    <Card className="rounded-lg border border-slate-200 bg-white shadow-sm mb-8">
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Dependency Graph Visualization
          </h2>
          <Button
            className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 transition-colors font-medium text-sm flex items-center gap-2 shadow-md"
            onClick={onGenerateGraph}
            disabled={isGenerating || Object.keys(dependencies).length === 0}
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? "Generating..." : "Generate Interactive Graph"}
          </Button>
        </div>
        
        <div className="graph-container relative w-full h-[600px]">
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
          
          <div className="network-graph h-[600px] w-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden relative">
            {/* Node Info Tooltip */}
            {activeNode && (
              <div className="absolute top-4 left-4 z-20 bg-white shadow-lg border border-blue-100 rounded-lg p-4 max-w-xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-blue-700 mb-2">{activeNode}</h3>
                  <button 
                    onClick={() => setActiveNode(null)}
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <div className="border-b border-slate-200 mb-2"></div>
                
                {dependencies[activeNode] && (
                  <div className="text-xs">
                    {Object.entries(dependencies[activeNode]).map(([category, deps]) => (
                      <div key={category} className="mb-3">
                        <p className="text-slate-600 font-medium mb-1">{category}:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          {deps.map((dep: string, index: number) => (
                            <li key={index} className="text-slate-700">{dep}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {showGraph ? (
              <svg 
                ref={svgRef} 
                width="100%" 
                height="100%" 
                viewBox={viewBox}
                style={{ 
                  transform: `scale(${zoomLevel})`, 
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease' 
                }}
              >
                {/* Render links first (so they're behind nodes) */}
                {links.map((link, index) => (
                  <path
                    key={`link-${link.source}-${link.target}-${index}`}
                    d={`M${link.points[0][0]},${link.points[0][1]} C${link.points[1][0]},${link.points[1][1]} ${link.points[2][0]},${link.points[2][1]} ${link.points[3][0]},${link.points[3][1]}`}
                    className="stroke-blue-500 fill-none"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}
                
                {/* Render all nodes */}
                {nodes.map((node) => {
                  const isRoot = node.level === 0;
                  const isExpanded = expandedNodes.has(node.id);
                  
                  // Different styles based on node type
                  let nodeClass, textClass, shadowOpacity;
                  
                  if (activeNode === node.id) {
                    // Active node styling (highest priority)
                    nodeClass = "fill-purple-200 stroke-purple-600";
                    textClass = "font-bold fill-purple-900";
                    shadowOpacity = 0.5;
                  } else if (isRoot) {
                    nodeClass = "fill-blue-300 stroke-blue-600";
                    textClass = "font-semibold fill-slate-800";
                    shadowOpacity = 0.4;
                  } else if (isExpanded) {
                    nodeClass = "fill-green-200 stroke-green-600";
                    textClass = "font-medium fill-slate-800";
                    shadowOpacity = 0.35;
                  } else {
                    nodeClass = "fill-blue-200 stroke-blue-600";
                    textClass = "font-medium fill-slate-800";
                    shadowOpacity = 0.3;
                  }
                  
                  return (
                    <g 
                      key={`node-${node.id}`}
                      className="node"
                      transform={`translate(${node.x - 90}, ${node.y - 20})`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
                      onMouseEnter={(e) => {
                        // Add highlight effect on hover
                        const rect = e.currentTarget.querySelector('rect');
                        if (rect) {
                          rect.setAttribute('stroke-width', '2.5');
                          rect.setAttribute('filter', `url(#shadow-highlight-${node.id})`);
                        }
                      }}
                      onMouseLeave={(e) => {
                        // Remove highlight effect
                        const rect = e.currentTarget.querySelector('rect');
                        if (rect) {
                          rect.setAttribute('stroke-width', '1.5');
                          rect.setAttribute('filter', `url(#shadow-${node.id})`);
                        }
                      }}
                    >
                      {/* Drop shadow filters - normal and highlight */}
                      <defs>
                        <filter id={`shadow-${node.id}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity={shadowOpacity} />
                        </filter>
                        <filter id={`shadow-highlight-${node.id}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity={shadowOpacity + 0.1} flood-color="#4287f5" />
                        </filter>
                      </defs>
                      
                      {activeNode === node.id ? (
                        // For active node, add a pulse animation
                        <>
                          <rect
                            width="190"
                            height="46"
                            x="-5"
                            y="-3"
                            rx="8"
                            ry="8"
                            className="fill-none stroke-purple-400 opacity-70"
                            strokeWidth="1"
                            style={{
                              animation: 'pulse 2s infinite ease-in-out'
                            }}
                          />
                          <style>
                            {`
                              @keyframes pulse {
                                0% { transform: scale(1); opacity: 0.7; }
                                50% { transform: scale(1.03); opacity: 0.5; }
                                100% { transform: scale(1); opacity: 0.7; }
                              }
                            `}
                          </style>
                        </>
                      ) : null}
                      <rect
                        width="180"
                        height="40"
                        rx="5"
                        ry="5"
                        className={nodeClass}
                        strokeWidth="1.5"
                        style={{ filter: `url(#shadow-${node.id})` }}
                      />
                      <text
                        x="90"
                        y="25"
                        textAnchor="middle"
                        className={`text-sm ${textClass}`}
                        pointerEvents="none" // Allows clicks to pass through to the parent
                      >
                        {node.id}
                      </text>
                    </g>
                  );
                })}
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
