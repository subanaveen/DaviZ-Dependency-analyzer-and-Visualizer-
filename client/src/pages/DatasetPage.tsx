import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Beliefs, Desires, Intentions, SelectedDependencies } from "@/lib/types";
import { Download, RefreshCw } from "lucide-react";

interface DatasetPageProps {
  beliefs: Beliefs;
  desires: Desires;
  intentions: Intentions;
  selectedDependencies: SelectedDependencies;
}

interface DatasetRow {
  [key: string]: number;
}

export default function DatasetPage({
  beliefs,
  desires,
  intentions,
  selectedDependencies
}: DatasetPageProps) {
  const [dataset, setDataset] = useState<DatasetRow[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [csvData, setCsvData] = useState<string>("");

  // Generate a synthetic dataset based on dependencies
  const generateDataset = () => {
    setIsGenerating(true);
    
    // Extract all features
    const featureLevels: Record<string, number> = {};
    
    // Function to assign depth to each feature
    const assignDepth = (feature: string, depth = 1) => {
      if (featureLevels[feature] !== undefined) {
        featureLevels[feature] = Math.min(featureLevels[feature], depth);
      } else {
        featureLevels[feature] = depth;
      }
      
      if (selectedDependencies[feature]) {
        for (const dep of selectedDependencies[feature]) {
          assignDepth(dep, depth + 1);
        }
      }
    };
    
    // Get all root features and assign depths
    const rootFeatures = Object.keys(selectedDependencies);
    for (const root of rootFeatures) {
      assignDepth(root, 1);
    }
    
    // Extract all unique features
    const allFeatures = Object.keys(featureLevels);
    
    if (allFeatures.length === 0) {
      setIsGenerating(false);
      return;
    }
    
    // First feature is the target variable
    const targetFeature = rootFeatures[0];
    
    // Generate 100 rows of logical synthetic data
    const data: DatasetRow[] = [];
    
    for (let i = 0; i < 100; i++) {
      const row: DatasetRow = {};
      
      // Step 1: Generate Base Feature Values
      const baseValues: Record<string, number> = {};
      for (const feature of allFeatures) {
        baseValues[feature] = Math.floor(Math.random() * 51) + 50; // Random value between 50-100
      }
      
      // Step 2: Apply Dependency-Based Adjustments with Exponential Decay
      for (const [feature, dependencies] of Object.entries(selectedDependencies)) {
        for (const dependentFeature of dependencies) {
          if (baseValues[dependentFeature] !== undefined) {
            const depth = featureLevels[dependentFeature] || 1;
            const influenceFactor = 1 / (1.5 ** (depth - 1)); // Exponential decay
            baseValues[dependentFeature] = Math.max(
              0, 
              Math.min(
                100, 
                baseValues[feature] * influenceFactor + (Math.random() * 10 - 5)
              )
            );
          }
        }
      }
      
      // Step 3: Assign values to dataset row
      for (const feature of allFeatures) {
        row[feature] = Math.round(baseValues[feature]);
      }
      
      // Step 4: Compute Target Variable with Decayed Influence from Dependencies
      if (allFeatures.includes(targetFeature)) {
        const relevantFeatures = allFeatures.filter(f => 
          selectedDependencies[targetFeature]?.includes(f)
        );
        
        if (relevantFeatures.length > 0) {
          let targetValue = 0;
          for (const feature of relevantFeatures) {
            const depth = featureLevels[feature] || 1;
            const weight = 1 / (1.2 ** depth); // Influence decreases with depth
            targetValue += baseValues[feature] * weight;
          }
          
          // Normalize and add some noise
          targetValue = targetValue / relevantFeatures.length;
          targetValue += (Math.random() * 10 - 5);
          row[targetFeature] = Math.round(Math.max(0, Math.min(100, targetValue)));
        }
      }
      
      data.push(row);
    }
    
    setDataset(data);
    
    // Generate CSV data
    const headers = allFeatures.join(',');
    const rows = data.map(row => 
      allFeatures.map(feature => row[feature]).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    setCsvData(csv);
    
    setIsGenerating(false);
  };
  
  // Download CSV file
  const downloadCSV = () => {
    if (!csvData) return;
    
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'dependency_dataset.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Synthetic Dataset Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <Label className="text-base">
                Generate a synthetic dataset based on the dependencies selected in your graph. 
                The data will reflect the hierarchical relationships and influences that exist 
                between the features.
              </Label>
            </div>
            
            <div className="flex gap-4">
              <Button
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-medium flex items-center gap-2"
                onClick={generateDataset}
                disabled={isGenerating || Object.keys(selectedDependencies).length === 0}
              >
                <RefreshCw className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generating..." : "Generate Dataset"}
              </Button>
              
              {dataset.length > 0 && (
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border border-purple-200 text-purple-700 hover:bg-purple-50"
                  onClick={downloadCSV}
                >
                  <Download className="h-4 w-4" />
                  Download CSV
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {dataset.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Generated Dataset (Preview)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableCaption>
                Showing first 10 rows of generated data. Download the full dataset using the button above.
              </TableCaption>
              <TableHeader>
                <TableRow>
                  {Object.keys(dataset[0]).map((header) => (
                    <TableHead key={header} className="text-center whitespace-nowrap">
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataset.slice(0, 10).map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.keys(row).map((key) => (
                      <TableCell key={`${rowIndex}-${key}`} className="text-center">
                        {row[key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}