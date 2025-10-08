import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase admin client  
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user making the request
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if the user has platform_admin or platform_owner role
    const { data: isPlatformAdmin } = await supabaseAdmin
      .rpc('has_platform_role', { 
        _user_id: user.id, 
        _role: 'platform_admin' 
      })

    const { data: isPlatformOwner } = await supabaseAdmin
      .rpc('has_platform_role', { 
        _user_id: user.id, 
        _role: 'platform_owner' 
      })

    if (!isPlatformAdmin && !isPlatformOwner) {
      throw new Error('Insufficient permissions - platform_admin or platform_owner role required')
    }

    // Get request body
    const { email, password, fullName, role } = await req.json()

    // Create the user using admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        full_name: fullName 
      },
      email_confirm: false
    })

    if (createError) {
      throw createError
    }

    // Insert the user's role into the user_roles table
    if (newUser.user && role) {
      // Validate role permissions: only platform_owner can create platform_owner
      if (role === 'platform_owner' && !isPlatformOwner) {
        throw new Error('Only platform owners can create other platform owners')
      }

      // Map old 'admin' role to 'platform_admin' for backward compatibility
      const platformRole = role === 'admin' ? 'platform_admin' : role;
      
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ 
          user_id: newUser.user.id, 
          role: platformRole,
          created_by: user.id
        })

      if (roleError) {
        console.error('Error assigning user role:', roleError)
        // Don't throw here as the user was created successfully
      }

      // Log role assignment in audit_log
      await supabaseAdmin
        .from('audit_log')
        .insert({
          actor_id: user.id,
          action: 'USER_CREATED',
          target_table: 'user_roles',
          target_id: newUser.user.id,
          diff: { role: platformRole, email }
        })
    }

    return new Response(
      JSON.stringify({ user: newUser.user }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})