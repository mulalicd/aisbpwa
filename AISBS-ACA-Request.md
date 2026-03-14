# AISBS — ACA Prompt: Fix Admin Panel Access
**Context:** Project runs entirely inside Lovable.dev. No direct Supabase dashboard access.  
**Bug:** Owner cannot access the Admin Panel.  
**Constraint:** All fixes must be applied via Lovable prompts only (migrations, code edits).

---

## What to diagnose first

Before writing any fix, inspect these three locations and report what you find:

1. **`src/pages/AdminPanel.tsx` (or equivalent)** — What condition gates access to this page? Is it checking `user_roles`, a `is_admin` flag, `app_metadata`, or a hardcoded email?

2. **`public.user_roles` table** — Does a row exist for the owner's user `auth.uid()`? What is the role value expected by the frontend check?

3. **The RLS policy on `user_roles`** — Can the currently authenticated user actually SELECT their own row from `user_roles`? If RLS blocks the read, the role check always returns null/false and admin access silently fails.

Report findings before applying any fix.

---

## Most likely root causes (in order of probability)

### Cause 1 — No `user_roles` row exists for the owner
The `user_roles` table exists but has no data. The frontend checks for a role record, finds nothing, and denies access.

**Fix prompt for Lovable:**
```
In the Supabase database, insert a row into the `user_roles` table 
that assigns the 'admin' role to the currently authenticated owner user. 
Create a migration that does:

INSERT INTO public.user_roles (user_id, role)
VALUES (auth.uid(), 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

If auth.uid() is not available in a migration context, expose a one-time 
admin seeding function or prompt me to enter my user UUID manually.
```

---

### Cause 2 — RLS on `user_roles` blocks the owner from reading their own row
Phase 1 security fixes may have applied strict RLS globally. If `user_roles` has no SELECT policy or uses `USING (false)`, the role check always fails silently.

**Fix prompt for Lovable:**
```
Create a migration to ensure the `user_roles` table has a correct RLS policy:

-- Allow users to read their own role
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Allow admin seeding (service role only for INSERT)
CREATE POLICY "Service role can manage roles"
  ON public.user_roles FOR ALL
  USING (auth.role() = 'service_role');
```

---

### Cause 3 — Frontend admin guard is checking the wrong field
The route guard may be looking for `is_admin: true` in `user_metadata` or `app_metadata`, but the project stores roles in `user_roles` table — these are two different systems and the check is pointed at the wrong one.

**Fix prompt for Lovable:**
```
In the admin route guard (likely in `src/hooks/useAdminAccess.ts`, 
`src/lib/auth.ts`, or inside `AdminPanel.tsx`), verify that the 
role check queries the `user_roles` table via Supabase client:

const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', session.user.id)
  .single();

const isAdmin = data?.role === 'admin';

Do NOT check user_metadata.is_admin — that field is user-editable 
and was flagged as a security risk in the ACA audit.
```

---

### Cause 4 — Route is not registered or protected route redirects incorrectly
The `/admin` route may not exist in the router, or the auth guard redirects to `/login` even when the user is authenticated because the session loads asynchronously and the guard fires before the session is ready.

**Fix prompt for Lovable:**
```
Check that the admin route in `src/App.tsx` (or router config) 
is correctly defined and that the ProtectedRoute wrapper waits 
for the Supabase session to resolve before evaluating the role check.

Add a loading state to the admin guard:

if (sessionLoading || roleLoading) return <LoadingSpinner />;
if (!isAdmin) return <Navigate to="/" />;
```

---

## Recommended fix sequence for Lovable prompt

Send these prompts to Lovable **in this order**:

**Step 1 — Diagnose:**
> "Show me the current admin access guard logic — what file controls who can see the Admin Panel, and what condition must be true for access to be granted?"

**Step 2 — Check the data:**
> "Query the `user_roles` table and show me all current rows. Also show me the RLS policies currently applied to the `user_roles` table."

**Step 3 — Apply the fix based on findings:**
> Use whichever of Cause 1–4 matches the diagnosis above.

**Step 4 — Verify:**
> "After the fix, confirm that: (1) the owner user has an 'admin' row in `user_roles`, (2) the RLS policy allows that user to SELECT it, (3) the frontend guard correctly reads and evaluates it, and (4) a non-admin authenticated user is denied access."

---

## Security note for the fix

When inserting the admin role, do NOT hardcode the owner's email in the frontend — use the `user_id` (UUID) from `auth.users`. Email-based admin checks are brittle (email can change) and can be bypassed if email confirmation is disabled.

---

*Send this document to ACA inside Lovable chat. All fixes are prompt-deliverable with no direct Supabase dashboard access required.*
