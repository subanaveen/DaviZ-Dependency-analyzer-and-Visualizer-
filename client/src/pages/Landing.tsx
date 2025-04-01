import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Database, FileSpreadsheet, GitGraph, BarChart } from "lucide-react";

export default function Landing() {
  return (
    <div className="container mx-auto py-20 px-4 flex flex-col items-center">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Our Work</h1>
        <p className="text-xl text-muted-foreground">
          Explore our AI projects and innovations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <Link href="/dataset">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <Database className="h-10 w-10 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold text-center">AI Generated Dataset</h2>
            </CardContent>
          </Card>
        </Link>

        <Link href="/own-dataset">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <BarChart className="h-10 w-10 text-orange-500 mb-4" />
              <h2 className="text-xl font-semibold text-center">Dataset Dependency Analysis</h2>
            </CardContent>
          </Card>
        </Link>

        <Link href="/statistical-analysis">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <FileSpreadsheet className="h-10 w-10 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-center">Excel Statistical Analysis</h2>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dependency-analyzer">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300 h-full">
            <CardContent className="flex flex-col items-center justify-center p-6 h-full">
              <GitGraph className="h-10 w-10 text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold text-center">Dependency Analyzer</h2>
            </CardContent>
          </Card>
        </Link>
      </div>

      <footer className="mt-20 text-center text-muted-foreground">
        <p>© 2025 All rights reserved.</p>
        <p>Developed by Himistu Lab.</p>
      </footer>
    </div>
  );
}