import { AppLayout } from "@/components/AppLayout";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { motion } from "framer-motion";

export default function AfterwordPage() {
  useDocumentTitle("Afterword — The Architect of the New Precision");

  return (
    <AppLayout>
      <div className="w-full py-8 md:py-12 px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* Header */}
          <header className="mb-12 border-b-4 border-primary pb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-widest text-foreground mb-4">
              AFTERWORD
            </h1>
            <p className="text-xl font-bold text-muted-foreground italic">
              The Architect of the New Precision
            </p>
          </header>

          {/* Content */}
          <div className="space-y-6 text-lg leading-relaxed text-foreground/85" style={{ textAlign: 'justify' }}>
            <p>
              You have just traveled through fifty of the most expensive, exhausting, and recurring bottlenecks in modern business. From the freight docks of global logistics to the compliance offices of regional banks, and from the high-stakes clinics of modern healthcare to the frantic "war rooms" of B2B sales, we have exposed the same fundamental truth in every sector.
            </p>

            <p className="text-2xl font-black text-foreground py-4 border-y border-border my-8">
              The "Human Middleware" era is over.
            </p>

            <p>
              For the last twenty years, we have built a world where our most talented people were used as manual data-bridges. We asked our best engineers to act as librarians for old code, our best clinicians to act as data-entry clerks for EHRs, and our best salespeople to act as search engines for prospect research. We didn't do this by choice; we did it because our software was rigid while our reality was fluid.
            </p>

            <p>
              As you close this book, I want you to remember the most important lesson from the trenches:
              <span className="font-bold underline decoration-primary ml-1">AI is not a "technology project." AI is an organizational reset.</span>
            </p>

            <p>
              The blueprints I've provided in these ten chapters are designed to liberate your team from the linear grind. But the transition from "Firefighter" to "Orchestrator" is not a simple software update. It requires the courage to dismantle the "Legacy Fortress" and the humility to learn from the failures documented in every Section 8 of this book.
            </p>

            <p>
              I didn't include those "What Goes Wrong & How to Recover" playbooks to discourage you. I included them because, in my twenty-five years of operations, I've learned that trust is built in the recovery, not the perfection. Your team will hit a "hallucinated clause" or a "data-latency spike." Your IT department will initially block the API. Your senior experts will feel threatened by the "Digital Twin."
            </p>

            <p>
              When those moments happen, and they will, don't retreat to the manual safety of the past. Use the recovery protocols. Tune the prompts. Debug the hallways.
            </p>

            <p>
              You are no longer just a manager of resources; you are the architect of an intelligent operating system. You now have the tools to close the "Decision Gap" that has been hollowing out your margins for a decade. You have the prompts (provided in this book) to turn these narratives into executable reality.
            </p>

            <p>
              The 2 AM phone calls aren't going to stop. But after today, they won't be about a machine that broke or a lead that went cold. They will be about how to handle the sudden, explosive growth that comes when an organization finally stops fighting its data and starts orchestrating its future.
            </p>

            <p className="font-bold pt-8 mt-12 border-t border-primary" style={{ textAlign: 'left' }}>
              It's time to stop counting the past and start building the precision era.
            </p>
            <p className="font-bold text-foreground" style={{ textAlign: 'left' }}>
              Go get started.
            </p>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
