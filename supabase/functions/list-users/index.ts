import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('list-users: Starting request');

    // Create supabase client with service role for elevated permissions
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('list-users: No authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a client with the user's token to verify their identity
    const userSupabase = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the current user
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    
    if (userError || !user) {
      console.error('list-users: Invalid user token', userError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('list-users: User authenticated:', user.id);

    // SECURITY: Check if user is platform admin or owner using the secure function
    const { data: hasAdminRole, error: adminCheckError } = await supabase
      .rpc('has_platform_role', { 
        _user_id: user.id, 
        _role: 'platform_admin' 
      });

    const { data: hasOwnerRole, error: ownerCheckError } = await supabase
      .rpc('has_platform_role', { 
        _user_id: user.id, 
        _role: 'platform_owner' 
      });

    if (adminCheckError || ownerCheckError) {
      console.error('list-users: Failed to check role', adminCheckError || ownerCheckError);
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!hasAdminRole && !hasOwnerRole) {
      console.error('list-users: User is not platform admin or owner');
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Platform admin or owner access required.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('list-users: User is platform admin, fetching all profiles');

    // Fetch all profiles using service role key
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('list-users: Failed to fetch profiles', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch users' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch platform roles and merge into profiles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      console.error('list-users: Failed to fetch roles', rolesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch roles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const users = (profiles || []).map((p: any) => ({
      ...p,
      platform_role: roles?.find((r: any) => r.user_id === p.id)?.role || 'user',
    }));

    console.log('list-users: Successfully fetched', users.length, 'profiles');

    return new Response(
      JSON.stringify({ users }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('list-users: Unexpected error', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
