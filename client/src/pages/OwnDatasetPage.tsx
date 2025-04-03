import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "wouter";
import { 
  ArrowLeft,
  Database,
  Upload,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/queryClient";
import Papa from "papaparse";
import { Network, Node, Edge, Options, Data } from "vis-network";
import myImage from "@/pages/himitsu8-logo-stacked.svg"; // Update with your image path

interface Dataset {
  data: any[];
  columns: string[];
}

interface VisNode extends Node {
  id: string;
  label: string;
  color: {
    background: string;
    border: string;
    highlight: {
      background: string;
      border: string;
    }
  };
  shape: string;
  font: {
    size: number;
  };
  shadow: boolean;
}

// Helper function to check if a value is numeric
const isNumeric = (value: any): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Helper function to get correlation between two arrays of numbers
const getCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
};

export default function OwnDatasetPage() {
  // State for the dataset
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for dependency analysis
  const [targetFeature, setTargetFeature] = useState<string>("");
  const [dependencies, setDependencies] = useState<Record<string, string[]>>({});
  const [levelMapping, setLevelMapping] = useState<Record<string, number>>({});
  const [graphReady, setGraphReady] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<Set<string>>(new Set());
  const [selectedFeature, setSelectedFeature] = useState<string>("");
  const [aiDependencies, setAiDependencies] = useState<Record<string, any>>({});
  const [selectedAIDependencies, setSelectedAIDependencies] = useState<string[]>([]);
  const [isFetchingAI, setIsFetchingAI] = useState(false);
  
  // Network graph reference
  const networkContainer = useRef<HTMLDivElement>(null);
  const network = useRef<any>(null);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      setIsLoading(true);
      
      Papa.parse(uploadedFile, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            const columns = results.meta.fields || [];
            setDataset({
              data: results.data,
              columns: columns
            });
            
            // Reset state when new file is uploaded
            setTargetFeature("");
            setDependencies({});
            setLevelMapping({});
            setGraphReady(false);
            setExpandedFeatures(new Set());
            setSelectedFeature("");
            setAiDependencies({});
            setSelectedAIDependencies([]);
          } else {
            alert("The CSV file appears to be empty or invalid.");
          }
          setIsLoading(false);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Error parsing the CSV file. Please ensure it's a valid CSV format.");
          setIsLoading(false);
        }
      });
    }
  };

  // Extract hierarchical dependencies from the dataset
  const extractHierarchicalDependencies = (
    targetFeature: string, 
    maxDepth: number = 3, 
    threshold: number = 0.2
  ) => {
    if (!dataset || !targetFeature || !dataset.columns.includes(targetFeature)) {
      return;
    }
    
    setIsLoading(true);
    
    // Create a copy of the dataset for correlation analysis
    const data = [...dataset.data];
    
    // Compute correlation matrix
    const correlations: Record<string, Record<string, number>> = {};
    
    for (const column of dataset.columns) {
      correlations[column] = {};
      
      // Get column values as numbers (where possible)
      const columnValues = data.map(row => {
        const val = row[column];
        return isNumeric(val) ? parseFloat(val) : NaN;
      }).filter(val => !isNaN(val));
      
      for (const otherColumn of dataset.columns) {
        if (column === otherColumn) {
          correlations[column][otherColumn] = 1; // Perfect correlation with self
        } else {
          const otherColumnValues = data.map(row => {
            const val = row[otherColumn];
            return isNumeric(val) ? parseFloat(val) : NaN;
          }).filter(val => !isNaN(val));
          
          // Only calculate if both columns have valid numeric values
          if (columnValues.length > 0 && otherColumnValues.length > 0) {
            // Use only the minimum length of both arrays
            const minLength = Math.min(columnValues.length, otherColumnValues.length);
            const correlation = getCorrelation(
              columnValues.slice(0, minLength), 
              otherColumnValues.slice(0, minLength)
            );
            correlations[column][otherColumn] = correlation;
          } else {
            correlations[column][otherColumn] = 0;
          }
        }
      }
    }
    
    // Find dependencies based on correlation threshold
    const newDependencies: Record<string, string[]> = { [targetFeature]: [] };
    const newLevelMapping: Record<string, number> = { [targetFeature]: 0 };
    
    // Calculate median correlation for threshold
    const targetCorrelations = Object.values(correlations[targetFeature] || {});
    const sortedCorrelations = [...targetCorrelations].sort((a, b) => a - b);
    const medianCorrelation = sortedCorrelations[Math.floor(sortedCorrelations.length / 2)] || threshold;
    
    // Use the higher value between median and provided threshold
    const effectiveThreshold = Math.max(Math.abs(medianCorrelation), threshold);
    
    // Function to recursively find dependencies
    const findDependencies = (feature: string, currentDepth: number) => {
      if (currentDepth > maxDepth || !correlations[feature]) {
        return;
      }
      
      // Get correlations for this feature and sort by absolute value
      const featureCorrelations = correlations[feature];
      const sortedFeatures = Object.keys(featureCorrelations)
        .filter(col => col !== feature) // Exclude self
        .sort((a, b) => Math.abs(featureCorrelations[b]) - Math.abs(featureCorrelations[a]));
      
      // Take top related features above threshold
      const relatedFeatures = sortedFeatures
        .filter(col => Math.abs(featureCorrelations[col]) > effectiveThreshold)
        .slice(0, 5); // Limit to top 5
      
      for (const rel of relatedFeatures) {
        if (!(rel in newDependencies)) {
          newDependencies[rel] = [];
          newLevelMapping[rel] = currentDepth;
        }
        
        if (!newDependencies[feature].includes(rel)) {
          newDependencies[feature].push(rel);
        }
        
        findDependencies(rel, currentDepth + 1);
      }
    };
    
    // Start the recursive process
    findDependencies(targetFeature, 1);
    
    setDependencies(newDependencies);
    setLevelMapping(newLevelMapping);
    setGraphReady(true);
    setExpandedFeatures(new Set([targetFeature]));
    setIsLoading(false);
  };

  // Fetch AI-based dependencies
  const fetchAIDependencies = async (feature: string) => {
    if (!dataset || !feature) return;
    
    setIsFetchingAI(true);
    
    try {
      // Build context from dataset columns
      const featureContext = dataset.columns.join(', ');
      
      // Define the response type
      interface AIResponseData {
        dependencies: {
          Primary: string[];
          [key: string]: string[];
        };
        explanations: Record<string, string>;
      }
      
      // Make a direct fetch request to ensure we handle the response correctly
      const response = await fetch('/api/dependencies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feature,
          context: featureContext
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as AIResponseData;
      
      if (data && data.dependencies && data.explanations) {
        setAiDependencies({
          ...aiDependencies,
          [feature]: data
        });
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("Error fetching AI dependencies:", error);
      alert("Failed to fetch AI dependencies. Please try again.");
    } finally {
      setIsFetchingAI(false);
    }
  };

  // Confirm selected AI dependencies
  const confirmAIDependencies = () => {
    if (!selectedFeature || selectedAIDependencies.length === 0) return;
    
    // Add selected dependencies to the dependency graph
    const updatedDependencies = { ...dependencies };
    
    // Ensure the feature exists in dependencies
    if (!updatedDependencies[selectedFeature]) {
      updatedDependencies[selectedFeature] = [];
    }
    
    // Add selected dependencies if they don't already exist
    for (const dep of selectedAIDependencies) {
      if (!updatedDependencies[selectedFeature].includes(dep)) {
        updatedDependencies[selectedFeature].push(dep);
      }
      
      // Add empty array for new dependency if it doesn't exist
      if (!updatedDependencies[dep]) {
        updatedDependencies[dep] = [];
      }
      
      // Update level mapping (set one level deeper than parent)
      setLevelMapping(prev => ({
        ...prev,
        [dep]: (prev[selectedFeature] || 0) + 1
      }));
    }
    
    setDependencies(updatedDependencies);
    
    // Update expanded features
    const newExpandedFeatures = new Set(expandedFeatures);
    selectedAIDependencies.forEach(dep => newExpandedFeatures.add(dep));
    setExpandedFeatures(newExpandedFeatures);
    
    // Reset selections
    setSelectedAIDependencies([]);
    
    // Update graph
    setGraphReady(true);
  };

  // Generate expanded dataset with added features
  const generateExpandedDataset = () => {
    if (!dataset) return null;
    
    const data = [...dataset.data];
    const existingColumns = new Set(dataset.columns);
    const expandedFeaturesArray = Array.from(expandedFeatures);
    
    // Filter out features that already exist in the dataset
    const newFeatures = expandedFeaturesArray.filter(feature => !existingColumns.has(feature));
    
    // Add new features to the dataset
    for (const feature of newFeatures) {
      // Generate random values as a demo (in a real app, this would be more sophisticated)
      for (const row of data) {
        row[feature] = Math.random(); // Simple random value between 0 and 1
      }
    }
    
    return {
      data,
      columns: [...dataset.columns, ...newFeatures]
    };
  };

  // Prepare and download expanded dataset as CSV
  const downloadExpandedDataset = () => {
    const expandedDataset = generateExpandedDataset();
    if (!expandedDataset) return;
    
    const csv = Papa.unparse(expandedDataset.data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'expanded_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render the dependency graph using vis-network
  useEffect(() => {
    if (graphReady && networkContainer.current && Object.keys(dependencies).length > 0) {
      // Create nodes and edges for the network
      const nodes: VisNode[] = [];
      const edges: Edge[] = [];
      
      // Add nodes
      for (const [node, level] of Object.entries(levelMapping)) {
        const colors = [
          "#a5d6a7", // light green for target (level 0)
          "#90caf9", // light blue (level 1) 
          "#ffcc80", // light orange (level 2)
          "#ef9a9a", // light red (level 3)
          "#b39ddb"  // light purple (level 4+)
        ];
        
        const color = colors[Math.min(level, colors.length - 1)];
        
        nodes.push({
          id: node,
          label: node,
          color: {
            background: color,
            border: "#666",
            highlight: { background: "#ffff99", border: "#666" }
          },
          shape: "box",
          font: { size: 16 },
          // Use the proper margin format for vis-network
          margin: { 
            top: 10, 
            right: 10, 
            bottom: 10, 
            left: 10 
          },
          shadow: true
        });
      }
      
      // Add edges
      for (const [parent, children] of Object.entries(dependencies)) {
        for (const child of children) {
          edges.push({
            from: parent,
            to: child,
            arrows: { to: true },
            color: { color: "#848484", highlight: "#333333" },
            width: 2,
            smooth: { 
              enabled: true, 
              type: "cubicBezier", 
              forceDirection: "horizontal",
              roundness: 0.5
            }
          });
        }
      }
      
      // Create network
      const data: Data = { 
        nodes: nodes, 
        edges: edges 
      };
      
      // Network options
      const options: Options = {
        layout: {
          hierarchical: {
            enabled: true,
            direction: "LR",
            sortMethod: "directed",
            levelSeparation: 250,
            nodeSpacing: 200
          }
        },
        physics: {
          enabled: false
        },
        interaction: {
          hover: true,
          dragNodes: true,
          zoomView: true
        },
        nodes: {
          font: {
            face: "Arial",
            size: 16
          }
        }
      };
      
      // Create the network
      network.current = new Network(networkContainer.current, data, options);
      
      // Clean up on unmount
      return () => {
        if (network.current) {
          network.current.destroy();
          network.current = null;
        }
      };
    }
  }, [graphReady, dependencies, levelMapping]);

  // Component content
  return (
    <div>
       <header>
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img
            src={myImage}
            alt="Himitsu Lab Logo"
            className="absolute top-3 left-4 w-15 h-10 md:w-14 md:h-14" // Responsive size
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="px-6">
            Share
          </Button>
          <Link href="/">
            <Button className="bg-black hover:bg-gray-800 text-white px-6">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </header>
          <Card className="mb-48">
        <CardHeader>
          <CardTitle>
            AI-Powered Dependency Analyzer (Dataset Mode)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-6">
            {/* Step 1: Upload Dataset */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Step 1: Upload Dataset (CSV format)</h2>
              
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload CSV
                </Button>
                <span className="text-sm text-muted-foreground">
                  {file ? file.name : "No file selected"}
                </span>
              </div>
            </div>
            
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Processing dataset...</p>
              </div>
            )}
            
            {dataset && (
              <>
                {/* Data Preview */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Dataset Preview</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {dataset.columns.map((col, index) => (
                            <TableHead key={index}>{col}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dataset.data.slice(0, 5).map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {dataset.columns.map((col, colIndex) => (
                              <TableCell key={colIndex}>{row[col]}</TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Showing first 5 rows of {dataset.data.length} total rows
                  </p>
                </div>
                
                {/* Step 2: Select Target Feature */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-700 mb-4">Step 2: Select Target Feature</h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Target Feature</Label>
                      <Select
                        value={targetFeature}
                        onValueChange={setTargetFeature}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a feature" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataset.columns.map((col) => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        onClick={() => extractHierarchicalDependencies(targetFeature)}
                        disabled={!targetFeature}
                        className="flex items-center gap-2"
                      >
                        🔍 Analyze Dataset-Based Dependencies
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Dependency Graph */}
                {graphReady && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Dependency Graph</h2>
                    
                    <div 
                      ref={networkContainer} 
                      className="h-[600px] w-full border border-gray-200 rounded-md"
                    ></div>
                    
                    <div className="mt-4 flex justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              onClick={() => {
                                if (network.current) {
                                  const canvas = network.current.canvas.frame.canvas;
                                  const dataURL = canvas.toDataURL("image/png");
                                  const link = document.createElement('a');
                                  link.href = dataURL;
                                  link.download = 'dependency_graph.png';
                                  link.click();
                                }
                              }}
                              variant="outline"
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download Graph
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Save graph as PNG image</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                )}
                
                {/* Feature Expansion with AI */}
                {graphReady && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Expand Features with AI</h2>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-lg font-medium mb-2">Select Feature to Expand:
                        </Label>
                        <Select
                          value={selectedFeature}
                          onValueChange={(value) => {
                            setSelectedFeature(value);
                            if (value && !aiDependencies[value]) {
                              fetchAIDependencies(value);
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a feature" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(dependencies).map((feat) => (
                              <SelectItem key={feat} value={feat}>{feat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {isFetchingAI && (
                      <div className="text-center py-4">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                        <p className="mt-2 text-sm text-muted-foreground">Fetching AI suggestions...</p>
                      </div>
                    )}
                    
                    {selectedFeature && aiDependencies[selectedFeature] && (
                      <div className="mt-4">
                        <h3 className="text-lg font-medium mb-2">
                          Primary Dependencies for {selectedFeature} (with Explanations):
                        </h3>
                        
                        <ScrollArea className="h-[300px] rounded-md border p-4">
  {aiDependencies[selectedFeature].dependencies.Primary.map((dep: string) => {
    const explanation = aiDependencies[selectedFeature].explanations[dep];
    return (
      <div
        key={dep}
        className="mb-4 pb-4 border-b border-gray-100 last:border-0 flex items-start gap-2"
      >
        <Checkbox
          id={`dep-${dep}`}
          checked={selectedAIDependencies.includes(dep)}
          onCheckedChange={(checked) => {
            if (checked) {
              setSelectedAIDependencies([...selectedAIDependencies, dep]);
            } else {
              setSelectedAIDependencies(
                selectedAIDependencies.filter((d) => d !== dep)
              );
            }
          }}
          className="mt"
        />
        <div className="flex flex-col">
          <Label htmlFor={`dep-${dep}`} className="font-bold leading-tight">
            {dep}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">{explanation}</p>
        </div>
      </div>
    );
  })}
</ScrollArea>

                        
                        <div className="mt-4">
                          <Button
                            onClick={confirmAIDependencies}
                            disabled={selectedAIDependencies.length === 0}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Confirm Dependencies
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Generate Expanded Dataset */}
                {graphReady && expandedFeatures.size > 0 && (
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                      Generate Expanded Dataset
                    </h2>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-medium mb-2">Selected Features:</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.from(expandedFeatures).map(feature => (
                          <Badge key={feature} variant="secondary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <Alert className="mb-4 bg-gray-100 border-gray-950">
                        <AlertDescription className="text-black-700">
                          The expanded dataset will include the original columns plus any new features 
                          you've added via the dependency analysis.
                        </AlertDescription>
                      </Alert>
                      
                      <Button 
                        onClick={downloadExpandedDataset}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Expanded Dataset
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Separator className="my-6" />
      
      <footer style={{
  position: 'fixed',
  bottom: 0,
  left: 0,
  width: '100%',
  backgroundColor: 'WHITE', // gray-900
  color: 'BLACK',
  textAlign: 'center',
  padding: '1rem',
}}>
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center',
  }}>
    <p style={{ fontSize: '0.875rem' }}>
      © 2025 All rights reserved by Himistu Lab
    </p>
    {/* Add similar inline styles for the social links and button */}
  </div>
</footer>
    </div>
  );
}