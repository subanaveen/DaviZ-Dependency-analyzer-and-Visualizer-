import React, { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import myImage from "@/pages/himitsu8-logo-stacked.svg"; // Update with your image path
import {
  Beliefs,
  Desires,
  Intentions,
  SelectedDependencies,
} from "@/lib/types";
import { Moon, Sun, BrainCircuit, Database } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  beliefs: Beliefs;
  desires: Desires;
  intentions: Intentions;
  selectedDependencies: SelectedDependencies;
}

export default function Layout({
  children,
  beliefs,
  desires,
  intentions,
  selectedDependencies,
}: LayoutProps) {
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleMode = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode class to the document
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Check if there's BDI data to show the indicator
  const hasBDIData =
    Object.keys(beliefs).length > 0 ||
    Object.keys(desires).length > 0 ||
    Object.keys(intentions).length > 0;

  return (
    <div
      className={`min-h-screen flex flex-col ${isDarkMode ? "dark bg-slate-900 text-white" : "bg-white"}`}
    >
      <header
        className={`border-b ${isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Link href="/landing">
              <span className="text-2xl font-bold text-blue-600 cursor-pointer"></span>
            </Link>
            <img
      src={myImage}
      alt="Himitsu Lab Logo"
      className="absolute top-2 left-3 w-15 h-10 md:w-14 md:h-14" // Responsive size
    />
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden sm:flex items-center space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location === "/"
                    ? "bg-blue-100 text-blue-700"
                    : isDarkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-700 hover:text-slate-900"
                }`}
              >
                Home
              </Link>

              <Link
                href="/bdi"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  location === "/bdi"
                    ? "bg-blue-100 text-blue-700"
                    : isDarkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-700 hover:text-slate-900"
                }`}
              >
                BDI State
                {hasBDIData && location !== "/bdi" && (
                  <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                )}
              </Link>

              <Link
                href="/dataset"
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                  location === "/dataset"
                    ? "bg-purple-100 text-purple-700"
                    : isDarkMode
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-700 hover:text-slate-900"
                }`}
              >
                <Database className="h-4 w-4 mr-1" />
                Dataset
                {Object.keys(selectedDependencies).length > 0 &&
                  location !== "/dataset" && (
                    <span className="ml-2 w-2 h-2 bg-purple-500 rounded-full"></span>
                  )}
              </Link>
            </nav>

            
          </div>
        </div>
      </header>

      <main
        className={`container mx-auto px-4 py-8 flex-1 ${isDarkMode ? "text-white" : ""}`}
      >
        {children}
      </main>

      <footer className="text-center text-muted-foreground ">
        <p>© 2025 All rights reserved by Himistu Lab</p>
       
      </footer>
    </div>
  );
}
