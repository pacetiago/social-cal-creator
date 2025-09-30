import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PublicCalendarRequest {
  token: string;
  action: 'validate' | 'get-data';
  filters?: {
    clientId?: string;
    companyId?: string;
    responsibility?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Public calendar function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action, filters = {} }: PublicCalendarRequest = await req.json();
    
    console.log('Request received:', { token: token?.substring(0, 10) + '...', action, filters });

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate token and get organization
    const { data: shareToken, error: tokenError } = await supabase
      .from('share_tokens')
      .select(`
        *,
        orgs:org_id (
          id,
          name,
          slug
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !shareToken) {
      console.error('Token validation failed:', tokenError);
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if token is expired
    if (shareToken.expires_at && new Date(shareToken.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'Token has expired' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const orgId = shareToken.org_id;
    console.log('Valid token for org:', orgId);

    if (action === 'validate') {
      return new Response(JSON.stringify({
        valid: true,
        organization: shareToken.orgs
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get-data') {
      // Fetch clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name');

      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      }

      // Fetch companies (if client filter is applied)
      let companies = [];
      if (filters.clientId) {
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('client_id', filters.clientId)
          .eq('is_active', true)
          .order('name');

        if (companiesError) {
          console.error('Error fetching companies:', companiesError);
        } else {
          companies = companiesData || [];
        }
      }

      // Fetch channels
      const { data: channels, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name');

      if (channelsError) {
        console.error('Error fetching channels:', channelsError);
      }

      // Fetch campaigns
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true)
        .order('name');

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
      }

      // Build posts query with filters
      let postsQuery = supabase
        .from('posts')
        .select(`
          *,
          client:clients(id, name),
          company:companies(id, name, color),
          channel:channels(id, name, key),
          campaign:campaigns(id, name)
        `)
        .eq('org_id', orgId)
        .order('publish_at', { ascending: true });

      if (filters.clientId) {
        postsQuery = postsQuery.eq('client_id', filters.clientId);
      }

      if (filters.companyId) {
        postsQuery = postsQuery.eq('company_id', filters.companyId);
      }

      if (filters.responsibility) {
        postsQuery = postsQuery.eq('responsibility', filters.responsibility);
      }

      const { data: posts, error: postsError } = await postsQuery;

      if (postsError) {
        console.error('Error fetching posts:', postsError);
      }

      console.log('Data fetched successfully:', {
        clients: clients?.length || 0,
        companies: companies.length,
        channels: channels?.length || 0,
        campaigns: campaigns?.length || 0,
        posts: posts?.length || 0
      });

      return new Response(JSON.stringify({
        organization: shareToken.orgs,
        clients: clients || [],
        companies,
        channels: channels || [],
        campaigns: campaigns || [],
        posts: posts || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in public-calendar function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);