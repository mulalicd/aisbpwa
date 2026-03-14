import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, BookOpen, PenLine, Library, BookA, Zap, ShieldAlert, LogOut } from "lucide-react";
import { useIndustries } from "@/hooks/useIndustries";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { CHAPTER_SUBTITLES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: industries } = useIndustries();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch {
      // ignore
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="hidden md:flex flex-col w-[280px] shrink-0 min-h-screen overflow-y-auto"
      style={{ background: "hsl(var(--sidebar-bg))" }}
    >
      {/* Branding */}
      <Link to="/" className="px-6 pt-6 pb-4">
        <h1 className="font-display text-sm font-black uppercase leading-tight tracking-tight text-white">
          AI SOLVED<br />BUSINESS<br />PROBLEMS
        </h1>
      </Link>

      {/* Main nav */}
      <nav className="px-4 mt-2">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--sidebar-heading))]">
          Main
        </span>
        <Link
          to="/"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
            location.pathname === "/"
              ? "bg-white/10 text-white"
              : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          to="/preface"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
            location.pathname === "/preface"
              ? "bg-white/10 text-white"
              : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Preface
        </Link>
        <Link
          to="/afterword"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
            location.pathname === "/afterword"
              ? "bg-white/10 text-white"
              : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
          )}
        >
          <PenLine className="h-4 w-4" />
          Afterword
        </Link>
      </nav>

      {/* Resources */}
      <nav className="px-4 mt-6">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--sidebar-heading))]">
          Resources
        </span>
        <Link
          to="/bibliography"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
            location.pathname === "/bibliography"
              ? "bg-white/10 text-white"
              : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
          )}
        >
          <Library className="h-4 w-4" />
          Bibliography
        </Link>
        <Link
          to="/index-terms"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
            location.pathname === "/index-terms"
              ? "bg-white/10 text-white"
              : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
          )}
        >
          <BookA className="h-4 w-4" />
          Index of Terms
        </Link>
        <Link
          to="/prompt-execution"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
            location.pathname === "/prompt-execution"
              ? "bg-white/10 text-white"
              : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
          )}
        >
          <Zap className="h-4 w-4" />
          Prompt Execution
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 mt-1 text-sm transition-colors",
              location.pathname === "/admin"
                ? "bg-white/10 text-white"
                : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
            )}
          >
            <ShieldAlert className="h-4 w-4" />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Chapters */}
      <nav className="px-4 mt-6 flex-1">
        <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[hsl(var(--sidebar-heading))]">
          Chapters
        </span>
        <div className="mt-2 space-y-0.5">
          {industries?.map(ind => {
            const path = `/industry/${ind.slug}`;
            const problemChapter = location.pathname.startsWith("/problem/")
              ? parseInt(location.pathname.split("/problem/")[1]?.split(".")[0] || "0", 10)
              : null;
            const active = isActive(path) || problemChapter === ind.chapter_number;
            const subtitle = CHAPTER_SUBTITLES[ind.chapter_number] || "";

            return (
              <Link
                key={ind.id}
                to={path}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm leading-snug transition-colors",
                  active
                    ? "bg-[hsl(var(--sidebar-active))] text-white font-medium"
                    : "text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
                )}
              >
                {ind.name}{subtitle ? ` - ${subtitle}` : ""}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="px-4 pb-2">
        {user?.email && (
          <div className="px-3 py-2 text-xs text-white/60 truncate" title={user.email}>
            {user.email}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors text-[hsl(var(--sidebar-fg))] hover:text-white hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
      <div className="px-6 py-3 text-[11px] text-white/50">
        © 2026 Davor Mulalić
      </div>
    </aside>
  );
}
