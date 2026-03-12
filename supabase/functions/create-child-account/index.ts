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

    // Verify caller
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callerUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callerUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const callerUserId = callerUser.id;

    const { display_name, username, pin, avatar, date_of_birth } = await req.json();

    // Validate inputs
    if (!display_name || typeof display_name !== 'string' || display_name.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Nome inválido (mínimo 2 caracteres)' }), { status: 400, headers: corsHeaders });
    }
    if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      return new Response(JSON.stringify({ error: 'Username inválido (3-20 caracteres alfanuméricos)' }), { status: 400, headers: corsHeaders });
    }
    if (!pin || typeof pin !== 'string' || !/^\d{4,6}$/.test(pin)) {
      return new Response(JSON.stringify({ error: 'PIN inválido (4-6 dígitos)' }), { status: 400, headers: corsHeaders });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    // Verify caller is a parent
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('id, household_id, tenant_id')
      .eq('user_id', callerUserId)
      .single();

    if (!callerProfile) {
      return new Response(JSON.stringify({ error: 'Perfil de encarregado não encontrado' }), { status: 403, headers: corsHeaders });
    }

    const { data: callerRoles } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUserId);

    const isParent = callerRoles?.some(r => r.role === 'parent');
    if (!isParent) {
      return new Response(JSON.stringify({ error: 'Apenas encarregados podem criar contas de crianças' }), { status: 403, headers: corsHeaders });
    }

    // Check username uniqueness
    const { data: existingUsername } = await adminClient
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .maybeSingle();

    if (existingUsername) {
      return new Response(JSON.stringify({ error: 'Este nome de utilizador já está em uso' }), { status: 409, headers: corsHeaders });
    }

    // Check child limit
    const { data: existingChildren } = await adminClient
      .from('children')
      .select('id')
      .eq('parent_profile_id', callerProfile.id);

    // Get max from subscription tier + extra purchased
    let maxChildren = 2;
    if (callerProfile.tenant_id) {
      const { data: tenant } = await adminClient
        .from('tenants')
        .select('subscription_tier_id, extra_children_purchased')
        .eq('id', callerProfile.tenant_id)
        .single();
      if (tenant?.subscription_tier_id) {
        const { data: tier } = await adminClient
          .from('subscription_tiers')
          .select('max_children')
          .eq('id', tenant.subscription_tier_id)
          .single();
        if (tier?.max_children) maxChildren = tier.max_children;
      }
      maxChildren += (tenant?.extra_children_purchased ?? 0);
    }

    if ((existingChildren?.length ?? 0) >= maxChildren) {
      return new Response(JSON.stringify({ error: `Limite de crianças atingido (${maxChildren}). Faça upgrade do plano.` }), { status: 400, headers: corsHeaders });
    }

    // Ensure parent has a household
    let householdId = callerProfile.household_id;
    if (!householdId) {
      const { data: hId } = await adminClient.rpc('ensure_parent_household', { _profile_id: callerProfile.id });
      householdId = hId as string;
    }

    // Create auth user with synthetic email
    const syntheticEmail = `${username.toLowerCase()}@child.kivara.local`;
    const childAvatar = avatar || '🦊';

    // Check if an orphaned auth user exists with this email (from a previously deleted child)
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const orphanedUser = existingUsers?.users?.find(u => u.email === syntheticEmail);

    let childUserId: string;

    if (orphanedUser) {
      // Check if this user still has a profile linked to an active child
      const { data: existingChild } = await adminClient
        .from('children')
        .select('id')
        .eq('profile_id', (await adminClient.from('profiles').select('id').eq('user_id', orphanedUser.id).maybeSingle()).data?.id || '')
        .maybeSingle();

      if (existingChild) {
        return new Response(JSON.stringify({ error: 'Este nome de utilizador já está em uso por outra criança activa' }), { status: 409, headers: corsHeaders });
      }

      // Orphaned user — delete and recreate
      await adminClient.auth.admin.deleteUser(orphanedUser.id);
      // Also clean up orphaned profile/roles
      await adminClient.from('user_roles').delete().eq('user_id', orphanedUser.id);
      await adminClient.from('profiles').delete().eq('user_id', orphanedUser.id);
    }

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email: syntheticEmail,
      password: pin,
      email_confirm: true,
      user_metadata: {
        display_name: display_name.trim(),
        role: 'child',
        avatar: childAvatar,
        country: 'AO',
      },
    });

    if (createError || !newUser.user) {
      console.error('Create user error:', createError);
      return new Response(JSON.stringify({ error: createError?.message || 'Erro ao criar conta da criança' }), { status: 500, headers: corsHeaders });
    }

    // Wait briefly for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get the child's profile (created by handle_new_user trigger)
    const { data: childProfile } = await adminClient
      .from('profiles')
      .select('id')
      .eq('user_id', newUser.user.id)
      .single();

    if (!childProfile) {
      return new Response(JSON.stringify({ error: 'Erro ao criar perfil da criança' }), { status: 500, headers: corsHeaders });
    }

    // Update profile with household, tenant, username
    await adminClient
      .from('profiles')
      .update({
        household_id: householdId,
        tenant_id: callerProfile.tenant_id,
        username: username.toLowerCase(),
      })
      .eq('id', childProfile.id);

    // Insert into children table
    const { data: childRecord, error: childError } = await adminClient
      .from('children')
      .insert({
        profile_id: childProfile.id,
        parent_profile_id: callerProfile.id,
        nickname: display_name.trim(),
        date_of_birth: date_of_birth || null,
      })
      .select('id')
      .single();

    if (childError) {
      console.error('Insert child error:', childError);
      return new Response(JSON.stringify({ error: childError.message }), { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({
      success: true,
      child_id: childRecord.id,
      profile_id: childProfile.id,
      username: username.toLowerCase(),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), { status: 500, headers: corsHeaders });
  }
});
