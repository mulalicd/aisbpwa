import { useState } from "react";
import { KeyRound, ExternalLink, X, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onKeySubmit: (provider: string, key: string) => void;
}

export function ProductionModeDialog({ open, onClose, onKeySubmit }: Props) {
  const [selectedProvider, setSelectedProvider] = useState("");
  const [apiKey, setApiKey] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (apiKey.trim() && selectedProvider) {
      onKeySubmit(selectedProvider, apiKey.trim());
      setApiKey("");
      onClose();
    }
  };

  const providers = [
    { id: "gemini",      label: "Gemini",      getUrl: "https://aistudio.google.com/app/apikey" },
    { id: "openai",      label: "ChatGPT",     getUrl: "https://platform.openai.com/api-keys" },
    { id: "claude",      label: "Claude",      getUrl: "https://console.anthropic.com/settings/keys" },
    { id: "grok",        label: "Grok",        getUrl: "https://console.x.ai/" },
    { id: "perplexity",  label: "Perplexity",  getUrl: "https://www.perplexity.ai/settings/api" },
    { id: "deepseek",    label: "DeepSeek",    getUrl: "https://platform.deepseek.com/api_keys" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">

        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
          <X className="h-5 w-5" />
        </button>

        <div className="bg-primary/10 px-6 pt-7 pb-5 text-center border-b border-border">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/15 text-primary mb-3">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">Add Your API Key</h2>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
            Use your own AI provider key. Compatible with all platforms listed in the execution prompt.
          </p>
        </div>

        <div className="px-6 pt-5 pb-3">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-3">Select Provider</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {providers.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProvider(p.id)}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold border transition-colors ${
                  selectedProvider === p.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                {p.label}
                <a
                  href={p.getUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-muted-foreground hover:text-primary"
                  title={`Get ${p.label} API key`}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </button>
            ))}
          </div>

          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Paste API Key</p>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="Paste your API key here..."
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
          />
        </div>

        <div className="px-6 pb-2 space-y-1.5">
          {[
            { icon: ShieldCheck, text: "Key sent directly to your provider — never stored on our servers" },
            { icon: Zap, text: "Platform falls back to Gemini if no key is provided" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>

        <div className="px-6 pb-6 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!apiKey.trim() || !selectedProvider}
            className="w-full gap-1.5"
          >
            <KeyRound className="h-4 w-4" />
            Activate with {selectedProvider ? providers.find(p => p.id === selectedProvider)?.label : "Selected Provider"}
          </Button>
        </div>

      </div>
    </div>
  );
}
