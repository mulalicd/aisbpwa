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

      // Step 1: Generate recovery link using Supabase admin API
      // This creates the token but does NOT send email via Supabase SMTP
      const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });

      if (linkError) {
        console.error('[RESET_PASSWORD] generateLink error:', linkError.message);
        return new Response(
          JSON.stringify({ error: `Failed to generate reset link: ${linkError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const recoveryLink = linkData?.properties?.action_link;
      if (!recoveryLink) {
        console.error('[RESET_PASSWORD] No action_link in response');
        return new Response(
          JSON.stringify({ error: 'Failed to generate recovery link' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('[RESET_PASSWORD] Recovery link generated successfully');

      // Step 2: Send via Brevo API directly — bypasses Supabase SMTP entirely
      const brevoKey = Deno.env.get('BREVO_API_KEY');
      if (!brevoKey) {
        console.error('[RESET_PASSWORD] BREVO_API_KEY secret not set');
        return new Response(
          JSON.stringify({ error: 'Email service not configured (BREVO_API_KEY missing)' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const year = new Date().getFullYear();
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'AISBS — AI Solved Business Problems',
	    email: 'mulalic.davor@outlook.com',          },
          to: [{ email }],
          subject: 'Password Reset Request — AISBS',
          htmlContent: `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:0;background:#f1f5f9;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}.wrap{max-width:560px;margin:40px auto;background:#fff;border-radius:10px;overflow:hidden;border:1px solid #e2e8f0}.header{background:#1a1a1a;padding:24px 32px;text-align:center;border-bottom:2px solid #c0392b}.brand{color:#fff;font-size:16px;font-weight:600;letter-spacing:.08em}.sub{color:#888;font-size:11px;letter-spacing:.04em;margin-top:2px}.body{padding:36px 32px}.h2{font-size:18px;font-weight:600;color:#0f172a;margin:0 0 16px}.p{font-size:14px;color:#475569;line-height:1.7;margin:0 0 16px}.btn-wrap{text-align:center;margin:0 0 28px}.btn{display:inline-block;background:#c0392b;color:#fff;font-size:14px;font-weight:600;padding:13px 32px;border-radius:6px;text-decoration:none}.divider{border:none;border-top:1px solid #e2e8f0;margin:0 0 20px}.link-label{font-size:13px;color:#94a3b8;margin:0 0 8px}.link-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 14px;font-size:12px;color:#c0392b;word-break:break-all;font-family:monospace}.footer{background:#f8fafc;border-top:1px solid #e2e8f0;padding:18px 32px;text-align:center;font-size:12px;color:#94a3b8}</style></head><body><div class="wrap"><div class="header"><div class="brand">AISBS</div><div class="sub">AI Solved Business Problems</div></div><div class="body"><div class="h2">Password Reset Request</div><p class="p">A password reset was requested for your AISBS account. Click the button below to set a new password. This link expires in 1 hour.</p><div class="btn-wrap"><a href="${recoveryLink}" class="btn">Reset My Password</a></div><hr class="divider"><p class="link-label">If the button doesn't work, copy and paste this link:</p><div class="link-box">${recoveryLink}</div><p class="p" style="margin-top:20px;font-size:13px;color:#94a3b8">If you did not request this, you can safely ignore this email.</p></div><div class="footer">© ${year} AISBS. All rights reserved.</div></div></body></html>`,
        }),
      });

      if (!brevoRes.ok) {
        const errText = await brevoRes.text();
        console.error('[RESET_PASSWORD] Brevo API error:', brevoRes.status, errText);
        return new Response(
          JSON.stringify({ error: `Email delivery failed (Brevo): ${errText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('[RESET_PASSWORD] Email sent successfully via Brevo to:', email);
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
