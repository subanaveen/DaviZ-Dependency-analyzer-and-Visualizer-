import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ZoomIn, ZoomOut, RotateCcw, Maximize, Minimize } from "lucide-react";
import { Dependencies, SelectedDependencies } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

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

  // Track the nodes by level for better positioning
  const nodesByLevel: Record<number, { id: string; y: number }[]> = {
    0: [{ id: rootFeature, y: 300 }]
  };

  // Function to add nodes and links recursively with improved positioning
  function addNodesAndLinks(
    feature: string,
    level: number,
    parentX: number,
    parentY: number,
    horizontalOffset: number
  ) {
    if (!selectedDependencies[feature] || selectedDependencies[feature].length === 0) return;
    
    const deps = selectedDependencies[feature];
    const isExpanded = expandedNodes.has(feature);
    
    // Initialize this level's tracking if not exists
    if (!nodesByLevel[level + 1]) {
      nodesByLevel[level + 1] = [];
    }
    
    // If the node is expanded and there are deps, render them
    if (isExpanded) {
      // Calculate optimal vertical spacing based on number of dependencies
      const levelNodesCount = deps.length;
      const verticalSpacing = Math.max(100, Math.min(200, 800 / levelNodesCount));
      
      // Calculate total height needed and starting position
      const totalHeight = deps.length * verticalSpacing;
      let startY = parentY - totalHeight / 2 + verticalSpacing / 2;
      
      deps.forEach((dep, index) => {
        const childX = parentX + horizontalOffset;
        let childY = startY + index * verticalSpacing;
        
        // Check for overlaps with existing nodes at this level
        let hasOverlap = true;
        let attempts = 0;
        const existingYPositions = nodesByLevel[level + 1].map(n => n.y);
        
        while (hasOverlap && attempts < 5) {
          hasOverlap = existingYPositions.some(y => Math.abs(y - childY) < verticalSpacing * 0.8);
          if (hasOverlap) {
            // Adjust position to avoid overlap
            childY += verticalSpacing * 0.5 * (attempts % 2 === 0 ? 1 : -1) * (Math.floor(attempts/2) + 1);
            attempts++;
          }
        }
        
        // Add the child node
        nodes.push({
          id: dep,
          level: level + 1,
          x: childX,
          y: childY,
          parent: feature,
        });
        
        // Track the node position at this level
        nodesByLevel[level + 1].push({ id: dep, y: childY });
        
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
          addNodesAndLinks(dep, level + 1, childX, childY, horizontalOffset);
        }
      });
    }
  }
  
  // Always show first level nodes and their children if they're expanded
  if (selectedDependencies[rootFeature] && selectedDependencies[rootFeature].length > 0) {
    const deps = selectedDependencies[rootFeature];
    
    // Calculate optimal spacing based on the number of dependencies
    const verticalSpacing = Math.max(100, Math.min(200, 800 / deps.length));
    const totalHeight = deps.length * verticalSpacing;
    let startY = 300 - totalHeight / 2 + verticalSpacing / 2;
    
    // Initialize level 1 tracking
    nodesByLevel[1] = [];
    
    deps.forEach((dep, index) => {
      const childX = 200 + 300; // Increased horizontal spacing for better readability
      const childY = startY + index * verticalSpacing;
      
      // Add the child node
      nodes.push({
        id: dep,
        level: 1,
        x: childX,
        y: childY,
        parent: rootFeature,
      });
      
      // Track the node position
      nodesByLevel[1].push({ id: dep, y: childY });
      
      // Add the link between parent and child
      links.push({
        source: rootFeature,
        target: dep,
        points: [
          [200, 300],
          [200 + 300 * 0.4, 300],
          [200 + 300 * 0.6, childY],
          [childX, childY],
        ],
      });
      
      // If this node is expanded, add its children recursively
      if (expandedNodes.has(dep) && selectedDependencies[dep]) {
        addNodesAndLinks(dep, 1, childX, childY, 300);
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewBox, setViewBox] = useState("0 0 1200 600");
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [nodePositions, setNodePositions] = useState<{[key: string]: {x: number, y: number}}>({});
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number, y: number}>({x: 0, y: 0});
  const { toast } = useToast();

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
  
  // Reset node positions
  const resetNodePositions = () => {
    setNodePositions({});
    toast({
      title: "Node positions reset",
      description: "All nodes have been returned to their original positions.",
      duration: 3000,
    });
  };
  
  // Calculate node positions when dependencies change
  const { nodes, links: originalLinks } = showGraph 
    ? calculateNodePositions(dependencies, selectedDependencies, expandedNodes)
    : { nodes: [], links: [] };
    
  // Update links based on custom node positions
  const links = originalLinks.map(link => {
    const sourceNode = nodes.find(n => n.id === link.source);
    const targetNode = nodes.find(n => n.id === link.target);
    
    if (!sourceNode || !targetNode) return link;
    
    // Get custom positions if they exist
    const sourceX = nodePositions[link.source]?.x || (sourceNode.x - 90) + 90;
    const sourceY = nodePositions[link.source]?.y || (sourceNode.y - 20) + 20;
    const targetX = nodePositions[link.target]?.x || (targetNode.x - 90) + 90;
    const targetY = nodePositions[link.target]?.y || (targetNode.y - 20) + 20;
    
    // Create control points for the curve
    // This creates a curved path from source to target
    return {
      ...link,
      points: [
        [sourceX, sourceY],
        [sourceX + (targetX - sourceX) * 0.4, sourceY + (targetY - sourceY) * 0.1],
        [sourceX + (targetX - sourceX) * 0.6, sourceY + (targetY - sourceY) * 0.9],
        [targetX, targetY]
      ]
    };
  });
    
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
    
    // Show toast for first-time graph generation
    if (nodes.length > 0 && Object.keys(nodePositions).length === 0) {
      toast({
        title: "Interactive Graph Ready",
        description: "Tip: You can click and drag nodes to reposition them in the graph.",
        duration: 5000,
      });
    }
  }, [nodes, showGraph, nodePositions, toast]);

  // Toggle fullscreen effect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add escape key to exit fullscreen
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);
  
  // Handle mouse move and mouse up for dragging nodes
  useEffect(() => {
    // Skip if no node is being dragged
    if (!draggingNode) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingNode || !svgRef.current) return;
      
      // Convert mouse coordinates to SVG coordinates
      const CTM = svgRef.current.getScreenCTM();
      if (!CTM) return;
      
      const mouseX = (e.clientX - CTM.e) / CTM.a;
      const mouseY = (e.clientY - CTM.f) / CTM.d;
      
      // Update node position based on drag offset
      setNodePositions(prev => ({
        ...prev,
        [draggingNode]: {
          x: mouseX + dragOffset.x,
          y: mouseY + dragOffset.y
        }
      }));
    };
    
    const handleMouseUp = () => {
      // End dragging
      setDraggingNode(null);
    };
    
    // Add event listeners to document
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingNode, dragOffset]);

  return (
    <div 
      ref={containerRef}
      className={`${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-900/80 overflow-auto' : ''}`}
    >
      <Card className={`rounded-lg border border-slate-200 bg-white shadow-sm ${isFullscreen ? 'w-full h-[calc(100vh-32px)]' : 'mb-8'}`}>
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
          
          <div className={`graph-container relative w-full ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[600px]'}`}>
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
              <Button
                variant="outline"
                size="icon"
                className="p-2 rounded-md bg-white text-slate-800 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
                onClick={resetNodePositions}
                title="Reset Node Positions"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                  <path d="M9 9h6v6H9z" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="p-2 rounded-md bg-white text-slate-800 hover:bg-slate-100 transition-colors shadow-sm border border-slate-200"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
            </div>
            
            {/* Help message for draggable nodes */}
            {showGraph && nodes.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-blue-50 text-blue-700 px-4 py-2 rounded-md shadow-sm border border-blue-200 text-xs flex items-center z-10">
                <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>Tip: Nodes are draggable! Click and drag to reposition nodes in the graph.</span>
              </div>
            )}
            
            <div className={`network-graph ${isFullscreen ? 'h-full' : 'h-[600px]'} w-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden relative`}>
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
                  {/* Define arrow marker for directed edges */}
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="10"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" className="fill-blue-500" />
                    </marker>
                  </defs>
                  
                  {/* Render links with arrowheads for directed edges */}
                  {links.map((link, index) => (
                    <path
                      key={`link-${link.source}-${link.target}-${index}`}
                      d={`M${link.points[0][0]},${link.points[0][1]} C${link.points[1][0]},${link.points[1][1]} ${link.points[2][0]},${link.points[2][1]} ${link.points[3][0]},${link.points[3][1]}`}
                      className="stroke-blue-500 fill-none"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      markerEnd="url(#arrowhead)"
                    />
                  ))}
                  
                  {/* Render all nodes */}
                  {nodes.map((node) => {
                    const isRoot = node.level === 0;
                    const isExpanded = expandedNodes.has(node.id);
                    
                    // Different styles based on hierarchy level
                    let nodeClass, textClass, shadowOpacity;
                    
                    if (activeNode === node.id) {
                      // Active node styling (highest priority)
                      nodeClass = "fill-purple-200 stroke-purple-600";
                      textClass = "font-bold fill-purple-900";
                      shadowOpacity = 0.5;
                    } else {
                      // Color coding based on level in the hierarchy
                      switch (node.level) {
                        case 0: // Root node
                          nodeClass = "fill-blue-300 stroke-blue-600";
                          textClass = "font-semibold fill-slate-800";
                          shadowOpacity = 0.4;
                          break;
                        case 1: // Level 1 nodes
                          nodeClass = "fill-green-200 stroke-green-600";
                          textClass = "font-medium fill-slate-800";
                          shadowOpacity = 0.35;
                          break;
                        case 2: // Level 2 nodes
                          nodeClass = "fill-orange-200 stroke-orange-600";
                          textClass = "font-medium fill-slate-800";
                          shadowOpacity = 0.35;
                          break;
                        case 3: // Level 3 nodes
                          nodeClass = "fill-red-200 stroke-red-600";
                          textClass = "font-medium fill-slate-800";
                          shadowOpacity = 0.3;
                          break;
                        default: // Level 4+ nodes
                          nodeClass = "fill-purple-200 stroke-purple-600";
                          textClass = "font-medium fill-slate-800";
                          shadowOpacity = 0.3;
                          break;
                      }
                      
                      // Add highlight for expanded nodes
                      if (isExpanded && node.level > 0) {
                        nodeClass = nodeClass.replace("fill-", "fill-").replace("stroke-", "stroke-");
                        nodeClass += " ring-2 ring-blue-400 ring-opacity-50";
                      }
                    }
                    
                    return (
                      <g 
                        key={`node-${node.id}`}
                        className="node"
                        transform={`translate(${nodePositions[node.id]?.x || node.x - 90}, ${nodePositions[node.id]?.y || node.y - 20})`}
                        style={{ cursor: draggingNode === node.id ? 'grabbing' : 'grab' }}
                        onClick={(e) => {
                          // Prevent click when we're finishing a drag operation
                          if (draggingNode) {
                            e.stopPropagation();
                            return;
                          }
                          setActiveNode(activeNode === node.id ? null : node.id);
                        }}
                        onMouseDown={(e) => {
                          // Start dragging
                          if (e.button !== 0) return; // Only left mouse button
                          
                          // Get SVG coordinates
                          const svg = svgRef.current;
                          if (!svg) return;
                          
                          const CTM = svg.getScreenCTM();
                          if (!CTM) return;
                          
                          // Calculate where in the node we clicked
                          const mouseX = (e.clientX - CTM.e) / CTM.a;
                          const mouseY = (e.clientY - CTM.f) / CTM.d;
                          const nodeX = nodePositions[node.id]?.x || node.x - 90;
                          const nodeY = nodePositions[node.id]?.y || node.y - 20;
                          
                          setDragOffset({
                            x: nodeX - mouseX,
                            y: nodeY - mouseY
                          });
                          
                          setDraggingNode(node.id);
                          
                          // Stop propagation to prevent other handlers
                          e.stopPropagation();
                        }}
                        onMouseEnter={(e) => {
                          // Don't show hover effect while dragging
                          if (draggingNode) return;
                          
                          // Add highlight effect on hover
                          const rect = e.currentTarget.querySelector('rect');
                          if (rect) {
                            rect.setAttribute('stroke-width', '2.5');
                            rect.setAttribute('filter', `url(#shadow-highlight-${node.id})`);
                          }
                        }}
                        onMouseLeave={(e) => {
                          // Don't remove effect while dragging
                          if (draggingNode === node.id) return;
                          
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
                  
                  {/* Add legend for color coding */}
                  {nodes.length > 0 && (
                    <g transform={`translate(50, ${Math.max(...nodes.map(n => n.y)) + 100})`}>
                      <rect width="500" height="90" fill="white" fillOpacity="0.9" stroke="#e2e8f0" rx="5" ry="5" />
                      <text x="250" y="25" textAnchor="middle" className="font-semibold fill-slate-700">Dependency Level Legend</text>
                      
                      {/* Legend items */}
                      <g transform="translate(30, 40)">
                        {/* Level 0 */}
                        <rect width="20" height="20" fill="#93c5fd" stroke="#2563eb" rx="2" ry="2" />
                        <text x="30" y="15" className="text-xs fill-slate-700">Root Node (Level 0)</text>
                        
                        {/* Level 1 */}
                        <rect width="20" height="20" x="180" y="0" fill="#bbf7d0" stroke="#16a34a" rx="2" ry="2" />
                        <text x="210" y="15" className="text-xs fill-slate-700">Level 1</text>
                        
                        {/* Level 2 */}
                        <rect width="20" height="20" x="280" y="0" fill="#fed7aa" stroke="#ea580c" rx="2" ry="2" />
                        <text x="310" y="15" className="text-xs fill-slate-700">Level 2</text>
                        
                        {/* Level 3 */}
                        <rect width="20" height="20" x="380" y="0" fill="#fecaca" stroke="#dc2626" rx="2" ry="2" />
                        <text x="410" y="15" className="text-xs fill-slate-700">Level 3</text>
                        
                        {/* Arrow direction */}
                        <path d="M30,40 L80,40" className="stroke-blue-500" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
                        <text x="120" y="45" className="text-xs fill-slate-700">Direction of dependency</text>
                        
                        {/* Selected node */}
                        <rect width="20" height="20" x="280" y="30" fill="#e9d5ff" stroke="#9333ea" rx="2" ry="2" />
                        <text x="310" y="45" className="text-xs fill-slate-700">Selected/Level 4+ Node</text>
                      </g>
                    </g>
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
    </div>
  );
}