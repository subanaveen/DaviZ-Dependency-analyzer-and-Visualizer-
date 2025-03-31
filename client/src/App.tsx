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

function Router({ beliefs, desires, intentions }: { 
  beliefs: Beliefs; 
  desires: Desires; 
  intentions: Intentions 
}) {
  return (
    <Switch>
      <Route path="/" component={Home} />
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
        <Router beliefs={beliefs} desires={desires} intentions={intentions} />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
