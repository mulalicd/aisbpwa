import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProblems } from "@/hooks/useProblems";
import { useIndustries } from "@/hooks/useIndustries";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const severityStyles: Record<string, string> = {
  HIGH: "bg-destructive/15 text-destructive border-destructive/30",
  MEDIUM: "bg-primary/15 text-primary border-primary/30",
  LOW: "bg-muted text-muted-foreground border-border",
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: problems } = useProblems();
  const { data: industries } = useIndustries();

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIdx(0);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim() || !problems) return [];
    const q = query.toLowerCase();
    return problems
      .filter(p => {
        const industryName = industries?.find(i => i.chapter_number === p.chapter_number)?.name || "";
        return (
          p.title.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.narrative_hook?.toLowerCase().includes(q) ||
          p.severity?.toLowerCase().includes(q) ||
          industryName.toLowerCase().includes(q)
        );
      })
      .slice(0, 8);
  }, [query, problems, industries]);

  useEffect(() => setSelectedIdx(0), [query]);

  const handleSelect = (id: string) => {
    navigate(`/problem/${id}`);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      handleSelect(results[selectedIdx].id);
    }
  };

  // Highlight matching text
  const highlight = (text: string) => {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-foreground rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Search problems...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-background px-1.5 font-mono text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-[15%] z-[101] w-[90vw] max-w-lg -translate-x-1/2 rounded-xl border border-border bg-card shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search 50 business problems..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                {query && results.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No problems found for "{query}"
                  </div>
                )}
                {results.map((p, i) => {
                  const ind = industries?.find(ind => ind.chapter_number === p.chapter_number);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(p.id)}
                      className={cn(
                        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors",
                        i === selectedIdx ? "bg-primary/5" : "hover:bg-secondary/50"
                      )}
                    >
                      <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0 w-8">{p.id}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {highlight(p.title)}
                        </div>
                        {ind && (
                          <span className="text-xs text-muted-foreground">{ind.name}</span>
                        )}
                      </div>
                      <Badge variant="outline" className={cn("shrink-0 text-[10px]", severityStyles[p.severity] || "")}>
                        {p.severity}
                      </Badge>
                    </button>
                  );
                })}
              </div>

              {!query && (
                <div className="p-4 text-xs text-muted-foreground text-center">
                  Type to search across all problems by title, ID, severity, or industry
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
