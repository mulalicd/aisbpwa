import { useParams, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useIndustries } from "@/hooks/useIndustries";
import { useProblems } from "@/hooks/useProblems";
import { AppLayout } from "@/components/AppLayout";
import { RichTextContent } from "@/components/RichTextContent";
import { CHAPTER_SUBTITLES } from "@/lib/constants";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export default function IndustryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: industries } = useIndustries();
  const industry = industries?.find(i => i.slug === slug);
  const { data: problems, isLoading } = useProblems(industry?.chapter_number);
  useDocumentTitle(industry ? `Ch. ${industry.chapter_number}: ${industry.name}` : undefined);

  if (!industry) {
    return (
      <AppLayout>
        <div className="px-10 py-16 text-center">
          <p className="text-muted-foreground">Industry not found.</p>
          <Link to="/" className="text-primary mt-4 inline-block">← Back to dashboard</Link>
        </div>
      </AppLayout>
    );
  }

  const subtitle = CHAPTER_SUBTITLES[industry.chapter_number] || "";

  return (
    <AppLayout>
      <div className="w-full px-4 sm:px-6 md:px-10 lg:px-14 xl:px-20 py-6 sm:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] font-semibold text-primary mb-4">
          <span>Sector Overview</span>
          <span className="text-muted-foreground">/</span>
          <span>Chapter {industry.chapter_number}</span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-8 sm:mb-10"
        >
          {industry.name} - {subtitle}
        </motion.h1>

        {/* Executive Brief */}
        {industry.description && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-10 sm:mb-12"
          >
            <div className="border-l-4 border-primary pl-4 sm:pl-6">
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                Executive Brief
              </span>
              <div className="mt-3">
                <RichTextContent
                  content={industry.description}
                  collapsible={industry.description.length > 1500}
                  defaultCollapsed={industry.description.length > 2000}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Strategic Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">Strategic Challenges</h2>

          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-card border border-border" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {problems?.map((p, i) => {
                const pNum = p.id.split(".")[1] || String(i + 1);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.25 }}
                  >
                    <Link
                      to={`/problem/${p.id}`}
                      className="group flex items-center gap-3 sm:gap-5 rounded-xl border border-border bg-card p-4 sm:p-5 hover:border-primary/30 hover:shadow-md transition-all"
                    >
                      <div className="flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-2xl bg-foreground text-background shrink-0">
                        <span className="font-display text-lg sm:text-xl md:text-2xl font-bold">
                          {industry.chapter_number}.{pNum}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                          Problem {p.id}
                        </span>
                        <h3 className="font-display text-sm sm:text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors mt-0.5">
                          {p.title}
                        </h3>
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
