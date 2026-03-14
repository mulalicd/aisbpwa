import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { Problem } from "@/lib/types";

const severityStyles: Record<string, string> = {
  HIGH: "bg-destructive/15 text-destructive border-destructive/30",
  MEDIUM: "bg-primary/15 text-primary border-primary/30",
  LOW: "bg-muted text-muted-foreground border-border",
};

export function ProblemCard({ problem, index }: { problem: Problem; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
    >
      <Link
        to={`/problem/${problem.id}`}
        className="group block rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <span className="font-mono text-xs text-muted-foreground">{problem.id}</span>
          <Badge variant="outline" className={severityStyles[problem.severity] || severityStyles.MEDIUM}>
            {problem.severity}
          </Badge>
        </div>
        <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
          {problem.title}
        </h3>
        {problem.narrative_hook && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {problem.narrative_hook}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {problem.budget && (
            <span className="flex items-center gap-1">
              💰 {problem.budget}
            </span>
          )}
          {problem.timeline && (
            <span className="flex items-center gap-1">
              ⏱ {problem.timeline}
            </span>
          )}
          <span>
            📊 {problem.confidence}/10
          </span>
          {problem.prompt && (
            <span className="text-primary font-medium">
              ✦ Has Prompt
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
