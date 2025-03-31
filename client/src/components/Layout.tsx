import React, { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
            <h1
              className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-slate-900"}`}
            >
              AI-Powered Dynamic Dependency Analyzer
            </h1>
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

            <div className="flex items-center space-x-2">
              <Sun
                className={`h-4 w-4 ${isDarkMode ? "text-slate-400" : "text-amber-500"}`}
              />
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleMode}
                className="data-[state=checked]:bg-slate-700"
              />
              <Moon
                className={`h-4 w-4 ${isDarkMode ? "text-blue-400" : "text-slate-400"}`}
              />
            </div>
          </div>
        </div>
      </header>

      <main
        className={`container mx-auto px-4 py-8 flex-1 ${isDarkMode ? "text-white" : ""}`}
      >
        {children}
      </main>

      <footer
        className={`border-t py-6 ${isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p
              className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              AI-Powered Dynamic Dependency Analyzer - Built with Next.js and
              Shadcn UI
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Powered by Gemini API
              </span>
              <div className="flex items-center">
                <Link
                  href="/bdi"
                  className={`flex items-center text-sm font-medium ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
                >
                  <BrainCircuit className="h-4 w-4 mr-1" />
                  View AI State
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
