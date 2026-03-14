import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[AUTH] Missing or malformed Authorization header');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // FIX: Use service role client + getUserById to verify JWT.
    // The original callerClient.auth.getUser() with anonKey fails for ES256
    // JWT tokens (new Supabase project format), producing spurious 401 errors.
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Decode JWT to extract user ID without verification
    // (adminClient.auth.admin.getUserById then confirms the user actually exists)
    let userId: string;
    try {
      const token = authHeader.slice(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      if (!userId) throw new Error('No sub claim in token');
    } catch (e) {
      console.error('[AUTH] Failed to decode JWT:', e);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { data: userData, error: userError } = await adminClient.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      console.error('[AUTH] getUserById failed:', userError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check admin role
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      console.error('[AUTH] User', userId, 'is not admin');
      return new Response(JSON.stringify({ error: 'Forbidden: admin only' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    console.log('[REQUEST] method:', req.method, 'action:', action);

    // GET — list users
    if (req.method === 'GET') {
      const { data, error } = await adminClient.auth.admin.listUsers({ perPage: 200 });
      if (error) {
        console.error('[LIST_USERS] Error:', error.message);
        throw error;
      }
      return new Response(JSON.stringify({ users: data.users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json().catch(() => ({}));

    // POST — create user
    if (req.method === 'POST' && action === 'create') {
      const { email, password } = body;
      console.log('[CREATE_USER] email:', email);
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) {
        console.error('[CREATE_USER] Error:', error.message);
        throw error;
      }
      return new Response(JSON.stringify({ user: data.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST — delete user
    if (req.method === 'POST' && action === 'delete') {
      const { userId: targetId } = body;
      if (targetId === userId) {
        return new Response(JSON.stringify({ error: 'Cannot delete yourself' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      console.log('[DELETE_USER] targetId:', targetId);
      const { error } = await adminClient.auth.admin.deleteUser(targetId);
      if (error) {
        console.error('[DELETE_USER] Error:', error.message);
        throw error;
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // POST — send password reset email
    if (req.method === 'POST' && action === 'reset-password') {
      const { email } = body;
      const siteUrl = Deno.env.get('SITE_URL') ?? 'https://aisbpwa.ai-studio.wiki';
      const redirectTo = `${siteUrl}/reset-password`;
      console.log('[RESET_PASSWORD] email:', email, 'redirectTo:', redirectTo);

      const { error } = await adminClient.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        console.error('[RESET_PASSWORD] Error:', error.message, '| status:', error.status);

        // Specific error messages for known failure modes
        if (error.message?.toLowerCase().includes('rate limit') ||
            error.status === 429) {
          return new Response(
            JSON.stringify({ error: 'Email rate limit exceeded. Supabase free tier allows 3 emails/hour. Please wait and try again, or configure Custom SMTP in Supabase Dashboard.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (error.message?.toLowerCase().includes('smtp') ||
            error.message?.toLowerCase().includes('email')) {
          return new Response(
            JSON.stringify({ error: `Email delivery failed: ${error.message}. Please configure Custom SMTP in Supabase Dashboard → Authentication → SMTP Settings.` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        throw error;
      }

      console.log('[RESET_PASSWORD] Email sent successfully to:', email);
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[UNHANDLED_ERROR]', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
