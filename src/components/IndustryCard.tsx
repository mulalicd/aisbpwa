import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Truck, GraduationCap, Users, Factory, ShoppingCart,
  Heart, DollarSign, BarChart3, Monitor, Leaf
} from "lucide-react";
import type { Industry } from "@/lib/types";

const iconMap: Record<string, React.ElementType> = {
  Truck, GraduationCap, Users, Factory, ShoppingCart,
  Heart, DollarSign, BarChart3, Monitor, Leaf,
};

export function IndustryCard({ industry, index }: { industry: Industry; index: number }) {
  const Icon = iconMap[industry.icon] || Monitor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Link
        to={`/industry/${industry.slug}`}
        className="group block rounded-lg border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-md"
      >
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-secondary text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Ch. {industry.chapter_number}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {industry.name}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {industry.description}
        </p>
        <div className="mt-3 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          Explore 5 problems →
        </div>
      </Link>
    </motion.div>
  );
}
