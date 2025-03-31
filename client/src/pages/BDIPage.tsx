import { Card, CardContent } from "@/components/ui/card";
import { Beliefs, Desires, Intentions } from "@/lib/types";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

interface BDIPageProps {
  beliefs: Beliefs;
  desires: Desires;
  intentions: Intentions;
}

export default function BDIPage({
  beliefs,
  desires,
  intentions
}: BDIPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">AI Agent State: Beliefs, Desires, and Intentions</h1>
      
      <p className="text-slate-600 mb-8">
        This page displays the internal state of the BDI (Belief-Desire-Intention) agent that powers
        the dependency analysis. The BDI model is a cognitive architecture that reflects how the AI
        reasons about dependencies and makes decisions.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <h3 className="text-md font-medium text-slate-800 mb-3">Beliefs</h3>
            <p className="text-sm text-slate-600 mb-4">What the AI believes about feature dependencies</p>
            
            {Object.keys(beliefs).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(beliefs).map(([feature, deps]) => (
                  <li key={feature} className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{feature}:</span>{" "}
                    {Array.isArray(deps.Primary) 
                      ? deps.Primary.map(d => d.split(" (for ")[0]).join(", ")
                      : "No dependencies"
                    }
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No beliefs have been formed yet</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <h3 className="text-md font-medium text-slate-800 mb-3">Desires</h3>
            <p className="text-sm text-slate-600 mb-4">What the AI wants to achieve</p>
            
            {Object.keys(desires).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(desires).map(([feature, desire]) => (
                  <li key={feature} className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{feature}:</span>{" "}
                    {desire}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No desires have been formed yet</p>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <h3 className="text-md font-medium text-slate-800 mb-3">Intentions</h3>
            <p className="text-sm text-slate-600 mb-4">What the AI intends to do</p>
            
            {Object.keys(intentions).length > 0 ? (
              <ul className="space-y-2">
                {Object.entries(intentions).map(([feature, intention]) => (
                  <li key={feature} className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{feature}:</span>{" "}
                    {intention}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 italic">No intentions have been formed yet</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Understanding BDI Model</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-blue-700">
          <li><strong>Beliefs</strong> represent the AI's knowledge about the world - in this case, what dependencies exist for each feature.</li>
          <li><strong>Desires</strong> represent the AI's goals - what it wants to achieve through dependency analysis.</li>
          <li><strong>Intentions</strong> represent the AI's current plan of action - how it intends to fulfill those desires.</li>
        </ul>
      </div>
    </div>
  );
}