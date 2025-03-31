import { Switch, Route, useLocation } from "wouter";
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
import OwnDatasetPage from "@/pages/OwnDatasetPage";
import Landing from "@/pages/Landing";
import StatisticalAnalysis from "@/pages/StatisticalAnalysis";
import LandingHeader from "@/components/LandingHeader";

function App() {
  // Global BDI state, to be shared across pages and passed to RLBDIAgent
  const [beliefs, setBeliefs] = useState<Beliefs>({});
  const [desires, setDesires] = useState<Desires>({});
  const [intentions, setIntentions] = useState<Intentions>({});
  const [selectedDependencies, setSelectedDependencies] = useState<SelectedDependencies>({});

  return (
    <QueryClientProvider client={queryClient}>
      <Switch>
        <Route path="/landing">
          {() => (
            <>
              <LandingHeader />
              <Landing />
            </>
          )}
        </Route>
        <Route path="/statistical-analysis">
          {() => <StatisticalAnalysis />}
        </Route>
        <Route path="/">
          {() => (
            <Layout beliefs={beliefs} desires={desires} intentions={intentions} selectedDependencies={selectedDependencies}>
              <Home 
                globalBeliefs={beliefs}
                globalDesires={desires}
                globalIntentions={intentions}
                setGlobalBeliefs={setBeliefs}
                setGlobalDesires={setDesires}
                setGlobalIntentions={setIntentions}
                setSelectedDependencies={setSelectedDependencies}
              />
            </Layout>
          )}
        </Route>
        <Route path="/bdi">
          {() => (
            <Layout beliefs={beliefs} desires={desires} intentions={intentions} selectedDependencies={selectedDependencies}>
              <BDIPage beliefs={beliefs} desires={desires} intentions={intentions} />
            </Layout>
          )}
        </Route>
        <Route path="/dataset">
          {() => (
            <Layout beliefs={beliefs} desires={desires} intentions={intentions} selectedDependencies={selectedDependencies}>
              <DatasetPage 
                beliefs={beliefs} 
                desires={desires} 
                intentions={intentions} 
                selectedDependencies={selectedDependencies} 
              />
            </Layout>
          )}
        </Route>
        <Route path="/own-dataset">
          {() => <OwnDatasetPage />}
        </Route>
        <Route>
          {() => (
            <Layout beliefs={beliefs} desires={desires} intentions={intentions} selectedDependencies={selectedDependencies}>
              <NotFound />
            </Layout>
          )}
        </Route>
      </Switch>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
