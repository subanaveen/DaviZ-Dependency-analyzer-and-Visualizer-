import { Card, CardContent } from "@/components/ui/card";
import { Beliefs, Desires, Intentions } from "@/lib/types";
import { Link } from "wouter";
import { ArrowLeft, BrainCircuit } from "lucide-react";

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
    <div className="w-full">
      <div className="mb-6 border-b pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mr-6">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
              AI Agent State: Beliefs, Desires, and Intentions
            </h1>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <BrainCircuit className="h-6 w-6 text-blue-700" />
          </div>
        </div>
      </div>
      
      <div className="mb-8 bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
        <p className="text-slate-700 leading-relaxed">
          This page displays the internal state of the BDI (Belief-Desire-Intention) agent that powers
          the dependency analysis. The BDI model is a cognitive architecture that reflects how the AI
          reasons about dependencies and makes decisions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="rounded-lg border border-blue-200 bg-white shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white px-6 py-3">
            <h3 className="text-lg font-medium">Beliefs</h3>
          </div>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-600 mb-4">What the AI believes about feature dependencies</p>
            
            {Object.keys(beliefs).length > 0 ? (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {Object.entries(beliefs).map(([feature, deps]) => (
                  <li key={feature} className="text-sm border-b border-slate-100 pb-2">
                    <span className="font-medium text-slate-800 block mb-1">{feature}:</span>
                    <span className="text-slate-600 pl-2">
                      {Array.isArray(deps.Primary) 
                        ? deps.Primary.map(d => d.split(" (for ")[0]).join(", ")
                        : "No dependencies"
                      }
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 italic">No beliefs have been formed yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-lg border border-green-200 bg-white shadow-md overflow-hidden">
          <div className="bg-green-600 text-white px-6 py-3">
            <h3 className="text-lg font-medium">Desires</h3>
          </div>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-600 mb-4">What the AI wants to achieve</p>
            
            {Object.keys(desires).length > 0 ? (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {Object.entries(desires).map(([feature, desire]) => (
                  <li key={feature} className="text-sm border-b border-slate-100 pb-2">
                    <span className="font-medium text-slate-800 block mb-1">{feature}:</span>
                    <span className="text-slate-600 pl-2">{desire}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 italic">No desires have been formed yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="rounded-lg border border-purple-200 bg-white shadow-md overflow-hidden">
          <div className="bg-purple-600 text-white px-6 py-3">
            <h3 className="text-lg font-medium">Intentions</h3>
          </div>
          <CardContent className="pt-4">
            <p className="text-sm text-slate-600 mb-4">What the AI intends to do</p>
            
            {Object.keys(intentions).length > 0 ? (
              <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {Object.entries(intentions).map(([feature, intention]) => (
                  <li key={feature} className="text-sm border-b border-slate-100 pb-2">
                    <span className="font-medium text-slate-800 block mb-1">{feature}:</span>
                    <span className="text-slate-600 pl-2">{intention}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 italic">No intentions have been formed yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold text-blue-800 mb-4 border-b border-blue-100 pb-2">Understanding BDI Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100">
            <h3 className="font-medium text-blue-700 mb-2">Beliefs</h3>
            <p className="text-sm text-slate-600">Represent the AI's knowledge about the world - in this case, what dependencies exist for each feature.</p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border border-green-100">
            <h3 className="font-medium text-green-700 mb-2">Desires</h3>
            <p className="text-sm text-slate-600">Represent the AI's goals - what it wants to achieve through dependency analysis.</p>
          </div>
          <div className="bg-white p-4 rounded-md shadow-sm border border-purple-100">
            <h3 className="font-medium text-purple-700 mb-2">Intentions</h3>
            <p className="text-sm text-slate-600">Represent the AI's current plan of action - how it intends to fulfill those desires.</p>
          </div>
        </div>
      </div>
    </div>
  );
}