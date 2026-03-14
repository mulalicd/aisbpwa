import { AppLayout } from "@/components/AppLayout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { motion } from "framer-motion";

const chapters = [
  {
    number: 1, title: "LOGISTICS & SUPPLY CHAIN", items: [
      { id: "ASMP-LSC-001", source: "Gartner (2024)", title: "The State of Supply Chain Planning: Breaking the Human Middleware Cycle" },
      { id: "ASMP-LSC-002", source: "Logistics Management (2024)", title: "Annual Warehouse and Distribution Center Usage Report: The Hidden Cost of Detention" },
      { id: "ASMP-LSC-003", source: "Capgemini Research Institute (2024)", title: "Supply Chain Visibility: From Data Streams to Actionable Orchestration" },
      { id: "ASMP-LSC-004", source: "Council of Supply Chain Management Professionals (CSCMP) (2023)", title: "State of Logistics Report: Freight Audit and Payment Accuracy Benchmarks" },
      { id: "ASMP-LSC-005", source: "Aberdeen Strategy & Research (2024)", title: "Dynamic Route Optimization: Fuel and Labor Productivity in the Last Mile" },
      { id: "ASMP-LSC-007", source: "Supply Chain Dive (2024)", title: "The High Cost of Silence: Quantifying the Early Warning Gap in Tier-N Supply Chains" },
    ],
  },
  {
    number: 2, title: "EDUCATION & EDTECH", items: [
      { id: "ASMP-EDU-001", source: "Deloitte / Harris Poll (2024)", title: "The Gen Z ROI Revolt: Perceptions of Higher Education and the Skills-First Economy" },
      { id: "ASMP-EDU-002", source: "The Chronicle of Higher Education (2023)", title: "The Administrative Lattice: Tracking 20 Years of Institutional Headcount" },
      { id: "ASMP-EDU-003", source: "Inside Higher Ed (2024)", title: "The Retention Signal: Identifying Student Disengagement Before the Midterm" },
      { id: "ASMP-EDU-004", source: "National Association of College and University Business Officers (NACUBO) (2024)", title: "Tuition Discounting and Revenue Management Study" },
      { id: "ASMP-EDU-005", source: "Chronicle Intelligence (2024)", title: "The Transfer Friction Report: Credit Evaluation Latency and Enrollment Melt" },
      { id: "ASMP-EDU-006", source: "Gartner Education (2024)", title: "Predictive Analytics in Student Success: Benchmarking Retention ROI" },
    ],
  },
  {
    number: 3, title: "HR & TALENT MANAGEMENT", items: [
      { id: "ASMP-HR-001", source: "Society for Human Resource Management (SHRM) (2024)", title: "Talent Acquisition Benchmarking Report: Time-to-Fill and Cost-per-Hire" },
      { id: "ASMP-HR-002", source: "Workhuman iQ (2024)", title: "The Silent Departure: Correlating Manager Sentiment to Regrettable Attrition" },
      { id: "ASMP-HR-003", source: "Gallup / Deloitte (2024)", title: "The Real Cost of Turnover: Disengagement, Recruitment, and Onboarding Multipliers" },
      { id: "ASMP-HR-004", source: "LinkedIn Economic Graph (2024)", title: "The Vacancy Tax: Quantifying Lost Revenue from Open Mid-Market Roles" },
      { id: "ASMP-HR-005", source: "Harvard Business Review (2024)", title: "AI in the Front Office: Case Studies in High-Volume Candidate Screening" },
    ],
  },
  {
    number: 4, title: "MANUFACTURING", items: [
      { id: "ASMP-MFG-001", source: "National Association of Manufacturers (NAM) (2024)", title: "The Knowledge Gap: Quantifying the Impact of the Silver Tsunami on Plant Productivity" },
      { id: "ASMP-MFG-002", source: "Deloitte Smart Factory Study (2024)", title: "Unlocking Dark Data: The OEE Impact of Real-Time Root Cause Analysis" },
      { id: "ASMP-MFG-003", source: "IndustryWeek (2024)", title: "The Hidden Waste: Measuring Non-Productive Labor in the Discrete Shop Floor" },
      { id: "ASMP-MFG-004", source: "IndustryWeek (2023)", title: "The True Cost of Unplanned Downtime: Tier-1 and Tier-2 Benchmarks" },
      { id: "ASMP-MFG-005", source: "McKinsey & Company (2024)", title: "AI in Manufacturing: Moving from Predictive Maintenance to Prescriptive Action" },
      { id: "ASMP-MFG-006", source: "Manufacturer's Alliance (2024)", title: "The Cost of Quality: Reducing Scrap and Rework through Signal Correlation" },
    ],
  },
  {
    number: 5, title: "RETAIL & E-COMMERCE", items: [
      { id: "ASMP-RET-001", source: "National Retail Federation (NRF) (2024)", title: "The Retail Returns Report: Consumer Behavior and Operational Impacts" },
      { id: "ASMP-RET-002", source: "Gartner Retail (2024)", title: "Inventory Turn Optimization: Mid-Market vs. World-Class Performance Gaps" },
      { id: "ASMP-RET-003", source: "Optoro (2024)", title: "The Reverse Logistics Crisis: Calculating the Total Cost of a Return" },
      { id: "ASMP-RET-004", source: "Shopify / Klaviyo (2024)", title: "Relevance and Retention: The Impact of Fit-Accuracy on Customer Lifetime Value" },
    ],
  },
  {
    number: 6, title: "HEALTHCARE & PHARMA", items: [
      { id: "ASMP-HCP-001", source: "Kaiser Family Foundation (KFF) / American Hospital Association (2024)", title: "The Denial Trend: Tracking Payer Behavior in the AI Era" },
      { id: "ASMP-HCP-002", source: "Healthcare Financial Management Association (HFMA) (2024)", title: "Revenue Cycle Excellence: Clean Claim Ratios and Rework Costs" },
      { id: "ASMP-HCP-003", source: "American Medical Association (AMA) / MGMA (2024)", title: "The Burnout Audit: Clinician Turnover and Institutional Stability" },
      { id: "ASMP-HCP-004", source: "Clinical Trials Arena (2024)", title: "The Recruitment Bottleneck: Identifying Attrition in Phase II and III Enrollment" },
      { id: "ASMP-HCP-005", source: "Tufts Center for the Study of Drug Development (2023)", title: "Clinical Trial Latency: The Impact of Enrollment Delays on Patent Life" },
      { id: "ASMP-HCP-006", source: "Deloitte Healthcare AI (2024)", title: "Augmenting the Appeals Process: Success Rates in Automated Claim Defense" },
      { id: "ASMP-HCP-007", source: "PhRMA (2024)", title: "Accelerating the Pipeline: The Impact of Automated Patient Selection on Commercialization" },
    ],
  },
  {
    number: 7, title: "FINANCE & BANKING", items: [
      { id: "ASMP-FIN-001", source: "Oliver Wyman / McKinsey Banking (2024)", title: "Commercial Banking Excellence: The Onboarding Experience as a Competitive Advantage" },
      { id: "ASMP-FIN-002", source: "Gartner Finance (2024)", title: "The Close-to-Commentary Gap: FP&A Latency and Strategic Drift" },
      { id: "ASMP-FIN-003", source: "Accenture (2024)", title: "The Regulatory Burden: Manual Documentation Costs in Mid-Market Finance" },
      { id: "ASMP-FIN-004", source: "Reuters / Financial Action Task Force (FATF) (2024)", title: "The Signal and the Noise: False Positive Rates in Modern AML Systems" },
      { id: "ASMP-FIN-005", source: "PwC AI in Finance (2024)", title: "Automating the Narrative: The Impact of LLMs on Financial Reporting Efficiency" },
      { id: "ASMP-FIN-006", source: "Aite-Novarica (2024)", title: "KYC Modernization: Benchmarking Time-to-Onboard for Corporate Lending" },
    ],
  },
  {
    number: 8, title: "MARKETING & SALES", items: [
      { id: "ASMP-MKT-001", source: "Harvard Business Review / InsideSales (2024)", title: "The Speed-to-Lead Benchmark: Response Latency and Conversion Decay" },
      { id: "ASMP-MKT-002", source: "Forbes / Salesforce (2024)", title: "The State of Sales: Time Allocation and Content Utilization Studies" },
      { id: "ASMP-MKT-003", source: "LeadResponseManagement.org (2024)", title: "The Golden Window: Lead Contact Ratios and Pipeline Velocity" },
      { id: "ASMP-MKT-004", source: "Gong.ai (2024)", title: "Revenue Intelligence: The Impact of Personalization on Demo-to-Close Rates" },
    ],
  },
  {
    number: 9, title: "IT & DIGITAL TRANSFORMATION", items: [
      { id: "ASMP-ITT-001", source: "Gartner / Forrester (2024)", title: "IT Budget Allocation: Run, Grow, and Transform Spend Analysis" },
      { id: "ASMP-ITT-002", source: "Computerworld (2024)", title: "The AI Talent War: Skill-Driven Turnover in Mid-Market IT Departments" },
      { id: "ASMP-ITT-003", source: "McKinsey Technology (2024)", title: "The Tech Debt Tax: Quantifying the Interest on Legacy Infrastructure" },
      { id: "ASMP-ITT-004", source: "Flexera (2024)", title: "State of the Cloud: SaaS Waste, Duplication, and Optimization Opportunities" },
      { id: "ASMP-ITT-005", source: "Splunk / Datadog (2024)", title: "AI-Ops Benchmarking: Reducing MTTR through Automated Log Diagnosis" },
      { id: "ASMP-ITT-006", source: "DORA / Google Cloud (2024)", title: "Accelerate: State of DevOps Report - Documentation and System Resilience" },
    ],
  },
  {
    number: 10, title: "SUSTAINABILITY & NGO", items: [
      { id: "ASMP-SUS-001", source: "Gartner / ESG Today (2024)", title: "The Compliance Burden: Labor Allocation in ESG and CSRD Reporting" },
      { id: "ASMP-SUS-002", source: "Philanthropy News Digest / Stanford Social Innovation (2024)", title: "The Evidence Gap: The Impact of Data Latency on Donor Retention" },
      { id: "ASMP-SUS-003", source: "GrantStation (2024)", title: "The State of Grant Seeking: Time and Resource Allocation Trends" },
      { id: "ASMP-SUS-004", source: "Oxford Economics / PwC Sustainability (2024)", title: "The ESG Reporting Cost Study: Corporate and Non-Profit Benchmarks" },
      { id: "ASMP-SUS-005", source: "South Pole (2024)", title: "The Green-hushing Report: Risks and Realities of Climate Disclosure" },
      { id: "ASMP-SUS-006", source: "McKinsey Sustainability (2024)", title: "From Reporting to Action: Using AI to Solve the ESG Knowledge Bottleneck" },
      { id: "ASMP-SUS-007", source: "Blackbaud (2024)", title: "Digital Trends in Philanthropy: Grant Success Rates and Narrative Adaptation" },
    ],
  },
];

export default function BibliographyPage() {
  useDocumentTitle("Master Bibliography");

  return (
    <AppLayout>
      <div className="w-full py-8 md:py-12 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Header */}
          <header className="mb-12 border-b-4 border-primary pb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-widest text-foreground mb-4">
              Master Bibliography
            </h1>
            <p className="text-muted-foreground italic max-w-3xl">
              This Master Bibliography provides the traceability audit trail for all ASMP (Assumption Tracking System) IDs referenced across the 10 chapters. Each entry represents the Tier-1 and Tier-2 research used to calculate the financial materiality, conservative targets, and failure mode diagnostics within the book framework.
            </p>
          </header>

          {/* Chapters */}
          <div className="space-y-16">
            {chapters.map((chapter) => (
              <section key={chapter.number} className="relative">
                <div className="absolute -left-4 md:-left-8 top-0 text-6xl font-black text-muted/40 select-none">
                  {chapter.number < 10 ? `0${chapter.number}` : chapter.number}
                </div>
                <div className="relative pl-4">
                  <h3 className="text-xl font-bold text-muted-foreground mb-8 uppercase tracking-widest border-b border-border pb-2">
                    Chapter {chapter.number} — <span className="text-foreground">{chapter.title}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {chapter.items.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <span className="font-mono text-xs font-bold text-primary shrink-0 pt-1">
                          {item.id}
                        </span>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground italic uppercase tracking-wider">
                            {item.source}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* Footer */}
          <footer className="mt-24 pt-12 border-t-2 border-border text-center text-muted-foreground text-sm italic">
            "Scientia potentia est" — Every decision in this workbook is grounded in empirical research.
          </footer>
        </motion.div>
      </div>
    </AppLayout>
  );
}
