import { Link } from "wouter";
import { Button } from "@/components/ui/button";

import myImage from "@/pages/logo_main.svg"; // Update with your image path



export default function LandingHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          
         <img src={myImage} style={{ position: "absolute", top: 8, left:52  }}/> 
         <h1 className="text-3xl font-bold cursor-pointer text-black "></h1>
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