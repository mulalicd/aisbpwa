import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextContentProps {
  content: string;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  maxLines?: number;
}

function parseTextToBlocks(text: string) {
  const lines = text.split("\n");
  const blocks: Array<{
    type: "heading" | "subheading" | "paragraph" | "bullet" | "tab-bullet" | "option-title" | "pros-cons" | "quote";
    content: string;
    variant?: string;
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Option titles (Option 1, Option 2, etc.)
    if (/^Option \d+[,:]/.test(trimmed)) {
      blocks.push({ type: "option-title", content: trimmed });
    }
    // Pros/Cons/ROI/Acceptable only if lines
    else if (/^\t?(Pros|Cons|ROI|Acceptable only if|Best case|Realistic case|Conservative case|Break-even|Threshold|Warning|Corrective|Constraint|Checkpoint|WHY|ACTION|LOGIC|PRODUCE|FORMULA|CATEGORIZATION|STRUCTURE|Handle|Symptom|Fix|Scenario|Immediate|Short-Term|Long-Term|How to Confirm):/.test(trimmed)) {
      blocks.push({ type: "pros-cons", content: trimmed.replace(/^\t/, "") });
    }
    // Tab-indented bullets
    else if (line.startsWith("\t")) {
      blocks.push({ type: "tab-bullet", content: trimmed });
    }
    // Lines that look like section sub-headers (short, no period at end, bold-worthy)
    else if (
      trimmed.length < 80 &&
      !trimmed.endsWith(".") &&
      !trimmed.endsWith(",") &&
      !trimmed.endsWith(":") &&
      !trimmed.startsWith("(") &&
      /^[A-Z]/.test(trimmed) &&
      !/^\d/.test(trimmed) &&
      (
        /^(Honest Assessment|Detailed Calculation|Current State|With AI|Implementation Cost|Payback|Context Dependency|Sensitivity Analysis|Quality Variance|Strategic Pattern|Pattern \d|Where to Start|The Business Case|The AI-Augmented Workflow|Immediate Next Action|What Goes Wrong|How to use this)/.test(trimmed) ||
        (trimmed.split(" ").length <= 8 && i > 0 && !lines[i - 1]?.trim())
      )
    ) {
      blocks.push({ type: "subheading", content: trimmed });
    }
    // Regular paragraphs
    else {
      blocks.push({ type: "paragraph", content: trimmed });
    }
  }

  return blocks;
}

export function RichTextContent({ content, className, collapsible = false, defaultCollapsed = false, maxLines = 12 }: RichTextContentProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const blocks = parseTextToBlocks(content);

  const visibleBlocks = collapsible && collapsed ? blocks.slice(0, maxLines) : blocks;
  const hasMore = collapsible && blocks.length > maxLines;

  return (
    <div className={cn("space-y-2", className)}>
      {visibleBlocks.map((block, i) => {
        switch (block.type) {
          case "subheading":
            return (
              <h3 key={i} className="font-display text-base font-semibold text-foreground mt-4 mb-1">
                {block.content}
              </h3>
            );
          case "option-title":
            return (
              <div key={i} className="mt-3 mb-1 px-3 py-2 rounded-lg bg-primary/5 border-l-3 border-primary">
                <span className="font-semibold text-foreground text-sm">{block.content}</span>
              </div>
            );
          case "pros-cons": {
            const [label, ...rest] = block.content.split(":");
            const value = rest.join(":").trim();
            const isPro = label.trim().startsWith("Pros");
            const isCon = label.trim().startsWith("Cons") || label.trim().startsWith("Acceptable only if");
            return (
              <div key={i} className="flex gap-2 text-sm pl-4">
                <span className={cn(
                  "font-semibold shrink-0",
                  isPro ? "text-primary" : isCon ? "text-destructive" : "text-foreground"
                )}>
                  {label.trim()}:
                </span>
                <span className="text-muted-foreground" style={{ textAlign: 'justify' }}>{value}</span>
              </div>
            );
          }
          case "tab-bullet":
            return (
              <div key={i} className="flex gap-2 text-sm pl-6 text-muted-foreground" style={{ textAlign: 'justify' }}>
                <span className="text-primary mt-1.5 shrink-0">•</span>
                <span>{block.content}</span>
              </div>
            );
          case "paragraph":
          default:
            return (
              <p key={i} className="text-sm sm:text-base text-muted-foreground leading-relaxed" style={{ textAlign: 'justify' }}>
                {highlightReferences(block.content)}
              </p>
            );
        }
      })}

      {hasMore && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors mt-2"
        >
          {collapsed ? (
            <>Show more <ChevronDown className="h-3 w-3" /></>
          ) : (
            <>Show less <ChevronUp className="h-3 w-3" /></>
          )}
        </button>
      )}
    </div>
  );
}

function highlightReferences(text: string) {
  // Highlight ASMP references
  const parts = text.split(/(ASMP-[A-Z]+-\d+(?::[^)]+\))?)/g);
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        /^ASMP-/.test(part) ? (
          <span key={i} className="font-mono text-xs bg-primary/10 text-primary px-1 py-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
