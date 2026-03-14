import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

const terms = [
  {
    letter: "A", items: [
      { term: "Administrative Bloat", definition: "The structural rise in non-instructional or non-clinical headcount, often growing at 3x the rate of core functions (Chapter 2, 6)." },
      { term: "Adverse Events (AE)", definition: "Any untoward medical occurrence in a patient or clinical investigation subject; a critical reporting mandate in Pharma (Chapter 6)." },
      { term: "AML (Anti-Money Laundering)", definition: "Legal requirements for financial institutions to prevent the disguising of illegally obtained funds (Chapter 7)." },
      { term: "API Chokepoint", definition: "A technical bottleneck where data flow between systems (e.g., AI to ERP) is delayed or throttled by legacy infrastructure (Chapter 9)." },
      { term: "ATS (Applicant Tracking System)", definition: "Legacy software used for recruitment that often fails due to rigid keyword filtering (Chapter 3)." },
      { term: "Audit Escapism", definition: "A state of cognitive overload where compliance staff skip critical red flags because they are buried in administrative noise (Chapter 7)." },
    ],
  },
  {
    letter: "B", items: [
      { term: "Basis Points (bps)", definition: "A unit of measure for interest rates and other percentages in finance; 1/100th of 1% (Chapter 7)." },
      { term: "Batch and Blast", definition: "A legacy marketing strategy of sending the same generic message to an entire database, resulting in engagement decay (Chapter 5, 8)." },
      { term: "Battlecards", definition: "Strategic documents used by sales teams to handle competitor-specific objections (Chapter 8)." },
      { term: "Beneficial Ownership (UBO)", definition: "The natural person who ultimately owns or controls a legal entity (Chapter 7)." },
      { term: "BOM (Bill of Materials)", definition: "A comprehensive inventory of the raw materials, assemblies, and components needed to manufacture a product (Chapter 4)." },
      { term: "Burnout Multiplier", definition: "The total financial cost of clinician or expert turnover, including replacement costs and lost throughput (Chapter 6)." },
    ],
  },
  {
    letter: "C", items: [
      { term: "CAC (Customer Acquisition Cost)", definition: "The total cost required to acquire a new customer, rising exponentially in the digital era (Chapter 5, 8)." },
      { term: "Carrier Ransom", definition: "The silent erosion of logistics margins through un-audited accessorial charges and detention fees (Chapter 1)." },
      { term: "Changeover Matrix", definition: "A mathematical map of the time required to switch a machine from producing one SKU to another (Chapter 4)." },
      { term: "Churn Radar", definition: "An AI-augmented tool used to detect \"Silent Churn\" by synthesizing linguistic signals in customer support logs (Chapter 8)." },
      { term: "CMMS (Computerized Maintenance Management System)", definition: "Software used to manage physical assets and maintenance logs (Chapter 4)." },
      { term: "Compliance Clock", definition: "The structural latency created by manual KYC or regulatory review processes (Chapter 7)." },
      { term: "Context Window", definition: "The maximum amount of data an LLM can \"remember\" during a single analysis; a failure point for long medical or legal files (Chapter 6, 9)." },
    ],
  },
  {
    letter: "D", items: [
      { term: "Dark Data", definition: "Millions of unanalyzed sensor pings, server logs, or maintenance notes that contain the root cause of systemic failures (Chapter 4, 9)." },
      { term: "Decision Gap", definition: "The time measured between a data signal (e.g., a late ship) and an operational action (e.g., a reroute) (Chapter 1)." },
      { term: "Denial Defender", definition: "An AI workflow designed to automate the clinical appeals process for rejected insurance claims (Chapter 6)." },
      { term: "DSCR (Debt Service Coverage Ratio)", definition: "A measurement of a firm's available cash flow to pay current debt obligations (Chapter 7)." },
      { term: "DSO (Days Sales Outstanding)", definition: "The average number of days it takes a company to receive payment for a sale (Chapter 6, 7)." },
    ],
  },
  {
    letter: "E", items: [
      { term: "EHR/EMR (Electronic Health Record)", definition: "Digital versions of patient paper charts, often the primary source of clinical documentation burnout (Chapter 6)." },
      { term: "Enrollment Cliff", definition: "The projected demographic decline in college-aged students, threatening institutional survival (Chapter 2)." },
      { term: "ESG (Environmental, Social, and Governance)", definition: "The three central factors in measuring the sustainability and ethical impact of an investment (Chapter 10)." },
      { term: "Evidence Latency", definition: "The delay in synthesizing field data, leading to a loss of donor or investor trust (Chapter 10)." },
      { term: "Excel Warriors", definition: "Planners or analysts who spend 4+ hours a day manually re-shuffling spreadsheets to manage complex schedules (Chapter 4, 7)." },
    ],
  },
  {
    letter: "F", items: [
      { term: "Fact-Integrity Guardrail", definition: "A prompt constraint that forbids an AI from paraphrasing or \"hallucinating\" statistics (Chapter 8, 10)." },
      { term: "FERPA", definition: "The Family Educational Rights and Privacy Act; a primary compliance hurdle for AI in education (Chapter 2)." },
      { term: "FinOps", definition: "A cultural practice and financial management discipline that uses AI to optimize cloud spend (Chapter 9)." },
      { term: "Freight Leak", definition: "The 5-8% error rate in logistics invoices that results in un-recovered overcharges (Chapter 1)." },
      { term: "Functional Specification", definition: "A document describing how a software module works; often missing in legacy \"technical debt\" stacks (Chapter 9)." },
    ],
  },
  {
    letter: "G", items: [
      { term: "GIGO (Garbage In, Garbage Out)", definition: "The principle that AI output quality is strictly limited by the cleanliness of the input data (Chapter 4, 10)." },
      { term: "GL Variance", definition: "The difference between the budgeted amount of expense or revenue and the actual amount (Chapter 7)." },
      { term: "Grant Weaver", definition: "An LLM-orchestrated workflow that personalizes a core impact narrative for multiple donor requirements (Chapter 10)." },
      { term: "Green-hushing", definition: "The practice of under-reporting sustainability goals to avoid the cost and risk of verification (Chapter 10)." },
    ],
  },
  {
    letter: "H", items: [
      { term: "Hallucination", definition: "An AI error where the model generates a factually incorrect but plausible-sounding statement (All Chapters)." },
      { term: "HCC (Hierarchical Condition Category)", definition: "A risk-adjustment model used by CMS to estimate future health care costs for patients (Chapter 6)." },
      { term: "HCM (Human Capital Management)", definition: "Enterprise software for managing human resources, often plagued by stale \"title-based\" data (Chapter 3)." },
      { term: "HIPAA", definition: "Health Insurance Portability and Accountability Act; the primary security standard for PHI (Chapter 6)." },
      { term: "Human Middleware", definition: "High-priced experts functioning as manual bridges between siloed systems (Foreword, All Chapters)." },
    ],
  },
  {
    letter: "I", items: [
      { term: "Impact Mirage", definition: "A state where administrative overhead hones in on a mission's capacity to deliver actual results (Chapter 10)." },
      { term: "Inclusion/Exclusion Criteria", definition: "Specific clinical requirements that determine whether a patient can participate in a drug trial (Chapter 6)." },
      { term: "Inventory Seesaw", definition: "The permanent state of being simultaneously out-of-stock on hero SKUs and overstocked on duds (Chapter 5)." },
      { term: "IoT (Internet of Things)", definition: "A network of physical objects embedded with sensors for data exchange (Chapter 4)." },
      { term: "ITSM (IT Service Management)", definition: "The activities performed by an organization to design, deliver, and control IT services (Chapter 9)." },
    ],
  },
  {
    letter: "K", items: [
      { term: "KYC (Know Your Customer)", definition: "The mandatory process of identifying and verifying the identity of clients in banking (Chapter 7)." },
    ],
  },
  {
    letter: "L", items: [
      { term: "Latency Tax", definition: "The direct financial loss caused by slow response times in sales, recruitment, or repairs (Chapter 3, 8)." },
      { term: "Lead Decay", definition: "The rapid decline in the probability of converting a lead into a deal as time passes from the initial inquiry (Chapter 8)." },
      { term: "Legacy Librarian", definition: "An AI workflow designed to document and decipher uncommented code in old technical stacks (Chapter 9)." },
      { term: "LMM (Large Multimodal Model)", definition: "An AI capable of processing both text and visual images for diagnosis or inspection (Chapter 4)." },
      { term: "LTV (Lifetime Value)", definition: "The total revenue a business can expect from a single customer account (Chapter 2, 5)." },
    ],
  },
  {
    letter: "M", items: [
      { term: "Maintenance Moat", definition: "The structural trap where 80% of an IT budget is spent on maintaining the past rather than building the future (Chapter 9)." },
      { term: "Markdown Madness", definition: "Forced price reductions required to clear SKU overhang caused by poor trend sensing (Chapter 5)." },
      { term: "MedDRA", definition: "The Medical Dictionary for Regulatory Activities; the global standard for Adverse Event terminology (Chapter 6)." },
      { term: "MTTR (Mean Time to Repair)", definition: "The average time required to troubleshoot and fix a failed system or machine (Chapter 4, 9)." },
    ],
  },
  {
    letter: "O", items: [
      { term: "OEE (Overall Equipment Effectiveness)", definition: "The gold standard for measuring manufacturing productivity (Availability x Performance x Quality) (Chapter 4)." },
      { term: "OCR (Optical Character Recognition)", definition: "Technology used to convert images of text (PDFs, Faxes) into machine-readable data (Chapter 6, 7)." },
      { term: "OTIF (On-Time-In-Full)", definition: "A supply chain metric measuring the percentage of orders delivered to the correct location on time (Chapter 1, 5)." },
    ],
  },
  {
    letter: "P", items: [
      { term: "PDP (Product Detail Page)", definition: "The specific page on an e-commerce site where a product's features and fit are described (Chapter 5)." },
      { term: "PHI (Protected Health Information)", definition: "Any information about health status, provision of health care, or payment for health care that can be linked to an individual (Chapter 6)." },
      { term: "PLC (Programmable Logic Controller)", definition: "The industrial computer used to control manufacturing processes (Chapter 4)." },
      { term: "Precision Collapse", definition: "The state where regulatory and technical requirements exceed the capacity of a manual workforce (Chapter 6)." },
      { term: "Prompt Engineering", definition: "The process of structuring text that can be interpreted and understood by a generative AI model (All Chapters)." },
    ],
  },
  {
    letter: "R", items: [
      { term: "RAF Score (Risk Adjustment Factor)", definition: "A relative measure of the cost of care for a patient; a primary driver of revenue in Value-Based Care (Chapter 6)." },
      { term: "RAG (Retrieval-Augmented Generation)", definition: "An AI architecture that \"grounds\" an LLM in specific, private documents to prevent hallucinations (Chapter 3, 7)." },
      { term: "Recency Bias", definition: "The human tendency to over-weight the most recent events when writing performance reviews or credit memos (Chapter 3, 7)." },
      { term: "ROI Revolt", definition: "The growing skepticism among students and parents regarding the value of traditional degrees (Chapter 2)." },
    ],
  },
  {
    letter: "S", items: [
      { term: "SaaS Waste", definition: "The 30% of software licenses that go unused or are duplicated across departments (Chapter 9)." },
      { term: "Scope 1, 2, and 3", definition: "Categorizations of greenhouse gas emissions, with Scope 3 representing the hardest-to-track supply chain emissions (Chapter 10)." },
      { term: "SDR (Sales Development Rep)", definition: "An entry-level sales role focused on lead qualification and research (Chapter 8)." },
      { term: "Shadow IT", definition: "Sanctioned software or hardware used by employees without the knowledge or approval of the IT department (Chapter 9)." },
      { term: "SIS (Student Information System)", definition: "The core database used by universities to manage student records (Chapter 2)." },
      { term: "SKU Overhang", definition: "Excess inventory of slow-moving products that hones in on warehouse space and capital (Chapter 5)." },
      { term: "SOP (Standard Operating Procedure)", definition: "A set of step-by-step instructions compiled by an organization to help workers carry out complex routine operations (Chapter 4)." },
    ],
  },
  {
    letter: "T", items: [
      { term: "Talent Velocity Trap", definition: "The reality where the workforce moves faster than HR's ability to track or trust it (Chapter 3)." },
      { term: "Technical Debt", definition: "The implied cost of additional rework caused by choosing an easy (limited) solution now instead of a better approach that would take longer (Chapter 9)." },
      { term: "Theory of Change", definition: "A comprehensive description of how and why a desired change is expected to happen in a particular context (Chapter 10)." },
      { term: "Time-to-Fill", definition: "The number of days between a job requisition being approved and a candidate accepting the offer (Chapter 3)." },
      { term: "Tribal Knowledge", definition: "Information known by a group of people but not formally documented; a major risk during retirement waves (Chapter 4)." },
    ],
  },
  {
    letter: "U", items: [
      { term: "Uncanny Valley (Marketing)", definition: "The state where automation is too generic to be personalized but too robotic to be trusted (Chapter 8)." },
      { term: "Unstructured Data", definition: "Information that either does not have a predefined data model or is not organized in a pre-defined manner (e.g., emails, PDF, audio) (All Chapters)." },
    ],
  },
  {
    letter: "V", items: [
      { term: "Value-Proposition Collapse", definition: "The structural crisis in industries (like Education) where traditional delivery models are being commoditized by AI (Chapter 2)." },
      { term: "Variance Analysis", definition: "The quantitative investigation of the difference between actual and planned behavior (Chapter 7)." },
      { term: "Visibility Paradox", definition: "The state of having more sensors and data than ever, but less actual operational certainty (Chapter 1)." },
    ],
  },
  {
    letter: "W", items: [
      { term: "WMS (Warehouse Management System)", definition: "Software designed to optimize warehouse or distribution center management (Chapter 1, 4)." },
    ],
  },
];

export default function IndexTermsPage() {
  useDocumentTitle("Index of Terms");
  const [search, setSearch] = useState("");

  const filtered = search.trim()
    ? terms.map(g => ({
        ...g,
        items: g.items.filter(
          i => i.term.toLowerCase().includes(search.toLowerCase()) ||
               i.definition.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(g => g.items.length > 0)
    : terms;

  return (
    <AppLayout>
      <div className="w-full py-8 md:py-12 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Header */}
          <header className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-widest text-foreground mb-4">
              Index of Terms
            </h1>
            <p className="text-muted-foreground italic mb-6" style={{ textAlign: 'justify' }}>
              This Index of Terms serves as your operational dictionary. It bridges the gap between the board-level "pains" and the AI-augmented "solutions" provided in the preceding chapters.
            </p>
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search terms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </header>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filtered.map((group) => (
              <div key={group.letter} className="space-y-6">
                <h3 className="text-4xl font-bold text-primary/20 border-b-2 border-border">
                  {group.letter}
                </h3>
                <div className="space-y-6">
                  {group.items.map((item) => (
                    <div key={item.term} className="group">
                      <h4 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                        {item.term}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border pl-4" style={{ textAlign: 'justify' }}>
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
