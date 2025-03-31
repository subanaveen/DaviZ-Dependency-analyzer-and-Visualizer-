import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Layout from "@/components/Layout";
import { useState } from "react";
import { Beliefs, Desires, Intentions, SelectedDependencies } from "@/lib/types";
import BDIPage from "@/pages/BDIPage";
import DatasetPage from "@/pages/DatasetPage";

function Router({ 
  beliefs, desires, intentions, selectedDependencies,
  setBeliefs, setDesires, setIntentions, setSelectedDependencies
}: { 
  beliefs: Beliefs; 
  desires: Desires; 
  intentions: Intentions;
  selectedDependencies: SelectedDependencies;
  setBeliefs: React.Dispatch<React.SetStateAction<Beliefs>>;
  setDesires: React.Dispatch<React.SetStateAction<Desires>>;
  setIntentions: React.Dispatch<React.SetStateAction<Intentions>>;
  setSelectedDependencies: React.Dispatch<React.SetStateAction<SelectedDependencies>>;
}) {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <Home 
            globalBeliefs={beliefs}
            globalDesires={desires}
            globalIntentions={intentions}
            setGlobalBeliefs={setBeliefs}
            setGlobalDesires={setDesires}
            setGlobalIntentions={setIntentions}
            setSelectedDependencies={setSelectedDependencies}
          />
        )}
      </Route>
      <Route path="/bdi">
        {() => <BDIPage beliefs={beliefs} desires={desires} intentions={intentions} />}
      </Route>
      <Route path="/dataset">
        {() => (
          <DatasetPage 
            beliefs={beliefs} 
            desires={desires} 
            intentions={intentions} 
            selectedDependencies={selectedDependencies} 
          />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Global BDI state, to be shared across pages and passed to RLBDIAgent
  const [beliefs, setBeliefs] = useState<Beliefs>({});
  const [desires, setDesires] = useState<Desires>({});
  const [intentions, setIntentions] = useState<Intentions>({});
  const [selectedDependencies, setSelectedDependencies] = useState<SelectedDependencies>({});

  return (
    <QueryClientProvider client={queryClient}>
      <Layout beliefs={beliefs} desires={desires} intentions={intentions} selectedDependencies={selectedDependencies}>
        <Router 
          beliefs={beliefs} 
          desires={desires} 
          intentions={intentions} 
          selectedDependencies={selectedDependencies}
          setBeliefs={setBeliefs}
          setDesires={setDesires}
          setIntentions={setIntentions}
          setSelectedDependencies={setSelectedDependencies}
        />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
