export interface AiMetric {
  label: string;
  before: number;
  after: number;
  unit: string;
}

const METRICS_COMMENT_REGEX = /<!--\s*AISBS_METRICS:\s*([\s\S]*?)\s*-->/g;
const LEGACY_METRICS_BLOCK_REGEX = /```metrics\s*\n?([\s\S]*?)```/g;

export function extractMetricsFromAiText(text: string): AiMetric[] {
  const parsedFromComment = parseMetricsMatches(text, METRICS_COMMENT_REGEX);
  if (parsedFromComment.length > 0) return parsedFromComment;
  return parseMetricsMatches(text, LEGACY_METRICS_BLOCK_REGEX);
}

export function stripMetricsFromAiText(text: string): string {
  return text
    .replace(METRICS_COMMENT_REGEX, "")
    .replace(LEGACY_METRICS_BLOCK_REGEX, "")
    .trim();
}

export function normalizeAiHtml(content: string): string {
  const cleanContent = stripMetricsFromAiText(content).trim();
  if (!cleanContent) return "";

  const withoutCodeFences = cleanContent
    .replace(/```html/gi, "")
    .replace(/```/g, "")
    .trim();

  const html = looksLikeHtml(withoutCodeFences)
    ? withoutCodeFences
    : markdownToHtmlFallback(withoutCodeFences);

  return sanitizeAiHtml(html);
}

function parseMetricsMatches(text: string, regex: RegExp): AiMetric[] {
  const matches = [...text.matchAll(regex)];
  for (const match of matches) {
    try {
      const parsed = JSON.parse((match[1] ?? "").trim());
      const metrics = Array.isArray(parsed?.metrics) ? parsed.metrics : Array.isArray(parsed) ? parsed : [];
      if (metrics.length > 0) {
        return metrics.filter((m: unknown): m is AiMetric => {
          if (!m || typeof m !== "object") return false;
          const metric = m as Record<string, unknown>;
          return (
            typeof metric.label === "string" &&
            typeof metric.before === "number" &&
            typeof metric.after === "number" &&
            typeof metric.unit === "string"
          );
        });
      }
    } catch {
      // ignore invalid JSON payloads
    }
  }
  return [];
}

function looksLikeHtml(content: string): boolean {
  return /<\/?[a-z][\s\S]*?>/i.test(content);
}

function sanitizeAiHtml(html: string): string {
  return html
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*\/?\s*>/gi, "")
    .replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, ' $1="#"');
}

function markdownToHtmlFallback(md: string): string {
  let html = md;

  const codeBlocks: string[] = [];
  html = html.replace(/```[\s\S]*?```/g, (match) => {
    const content = match.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
    const idx = codeBlocks.length;
    codeBlocks.push(`<pre><code>${escapeHtml(content)}</code></pre>`);
    return `%%CODEBLOCK_${idx}%%`;
  });

  const lines = html.split("\n");
  const result: string[] = [];
  let tableRows: string[] = [];

  const flushTable = () => {
    if (tableRows.length < 2) {
      result.push(...tableRows);
      tableRows = [];
      return;
    }

    const isSeparator = (row: string) => /^\|[\s\-:|]+\|$/.test(row.trim());
    const parseRow = (row: string) => row.split("|").slice(1, -1).map((cell) => cell.trim());
    const hasSeparator = tableRows.length >= 2 && isSeparator(tableRows[1]);

    let table = "<table>";
    if (hasSeparator) {
      table += "<thead><tr>" + parseRow(tableRows[0]).map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("") + "</tr></thead><tbody>";
      for (let i = 2; i < tableRows.length; i++) {
        table += "<tr>" + parseRow(tableRows[i]).map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("") + "</tr>";
      }
      table += "</tbody>";
    } else {
      table += "<tbody>";
      for (const row of tableRows) {
        table += "<tr>" + parseRow(row).map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("") + "</tr>";
      }
      table += "</tbody>";
    }
    table += "</table>";

    result.push(table);
    tableRows = [];
  };

  for (const line of lines) {
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      tableRows.push(line);
    } else {
      if (tableRows.length > 0) flushTable();
      result.push(line);
    }
  }
  if (tableRows.length > 0) flushTable();
  html = result.join("\n");

  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/`(.+?)`/g, "<code>$1</code>");
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  html = html.replace(/((?:^- .+$\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => `<li>${inlineMarkdown(line.replace(/^- /, ""))}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  html = html.replace(/((?:^\d+\. .+$\n?)+)/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((line) => `<li>${inlineMarkdown(line.replace(/^\d+\. /, ""))}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  html = html.replace(/\n{2,}/g, "</p><p>");
  html = html.replace(/\n/g, "<br/>");
  html = `<p>${html}</p>`;

  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p>\s*(<(?:h[1-4]|table|ul|ol|pre|blockquote))/g, "$1");
  html = html.replace(/(<\/(?:h[1-4]|table|ul|ol|pre|blockquote)>)\s*<\/p>/g, "$1");

  codeBlocks.forEach((block, idx) => {
    html = html.replace(`%%CODEBLOCK_${idx}%%`, block);
  });

  return html;
}

function escapeHtml(content: string): string {
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineMarkdown(content: string): string {
  return content
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}
