import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, BookOpen, PenLine, Library, BookA, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/AppSidebar";

import { useIndustries } from "@/hooks/useIndustries";
import { useUserRole } from "@/hooks/useUserRole";
import { CHAPTER_SUBTITLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: industries } = useIndustries();
  const { isAdmin } = useUserRole();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[280px] overflow-y-auto"
            style={{ background: "hsl(var(--sidebar-bg))" }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <Link to="/" onClick={() => setMobileMenuOpen(false)}>
                <h1 className="font-display text-sm font-black uppercase leading-tight tracking-tight text-white">
                  AI SOLVED<br />BUSINESS<br />PROBLEMS
                </h1>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="px-4 mt-2">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--sidebar-heading))]">Main</span>
              <Link to="/" onClick={() => setMobileMenuOpen(false)}
                className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
                  location.pathname === "/" ? "bg-white/10 text-white" : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                )}>
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/preface" onClick={() => setMobileMenuOpen(false)}
                className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
                  location.pathname === "/preface" ? "bg-white/10 text-white" : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                )}>
                <BookOpen className="h-4 w-4" /> Preface
              </Link>
              <Link to="/afterword" onClick={() => setMobileMenuOpen(false)}
                className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
                  location.pathname === "/afterword" ? "bg-white/10 text-white" : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                )}>
                <PenLine className="h-4 w-4" /> Afterword
              </Link>
            </nav>
            <nav className="px-4 mt-6">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--sidebar-heading))]">Resources</span>
              <Link to="/bibliography" onClick={() => setMobileMenuOpen(false)}
                className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
                  location.pathname === "/bibliography" ? "bg-white/10 text-white" : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                )}>
                <Library className="h-4 w-4" /> Bibliography
              </Link>
              <Link to="/index-terms" onClick={() => setMobileMenuOpen(false)}
                className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
                  location.pathname === "/index-terms" ? "bg-white/10 text-white" : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                )}>
                <BookA className="h-4 w-4" /> Index of Terms
              </Link>
              <Link to="/prompt-execution" onClick={() => setMobileMenuOpen(false)}
                className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
                  location.pathname === "/prompt-execution" ? "bg-white/10 text-white" : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                )}>
                <Zap className="h-4 w-4" /> Prompt Execution
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}
                  className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
                    location.pathname === "/admin" ? "bg-white/10 text-white" : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                  )}>
                  <ShieldAlert className="h-4 w-4" /> Admin Panel
                </Link>
              )}
            </nav>
            <nav className="px-4 mt-6 flex-1">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--sidebar-heading))]">Chapters</span>
              <div className="mt-2 space-y-0.5">
                {industries?.map(ind => {
                  const path = `/industry/${ind.slug}`;
                  const active = location.pathname.startsWith(path);
                  const subtitle = CHAPTER_SUBTITLES[ind.chapter_number] || "";
                  return (
                    <Link key={ind.id} to={path} onClick={() => setMobileMenuOpen(false)}
                      className={cn("block rounded-lg px-3 py-2 text-sm leading-snug transition-colors",
                        active ? "bg-[hsl(var(--sidebar-active))] text-white font-medium" : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                      )}>
                      {ind.name}{subtitle ? ` - ${subtitle}` : ""}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 min-h-screen overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-3 sm:px-6 md:px-10 py-2 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <a href="https://aisbp.ai-studio.wiki/" target="_blank" rel="noopener noreferrer" className="hidden md:block">
              <motion.div
                className="px-6 py-3 rounded-lg font-display text-sm font-bold text-white tracking-wide cursor-pointer select-none"
                style={{
                  background: "linear-gradient(180deg, hsl(0 72% 48%) 0%, hsl(0 72% 38%) 100%)",
                  boxShadow: "0 2px 8px hsl(0 72% 41% / 0.4), inset 0 1px 0 hsl(0 72% 60% / 0.3)"
                }}
                animate={{
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    "0 2px 8px hsl(0 72% 41% / 0.4), inset 0 1px 0 hsl(0 72% 60% / 0.3)",
                    "0 4px 20px hsl(0 72% 41% / 0.7), inset 0 1px 0 hsl(0 72% 60% / 0.3)",
                    "0 2px 8px hsl(0 72% 41% / 0.4), inset 0 1px 0 hsl(0 72% 60% / 0.3)"
                  ]
                }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ scale: 1.12 }}
              >
                AISBP Framework™
              </motion.div>
            </a>
          </div>
          <div className="flex-1" />
          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] leading-tight text-muted-foreground text-right">
              For specialized implementation support, training, or executive consulting:
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              <a href="mailto:mulalic.davor@outlook.com" className="text-primary font-semibold hover:underline">mulalic.davor@outlook.com</a>
              <span className="text-muted-foreground">|</span>
              <a href="https://mulalic.ai-studio.wiki/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">mulalic.ai-studio.wiki</a>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
