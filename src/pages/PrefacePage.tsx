import { motion } from "framer-motion";
import { AppLayout } from "@/components/AppLayout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const PREFACE_SECTIONS = [
  {
    id: "epigraph",
    content: `Homo naturae minister et interpres tantum facit et intelligit, quantum de naturae ordine re vel mente observaverit: nec amplius scit aut potest.\n— Francis Bacon, Novum Organum (1620), Book I, Aphorism 1`,
    isQuote: true,
  },
  {
    id: "opening",
    content: `Your phone rings at 2:00 AM. It's not a security alarm. It's the Port of Long Beach telling you that your priority containers, the ones holding components for your Q3 product launch, are stuck behind a vessel that just lost power in the channel.

By 8:00 AM, your CFO will ask why "transportation variable costs" are decoupling from revenue. By 10:00 AM, the board will want to know about "working capital efficiency." By noon, you'll be explaining why the AI pilot you approved three months ago hasn't prevented this exact scenario.

This is not an AI problem. This is a business problem that AI can help you solve, if you know what you're doing.

Most books about AI will tell you it's transformative. They'll show you case studies of companies that "revolutionized their operations" and invite you to imagine similar success. They'll use words like "paradigm shift" and "strategic imperative" and "digital transformation."

This book will not do that.

Instead, it will give you fifty specific business problems, fifty executable prompts, and 150 documented failure modes with recovery playbooks. It will show you the math. It will cite its sources. It will tell you what goes wrong, why it goes wrong, and exactly how to fix it when it does.

Why? Because you don't need inspiration. You need Monday morning tactics.`,
  },
  {
    id: "whats-happening",
    title: "WHAT'S ACTUALLY HAPPENING",
    content: `If you're a Chief Supply Chain Officer, VP of Operations, CFO, or CIO at a mid-market company ($50M–$500M revenue), you already know the conversation around AI has become theater.

The consultants tell you: "AI will transform your supply chain."
The vendors tell you: "Our platform delivers 40–60% improvement."
Your board tells you: "Why aren't we doing this?"

What they don't tell you:
\t40% of first AI pilots fail due to data quality issues you can't see until week three
\tYour IT department will demand an 18-month architecture review (real reason: the last AI project failed and they got blamed)
\tYour best implementation will hit a failure mode — GPS latency, CSV format errors, carrier relationship friction — that no case study warned you about
\tWhen your pilot breaks at 4 PM on a Friday, you'll need an email template to send your CEO, not a vision statement

This book exists because you need the second conversation, not the first.`,
  },
  {
    id: "whats-different",
    title: "WHAT MAKES THIS DIFFERENT",
    content: `1. Every Problem Is Promptable (No ML Engineering Required)

Other AI books describe solutions that require data science teams, custom model training, and GPU infrastructure. Those aren't promptable — they're engineering projects disguised as AI solutions.

Every problem in this book scores ≥7.0 on the Promptability Index:
\tYou can test the core concept with ChatGPT, Claude, or Gemini today
\tNo custom ML models, no fine-tuning, no data science team
\tStandard LLM APIs + your existing data = deployable solution

Problem 1.1 (Freight Invoice Audit), Promptability 9.5/10
LLM extracts contract clauses from PDFs, compares to invoice line items, flags discrepancies. You can pilot this Monday with $0 infrastructure investment.

Problem 1.5 (Micro-Fulfillment Feasibility), Promptability 7.1/10
LLM runs diagnostic on your customer density data to assess if urban fulfillment centers are viable. It's a Go/No-Go analysis, not a promise.

This is the difference. We filtered 200+ potential problems. Only 50 made the cut. If it requires ML engineering, it's not in this book.

2. Conservative Financial Estimates (Lower Quartile, Not Median)

Consultants use median improvements to look impressive. We use lower quartile (25th percentile) from case studies.

Problem 1.1 ROI Calculation:
\t5 case studies show: 28%, 35%, 38%, 43%, 50% error recovery
\tConsultants would say: "38–43% improvement expected"
\tWe say: "35% conservative target (lower quartile)"

Why this matters: When you deliver 40%, you look prophetic. When consultants promise 43% and deliver 35%, they look incompetent.

Every ROI calculation in this book shows:
\tThe formula (no black boxes)
\tAll variables sourced (ASMP-ID citations, verifiable by CFO)
\tFour scenarios: Best case / Realistic / Conservative / Worst case
\tBreak-even threshold: "Even at 8.6% recovery, ROI is positive"

Your CFO can verify every number. That's not an accident — it's design.

3. Failure Modes = Competitive Advantage

McKinsey celebrates success. HBR publishes case studies of companies that "got it right."
We document what goes wrong.

150+ failure modes across 50 problems:
\tSymptom: What you see (AI sends 100 incorrect dispute emails)
\tRoot Cause: Why it happens (LLM misread blurry PDF fuel table)
\tDiagnostics: 3–5 questions to confirm this is your issue
\tRecovery: Immediate (24hr) → Short-term (2 weeks) → Long-term (prevention)
\tEmail Template: Copy-paste message to CEO when this happens Friday at 4 PM

Failure Mode #1 (GPS Latency):
60% of route optimization pilots hit this. AI suggests turns, but recommendations arrive 10 minutes late — after driver already passed the intersection.

Diagnostic: Check GPS upload frequency. Fix: Switch to manual trigger mode (24hr), then edge computing deployment (4 weeks).

This depth is unavailable anywhere else. Competitors tell you what works. We tell you what breaks and how to fix it.

4. Political Realism (Stated vs. REAL Reasons)

Other books: "Ensure stakeholder alignment through change management frameworks."

This book:

IT blocks you:
\tStated reason: "Security concerns"
\tREAL reason: Last AI project failed, they got blamed, don't want another failure on their record
\tShadow Path: Pilot <$50K (below procurement radar), <30 days (too fast for architecture review), read-only mode (zero production risk)

Finance blocks you:
\tStated reason: "No budget for experimental technology"
\tREAL reason: Burned by $2.4M ERP upgrade that took 4 years instead of 1
\tShadow Path: Use "operational efficiency fund," frame as "process audit" not "AI implementation"

This is the organizational reality no one documents. We do.`,
  },
  {
    id: "method",
    title: "THE METHOD",
    content: `Nemo huc sana mente carens ingrediatur — "Let no one lacking sanity enter here"

If you bought this book thinking AI is magic, return it.
If you bought it thinking AI is irrelevant, same advice.

What's here is structured method.

The 8-Section Framework (Every Problem):

SECTION 1 — The Operational Reality
Not "companies face logistics challenges" but "Your AP clerk approved a $2,800 invoice with a $150 residential surcharge to a distribution center at 3 PM Friday because they're too exhausted to cross-reference the 50-page carrier contract."

SECTION 2 — Why Traditional Methods Fail
Not "legacy systems are inefficient" but "Your rules-based audit software breaks when a carrier changes 'Fuel-S' to 'F-Surcharge' because it can't adapt to naming variations."

SECTION 3 — The Manager's Decision Point
Three options: Do nothing (honest pros/cons), Traditional enhancement (realistic ROI), AI-augmented (transparent trade-offs including learning curve). No straw men. All three are viable in some context.

SECTION 4 — The AI-Augmented Workflow
"Monday morning at 9:15 AM, your AP clerk sees that Carrier X charged residential surcharges on 42 shipments to Warehouse 402, a commercial address per Contract Clause 7.2. AI has drafted the dispute email citing page 23, paragraph 4. Clerk reviews, approves, dispute sent. 20 hours of forensic work → 15 minutes."

SECTION 5 — The Execution Prompt
2,200–2,400 word executable prompt. Platform-agnostic (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Grok). Copy-paste ready. Includes input specifications, methodology steps, validation checkpoints, red flags.

SECTION 6 — The Business Case
All formulas shown. All variables sourced. Conservative estimates. Sensitivity analysis. Break-even threshold. Your CFO can verify independently.

SECTION 7 — Industry Context & Next Steps
Not "this is transformative" but "40% of logistics companies deployed this by 2024. The question isn't 'does it work', it's 'why are you still bleeding $250K annually?'"

SECTION 8 — What Goes Wrong & How to Recover
3–5 failure modes per problem. This is where the book earns its shelf space. When your pilot hits Failure Mode #2 (CSV format errors) at 4 PM Friday, you open to page 47, run the diagnostic questions, execute the 24-hour recovery plan, email your CEO using the template.

This is operations manual discipline applied to AI deployment.`,
  },
  {
    id: "whats-not",
    title: "WHAT'S NOT IN THE BOOK",
    content: `No transformation narratives. Success stories leave out the failures, false starts, expensive mistakes. We're not selling you a vision.

No predictions about AI's future. Technology evolves. Business problems don't. Freight invoices will have errors in 2030 just like they do in 2026. The prompt might simplify, but the problem remains.

No case studies about companies that "revolutionized with AI." Most are marketing. What we provide instead: 5 documented implementations per problem, with company context, approach, results, and source citations. You verify the research, not trust the narrative.

No debate about AI ethics. Real issues. Not what this book is about. This book is about method. If you want societal implications, there are other books.

No generic advice. Every problem includes specific dollar amounts, specific error rates, specific diagnostic thresholds. Not "billing errors are common" but "6% of freight invoices contain errors (ASMP-LSC-004: Aberdeen Group, 2023, n=500 companies). At $12M annual spend, that's $720K leakage."`,
  },
  {
    id: "who",
    title: "WHO THIS IS FOR",
    content: `Primary audience:
\tChief Supply Chain Officers, VPs Operations, CFOs, CIOs
\tMid-market companies ($50M–$500M revenue)
\t15–25 years industry experience
\tUnder immense pressure, deeply skeptical, profoundly isolated

You're managing three crises simultaneously that would have been career-defining a decade ago. Now they're Tuesday.

You're sitting on $14M of slow-moving inventory costing 22% annually, but every time you try to lean out, a port strike threatens stockout. Your freight spend is up 34%, but you're being nickel-and-dimed by detention fees your team has no time to audit. Your best planners are quitting because they're functioning as human macros between your AS/400 and Excel.

You're not failing at your job. You're succeeding at managing a system designed for 2012.

The board wants transformation. IT wants 18-month architecture reviews. Finance wants guaranteed ROI before investment. Legal raises data privacy concerns they can't articulate. You're stuck: blamed for problems you can't fix because the organization won't let you implement solutions.

This book is your shadow path.`,
  },
  {
    id: "how",
    title: "HOW TO USE THIS BOOK",
    content: `First Read → Your Industry
Start with your industry. Read all 5 problems. Identify which crisis you're managing right now. That's Problem 1 for you.

Second Read → Pattern Recognition
Read the other 9 industries. You'll see the patterns. Structuring a logistics problem isn't fundamentally different from structuring an HR problem. The details change. The discipline doesn't.

Implementation → Monday Morning Test
Can you read Problem X on Friday, pilot it Monday morning, and show results by end of week?

If YES: Problem is book-worthy (promptable, financially material, politically feasible)
If NO: Problem requires ML engineering (doesn't belong in this book)

When Things Break → Section 8
Your pilot will hit failure modes. 30–40% of first implementations do. When your AI hallucinates phantom contract clauses at 4 PM Friday and your carrier threatens to blacklist you, you open to Section 8, run the diagnostics, execute the recovery plan, email your CEO.

This is when the book earns its price 10× over.`,
  },
  {
    id: "epistemology",
    title: "THE CORE EPISTEMOLOGICAL PROBLEM",
    content: `"Man, as the minister and interpreter of nature, does and understands only as much as he has observed of the order of nature by fact or mental reflection, beyond this he neither knows nor is able to do anything." — Francis Bacon

AI has the same limitation. It processes data. It finds patterns. It generates outputs based on statistical likelihood. It cannot verify whether those outputs are true. It cannot account for what it hasn't seen. It cannot tell you when it's wrong.

When you get an AI-generated freight audit report flagging 42 residential surcharges, you must decide: Is this accurate, or plausible nonsense?

If you lack domain knowledge: The tool is dangerous.
If you have domain knowledge: The tool is powerful.

Most managers fall into two traps:

Trap 1 — Treating AI output as authoritative
It's not. It's probabilistic. Sometimes highly accurate, sometimes completely wrong. The model can't tell you which.

Trap 2 — Dismissing AI entirely because it makes mistakes
Everything makes mistakes. The question is whether the error rate is acceptable given the context and whether you have recovery playbooks.

Both traps stem from not understanding what the tool actually does. This book gives you the method to avoid both.`,
  },
  {
    id: "why",
    title: "WHY I WROTE THIS",
    content: `Twenty-seven years across industries. Same patterns everywhere. Bad forecasting. Misaligned incentives. Poor cross-departmental communication. Reactive decision-making dressed up as agility.

AI doesn't fix any of that. But it makes some of it easier to see.

What pushed me to write this — watching smart people do catastrophically dumb things with AI. Not because they're incompetent, because they lack method.

They ask vague questions: "Optimize my supply chain."
They get vague answers: "Consider implementing predictive analytics."
They either trust blindly (dangerous) or dismiss entirely (wasteful).

There's a middle path:
\tStructure questions carefully (2,200-word prompts, not 20-word queries)
\tInterpret answers critically (run diagnostics, don't assume accuracy)
\tVerify everything that matters (CFO checks math, operations validates workflow)
\tDocument what breaks (failure modes + recovery playbooks)
\tBuild organizational muscle (each pilot makes next one 40% faster)

The fifty problems in this book are real. Operations, strategy, resource allocation, risk management. The prompts work — I've tested them across industries. But they're starting points, not final answers.

You still have to think.`,
  },
  {
    id: "warning",
    title: "FINAL WARNING",
    content: `This book assumes you're capable of critical thinking.

If you're looking for someone to tell you AI will solve your problems: Wrong book.
If you're looking for transformation narratives and consultant-speak: Wrong book.
If you want to copy prompts verbatim and never adapt them: Wrong book.

If you're looking for:
\tStructured method (8-section framework per problem)
\tExecutable tactics (50 copy-paste prompts)
\tFinancial rigor (conservative estimates, CFO-verifiable math)
\tFailure documentation (150 modes with recovery playbooks)
\tPolitical navigation (shadow paths, email templates)
\tPromptable solutions (no ML engineering required)

Then keep reading.

You either want operational discipline applied to AI deployment, or you don't.
If you do, turn the page.

January 2026
Sarajevo`,
  },
];

export default function PrefacePage() {
  useDocumentTitle("Preface");

  return (
    <AppLayout>
      <div className="w-full py-8 sm:py-12 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] font-semibold text-primary mb-4">
            <span>Preface</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
            PREFACE
          </h1>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8 sm:space-y-10">
          {PREFACE_SECTIONS.map((section, i) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              {section.title && (
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-4">
                  {section.title}
                </h2>
              )}
              {section.isQuote ? (
                <blockquote className="border-l-4 border-primary pl-5 py-2 italic text-base sm:text-lg text-muted-foreground leading-relaxed">
                  {section.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-2 not-italic text-sm text-muted-foreground/80" : ""}>
                      {line}
                    </p>
                  ))}
                </blockquote>
              ) : (
                <div className="space-y-4">
                  {section.content.split("\n\n").map((para, j) => {
                    // Tab-indented lines become bullet points
                    if (para.includes("\t")) {
                      const lines = para.split("\n");
                      return (
                        <div key={j} className="space-y-1">
                          {lines.map((line, k) => {
                            const trimmed = line.replace(/^\t/, "");
                            if (line.startsWith("\t")) {
                              return (
                                <div key={k} className="flex gap-2.5 text-sm sm:text-base text-muted-foreground pl-4" style={{ textAlign: 'justify' }}>
                                  <span className="text-primary mt-1 shrink-0">•</span>
                                  <span className="leading-relaxed">{trimmed}</span>
                                </div>
                              );
                            }
                            return (
                              <p key={k} className="text-sm sm:text-base text-muted-foreground leading-relaxed" style={{ textAlign: 'justify' }}>
                                {trimmed}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }
                    return (
                      <p key={j} className="text-sm sm:text-base text-muted-foreground leading-relaxed" style={{ textAlign: 'justify' }}>
                        {para}
                      </p>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Consulting link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="mt-12 pt-8 border-t border-border text-center"
        >
          <p className="text-sm text-muted-foreground mb-2">
            For specialized implementation support, training workshops, or executive consulting
          </p>
          <a
            href="https://mulalic.ai-studio.wiki/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
          >
            mulalic.ai-studio.wiki
          </a>
        </motion.div>
      </div>
    </AppLayout>
  );
}
