import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileSpreadsheet } from "lucide-react";
import { Link } from "wouter";

export default function StatisticalAnalysis() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center">
        <Link href="/landing">
          <Button variant="ghost" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            Excel Statistical Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileSpreadsheet className="h-20 w-20 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold mb-4">Excel Statistical Analysis Tool</h2>
            <p className="text-muted-foreground max-w-2xl mb-6">
              This feature allows you to perform advanced statistical analysis on Excel data.
              Upload your Excel files and get insights through comprehensive statistical methods.
            </p>
            <p className="text-sm text-muted-foreground italic">
              This feature is coming soon. Please check back later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}