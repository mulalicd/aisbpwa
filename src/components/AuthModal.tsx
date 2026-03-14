import { useState, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Check, ArrowLeft, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name?: string; id?: string }) => void;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60_000; // 1 minute

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'login' | 'forgot-password'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [emailError, setEmailError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  // Rate limiting state
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [lockCountdown, setLockCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const startLockoutCountdown = useCallback((until: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    const update = () => {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setLockCountdown(remaining);
      if (remaining <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setLockedUntil(null);
        setFailedAttempts(0);
      }
    };
    update();
    countdownRef.current = setInterval(update, 1000);
  }, []);

  const validateEmail = useCallback((email: string) => {
    const trimmed = email.trim();
    if (!trimmed) { setEmailError(''); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(emailRegex.test(trimmed) ? '' : 'Please enter a valid email address');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = formData.email.trim();
    const password = formData.password;

    if (emailError || !trimmedEmail) return;
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (isLocked) {
      toast.error(`Too many failed attempts. Try again in ${lockCountdown}s.`);
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await signIn(trimmedEmail, password);
      if (user) {
        setFailedAttempts(0);
        setLockedUntil(null);
        toast.success('Access granted. Welcome back.');
        onSuccess({
          id: user.id,
          email: user.email || trimmedEmail,
          name: user.user_metadata?.display_name || user.user_metadata?.full_name,
        });
      }
    } catch (error: any) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_DURATION_MS;
        setLockedUntil(until);
        startLockoutCountdown(until);
        toast.error('Account temporarily locked. Try again in 60 seconds.');
      } else if (error.message?.includes('Invalid login credentials')) {
        const remaining = MAX_ATTEMPTS - newAttempts;
        toast.error(`Invalid credentials. Attempts remaining: ${remaining}`);
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Email not confirmed. Check your inbox for the verification link.');
      } else {
        toast.error(error.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = formData.email.trim();
    if (emailError || !trimmedEmail) return;
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success('Password reset link sent. Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: 'login' | 'forgot-password') => {
    setMode(newMode);
    setFormData({ email: formData.email.trim(), password: '' });
    setEmailError('');
    setShowPassword(false);
    setResetSent(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden border-border">
        {/* Red accent bar */}
        <div className="w-full h-1 bg-primary" />

        <div className="p-6 pt-5">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="AI Solved Business Problems" className="h-10" />
          </div>

          <DialogHeader className="text-center space-y-1.5 mb-6">
            <DialogTitle className="font-display text-2xl font-bold tracking-wide text-center">
              OPERATOR ACCESS
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm text-center">
              {mode === 'login'
                ? 'Enter your credentials to access AI Solved Business Problems'
                : 'Enter your email to receive a password reset link'}
            </DialogDescription>
          </DialogHeader>

          {mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Lockout warning */}
              {isLocked && (
                <div className="flex items-center gap-2 p-3 rounded-sm bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>Account locked. Try again in <strong>{lockCountdown}s</strong></span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="operator@company.com"
                    value={formData.email}
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); validateEmail(e.target.value); }}
                    className="flex w-full h-12 rounded-sm text-sm transition-all duration-200 bg-muted/30 border border-border pl-10 pr-4 py-3 font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:outline-none placeholder:text-muted-foreground"
                    disabled={isLocked}
                  />
                </div>
                {emailError && <p className="text-xs text-destructive">{emailError}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="flex w-full h-12 rounded-sm text-sm transition-all duration-200 bg-muted/30 border border-border pl-10 pr-10 py-3 font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:outline-none placeholder:text-muted-foreground"
                    disabled={isLocked}
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

              {/* Forgot password link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchMode('forgot-password')}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading || !!emailError || isLocked || !formData.email.trim() || formData.password.length < 8}
                className="w-full h-11 font-display tracking-wider font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                size="lg"
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Authenticating...</>
                ) : (
                  <>ACCESS SYSTEM <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>

              {/* Failed attempts indicator */}
              {failedAttempts > 0 && !isLocked && (
                <p className="text-[11px] text-muted-foreground text-center">
                  Failed attempts: {failedAttempts}/{MAX_ATTEMPTS}
                </p>
              )}

              {/* Info text */}
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed pt-2">
                Credentials are assigned after verified payment. Contact{' '}
                <a href="mailto:mulalic.davor@outlook.com" className="text-primary hover:underline">mulalic.davor@outlook.com</a>{' '}
                for access.
              </p>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {resetSent ? (
                <div className="text-center py-6 space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-[hsl(152_60%_36%/0.15)] flex items-center justify-center">
                    <Check className="h-6 w-6 text-[hsl(152_60%_36%)]" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Reset link sent!</p>
                  <p className="text-xs text-muted-foreground">
                    Check the inbox at <span className="font-mono font-medium text-foreground">{formData.email}</span> for the password reset link.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        id="reset-email"
                        type="email"
                        autoComplete="email"
                        placeholder="operator@company.com"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); validateEmail(e.target.value); }}
                        className="flex w-full h-12 rounded-sm text-sm transition-all duration-200 bg-muted/30 border border-border pl-10 pr-4 py-3 font-mono text-foreground focus:border-primary focus:ring-1 focus:ring-primary/30 focus-visible:outline-none placeholder:text-muted-foreground"
                      />
                    </div>
                    {emailError && <p className="text-xs text-destructive">{emailError}</p>}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading || !!emailError || !formData.email.trim()}
                    className="w-full h-11 font-display tracking-wider font-semibold shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                    size="lg"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                    ) : (
                      <>SEND RESET LINK <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </>
              )}

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline mx-auto"
              >
                <ArrowLeft className="h-3 w-3" /> Back to login
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
