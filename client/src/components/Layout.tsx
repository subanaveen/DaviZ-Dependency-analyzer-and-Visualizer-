import React, { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold text-blue-600">🤖</span>
            <h1 className="text-xl font-semibold text-slate-900">AI-Powered Dynamic Dependency Analyzer</h1>
          </div>
          <div>
            <button className="px-4 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm font-medium">
              Settings
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-slate-500">
              AI-Powered Dynamic Dependency Analyzer - Built with Next.js and Shadcn UI
            </p>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span className="text-sm text-slate-500">Powered by Gemini API</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
