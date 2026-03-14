import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Copy, Check, Play, ChevronDown, ChevronUp, AlertTriangle, Target, TrendingUp, Lightbulb, Workflow, BarChart3, Shield, BookOpen, Zap, Send, Trash2, Bot, Database, Upload, Info, ShieldCheck, KeyRound, FileDown, Loader2} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useProblem, useProblems } from "@/hooks/useProblems";
import { useIndustries } from "@/hooks/useIndustries";
import { AppLayout } from "@/components/AppLayout";
import { CHAPTER_SUBTITLES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { RichTextContent } from "@/components/RichTextContent";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useExecutionChat } from "@/hooks/useExecutionChat";
import { ResponseVisuals, stripMetricsBlock } from "@/components/execution/ResponseVisuals";
import { ProductionModeDialog } from "@/components/execution/ProductionModeDialog";
import { normalizeAiHtml } from "@/lib/aiHtml";

const severityStyles: Record<string, string> = {
  HIGH: "bg-destructive/15 text-destructive border-destructive/30",
  MEDIUM: "bg-primary/15 text-primary border-primary/30",
  LOW: "bg-muted text-muted-foreground border-border",
};

const sectionConfig: Array<{ key: string; label: string; icon: React.ElementType }> = [
  { key: "problem_statement", label: "The Operational Reality", icon: Target },
  { key: "current_state", label: "Why Traditional Approaches Fail", icon: Shield },
  { key: "ai_solution", label: "The Manager's Decision Point", icon: Lightbulb },
  { key: "implementation_roadmap", label: "The AI-Augmented Workflow", icon: Workflow },
  { key: "expected_outcomes", label: "The Business Case", icon: TrendingUp },
  { key: "risk_factors", label: "Industry Context & Next Steps", icon: Zap },
];

const stripPrefixes = [
  "The Operational Reality\n", "Why Traditional Methods Fail\n", "Why Traditional Approaches Fail\n",
  "The Manager's Decision Point\n", "The Manager\u2019s Decision Point\n",
  "The AI-Augmented Workflow\n", "The Business Case\n",
  "Industry Context & Next Steps\n", "Industry Context\n",
];

type ExecutionMode = "simulation" | "production";

export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const { data: problem, isLoading } = useProblem(id || "");
  const { data: industries } = useIndustries();
  const { data: allProblems } = useProblems(problem?.chapter_number);
  const [copied, setCopied] = useState(false);
  const [showPromptExec, setShowPromptExec] = useState(false);
  const [expandedFailureMode, setExpandedFailureMode] = useState<number | null>(null);
  const [promptExpanded, setPromptExpanded] = useState(false);

  const { messages, isLoading: executing, execute, followUp, clear } = useExecutionChat();
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("simulation");
  const [userData, setUserData] = useState("");
  const [userApiKey, setUserApiKey] = useState("");
  const [userProvider, setUserProvider] = useState("");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [productionKey, setProductionKey] = useState<{ provider: string; key: string } | null>(null);
  const [followUpInput, setFollowUpInput] = useState("");
  const [hasExecuted, setHasExecuted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const industry = industries?.find(i => i.chapter_number === problem?.chapter_number);
  useDocumentTitle(problem ? `${problem.id}: ${problem.title}` : undefined);

  const sortedProblems = allProblems?.sort((a, b) => a.id.localeCompare(b.id));
  const currentIdx = sortedProblems?.findIndex(p => p.id === problem?.id) ?? -1;
  const prevProblem = currentIdx > 0 ? sortedProblems?.[currentIdx - 1] : null;
  const nextProblem = currentIdx >= 0 && sortedProblems ? sortedProblems[currentIdx + 1] : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    clear();
    setHasExecuted(false);
    setUserData("");
    setShowPromptExec(false);
  }, [id, clear]);

  const SIMULATION_PREFIX =
    "SIMULATION MODE ACTIVE.\n\n" +
    "This is a controlled simulation. You must NOT ask the user for any data. " +
    "For every INPUT field, data request, or placeholder in the prompt below, " +
    "you MUST silently generate realistic, specific, industry-appropriate mockup data and proceed immediately with the full analysis. " +
    "Do not announce that you are using mockup data \u2014 simply execute the prompt as if real data was provided. " +
    "Produce a complete, detailed, professional output as if this were a live deployment.\n\n" +
    "\u26a0\ufe0f BEGIN EXECUTION NOW. DO NOT ASK FOR DATA. DO NOT PAUSE. GENERATE ALL INPUTS YOURSELF AND RUN THE FULL ANALYSIS.\n\n";

  const PRODUCTION_PREFIX =
    "\u26a0\ufe0f EXECUTE THIS PROMPT WITH THE USER-PROVIDED DATA BELOW. DO NOT EVALUATE OR CRITIQUE \u2014 BEGIN ANALYSIS NOW.\n\n";

  // PREFIX shown in UI prompt preview and used by Copy button
  // COPY PREFIX — used when copying to external platforms (ChatGPT, Claude, Gemini etc.)
  // IMPORTANT: Must ask user for THEIR data — do NOT simulate or generate mock data.
  // This is the opposite of SIMULATION_PREFIX which is only for the internal web app engine.
  const COPY_PREFIX =
    "\u26a0\ufe0f AISBS PROMPT — INSTRUCTIONS FOR AI:\n\n" +
    "This is a structured business analysis prompt from the book \"AI Solved Business Problems\" by Davor Mulali\u0107.\n\n" +
    "BEFORE YOU BEGIN: You must ask me to provide my real business data.\n" +
    "DO NOT generate sample data. DO NOT simulate. DO NOT start analysis without my data.\n" +
    "Ask me clearly: \"Please provide your [specific data required by this prompt] and I will run the full analysis.\"\n\n" +
    "Once I provide my data, execute the full analysis immediately and completely.\n\n";

  // getCopyPrompt() — used for Copy button and prompt preview display
  const getCopyPrompt = () => COPY_PREFIX + (problem?.prompt ?? "");

  const getFullPrompt = () => {
    const base = problem?.prompt ?? "";
    return executionMode === "simulation"
      ? SIMULATION_PREFIX + base
      : PRODUCTION_PREFIX + base;
  };

  const copyPrompt = () => {
    if (!problem?.prompt) return;
    navigator.clipboard.writeText(getCopyPrompt());
    setCopied(true);
    toast({ title: "Prompt copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    if (!problem?.prompt) return;
    setHasExecuted(true);
    await execute(
      getFullPrompt(),
      executionMode === "production" ? userData : undefined,
      "execute",
      executionMode === "production" && userApiKey.trim() ? userApiKey.trim() : undefined,
      executionMode === "production" && userProvider ? userProvider : undefined
    );
  };

  const handleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpInput.trim() || executing) return;
    const q = followUpInput.trim();
    setFollowUpInput("");
    await followUp(q);
  };

  const handleProductionKeySubmit = (provider: string, key: string) => {
    setProductionKey({ provider, key });
    setUserApiKey(key);
    setUserProvider(provider);
    toast({ title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API key configured`, description: "Production Mode is now active." });
  };

  // ─── FIX 2: PDF EXPORT ─────────────────────────────────────────────────────
  // Root cause of blank PDF: html2canvas does not render elements positioned
  // at left:-9999px because they are outside the viewport bounding box.
  // Fix: position:fixed + opacity:0 keeps the element in the render tree
  // (html2canvas captures it) while hiding it from the user.
  const handleDownloadPDF = async () => {
    const contentEl = document.getElementById("execution-output");
    if (!contentEl || !contentEl.innerHTML.trim()) {
      toast({
        title: "Nothing to export",
        description: "Run the prompt first.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    let wrapper: HTMLDivElement | null = null;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdf = (await import("html2pdf.js" as any)).default;

      wrapper = document.createElement("div");
      wrapper.style.cssText =
        "width:794px;padding:40px 48px;background:#ffffff;color:#1e293b;" +
        "font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
        "font-size:13px;line-height:1.6;" +
        "position:fixed;top:0;left:0;z-index:-9999;opacity:0;pointer-events:none;";

      const dateStr = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const year = new Date().getFullYear();
      const title = problem?.title ?? "AI Solved Business Problems";
      const problemId = problem?.id ?? "Report";

      wrapper.innerHTML =
        `<div style="display:flex;align-items:center;justify-content:space-between;` +
        `margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #e74c3c;">` +
        `<div>` +
        `<div style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;` +
        `color:#e74c3c;margin-bottom:4px;">AISBS EXECUTION REPORT</div>` +
        `<div style="font-size:20px;font-weight:800;color:#1e293b;">${problemId}: ${title}</div>` +
        `<div style="font-size:12px;color:#64748b;margin-top:2px;">Generated: ${dateStr}</div>` +
        `</div></div>` +
        contentEl.innerHTML +
        `<div style="margin-top:32px;padding-top:12px;border-top:1px solid #e2e8f0;` +
        `text-align:center;font-size:11px;color:#94a3b8;">` +
        `AI Solved Business Problems \u2014 Generated by AISBS Execution Console<br/>` +
        `\u00a9 ${year} Davor Mulali\u0107. All rights reserved.</div>`;

      document.body.appendChild(wrapper);

      // Allow browser to complete layout and font loading
      await new Promise<void>((resolve) => setTimeout(resolve, 800));

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `AISBS-${problemId}-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: 794,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: { mode: ["css", "legacy"] },
      };

      await html2pdf().set(opt).from(wrapper).save();

    } catch (err) {
      console.error("PDF export failed:", err);
      toast({
        title: "PDF export failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      if (wrapper && document.body.contains(wrapper)) {
        document.body.removeChild(wrapper);
      }
      setIsExporting(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <AppLayout>
        <div className="w-full py-16 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
          <div className="h-4 w-32 animate-pulse rounded bg-card mb-4" />
          <div className="h-10 w-80 animate-pulse rounded bg-card mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            {[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse rounded-lg bg-card border border-border" />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!problem) {
    return (
      <AppLayout>
        <div className="px-10 py-16 text-center">
          <p className="text-muted-foreground">Problem not found.</p>
          <Link to="/" className="text-primary mt-4 inline-block">← Back to dashboard</Link>
        </div>
      </AppLayout>
    );
  }

  const sections = (problem.sections || {}) as Record<string, string>;
  const failureModes = (problem.failure_modes || []) as Array<{
    number: number; title: string; symptom: string; root_cause: string; recovery: string;
  }>;
  const roiData = (problem.roi_data || {}) as {
    investment?: number; annual_savings?: number; payback_months?: number;
    year1_roi_percent?: number;
    metrics?: Array<{ label: string; before: number; after: number; unit: string }>;
  };

  const confidencePercent = (problem.confidence / 10) * 100;
  const promptabilityPercent = (problem.promptability / 10) * 100;
  const subtitle = CHAPTER_SUBTITLES[problem.chapter_number] || "";

  return (
    <AppLayout>
      <div className="w-full py-6 sm:py-8 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] font-semibold text-primary mb-4">
          <span>Problem {problem.id}</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-sm text-muted-foreground">Problem {problem.id}</span>
              <Badge variant="outline" className={severityStyles[problem.severity] || ""}>
                {problem.severity}
              </Badge>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{problem.title}</h1>
            {problem.narrative_hook && (
              <blockquote className="mt-4 pl-4 border-l-3 border-primary italic text-base sm:text-lg text-muted-foreground leading-relaxed" style={{ textAlign: 'justify' }}>
                "{problem.narrative_hook}"
              </blockquote>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
            <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <div className="text-xs text-muted-foreground mb-1.5">Confidence</div>
              <div className="font-display text-lg font-bold text-foreground mb-2">{problem.confidence}/10</div>
              <Progress value={confidencePercent} className="h-1.5" />
            </div>
            <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <div className="text-xs text-muted-foreground mb-1.5">Promptability</div>
              <div className="font-display text-lg font-bold text-foreground mb-2">{problem.promptability}/10</div>
              <Progress value={promptabilityPercent} className="h-1.5" />
            </div>
            <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <div className="text-xs text-muted-foreground mb-1.5">Budget</div>
              <div className="font-display text-sm sm:text-base font-semibold text-foreground">{problem.budget || "N/A"}</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
              <div className="text-xs text-muted-foreground mb-1.5">Timeline</div>
              <div className="font-display text-sm sm:text-base font-semibold text-foreground">{problem.timeline || "N/A"}</div>
            </div>
          </div>

          {/* Sections */}
          {sectionConfig.map(({ key, label, icon: Icon }) => {
            let content = sections[key];
            if (!content) return null;
            for (const prefix of stripPrefixes) {
              if (content.startsWith(prefix)) { content = content.substring(prefix.length); break; }
            }
            if (content.startsWith(label + "\n")) content = content.substring(label.length + 1);
            return (
              <motion.div key={key} className="mb-8" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3 flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  {label}
                </h2>
                <div className="pl-3 border-l-2 border-border">
                  <RichTextContent content={content} collapsible={content.length > 800} defaultCollapsed={content.length > 1200} />
                </div>
              </motion.div>
            );
          })}

          {/* ROI Chart */}
          {roiData.metrics && roiData.metrics.length > 0 && (
            <motion.div className="mb-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
                  <BarChart3 className="h-4 w-4" />
                </div>
                ROI Analysis
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {roiData.investment != null && (
                  <div className="rounded-lg bg-card border border-border p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Investment</div>
                    <div className="font-display text-lg font-bold text-foreground">${(roiData.investment / 1000).toFixed(0)}K</div>
                  </div>
                )}
                {roiData.annual_savings != null && (
                  <div className="rounded-lg bg-card border border-primary/20 p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Annual Savings</div>
                    <div className="font-display text-lg font-bold text-primary">${(roiData.annual_savings / 1000).toFixed(0)}K</div>
                  </div>
                )}
                {roiData.payback_months != null && (
                  <div className="rounded-lg bg-card border border-border p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Payback</div>
                    <div className="font-display text-lg font-bold text-foreground">
                      {roiData.payback_months < 1 ? `${Math.round(roiData.payback_months * 30)} days` : `${roiData.payback_months} mo`}
                    </div>
                  </div>
                )}
                {roiData.year1_roi_percent != null && (
                  <div className="rounded-lg bg-card border border-primary/20 p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">Year 1 ROI</div>
                    <div className="font-display text-lg font-bold text-primary">{roiData.year1_roi_percent}%</div>
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Before vs After AI Implementation</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={roiData.metrics} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(value: number, name: string) => [value, name === "before" ? "Before" : "After"]} />
                      <Bar dataKey="before" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} name="before" />
                      <Bar dataKey="after" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="after" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Before</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">After</th>
                        <th className="text-right py-2 text-muted-foreground font-medium">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roiData.metrics.map((m, i) => {
                        const change = m.after - m.before;
                        const pct = m.before !== 0 ? ((change / m.before) * 100).toFixed(0) : "N/A";
                        return (
                          <tr key={i} className="border-b border-border/50">
                            <td className="py-2 text-foreground">{m.label}</td>
                            <td className="py-2 text-right text-muted-foreground">{m.before}{m.unit && ` ${m.unit}`}</td>
                            <td className="py-2 text-right font-semibold text-foreground">{m.after}{m.unit && ` ${m.unit}`}</td>
                            <td className={cn("py-2 text-right font-semibold", change > 0 ? "text-primary" : "text-destructive")}>
                              {change > 0 ? "+" : ""}{pct}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Failure Modes */}
          {failureModes.length > 0 && (
            <motion.div className="mb-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-destructive/10 text-destructive shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                Failure Modes & Recovery
              </h2>
              <div className="space-y-2">
                {failureModes.map((fm, i) => {
                  const isOpen = expandedFailureMode === i;
                  return (
                    <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                      <button onClick={() => setExpandedFailureMode(isOpen ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/50 transition-colors">
                        <h3 className="font-display text-sm font-semibold text-foreground">
                          <span className="text-destructive">#{fm.number}</span> — {fm.title}
                        </h3>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
                              <div className="flex gap-3 items-start">
                                <div className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-0.5">Symptom</div>
                                <p className="text-sm text-muted-foreground">{fm.symptom}</p>
                              </div>
                              <div className="flex gap-3 items-start">
                                <div className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-0.5">Root Cause</div>
                                <p className="text-sm text-muted-foreground">{fm.root_cause}</p>
                              </div>
                              <div className="flex gap-3 items-start">
                                <div className="w-20 shrink-0 text-xs font-semibold uppercase tracking-wider text-primary pt-0.5">Recovery</div>
                                <p className="text-sm text-muted-foreground">{fm.recovery}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Prompt + Execution Console */}
          {problem.prompt && (
            <motion.div className="mb-10" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-primary shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  AI Execution Prompt
                </h2>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={copyPrompt} className="gap-1.5">
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="default" size="sm" onClick={() => setShowPromptExec(!showPromptExec)} className="gap-1.5">
                    <Play className="h-3.5 w-3.5" />
                    {showPromptExec ? "Hide Console" : "Execute"}
                  </Button>
                </div>
              </div>

              {/* FIX 1: Preview uses getCopyPrompt() — shows ⚠️ prefix to user */}
              <Collapsible open={promptExpanded} onOpenChange={setPromptExpanded}>
                <div className="rounded-xl border border-primary/20 bg-primary/5 overflow-hidden">
                  <pre className="p-4 sm:p-5 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto max-h-48">
                    {getCopyPrompt().substring(0, 600)}...
                  </pre>
                  <CollapsibleContent>
                    <pre className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
                      {getCopyPrompt().substring(600)}
                    </pre>
                  </CollapsibleContent>
                  <CollapsibleTrigger asChild>
                    <button className="w-full py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors border-t border-primary/10 flex items-center justify-center gap-1">
                      {promptExpanded
                        ? <>Collapse prompt <ChevronUp className="h-3 w-3" /></>
                        : <>View full prompt ({(getCopyPrompt().length / 1000).toFixed(1)}K chars) <ChevronDown className="h-3 w-3" /></>}
                    </button>
                  </CollapsibleTrigger>
                </div>
              </Collapsible>

              {/* Execution Console */}
              <AnimatePresence>
                {showPromptExec && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="mt-4 rounded-xl border border-border bg-card flex flex-col min-h-[50vh]">
                      {/* Console Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 sm:px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-primary" />
                          <h3 className="font-display text-sm font-bold text-foreground">Execution Console</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasExecuted && messages.length > 0 && (
                            <>
                              <Button variant="outline" size="sm" onClick={handleDownloadPDF} disabled={isExporting || !hasExecuted || messages.length === 0} className="gap-1.5">
                                {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                                {isExporting ? "Generating..." : "PDF Report"}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => { clear(); setHasExecuted(false); }} className="gap-1.5 h-7 text-xs">
                                <Trash2 className="h-3 w-3" /> Clear
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Mode Selection */}
                      {!hasExecuted && (
                        <div className="px-3 sm:px-4 py-3 border-b border-border space-y-3">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button onClick={() => setExecutionMode("simulation")} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${executionMode === "simulation" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                              <Database className="h-3.5 w-3.5" /> SIMULATION MODE
                            </button>
                            <button onClick={() => { setExecutionMode("production"); setShowPremiumDialog(true); }} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${executionMode === "production" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
                              <Upload className="h-3.5 w-3.5" /> PRODUCTION MODE
                              {!productionKey && <button onClick={(e) => { e.stopPropagation(); setShowPremiumDialog(true); }} className="ml-1 opacity-70 hover:opacity-100"><Info className="h-3 w-3" /></button>}
                            </button>
                          </div>

                          {executionMode === "simulation" && (
                            <p className="text-xs text-muted-foreground">
                              AI will generate realistic, high-fidelity industry-appropriate sample data tailored to <strong className="text-foreground">Problem {problem.id}</strong>.
                            </p>
                          )}

                          {executionMode === "production" && (
                            <div className="space-y-2">
                              <label className="block text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Your Data</label>
                              {productionKey && (
                                <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                                  <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span className="text-xs text-foreground font-medium">{productionKey.provider.charAt(0).toUpperCase() + productionKey.provider.slice(1)} key active</span>
                                  <button onClick={() => { setProductionKey(null); setUserApiKey(""); setUserProvider(""); setShowPremiumDialog(true); }} className="ml-auto text-[10px] text-muted-foreground hover:text-primary transition-colors">Change</button>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 cursor-pointer rounded-lg border border-input bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
                                  <Upload className="h-3.5 w-3.5" />
                                  Upload File
                                  <input
                                    type="file"
                                    accept=".txt,.csv,.json,.md"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onload = (ev) => setUserData(ev.target?.result as string ?? "");
                                      reader.readAsText(file);
                                      e.target.value = "";
                                    }}
                                  />
                                </label>
                                <span className="text-[10px] text-muted-foreground">TXT · CSV · JSON · MD</span>
                                {userData && (
                                  <button onClick={() => setUserData("")} className="ml-auto text-[10px] text-muted-foreground hover:text-destructive transition-colors">Clear</button>
                                )}
                              </div>
                              <textarea
                                value={userData}
                                onChange={(e) => setUserData(e.target.value)}
                                placeholder="Paste your data here, or upload a file above..."
                                rows={5}
                                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y font-mono"
                              />
                              {userData && (
                                <p className="text-[10px] text-muted-foreground">{userData.length.toLocaleString()} characters loaded</p>
                              )}
                            </div>
                          )}

                          <Button onClick={handleExecute} disabled={executing || !problem.prompt} className="gap-2 w-full sm:w-auto">
                            <Play className="h-4 w-4" />
                            {executing ? "Executing..." : "Execute Prompt"}
                          </Button>
                        </div>
                      )}

                      {/* Response Area */}
                      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-4">
                        {!hasExecuted && !executing && (
                          <div className="flex flex-col items-center justify-center h-full text-center py-8 text-muted-foreground">
                            <Bot className="h-8 w-8 mb-3 opacity-20" />
                            <p className="text-xs sm:text-sm">Configure execution mode and run the prompt to begin analysis.</p>
                          </div>
                        )}

                        {messages.map((msg, idx) => {
                          if (msg.role === "user" && idx === 0) return null;
                          if (msg.role === "user") {
                            return (
                              <div key={msg.id} className="flex justify-end">
                                <div className="max-w-[90%] sm:max-w-[85%] rounded-xl bg-primary text-primary-foreground px-3 sm:px-4 py-2 text-xs sm:text-sm">{msg.content}</div>
                              </div>
                            );
                          }
                          const cleanContent = stripMetricsBlock(msg.content);
                          const isLastAssistant = msg.role === "assistant" && messages.slice(idx + 1).every(m => m.role !== "assistant");
                          return (
                            <div key={msg.id}>
                              <div
                                id={isLastAssistant ? "execution-output" : undefined}
                                className="prose-exec text-xs sm:text-sm leading-[1.7] text-foreground"
                                dangerouslySetInnerHTML={{ __html: normalizeAiHtml(cleanContent) }}
                              />
                              <ResponseVisuals content={msg.content} />
                            </div>
                          );
                        })}

                        {executing && messages[messages.length - 1]?.role !== "assistant" && (
                          <div className="flex items-center gap-3 text-muted-foreground text-xs">
                            <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            Processing analysis...
                          </div>
                        )}
                        <div ref={bottomRef} />
                      </div>

                      {/* Follow-up Input */}
                      {hasExecuted && !executing && messages.length > 0 && (
                        <div className="border-t border-border px-3 sm:px-4 py-2.5">
                          <form onSubmit={handleFollowUp} className="flex gap-2">
                            <input value={followUpInput} onChange={e => setFollowUpInput(e.target.value)} placeholder="Ask a follow-up question..." className="flex-1 rounded-lg border border-input bg-secondary px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" disabled={executing} />
                            <Button type="submit" size="icon" disabled={executing || !followUpInput.trim()}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ASMP IDs */}
          {problem.asmp_ids && problem.asmp_ids.length > 0 && (
            <div className="mb-10">
              <h2 className="font-display text-lg font-semibold text-foreground mb-3">Research Citations</h2>
              <div className="flex flex-wrap gap-2">
                {problem.asmp_ids.map(aid => (
                  <Badge key={aid} variant="outline" className="font-mono text-xs">{aid}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prev/Next Navigation */}
          <nav className="flex items-stretch gap-3 mt-12 mb-4">
            {prevProblem ? (
              <Link to={`/problem/${prevProblem.id}`} className="flex-1 group rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors text-left">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><ArrowLeft className="h-3 w-3" /> Previous</div>
                <div className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{prevProblem.id}: {prevProblem.title}</div>
              </Link>
            ) : <div className="flex-1" />}
            {nextProblem ? (
              <Link to={`/problem/${nextProblem.id}`} className="flex-1 group rounded-xl border border-border bg-card p-4 hover:border-primary/30 transition-colors text-right">
                <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mb-1">Next <ArrowRight className="h-3 w-3" /></div>
                <div className="font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{nextProblem.id}: {nextProblem.title}</div>
              </Link>
            ) : <div className="flex-1" />}
          </nav>
        </motion.div>
      </div>

      <ProductionModeDialog open={showPremiumDialog} onClose={() => setShowPremiumDialog(false)} onKeySubmit={handleProductionKeySubmit} />
    </AppLayout>
  );
}
