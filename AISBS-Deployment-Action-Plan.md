# AISBS — Pre-Deployment Action Plan
**Based on:** ACA Deep-Dive Audit · March 10, 2026  
**Owner:** Davor Mulalić  
**Status:** Remediation in progress — 5 blockers must be resolved before go-live

---

## Owner Decisions Recorded

Before the action plan, two items from the ACA report have been closed by owner decision:

| # | Item | Decision |
|---|------|----------|
| Q3 | Production Mode key routing is a UI placeholder | ✅ **ACCEPTED AS-IS.** By design: users who want Production Mode responses supply their own API key and bear their own costs. No server-side routing needed. |
| Q9 | Edge Function has no JWT validation | ✅ **ACCEPTED AS-IS.** The free API key used by the platform is intentionally public-facing. Cost exposure is bounded by the free tier. This is a product decision, not a bug. |

These two items are **closed** and removed from the action backlog.

---

## Deployment Readiness Dashboard

| Domain | Area | Status | Blocker? |
|--------|------|--------|----------|
| A | AI & RAG Architecture | 🟠 AMBER | No |
| B | Data Model & Sessions | 🔴 RED | **YES** |
| C | Auth & Access Gating | 🔴 RED | **YES** |
| D | PDF Export | 🟢 GREEN | No |
| E | Performance & Errors | 🟠 AMBER | No |
| F | Deployment & Config | 🔴 RED | **YES** |
| G | Provider Flexibility | ⚪ GRAY | No |

> **Go-live is blocked** until all RED domain items are resolved.  
> AMBER and GRAY items are recommended but not blocking.

---

## 🔴 BLOCKERS — Must fix before deployment

---

### B1 — `chat_messages` has no user isolation
**File:** Migration `20260210...`, Line 40 & 50  
**Problem:** No `user_id` column. RLS policy uses `USING (true)` — every chat message is readable by any user who knows a `session_id`.  
**Fix:**
```sql
-- 1. Add user_id column
ALTER TABLE chat_messages
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Backfill if needed, then make non-nullable
ALTER TABLE chat_messages ALTER COLUMN user_id SET NOT NULL;

-- 3. Replace the open RLS policy
DROP POLICY "Chat messages are public" ON chat_messages;

CREATE POLICY "Users can only access own messages"
  ON chat_messages FOR ALL
  USING (auth.uid() = user_id);
```

---

### B2 — `session_id` is volatile and client-generated
**File:** `useExecutionChat.ts`  
**Problem:** `crypto.randomUUID()` generates a new ID per page load. No persistent session is written to the backend. Chat history is lost on refresh.  
**Fix:** On session start, `INSERT` a session record server-side tied to `auth.uid()` and return the stable `session_id` to the client. Store in React state, not regenerated on re-render.

---

### B3 — PostGIS extension is unused
**Problem:** Installed but never referenced. Unnecessary attack surface and migration overhead.  
**Fix:**
```sql
DROP EXTENSION IF EXISTS postgis;
```

---

### C1 — Proprietary book content (`problems` table) is publicly readable
**File:** Migration `20260210...`, Line 37  
**Problem:** `problems` RLS policy uses `USING (true)`. The entire book content is accessible to unauthenticated visitors with the Supabase anon key.  
**Fix:**
```sql
-- Option A: Require authentication only
DROP POLICY "Problems are public" ON problems;
CREATE POLICY "Authenticated users can read problems"
  ON problems FOR SELECT
  USING (auth.role() = 'authenticated');

-- Option B: Role-based (if free/premium tiers are planned)
CREATE POLICY "Premium users can read problems"
  ON problems FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'premium'
    )
  );
```

---

### F1 — Edge Function CORS is open to all origins
**File:** `aisbs-chat/index.ts`, Line 4  
**Problem:** `Access-Control-Allow-Origin: "*"` allows any third-party domain to proxy requests through this endpoint.  
**Fix:**
```typescript
const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") ?? "https://your-production-domain.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```
Set `ALLOWED_ORIGIN` as a Supabase Edge Function secret in the dashboard.

---

### F2 — No environment variable validation at startup
**Files:** `client.ts`, `useExecutionChat.ts`  
**Problem:** `import.meta.env` values are used directly with no guards. A missing variable causes a silent failure or a cryptic runtime crash.  
**Fix:** Create `src/lib/env.ts`:
```typescript
import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

export const env = envSchema.parse({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
```
Import `env` from this file everywhere instead of accessing `import.meta.env` directly.

---

## 🟠 RECOMMENDED — Fix soon, not blocking

---

### A1 — Chat agent has shallow book knowledge (~600 token context)
**Risk:** The AI only knows chapter titles and problem IDs — not full problem content. Deep or specific queries will hallucinate.  
**Recommendation:** For v1.0 this is acceptable. Plan a Vector RAG migration (pgvector + embeddings table) for v1.1 if user feedback reveals accuracy issues.

---

### A2 — Metrics chart lost if stream breaks mid-comment
**File:** `lib/aiHtml.ts` — `extractMetricsFromAiText`  
**Risk:** The `<!--AISBS_METRICS:{...}-->` payload is only parsed after the full stream completes. A dropped connection loses the chart silently.  
**Recommendation:** Wrap chart extraction in a try/catch that shows a "Chart unavailable — stream was interrupted" fallback rather than no chart and no explanation.

---

### E1 — Single global Error Boundary will crash entire app on AI parse failure
**File:** `App.tsx`  
**Risk:** A malformed AI response that throws inside `ResponseVisuals` propagates to the top-level boundary and resets the whole application.  
**Recommendation:**
```tsx
// Wrap just the execution console
<ErrorBoundary fallback={<AIConsoleFallback />}>
  <PromptExecutionConsole />
</ErrorBoundary>
```

---

### E2 — No reconnect/retry on dropped ReadableStream
**File:** `useExecutionChat.ts`, Line 55  
**Risk:** A network drop mid-generation leaves the UI in a spinning/incomplete state with no recovery path.  
**Recommendation:** Add a simple retry wrapper with max 2 retries and a user-visible "Connection lost — retry?" button as fallback.

---

## ⚪ NOTED — Low priority, post-launch backlog

---

### G1 — Single LLM provider, no fallback
A Gemini API outage takes down Simulation Mode entirely. Post-launch, add a Groq fallback in the Edge Function with a simple timeout-based switch.

### G2 — No provider-specific prompt variants
If users bring their own Claude or Groq key, the `<!--AISBS_METRICS-->` extraction may fail because those models may not follow the formatting instruction as reliably as Gemini. Add per-provider prompt variants when Production Mode key routing is implemented.

### D1 — Charts excluded from PDF export
Currently intentional. If users request chart exports in feedback, implement an SVG-to-PNG rasterization step before PDF generation.

---

## Action Checklist

```
BLOCKERS (must complete before go-live)
[ ] B1 — Add user_id to chat_messages + fix RLS policy
[ ] B2 — Implement persistent server-side session_id
[ ] B3 — Drop unused PostGIS extension
[ ] C1 — Restrict problems table RLS to authenticated users
[ ] F1 — Lock Edge Function CORS to production domain
[ ] F2 — Add Zod env validation in src/lib/env.ts

RECOMMENDED (complete within first 2 sprints post-launch)
[ ] A2 — Graceful fallback when metrics stream breaks
[ ] E1 — Add localized Error Boundary around AI Console
[ ] E2 — Add retry/reconnect logic for dropped streams

BACKLOG (post-launch, prioritize by user feedback)
[ ] A1 — Vector RAG migration for deeper book queries
[ ] G1 — Groq fallback in Edge Function
[ ] G2 — Provider-specific prompt templates
[ ] D1 — Chart-to-PNG in PDF export
```

---

*Document compiled March 10, 2026 · Owner-reviewed decisions incorporated · Ready to send to development team.*
