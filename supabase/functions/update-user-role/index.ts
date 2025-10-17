import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Service role client for privileged operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);

    // Require Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User-scoped client to read the calling user from the JWT
    const userSupabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) {
      console.error('update-user-role: auth failed', userError);
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Define and validate input schema
    const UpdateRoleSchema = z.object({
      userId: z.string().uuid("Invalid user ID format"),
      role: z.enum(['platform_admin', 'platform_owner'], { errorMap: () => ({ message: "Invalid role" }) })
    });

    // Parse and validate request body
    const body = await req.json();
    let validatedData;
    try {
      validatedData = UpdateRoleSchema.parse(body);
    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationError.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { userId, role } = validatedData;

    // Permission checks using SECURITY DEFINER function via service client
    const { data: isAdmin, error: adminCheckErr } = await supabaseAdmin.rpc('has_platform_role', {
      _user_id: user.id,
      _role: 'platform_admin',
    });
    if (adminCheckErr) {
      console.error('update-user-role: admin check failed', adminCheckErr);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isOwner } = await supabaseAdmin.rpc('has_platform_role', {
      _user_id: user.id,
      _role: 'platform_owner',
    });

    if (!isAdmin && !isOwner) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (userId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot modify your own role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (role === 'platform_owner' && !isOwner) {
      return new Response(
        JSON.stringify({ error: 'Only platform owners can assign owner role' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update role: delete existing then insert new (service client bypasses RLS)
    const { error: delErr } = await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);
    if (delErr) {
      console.error('update-user-role: delete old role failed', delErr);
      return new Response(
        JSON.stringify({ error: 'Failed to delete old role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: insErr } = await supabaseAdmin.from('user_roles').insert({
      user_id: userId,
      role,
      created_by: user.id,
    });
    if (insErr) {
      console.error('update-user-role: insert new role failed', insErr);
      return new Response(
        JSON.stringify({ error: 'Failed to insert new role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('update-user-role: unexpected error', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
