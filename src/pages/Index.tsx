import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useIndustries } from "@/hooks/useIndustries";
import { AppLayout } from "@/components/AppLayout";
import { CHAPTER_SUBTITLES } from "@/lib/constants";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function Index() {
  const { data: industries, isLoading } = useIndustries();
  useDocumentTitle();

  return (
    <AppLayout>
      {/* Hero — Book Cover Style */}
      <section className="px-6 sm:px-10 md:px-14 pt-10 md:pt-16 lg:pt-20 pb-6">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="font-display font-black text-foreground uppercase leading-[0.9] tracking-tight"
          style={{ fontSize: "clamp(48px, 8vw, 110px)" }}
        >
          AI SOLVED
          <br />
          BUSINESS
          <br />
          PROBLEMS
        </motion.h1>

        <hr className="my-6 md:my-8 border-t border-border" />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="text-muted-foreground"
          style={{ fontSize: "clamp(16px, 2vw, 22px)", fontWeight: 500, lineHeight: 1.4 }}
        >
          <div>50 Real-World Challenges from 10 Industries</div>
          <div>A Manager's Workbook</div>
        </motion.div>

        <hr className="my-6 md:my-8 border-t border-border" />
      </section>

      {/* Table of Contents */}
      <section className="px-6 sm:px-10 md:px-14 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {/* Preface link */}
          <Link
            to="/preface"
            className="group flex items-baseline gap-4 py-4 hover:bg-secondary/30 transition-colors -mx-3 px-3 rounded mb-6"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary shrink-0 w-20">
              Preface
            </span>
            <span className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              The Method, The Warning, The Discipline
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </Link>

          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Table of Contents</h2>
          <hr className="mb-8 border-t border-border" />

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-secondary" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {industries?.map((ind, i) => {
                const subtitle = CHAPTER_SUBTITLES[ind.chapter_number] || "";
                return (
                  <motion.div
                    key={ind.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <Link
                      to={`/industry/${ind.slug}`}
                      className="group flex items-baseline gap-4 py-4 hover:bg-secondary/30 transition-colors -mx-3 px-3 rounded"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground shrink-0 w-20">
                        Chapter {ind.chapter_number}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                          {ind.name}
                        </span>
                        <span className="ml-2 text-sm italic text-muted-foreground hidden sm:inline">
                          — {subtitle}
                        </span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="mt-10 text-foreground font-semibold"
          style={{ fontSize: "clamp(18px, 2vw, 26px)" }}
        >
          Davor Mulalić
        </motion.div>
      </section>
    </AppLayout>
  );
}
