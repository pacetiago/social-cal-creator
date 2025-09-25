import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, email, ip_address } = await req.json();

    if (action === 'check') {
      // Check rate limits
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Check IP-based rate limiting (5 attempts per hour)
      const { data: ipAttempts } = await supabase
        .from('auth_rate_limits')
        .select('attempt_count, blocked_until')
        .eq('ip_address', ip_address)
        .gte('last_attempt', oneHourAgo.toISOString())
        .order('last_attempt', { ascending: false })
        .limit(1);

      if (ipAttempts && ipAttempts.length > 0) {
        const latest = ipAttempts[0];
        if (latest.blocked_until && new Date(latest.blocked_until) > now) {
          return new Response(JSON.stringify({ 
            allowed: false, 
            reason: 'IP blocked',
            blocked_until: latest.blocked_until 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (latest.attempt_count >= 5) {
          // Block IP for 1 hour
          const blockUntil = new Date(now.getTime() + 60 * 60 * 1000);
          await supabase
            .from('auth_rate_limits')
            .upsert({
              ip_address,
              email,
              attempt_count: latest.attempt_count + 1,
              last_attempt: now.toISOString(),
              blocked_until: blockUntil.toISOString(),
            });

          return new Response(JSON.stringify({ 
            allowed: false, 
            reason: 'Rate limit exceeded',
            blocked_until: blockUntil.toISOString() 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      // Check email-based rate limiting (3 attempts per hour per email)
      if (email) {
        const { data: emailAttempts } = await supabase
          .from('auth_rate_limits')
          .select('attempt_count')
          .eq('email', email)
          .gte('last_attempt', oneHourAgo.toISOString());

        const totalEmailAttempts = emailAttempts?.reduce((sum, attempt) => sum + attempt.attempt_count, 0) || 0;
        
        if (totalEmailAttempts >= 3) {
          return new Response(JSON.stringify({ 
            allowed: false, 
            reason: 'Email rate limit exceeded' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }

      return new Response(JSON.stringify({ allowed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'record') {
      // Record failed attempt
      await supabase
        .from('auth_rate_limits')
        .upsert({
          ip_address,
          email,
          attempt_count: 1,
          last_attempt: new Date().toISOString(),
        });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in rate-limit function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});