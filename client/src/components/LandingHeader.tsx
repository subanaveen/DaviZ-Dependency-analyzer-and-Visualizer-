import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import myImage from "@/pages/himitsu8-logo-stacked.svg"; // Update with your image path

export default function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 border-b border-slate-200 bg-white">
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