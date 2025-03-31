import { Card, CardContent } from "@/components/ui/card";
import { Beliefs, Desires, Intentions } from "@/lib/types";

interface BDIStateDisplayProps {
  beliefs: Beliefs;
  desires: Desires;
  intentions: Intentions;
}

export default function BDIStateDisplay({
  beliefs,
  desires,
  intentions
}: BDIStateDisplayProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <h3 className="text-md font-medium text-slate-800 mb-3">Beliefs</h3>
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
        </CardContent>
      </Card>
      
      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <h3 className="text-md font-medium text-slate-800 mb-3">Desires</h3>
          <ul className="space-y-2">
            {Object.entries(desires).map(([feature, desire]) => (
              <li key={feature} className="text-sm text-slate-600">
                <span className="font-medium text-slate-800">{feature}:</span>{" "}
                {desire}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-6">
          <h3 className="text-md font-medium text-slate-800 mb-3">Intentions</h3>
          <ul className="space-y-2">
            {Object.entries(intentions).map(([feature, intention]) => (
              <li key={feature} className="text-sm text-slate-600">
                <span className="font-medium text-slate-800">{feature}:</span>{" "}
                {intention}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
