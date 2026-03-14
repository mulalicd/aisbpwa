import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useProblems } from "@/hooks/useProblems";
import { useIndustries } from "@/hooks/useIndustries";
import { useExecutionChat } from "@/hooks/useExecutionChat";
import { motion } from "framer-motion";
import { Play, Copy, Check, BookOpen, Zap, Send, Database, Upload, Trash2, Bot, Info, Search, ShieldCheck, KeyRound, FileDown, Loader2} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ResponseVisuals, stripMetricsBlock } from "@/components/execution/ResponseVisuals";
import { ProductionModeDialog } from "@/components/execution/ProductionModeDialog";
import { normalizeAiHtml } from "@/lib/aiHtml";

type ExecutionMode = "simulation" | "production";

export default function PromptExecutionPage() {
  useDocumentTitle("Prompt Execution Console");
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get("problem") || "";
  const { data: industries } = useIndustries();
  const { data: allProblems, isLoading } = useProblems();
  const { messages, isLoading: executing, execute, followUp, clear } = useExecutionChat();

  const [selectedProblemId, setSelectedProblemId] = useState(problemId);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("simulation");
  const [userData, setUserData] = useState("");
  const [userApiKey, setUserApiKey] = useState("");
  const [userProvider, setUserProvider] = useState("");
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [productionKey, setProductionKey] = useState<{ provider: string; key: string } | null>(null);
  const [followUpInput, setFollowUpInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [hasExecuted, setHasExecuted] = useState(false);
  const [problemSearch, setProblemSearch] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const problem = allProblems?.find(p => p.id === selectedProblemId);
  const industry = industries?.find(i => i.chapter_number === problem?.chapter_number);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    clear();
    setHasExecuted(false);
    setUserData("");
  }, [selectedProblemId, clear]);

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

  // COPY PREFIX — for external platforms (ChatGPT, Claude, Gemini, Grok etc.)
  // Must ask user for THEIR real data. Do NOT simulate. Opposite of SIMULATION_PREFIX.
  const COPY_PREFIX =
    "\u26a0\ufe0f AISBS PROMPT \u2014 INSTRUCTIONS FOR AI:\n\n" +
    "This is a structured business analysis prompt from the book \"AI Solved Business Problems\" by Davor Mulali\u0107.\n\n" +
    "BEFORE YOU BEGIN: You must ask me to provide my real business data.\n" +
    "DO NOT generate sample data. DO NOT simulate. DO NOT start analysis without my data.\n" +
    "Ask me clearly: \"Please provide your [specific data required by this prompt] and I will run the full analysis.\"\n\n" +
    "Once I provide my data, execute the full analysis immediately and completely.\n\n";

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

  const handleDownloadPDF = async () => {
    const contentEl = document.getElementById("execution-output");
    if (!contentEl || !contentEl.innerHTML.trim()) {
      toast({ title: "Nothing to export", description: "Run the prompt first.", variant: "destructive" });
      return;
    }
    setIsExporting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const html2pdf = (await import("html2pdf.js" as any)).default;
      // Capture the live DOM element directly — no wrapper div.
      // Wrapper approach fails in production: opacity:0 blocks html2canvas,
      // and CSS custom properties don't resolve on off-screen clones.
      await html2pdf().set({
        margin: [12, 10, 12, 10],
        filename: `AISBS-${problem?.id ?? "Report"}-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: "#ffffff", logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      }).from(contentEl).save();
    } catch (err) {
      console.error("PDF export failed:", err);
      toast({ title: "PDF export failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Group problems by industry
  const groupedProblems = industries?.map(ind => ({
    industry: ind,
    problems: allProblems?.filter(p => p.chapter_number === ind.chapter_number).sort((a, b) => a.id.localeCompare(b.id)) || [],
  })).filter(g => g.problems.length > 0) || [];

  const filteredGroups = problemSearch.trim()
    ? groupedProblems.map(g => ({
        ...g,
        problems: g.problems.filter(p =>
          p.id.toLowerCase().includes(problemSearch.toLowerCase()) ||
          p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
          g.industry.name.toLowerCase().includes(problemSearch.toLowerCase())
        ),
      })).filter(g => g.problems.length > 0)
    : groupedProblems;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="w-full max-w-7xl mx-auto py-16 px-4 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="w-full max-w-7xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-5 md:px-8 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Header */}
          <header className="mb-5 sm:mb-6 border-b-4 border-primary pb-4 sm:pb-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-semibold text-primary mb-2">
              <Zap className="h-3.5 w-3.5" />
              Intelligent Asset / Execution Controller
            </div>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-black text-foreground">
              Prompt Execution Console
            </h1>
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              Select a business problem, execute the AI prompt, and explore results interactively.
            </p>
          </header>

          {/* Interactive Problem Selector */}
          <div className="mb-5 sm:mb-6">
            <label className="block text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">
              Select Business Problem
            </label>
            <div className="relative">
              <button
                onClick={() => setSelectorOpen(!selectorOpen)}
                className="w-full flex items-center justify-between rounded-lg border border-input bg-card px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-foreground hover:border-primary/40 transition-colors"
              >
                {problem ? (
                  <span className="truncate">
                    <span className="font-mono text-primary font-semibold">[{problem.id}]</span>{" "}
                    {problem.title}
                    <span className="text-muted-foreground ml-2">— {industry?.name}</span>
                  </span>
                ) : (
                  <span className="text-muted-foreground">— Choose a problem —</span>
                )}
                <Search className="h-4 w-4 text-muted-foreground shrink-0 ml-2" />
              </button>

              {selectorOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setSelectorOpen(false)} />
                  <div className="absolute z-40 top-full mt-1 left-0 right-0 rounded-xl border border-border bg-card shadow-xl max-h-[60vh] overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-border">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          value={problemSearch}
                          onChange={e => setProblemSearch(e.target.value)}
                          placeholder="Search problems by ID, title, or industry..."
                          className="w-full pl-8 pr-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {filteredGroups.map(g => (
                        <div key={g.industry.id}>
                          <div className="px-3 py-1.5 bg-secondary/50 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground sticky top-0">
                            Ch. {g.industry.chapter_number} — {g.industry.name}
                          </div>
                          {g.problems.map(p => (
                            <button
                              key={p.id}
                              onClick={() => { setSelectedProblemId(p.id); setSelectorOpen(false); setProblemSearch(""); }}
                              className={cn(
                                "w-full text-left px-4 py-2.5 text-sm hover:bg-secondary/80 transition-colors flex items-center gap-2",
                                p.id === selectedProblemId ? "bg-primary/10 text-primary font-medium" : "text-foreground"
                              )}
                            >
                              <span className="font-mono text-xs text-primary shrink-0 w-8">{p.id}</span>
                              <span className="truncate">{p.title}</span>
                              <Badge variant="outline" className={cn("ml-auto text-[9px] shrink-0", severityColor(p.severity))}>{p.severity}</Badge>
                            </button>
                          ))}
                        </div>
                      ))}
                      {filteredGroups.length === 0 && (
                        <div className="p-6 text-center text-muted-foreground text-sm">No problems match your search.</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Split View */}
          {problem && (
            <div className="grid grid-cols-1 lg:grid-cols-[28fr_72fr] gap-4 sm:gap-5">
              {/* Left: Reference Blueprint */}
              <div className="rounded-xl border border-border bg-card p-3 sm:p-4 md:p-5 overflow-y-auto max-h-[85vh] lg:sticky lg:top-16">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <h2 className="font-display text-sm sm:text-base font-bold text-foreground">Reference Blueprint</h2>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Problem</span>
                    <p className="font-semibold text-foreground mt-0.5 text-xs sm:text-sm">{problem.id}: {problem.title}</p>
                  </div>
                  {industry && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Industry</span>
                      <p className="text-foreground mt-0.5 text-xs sm:text-sm">{industry.name}</p>
                    </div>
                  )}
                  {problem.narrative_hook && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Narrative Hook</span>
                      <p className="italic text-muted-foreground mt-0.5 border-l-2 border-primary pl-3 text-[11px] sm:text-xs">"{problem.narrative_hook}"</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Execution Prompt</span>
                    <div className="mt-1.5 bg-secondary/50 rounded-lg p-2 sm:p-2.5 text-[10px] sm:text-[11px] font-mono text-foreground/80 whitespace-pre-wrap max-h-[200px] sm:max-h-[250px] overflow-y-auto leading-relaxed">
                      {getCopyPrompt() || "No prompt available."}
                    </div>
                    <Button variant="outline" size="sm" onClick={copyPrompt} className="mt-2 gap-1.5 h-7 text-xs">
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                  </div>
                  <Link to={`/problem/${problem.id}`} className="text-xs text-primary hover:underline block mt-2">
                    ← View full problem analysis
                  </Link>
                </div>
              </div>

              {/* Right: Execution Console */}
              <div className="rounded-xl border border-border bg-card flex flex-col min-h-[60vh] sm:min-h-[70vh]">
                {/* Console Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-border px-3 sm:px-4 md:px-5 py-2.5 sm:py-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <h2 className="font-display text-sm sm:text-base font-bold text-foreground">Execution Console</h2>
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

                {/* Mode Selection + Execute */}
                {!hasExecuted && (
                  <div className="px-3 sm:px-4 md:px-5 py-3 sm:py-4 border-b border-border space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => setExecutionMode("simulation")}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${executionMode === "simulation" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                      >
                        <Database className="h-3.5 w-3.5" /> SIMULATION MODE
                      </button>
                      <button
                        onClick={() => { setExecutionMode("production"); setShowPremiumDialog(true); }}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${executionMode === "production" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                      >
                        <Upload className="h-3.5 w-3.5" /> PRODUCTION MODE
                        {!productionKey && (
                          <button onClick={(e) => { e.stopPropagation(); setShowPremiumDialog(true); }} className="ml-1 opacity-70 hover:opacity-100">
                            <Info className="h-3 w-3" />
                          </button>
                        )}
                      </button>
                    </div>

                    {executionMode === "simulation" && (
                      <p className="text-xs text-muted-foreground">
                        AI will generate realistic, high-fidelity industry-appropriate sample data tailored to <strong className="text-foreground">Problem {problem.id}</strong> to demonstrate the prompt's full analytical power.
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


                    <Button
                      onClick={handleExecute}
                      disabled={executing || !problem.prompt}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Play className="h-4 w-4" />
                      {executing ? "Executing..." : "Execute Prompt"}
                    </Button>
                  </div>
                )}

                {/* Response Area */}
                <div className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-5 py-3 sm:py-4 space-y-4">
                  {!hasExecuted && !executing && (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8 sm:py-12 text-muted-foreground">
                      <Bot className="h-8 sm:h-10 w-8 sm:w-10 mb-3 opacity-20" />
                      <p className="text-xs sm:text-sm">Configure execution mode and run the prompt to begin analysis.</p>
                    </div>
                  )}

                  {messages.map((msg, idx) => {
                    if (msg.role === "user" && idx === 0) return null;
                    if (msg.role === "user") {
                      return (
                        <div key={msg.id} className="flex justify-end">
                          <div className="max-w-[90%] sm:max-w-[85%] rounded-xl bg-primary text-primary-foreground px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm">
                            {msg.content}
                          </div>
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
                    <div className="flex items-center gap-3 text-muted-foreground text-xs sm:text-sm">
                      <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Processing analysis...
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>

                {/* Follow-up Input */}
                {hasExecuted && !executing && messages.length > 0 && (
                  <div className="border-t border-border px-3 sm:px-4 md:px-5 py-2.5 sm:py-3">
                    <form onSubmit={handleFollowUp} className="flex gap-2">
                      <input
                        value={followUpInput}
                        onChange={e => setFollowUpInput(e.target.value)}
                        placeholder="Ask a follow-up question..."
                        className="flex-1 rounded-lg border border-input bg-secondary px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        disabled={executing}
                      />
                      <Button type="submit" size="icon" disabled={executing || !followUpInput.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {!problem && !isLoading && (
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              <Zap className="h-8 sm:h-10 w-8 sm:w-10 mx-auto mb-3 opacity-20" />
              <p className="text-xs sm:text-sm">Select a business problem above to begin execution.</p>
            </div>
          )}
        </motion.div>
      </div>

      <ProductionModeDialog
        open={showPremiumDialog}
        onClose={() => setShowPremiumDialog(false)}
        onKeySubmit={handleProductionKeySubmit}
      />
    </AppLayout>
  );
}

function severityColor(s: string) {
  if (s === "HIGH") return "border-destructive/30 text-destructive";
  if (s === "MEDIUM") return "border-primary/30 text-primary";
  return "border-border text-muted-foreground";
}
