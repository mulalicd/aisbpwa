import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UserGuide } from "@/components/UserGuide";
import { AuthModal } from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";

const PrefacePage = lazy(() => import("./pages/PrefacePage"));
const IndustryPage = lazy(() => import("./pages/IndustryPage"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const AfterwordPage = lazy(() => import("./pages/AfterwordPage"));
const BibliographyPage = lazy(() => import("./pages/BibliographyPage"));
const IndexTermsPage = lazy(() => import("./pages/IndexTermsPage"));
const PromptExecutionPage = lazy(() => import("./pages/PromptExecutionPage"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AuthModal
          isOpen={true}
          onClose={() => {}} // Keep modal open — no way to dismiss
          onSuccess={() => {}} // user state change from useAuth handles the redirect
        />
      </div>
    );
  }

  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public route — reset password */}
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected routes */}
              <Route path="*" element={
                <AuthGate>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/preface" element={<PrefacePage />} />
                    <Route path="/industry/:slug" element={<IndustryPage />} />
                    <Route path="/problem/:id" element={<ProblemPage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/afterword" element={<AfterwordPage />} />
                    <Route path="/bibliography" element={<BibliographyPage />} />
                    <Route path="/index-terms" element={<IndexTermsPage />} />
                    <Route path="/prompt-execution" element={<PromptExecutionPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <UserGuide />
                </AuthGate>
              } />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
