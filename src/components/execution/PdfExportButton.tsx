import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ExecMessage } from "@/hooks/useExecutionChat";
import { normalizeAiHtml } from "@/lib/aiHtml";
import { stripMetricsBlock } from "./ResponseVisuals";

interface Props {
  messages: ExecMessage[];
  problemTitle: string;
  problemId: string;
  industryName: string;
}

const PDF_PAGE_WIDTH_MM = 210;
const PDF_MARGINS_MM = { top: 14, right: 12, bottom: 14, left: 12 } as const;
const MM_TO_PX = 96 / 25.4;
const REPORT_CONTENT_WIDTH_PX = Math.floor((PDF_PAGE_WIDTH_MM - PDF_MARGINS_MM.left - PDF_MARGINS_MM.right) * MM_TO_PX);

export function PdfExportButton({ messages, problemTitle, problemId, industryName }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const hasAssistantMessages = messages.some((message) => message.role === "assistant");

  const handleExport = async () => {
    if (isExporting) return;

    const assistantMessages = messages.filter((message) => message.role === "assistant");
    if (assistantMessages.length === 0) return;

    const sections = messages
      .map((message, index) => {
        if (message.role === "user") {
          if (index === 0) return "";
          return `<div style="margin:20px 0;padding:12px 16px;background:#f0f0f0;border-radius:8px;font-style:italic;color:#333;">
            <strong>Follow-up Question:</strong> ${escapeHtml(message.content)}
          </div>`;
        }

        const clean = stripMetricsBlock(message.content);
        return `<div style="margin:16px 0;line-height:1.7;color:#222;">${normalizeAiHtml(clean)}</div>`;
      })
      .filter(Boolean)
      .join("\n<hr style='border:none;border-top:1px solid #ddd;margin:24px 0;'/>\n");

    const reportMarkup = `<div class="aisbs-pdf-root">
      <style>
        * { box-sizing: border-box; }
        .aisbs-pdf-root { font-family: "Segoe UI", Arial, sans-serif; width: ${REPORT_CONTENT_WIDTH_PX}px; margin: 0 auto; padding: 30px 24px; color: #1a1a1a; font-size: 12px; line-height: 1.6; background: #fff; word-wrap: break-word; overflow-wrap: break-word; }
        .aisbs-pdf-root h1, .aisbs-pdf-root h2, .aisbs-pdf-root h3, .aisbs-pdf-root h4 { font-family: "Arial Narrow", "Segoe UI", Arial, sans-serif; page-break-after: avoid; break-after: avoid; word-wrap: break-word; }
        .aisbs-pdf-root p, .aisbs-pdf-root li, .aisbs-pdf-root blockquote { page-break-inside: avoid; break-inside: avoid; }
        .aisbs-pdf-root h1, .aisbs-pdf-root h2, .aisbs-pdf-root h3, .aisbs-pdf-root h4 { page-break-inside: avoid; break-inside: avoid; }
        .aisbs-pdf-root table { page-break-inside: avoid; break-inside: avoid; }
        .aisbs-pdf-root tr { page-break-inside: avoid; break-inside: avoid; }
        .aisbs-pdf-root pre { page-break-inside: avoid; break-inside: avoid; }
        .aisbs-pdf-root .header { border-bottom: 4px solid #c62828; padding-bottom: 16px; margin-bottom: 24px; page-break-inside: avoid; break-inside: avoid; }
        .aisbs-pdf-root .header h1 { font-size: 26px; margin: 4px 0; line-height: 1.25; word-wrap: break-word; }
        .aisbs-pdf-root .header p { color: #666; font-size: 12px; margin: 3px 0; }
        .aisbs-pdf-root .badge { display: inline-block; background: #c62828; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 9px; font-weight: 700; letter-spacing: 0.05em; }
        .aisbs-pdf-root h2 { font-size: 20px; color: #c62828; margin: 20px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
        .aisbs-pdf-root h3 { font-size: 17px; margin: 14px 0 6px; }
        .aisbs-pdf-root h4 { font-size: 14px; margin: 12px 0 5px; }
        .aisbs-pdf-root p { margin: 6px 0; word-wrap: break-word; overflow-wrap: break-word; }
        .aisbs-pdf-root ul, .aisbs-pdf-root ol { margin: 5px 0 5px 18px; padding: 0; }
        .aisbs-pdf-root li { margin: 2px 0; word-wrap: break-word; }
        .aisbs-pdf-root strong { font-weight: 700; }
        .aisbs-pdf-root em { font-style: italic; }
        .aisbs-pdf-root code { background: #f5f5f5; padding: 1px 3px; border-radius: 3px; font-size: 10px; font-family: "Courier New", monospace; word-break: break-all; }
        .aisbs-pdf-root pre { background: #f5f5f5; padding: 10px; border-radius: 6px; font-size: 10px; font-family: "Courier New", monospace; overflow-wrap: anywhere; word-break: break-all; white-space: pre-wrap; margin: 8px 0; max-width: 100%; }
        .aisbs-pdf-root pre code { background: none; padding: 0; }
        .aisbs-pdf-root blockquote { border-left: 3px solid #c62828; padding-left: 12px; color: #555; font-style: italic; margin: 8px 0; }
        .aisbs-pdf-root table { width: 100%; border-collapse: collapse; margin: 10px 0; table-layout: fixed; }
        .aisbs-pdf-root th, .aisbs-pdf-root td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; font-size: 11px; vertical-align: top; word-wrap: break-word; overflow-wrap: break-word; }
        .aisbs-pdf-root th { background: #f0f0f0; font-weight: 700; }
        .aisbs-pdf-root tr:nth-child(even) { background: #fafafa; }
        .aisbs-pdf-root img { max-width: 100%; height: auto; }
        .aisbs-pdf-root .footer { margin-top: 30px; border-top: 2px solid #eee; padding-top: 12px; text-align: center; color: #999; font-size: 9px; }
      </style>
      <div class="header">
        <span class="badge">AISBS EXECUTION REPORT</span>
        <h1>${escapeHtml(problemId)}: ${escapeHtml(problemTitle)}</h1>
        <p>Industry: ${escapeHtml(industryName)}</p>
        <p>Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
      ${sections}
      <div class="footer">
        AI Solved Business Problems — Generated by AISBS Execution Console<br/>
        © ${new Date().getFullYear()} Davor Mulalić. All rights reserved.
      </div>
    </div>`;

    const mountNode = document.createElement("div");
    mountNode.style.position = "fixed";
    mountNode.style.left = "0";
    mountNode.style.top = "0";
    mountNode.style.width = `${REPORT_CONTENT_WIDTH_PX}px`;
    mountNode.style.background = "#fff";
    mountNode.style.zIndex = "-9999";
    mountNode.style.pointerEvents = "none";
    mountNode.setAttribute("aria-hidden", "true");
    mountNode.innerHTML = reportMarkup;

    document.body.appendChild(mountNode);

    try {
      setIsExporting(true);
      const { default: html2pdf } = await import("html2pdf.js");
      const reportElement = mountNode.querySelector(".aisbs-pdf-root") as HTMLElement | null;

      if (!reportElement) {
        throw new Error("PDF content root not found");
      }

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if ("fonts" in document) {
        await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready;
      }

      const options: Record<string, unknown> = {
          margin: [PDF_MARGINS_MM.top, PDF_MARGINS_MM.right, PDF_MARGINS_MM.bottom, PDF_MARGINS_MM.left] as [number, number, number, number],
          filename: buildFileName(problemId, problemTitle),
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
            width: REPORT_CONTENT_WIDTH_PX,
            windowWidth: REPORT_CONTENT_WIDTH_PX,
            scrollX: 0,
            scrollY: 0,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        };

      await (html2pdf() as any)
        .set(options)
        .from(reportElement)
        .save();
    } catch (error) {
      console.error("PDF export failed", error);
    } finally {
      setIsExporting(false);
      mountNode.remove();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting || !hasAssistantMessages}
      className="gap-1.5"
    >
      {isExporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
      {isExporting ? "Generating..." : "PDF Report"}
    </Button>
  );
}

function escapeHtml(content: string) {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildFileName(problemId: string, problemTitle: string): string {
  const safeId = sanitizeFileNamePart(problemId);
  const safeTitle = sanitizeFileNamePart(problemTitle);
  const suffix = [safeId, safeTitle].filter(Boolean).join("-") || "report";
  return `AISBS-${suffix}.pdf`;
}

function sanitizeFileNamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
