import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get caller's profile
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('id, household_id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (!callerProfile?.household_id) {
      return new Response(JSON.stringify({ error: 'No household found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check subscription allows >1 guardian
    let maxGuardians = 1;
    if (callerProfile.tenant_id) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('subscription_tier_id, subscription_tiers(max_guardians)')
        .eq('id', callerProfile.tenant_id)
        .single();

      const tier = tenant?.subscription_tiers as any;
      maxGuardians = tier?.max_guardians ?? 1;
    }

    // Count current guardians
    const { count } = await supabase
      .from('household_guardians')
      .select('id', { count: 'exact', head: true })
      .eq('household_id', callerProfile.household_id);

    if ((count ?? 0) >= maxGuardians) {
      return new Response(JSON.stringify({ error: 'Guardian limit reached. Upgrade your plan.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate invite code with guardian metadata
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];

    const { error: insertError } = await supabase
      .from('family_invite_codes')
      .insert({
        code,
        parent_profile_id: callerProfile.id,
        household_id: callerProfile.household_id,
        // We'll use expires_at default (48h)
      });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ code, email }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
