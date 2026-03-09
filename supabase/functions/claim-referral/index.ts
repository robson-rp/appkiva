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

    const { referral_code } = await req.json();
    if (!referral_code || typeof referral_code !== 'string') {
      return new Response(JSON.stringify({ error: 'Referral code is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get referred user's profile
    const { data: referredProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!referredProfile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Find referral code
    const { data: refCode } = await supabase
      .from('referral_codes')
      .select('id, profile_id')
      .eq('code', referral_code.toUpperCase())
      .single();

    if (!refCode) {
      return new Response(JSON.stringify({ error: 'Invalid referral code' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Can't refer yourself
    if (refCode.profile_id === referredProfile.id) {
      return new Response(JSON.stringify({ error: 'Cannot use your own referral code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check not already claimed
    const { data: existing } = await supabase
      .from('referral_claims')
      .select('id')
      .eq('referred_profile_id', referredProfile.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Already claimed a referral' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert claim
    const { error: claimError } = await supabase
      .from('referral_claims')
      .insert({
        referral_code_id: refCode.id,
        referred_profile_id: referredProfile.id,
        bonus_awarded: true,
      });

    if (claimError) {
      return new Response(JSON.stringify({ error: claimError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Award KVC to referrer (100 KVC)
    const { data: systemWallet } = await supabase
      .rpc('get_system_wallet_id');

    const { data: referrerWallet } = await supabase
      .from('wallets')
      .select('id')
      .eq('profile_id', refCode.profile_id)
      .eq('wallet_type', 'virtual')
      .eq('currency', 'KVC')
      .single();

    if (systemWallet && referrerWallet) {
      await supabase.from('ledger_entries').insert({
        amount: 100,
        debit_wallet_id: systemWallet,
        credit_wallet_id: referrerWallet.id,
        created_by: refCode.profile_id,
        entry_type: 'adjustment',
        description: 'Bónus de referral — novo utilizador convidado',
        idempotency_key: `referral-${referredProfile.id}`,
        metadata: { type: 'referral_bonus', referred_profile_id: referredProfile.id },
      });

      // Check milestone: 3 referrals = extra 100 KVC
      const { count } = await supabase
        .from('referral_claims')
        .select('id', { count: 'exact', head: true })
        .eq('referral_code_id', refCode.id);

      if (count === 3) {
        await supabase.from('ledger_entries').insert({
          amount: 100,
          debit_wallet_id: systemWallet,
          credit_wallet_id: referrerWallet.id,
          created_by: refCode.profile_id,
          entry_type: 'adjustment',
          description: 'Bónus milestone — 3 amigos convidados!',
          idempotency_key: `referral-milestone-3-${refCode.id}`,
          metadata: { type: 'referral_milestone', milestone: 3 },
        });
      }
    }

    return new Response(JSON.stringify({ success: true, bonus: 100 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
