import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, BookOpen, Zap, BarChart3, FileDown, MessageSquare, Search, HelpCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: BookOpen,
    title: "Welcome to AISBS",
    description: "This web app is the interactive companion to \"AI Solved Business Problems\" by Davor Mulalić. Navigate 50 business problems across 10 industries with AI-powered analysis.",
    routes: ["/"],
  },
  {
    icon: Search,
    title: "Navigate & Explore",
    description: "Use the left sidebar to browse chapters and problems. The Dashboard shows all 10 industries. Click any problem to see its full analysis with ROI data, failure modes, and execution prompts.",
    routes: ["/", "/industry"],
  },
  {
    icon: Zap,
    title: "Prompt Execution Console",
    description: "Go to 'Prompt Execution' in the sidebar. Select a business problem, choose SIMULATION MODE (pre-built demo data) to see AI in action, or PRODUCTION MODE with your own API key for real analysis.",
    routes: ["/prompt-execution"],
  },
  {
    icon: MessageSquare,
    title: "Follow-up Conversations",
    description: "After the AI generates an initial analysis, ask follow-up questions to dive deeper. Each response builds on the previous context for continuous, intelligent dialogue.",
    routes: ["/prompt-execution", "/problem"],
  },
  {
    icon: BarChart3,
    title: "Auto-Generated Visuals",
    description: "The AI automatically generates performance impact charts and metric cards below each analysis. These visualize before/after improvements for executive-level reporting.",
    routes: ["/prompt-execution", "/problem"],
  },
  {
    icon: FileDown,
    title: "Export PDF Reports",
    description: "Click 'PDF Report' to export the entire AI conversation — including follow-up Q&A — into a professionally formatted document ready for print or executive briefing.",
    routes: ["/prompt-execution", "/problem"],
  },
];

function getContextualStep(pathname: string): number {
  if (pathname.startsWith("/problem/")) return 3;
  if (pathname.startsWith("/prompt-execution")) return 2;
  if (pathname.startsWith("/industry/")) return 1;
  if (pathname.startsWith("/preface") || pathname.startsWith("/afterword")) return 0;
  if (pathname.startsWith("/bibliography") || pathname.startsWith("/index-terms")) return 1;
  return 0;
}

export function UserGuide() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const seen = localStorage.getItem("aisbs-guide-seen");
    if (!seen) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem("aisbs-guide-seen", "true");
  };

  const handleOpen = () => {
    setStep(getContextualStep(location.pathname));
    setOpen(true);
  };

  if (!open) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        title="Open User Guide"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    );
  }

  const current = steps[step];
  const Icon = current.icon;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed z-[91] bottom-6 right-6 left-6 sm:left-auto sm:w-[420px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-primary">
            Guide — {step + 1}/{steps.length}
          </span>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">{current.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{current.description}</p>
        </div>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 pb-2">
          {steps.map((_, i) => (
            <button key={i} onClick={() => setStep(i)} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground"}`} />
          ))}
        </div>
        <div className="flex items-center justify-between px-5 pb-4">
          <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-1">
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button size="sm" onClick={() => setStep(s => s + 1)} className="gap-1">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleClose} className="gap-1">
              Get Started <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
