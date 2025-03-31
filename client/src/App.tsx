import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Layout from "@/components/Layout";
import { useState } from "react";
import { Beliefs, Desires, Intentions } from "@/lib/types";
import BDIPage from "@/pages/BDIPage";

function Router({ 
  beliefs, desires, intentions, 
  setBeliefs, setDesires, setIntentions 
}: { 
  beliefs: Beliefs; 
  desires: Desires; 
  intentions: Intentions;
  setBeliefs: React.Dispatch<React.SetStateAction<Beliefs>>;
  setDesires: React.Dispatch<React.SetStateAction<Desires>>;
  setIntentions: React.Dispatch<React.SetStateAction<Intentions>>;
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
          />
        )}
      </Route>
      <Route path="/bdi">
        {() => <BDIPage beliefs={beliefs} desires={desires} intentions={intentions} />}
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

  return (
    <QueryClientProvider client={queryClient}>
      <Layout beliefs={beliefs} desires={desires} intentions={intentions}>
        <Router 
          beliefs={beliefs} 
          desires={desires} 
          intentions={intentions} 
          setBeliefs={setBeliefs}
          setDesires={setDesires}
          setIntentions={setIntentions}
        />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
