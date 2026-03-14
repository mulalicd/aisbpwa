import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, Check, X, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "Number", test: (p: string) => /\d/.test(p) },
  { label: "Special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [success, setSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);
  const recoveryDetectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const url = new URL(window.location.href);
    const search = url.search;
    const code = url.searchParams.get("code");

    const hash = window.location.hash || "";
    const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
    const type = url.searchParams.get("type") || hashParams.get("type");

    const hasRecoveryHint =
      type === "recovery" ||
      hash.includes("access_token=") ||
      search.includes("type=recovery") ||
      !!code;

    const markValid = () => {
      recoveryDetectedRef.current = true;
      setInvalidLink(false);
      setIsCheckingLink(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || !!session) {
        markValid();
      }
    });

    (async () => {
      try {
        // Some recovery links arrive as PKCE `?code=...` and require an explicit exchange.
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error) {
            const cleanUrl = `${window.location.origin}${window.location.pathname}`;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) markValid();
      } catch {
        // Ignore: we'll fall back to the timer below.
      }
    })();

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      if (!recoveryDetectedRef.current && !hasRecoveryHint) {
        setInvalidLink(true);
      }
      setIsCheckingLink(false);
    }, 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const allRulesPass = PASSWORD_RULES.every((r) => r.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRulesPass) {
      toast({ title: "Password does not meet all strength requirements.", variant: "destructive" });
      return;
    }
    if (!passwordsMatch) {
      toast({ title: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast({ title: "Password updated successfully!" });
      setTimeout(() => navigate("/"), 3000);
    } catch (error: any) {
      toast({ title: error.message || "Failed to update password. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingLink) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden">
          <div className="w-full h-1 bg-primary" />
          <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Verifying link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invalidLink) {

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden">
          <div className="w-full h-1 bg-primary" />
          <CardHeader className="text-center">
            <CardTitle className="font-display text-xl">Invalid Reset Link</CardTitle>
            <CardDescription>This password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden">
          <div className="w-full h-1 bg-primary" />
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-[hsl(152_60%_36%/0.15)] flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-[hsl(152_60%_36%)]" />
            </div>
            <h2 className="font-display text-xl font-bold">Password Updated</h2>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <div className="w-full h-1 bg-primary" />
        <CardHeader className="text-center">
          <CardTitle className="font-display text-xl">SET NEW PASSWORD</CardTitle>
          <CardDescription>Create a strong password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex w-full h-12 rounded-sm text-sm transition-all duration-200 bg-muted/30 border border-border pl-10 pr-10 py-3 font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password strength rules */}
            {password.length > 0 && (
              <div className="space-y-1.5 pl-1">
                {PASSWORD_RULES.map((rule) => {
                  const passes = rule.test(password);
                  return (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      {passes ? (
                        <Check className="h-3.5 w-3.5 text-[hsl(152_60%_36%)]" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span className={passes ? "text-[hsl(152_60%_36%)]" : "text-muted-foreground"}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flex w-full h-12 rounded-sm text-sm transition-all duration-200 bg-muted/30 border border-border pl-10 pr-10 py-3 font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !allRulesPass || !passwordsMatch}
              className="w-full h-11 font-display tracking-wider font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
              size="lg"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
              ) : (
                "UPDATE PASSWORD"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
