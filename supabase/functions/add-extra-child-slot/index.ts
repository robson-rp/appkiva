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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is parent
    const { data: roles } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (!roles?.some(r => r.role === 'parent')) {
      return new Response(JSON.stringify({ error: 'Apenas encarregados podem adicionar crianças extra' }), { status: 403, headers: corsHeaders });
    }

    // Get profile & tenant
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, tenant_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.tenant_id) {
      return new Response(JSON.stringify({ error: 'Tenant não encontrado' }), { status: 400, headers: corsHeaders });
    }

    // Get current tier & extra_child_price
    const { data: tenant } = await adminClient
      .from('tenants')
      .select('subscription_tier_id, extra_children_purchased')
      .eq('id', profile.tenant_id)
      .single();

    if (!tenant?.subscription_tier_id) {
      return new Response(JSON.stringify({ error: 'Plano de subscrição não encontrado' }), { status: 400, headers: corsHeaders });
    }

    const { data: tier } = await adminClient
      .from('subscription_tiers')
      .select('name, extra_child_price, currency')
      .eq('id', tenant.subscription_tier_id)
      .single();

    const extraPrice = Number(tier?.extra_child_price ?? 0);
    if (extraPrice <= 0) {
      return new Response(JSON.stringify({ error: 'Preço de criança extra não configurado para este plano' }), { status: 400, headers: corsHeaders });
    }

    // Increment extra_children_purchased
    const { error: updateError } = await adminClient
      .from('tenants')
      .update({ extra_children_purchased: (tenant.extra_children_purchased ?? 0) + 1 })
      .eq('id', profile.tenant_id);

    if (updateError) throw updateError;

    // Create one-time invoice
    const { error: invoiceError } = await adminClient
      .from('subscription_invoices')
      .insert({
        tenant_id: profile.tenant_id,
        tier_id: tenant.subscription_tier_id,
        amount: extraPrice,
        currency: tier?.currency ?? 'USD',
        billing_period: 'one_time',
        status: 'paid',
        due_date: new Date().toISOString(),
        paid_at: new Date().toISOString(),
        payment_method: 'in_app',
      });

    if (invoiceError) throw invoiceError;

    return new Response(JSON.stringify({
      success: true,
      extra_children_purchased: (tenant.extra_children_purchased ?? 0) + 1,
      price: extraPrice,
      currency: tier?.currency,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500, headers: corsHeaders });
  }
});
