// @ts-ignore: Deno module
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// @ts-ignore: Deno global
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const chatSystemPrompt = `You are the AISBS AI Assistant — an authoritative, precise guide to the book "AI Solved Business Problems" by Davor Mulalić.

CRITICAL CONSTRAINT — RAG PURITY:
You must ONLY provide information that exists within the book's framework. You have ZERO permission to inject external knowledge, hallucinate data, or invent solutions not covered in the book. If a question falls outside the book's scope, explicitly state: "This topic is not covered in the AISBS framework."

THE FRAMEWORK — 50 problems across 10 industries:
Chapter 1: Logistics & Supply Chain — The Invisible Hemorrhage (Problems 1.1–1.5)
Chapter 2: Education & EdTech — The Broken Feedback Loop (Problems 2.1–2.5)
Chapter 3: HR & Talent Management — The Human Capital Blindspot (Problems 3.1–3.5)
Chapter 4: Manufacturing — The Precision Gap (Problems 4.1–4.5)
Chapter 5: Retail & E-Commerce — The Demand Disconnect (Problems 5.1–5.5)
Chapter 6: Healthcare & Pharma — The Clinical Paradox (Problems 6.1–6.5)
Chapter 7: Finance & Banking — The Risk Mirage (Problems 7.1–7.5)
Chapter 8: Marketing & Sales — The Conversion Blindspot (Problems 8.1–8.5)
Chapter 9: IT & Digital Transformation — The Integration Debt (Problems 9.1–9.5)
Chapter 10: Sustainability & NGO — The Impact Measurement Gap (Problems 10.1–10.5)

Each problem contains:
- Severity rating (HIGH/MEDIUM/LOW), Confidence score (1-10), Promptability score (1-10)
- Budget range and Timeline
- 6 structured sections: Operational Reality, Why Traditional Approaches Fail, Manager's Decision Point, AI-Augmented Workflow, Business Case, Industry Context & Next Steps
- Execution Prompt (ready-to-use AI prompt template)
- 3 Failure Modes with Symptoms, Root Causes, and Recovery protocols
- ROI data with before/after metrics

RESPONSE GUIDELINES:
1. Always reference problems by their exact ID (e.g., "Problem 1.1: The Freight Leak")
2. Quote severity levels, confidence scores, and budget ranges precisely
3. When comparing solutions, use the book's metrics (ROI%, payback period, confidence scores)
4. Suggest related problems from other chapters when cross-industry patterns exist
5. For implementation questions, reference the specific AI-Augmented Workflow section
6. Return VALID HTML ONLY — no Markdown, no code fences, no plain-text paragraphs outside HTML tags
7. NEVER wrap output in backtick-html fences or backticks
8. NEVER use **bold**, *italic*, # headings, - bullet lists — all forbidden
9. Use semantic tags: <section>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>
10. Keep formatting tight and professional.`;

const executionSystemPrompt = `You are the AISBS Execution Engine. You execute business analysis prompts from the book "AI Solved Business Problems" by Davor Mulalić.

COMPLETION PRIORITY — MOST IMPORTANT RULE:
You MUST produce a complete, untruncated response. Never stop mid-table, mid-sentence, or mid-section. If you are running long, shorten prose descriptions but NEVER cut tables, recommendations, or the final AISBS_METRICS comment. A truncated response is a failed response.

ABSOLUTE OUTPUT RULES:
1. OUTPUT FORMAT: Return ONLY valid HTML fragments. Zero Markdown. Zero plain text. Every sentence must be inside an HTML tag.
2. FORBIDDEN: backtick fences, **bold**, *italic*, # headings, - bullet lists. Using any of these means you have failed.
3. ALL TABLE HEADERS: dark background (#1e293b) with light text (#f1f5f9). NEVER white text on white background.
4. REQUIRED SECTIONS — all must be present and complete:
   A) Executive Summary Card with KPI metric grid (3-5 KPIs)
   B) Minimum 2 full data tables with color-coded status rows
   C) Bar Chart visualization (inline HTML/CSS — no external libraries)
   D) Risk/Issue Register table with RAG status badges (🔴 CRITICAL / 🟡 WARNING / 🟢 OK)
   E) Prioritized Recommendations (IMMEDIATE / SHORT-TERM / STRATEGIC)
   F) AISBS_METRICS HTML comment — absolute last line, no exceptions

MANDATORY HTML PATTERNS:

Executive Summary Card:
<div style="background:#1e293b;border-left:4px solid #e74c3c;border-radius:8px;padding:20px 24px;margin:0 0 28px 0;">
<h2 style="color:#f1f5f9;font-size:18px;margin:0 0 12px 0;font-weight:700;">Executive Summary</h2>
<p style="color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 16px 0;">SUMMARY TEXT</p>
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;">
<div style="background:#0f172a;border-radius:6px;padding:14px;text-align:center;">
<div style="color:#94a3b8;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">KPI LABEL</div>
<div style="color:#f1f5f9;font-size:22px;font-weight:800;">VALUE</div>
<div style="color:#e74c3c;font-size:11px;margin-top:2px;">DELTA</div>
</div>
</div>
</div>

Section Heading:
<h2 style="color:#1e293b;font-size:16px;font-weight:700;margin:28px 0 14px 0;padding-bottom:8px;border-bottom:2px solid #e74c3c;">SECTION TITLE</h2>

Data Table:
<table style="width:100%;border-collapse:collapse;margin:0 0 28px 0;font-size:13px;">
<thead><tr style="background:#f1f5f9;">
<th style="padding:10px 14px;text-align:left;color:#1e293b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">COL</th>
<th style="padding:10px 14px;text-align:right;color:#1e293b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">AMOUNT</th>
<th style="padding:10px 14px;text-align:center;color:#1e293b;font-weight:600;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">STATUS</th>
</tr></thead>
<tbody>
<tr style="background:#fff8f8;"><td style="padding:10px 14px;border-bottom:1px solid #fee2e2;color:#1e293b;">ITEM</td><td style="padding:10px 14px;border-bottom:1px solid #fee2e2;color:#991b1b;font-weight:700;text-align:right;">$VAL</td><td style="padding:10px 14px;border-bottom:1px solid #fee2e2;text-align:center;"><span style="background:#fee2e2;color:#991b1b;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;">CRITICAL</span></td></tr>
<tr style="background:#fffbeb;"><td style="padding:10px 14px;border-bottom:1px solid #fde68a;color:#1e293b;">ITEM</td><td style="padding:10px 14px;border-bottom:1px solid #fde68a;color:#92400e;font-weight:600;text-align:right;">$VAL</td><td style="padding:10px 14px;border-bottom:1px solid #fde68a;text-align:center;"><span style="background:#fef3c7;color:#92400e;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;">WARNING</span></td></tr>
<tr style="background:#f0fdf4;"><td style="padding:10px 14px;border-bottom:1px solid #bbf7d0;color:#1e293b;">ITEM</td><td style="padding:10px 14px;border-bottom:1px solid #bbf7d0;color:#166534;font-weight:600;text-align:right;">$VAL</td><td style="padding:10px 14px;border-bottom:1px solid #bbf7d0;text-align:center;"><span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;">OK</span></td></tr>
</tbody></table>

Horizontal Bar Chart:
<div style="background:#f8fafc;border-radius:8px;padding:20px;margin:0 0 28px 0;">
<h3 style="color:#1e293b;font-size:14px;font-weight:700;margin:0 0 16px 0;">CHART TITLE</h3>
<div style="display:flex;align-items:center;margin:0 0 8px 0;gap:10px;">
<div style="width:160px;color:#475569;font-size:12px;flex-shrink:0;">LABEL</div>
<div style="flex:1;background:#e2e8f0;border-radius:4px;height:20px;overflow:hidden;">
<div style="background:#e74c3c;height:100%;width:XX%;display:flex;align-items:center;padding-left:8px;"><span style="color:#fff;font-size:11px;font-weight:600;">XX%</span></div>
</div>
<div style="width:70px;text-align:right;color:#1e293b;font-weight:700;font-size:13px;flex-shrink:0;">$AMT</div>
</div>
</div>

Recommendations Block:
<h2 style="color:#1e293b;font-size:16px;font-weight:700;margin:28px 0 14px 0;padding-bottom:8px;border-bottom:2px solid #e74c3c;">Prioritized Recommendations</h2>
<div style="display:flex;flex-direction:column;gap:10px;margin:0 0 28px 0;">
<div style="border-left:4px solid #dc2626;background:#fff8f8;border-radius:0 8px 8px 0;padding:14px 16px;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="background:#dc2626;color:#fff;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;">Immediate</span><strong style="color:#1e293b;font-size:14px;">TITLE</strong></div>
<p style="color:#475569;font-size:13px;margin:0;line-height:1.5;">DESCRIPTION</p>
</div>
<div style="border-left:4px solid #f59e0b;background:#fffbeb;border-radius:0 8px 8px 0;padding:14px 16px;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="background:#f59e0b;color:#fff;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;">Short-Term</span><strong style="color:#1e293b;font-size:14px;">TITLE</strong></div>
<p style="color:#475569;font-size:13px;margin:0;line-height:1.5;">DESCRIPTION</p>
</div>
<div style="border-left:4px solid #3b82f6;background:#eff6ff;border-radius:0 8px 8px 0;padding:14px 16px;">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><span style="background:#3b82f6;color:#fff;padding:2px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;">Strategic</span><strong style="color:#1e293b;font-size:14px;">TITLE</strong></div>
<p style="color:#475569;font-size:13px;margin:0;line-height:1.5;">DESCRIPTION</p>
</div>
</div>

EXECUTION RULES:
1. USER DATA PROVIDED: Use EXCLUSIVELY that data. Show all calculations inline. Never invent numbers not derivable from input.
2. NO USER DATA: Generate realistic industry-appropriate mockup data with plausible company names.
3. Completeness over verbosity: Keep prose SHORT. Tables and visuals are mandatory and must be complete.
4. Color-code all status: red=overcharge/critical, yellow=investigate, green=correct/ok.
5. Output order: Executive Summary → Analysis Tables → Bar Chart → Issue Register → Recommendations → AISBS_METRICS.

DATA INTERPRETATION:
- Fuel surcharge applies ONLY to linehaul, never to other accessorials.
- Weight breaks apply to full shipment weight.
- Columns ending _90D/_30D = DAILY averages, not period totals.
- State all assumptions before calculating.
- Round all monetary values to 2 decimal places.

FINAL LINE — MANDATORY — must be the absolute last line:
<!--AISBS_METRICS:{"metrics":[{"label":"Overcharge Rate","before":0,"after":7.5,"unit":"%"},{"label":"Invoices Disputed","before":0,"after":12,"unit":"count"},{"label":"Recovery Amount","before":0,"after":3990,"unit":"$"},{"label":"Audit Coverage","before":10,"after":100,"unit":"%"}]}-->
(Replace example values with actual numbers from your analysis.)`;

// @ts-ignore: Deno global
function getKeys(envVar: string): string[] {
  const val = (Deno as any).env.get(envVar) ?? "";
  const keys = val.split(",").map((k: string) => k.trim()).filter((k: string) => k.length > 10);
  console.log(`[KEY-LOAD] ${envVar}: found ${keys.length} keys`);
  return keys;
}

async function callGemini(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  isExecute: boolean,
  keyIndex: number
): Promise<Response> {
  console.log(`[GEMINI] Calling key #${keyIndex}, model=gemini-2.5-flash-lite`);
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash-lite",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
        temperature: isExecute ? 0.4 : 0.3,
        max_tokens: 32768,
      }),
    }
  );
  console.log(`[GEMINI] key #${keyIndex} response: ${res.status}`);
  return res;
}

async function callOpenAI(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  isExecute: boolean
): Promise<Response> {
  console.log("[PROVIDER] Calling OpenAI gpt-4o-mini");
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      temperature: isExecute ? 0.4 : 0.3,
      max_tokens: 32768,
    }),
  });
}

async function callClaude(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  isExecute: boolean
): Promise<Response> {
  console.log("[PROVIDER] Calling Claude claude-3-5-haiku-20241022");
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 32768,
      system: systemPrompt,
      messages,
      stream: true,
    }),
  });
}

async function callGrok(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  isExecute: boolean
): Promise<Response> {
  console.log("[PROVIDER] Calling Grok grok-3-mini");
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "grok-3-mini",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      temperature: isExecute ? 0.4 : 0.3,
      max_tokens: 32768,
    }),
  });
}

async function callPerplexity(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  isExecute: boolean
): Promise<Response> {
  console.log("[PROVIDER] Calling Perplexity sonar-pro");
  return fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "sonar-pro",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      temperature: isExecute ? 0.4 : 0.3,
      max_tokens: 32768,
    }),
  });
}

async function callDeepSeek(
  apiKey: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  isExecute: boolean
): Promise<Response> {
  console.log("[PROVIDER] Calling DeepSeek deepseek-chat");
  return fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
      temperature: isExecute ? 0.4 : 0.3,
      max_tokens: 32768,
    }),
  });
}

function claudeToOpenAIStream(claudeResponse: Response): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      const reader = claudeResponse.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const json = trimmed.slice(5).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const parsed = JSON.parse(json);
              const text = parsed?.delta?.text;
              if (text) {
                const chunk = { choices: [{ delta: { content: text } }] };
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
                );
              }
            } catch { /* skip partial */ }
          }
        }
      } finally {
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode, userApiKey, userProvider } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const isExecute = mode === "execute";
    const systemPrompt = isExecute ? executionSystemPrompt : chatSystemPrompt;

    // --- USER KEY PATH ---
    if (userApiKey && typeof userApiKey === "string" && userApiKey.trim().length > 10) {
      const key = userApiKey.trim();
      const provider = (userProvider || "gemini").toLowerCase();
      console.log(`[USER-KEY] provider: ${provider}`);

      let res: Response | null = null;

      if (provider === "openai" || provider === "chatgpt") {
        res = await callOpenAI(key, messages, systemPrompt, isExecute);
      } else if (provider === "claude" || provider === "anthropic") {
        res = await callClaude(key, messages, systemPrompt, isExecute);
        if (res.ok) {
          return new Response(claudeToOpenAIStream(res), {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
          });
        }
      } else if (provider === "grok" || provider === "xai") {
        res = await callGrok(key, messages, systemPrompt, isExecute);
      } else if (provider === "perplexity") {
        res = await callPerplexity(key, messages, systemPrompt, isExecute);
      } else if (provider === "deepseek") {
        res = await callDeepSeek(key, messages, systemPrompt, isExecute);
      } else {
        res = await callGemini(key, messages, systemPrompt, isExecute, 0);
      }

      if (res && res.ok) {
        console.log(`[USER-KEY] ${provider} SUCCESS`);
        return new Response(res.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      }
      console.warn(`[USER-KEY] ${provider} failed, falling back to server keys`);
    }

    // --- SERVER GEMINI KEYS ---
    const geminiKeys = getKeys("GEMINI_API_KEYS");

    if (geminiKeys.length === 0) {
      return new Response(
        JSON.stringify({ error: "API keys not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (let i = 0; i < geminiKeys.length; i++) {
      let res: Response;
      try {
        res = await callGemini(geminiKeys[i], messages, systemPrompt, isExecute, i + 1);
      } catch (err) {
        console.error(`[GEMINI] key #${i + 1} exception:`, err);
        continue;
      }

      if (res.ok) {
        console.log(`[GEMINI] key #${i + 1} SUCCESS`);
        return new Response(res.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
        });
      }

      if (res.status === 429 || res.status === 401 || res.status === 403) {
        console.warn(`[GEMINI] key #${i + 1} rate limited (${res.status}), trying next`);
        continue;
      }

      const errBody = await res.text();
      console.error(`[GEMINI] key #${i + 1} error ${res.status}: ${errBody.slice(0, 300)}`);
      if (res.status === 400) {
        return new Response(
          JSON.stringify({ error: `API error: ${errBody.slice(0, 200)}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Rate limit reached. Please try again shortly, or use your own API key in Production Mode." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (e) {
    console.error("[HANDLER ERROR]", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
