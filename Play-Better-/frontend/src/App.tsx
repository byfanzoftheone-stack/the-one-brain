import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useRef } from "react";
import Home from "@/pages/home";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";

function VideoIntro({ onComplete }: { onComplete: () => void }) {
  const [fading, setFading] = useState(false);
  const finish = () => { setFading(true); setTimeout(onComplete, 600); };
  return (
    <div className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-[600ms] ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      <video src="/intro.mp4" autoPlay muted playsInline onEnded={finish} className="w-full h-full object-cover" />
      <button onClick={finish} className="absolute top-5 right-5 z-10 px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/50 backdrop-blur-sm transition-all">
        Skip
      </button>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {showIntro ? <VideoIntro onComplete={() => setShowIntro(false)} /> : <Router />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
