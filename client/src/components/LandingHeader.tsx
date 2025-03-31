import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { InfinityIcon } from "lucide-react";

export default function LandingHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link href="/landing">
            <InfinityIcon className="h-8 w-8 text-gradient-to-r from-purple-500 via-pink-400 to-blue-500 cursor-pointer" />
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="px-6">
            Share
          </Button>
          <Link href="/landing">
            <Button className="bg-black hover:bg-gray-800 text-white px-6">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}