import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ─── VAPID JWT helpers ─────────────────────────────────────────

function base64UrlEncode(data: Uint8Array): string {
  let binary = '';
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importVapidPrivateKey(base64Key: string): Promise<CryptoKey> {
  const raw = base64UrlDecode(base64Key);
  return crypto.subtle.importKey(
    'pkcs8',
    raw,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64: string,
  expSeconds = 86400
): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = { aud: audience, exp: now + expSeconds, sub: subject };

  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  const key = await importVapidPrivateKey(privateKeyBase64);
  const signature = new Uint8Array(
    await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      key,
      enc.encode(unsignedToken)
    )
  );

  return `${unsignedToken}.${base64UrlEncode(signature)}`;
}

function getAudience(endpoint: string): string {
  const url = new URL(endpoint);
  return `${url.protocol}//${url.host}`;
}

// ─── Send a single Web Push message ────────────────────────────

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; status?: number; removed?: boolean }> {
  const audience = getAudience(subscription.endpoint);
  const jwt = await createVapidJwt(audience, vapidSubject, vapidPrivateKey);

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      TTL: '86400',
      Urgency: 'high',
      Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    },
    body: new TextEncoder().encode(payload),
  });

  const responseText = await response.text();

  // 201 = created/delivered, 202 = accepted
  if (response.status === 201 || response.status === 202) {
    return { success: true, status: response.status };
  }

  // 404 or 410 = subscription expired/invalid, should remove
  if (response.status === 404 || response.status === 410) {
    return { success: false, status: response.status, removed: true };
  }

  console.error(`Push failed ${response.status}: ${responseText}`);
  return { success: false, status: response.status };
}

// ─── Main handler ──────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, profileId, title, body: notifBody, data } = await req.json();

    // ─── Return VAPID public key ─────────────────────────────
    if (action === 'get-vapid-key') {
      const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
      if (!vapidPublicKey) {
        return new Response(
          JSON.stringify({ error: 'VAPID_PUBLIC_KEY not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ vapidPublicKey }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ─── Send push notification ──────────────────────────────
    if (action === 'send') {
      const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
      const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
      const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

      if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        return new Response(
          JSON.stringify({ error: 'VAPID keys not configured' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      // Fetch subscriptions for profile
      const { data: subscriptions, error: subErr } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('profile_id', profileId);

      if (subErr || !subscriptions || subscriptions.length === 0) {
        return new Response(
          JSON.stringify({ sent: 0, message: 'No subscriptions found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const payload = JSON.stringify({
        title: title || 'Kivara',
        body: notifBody || '',
        data: data || {},
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });

      let sent = 0;
      const vapidSubject = 'mailto:push@kivara.app';

      for (const sub of subscriptions) {
        try {
          const result = await sendWebPush(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            payload,
            VAPID_PUBLIC_KEY,
            VAPID_PRIVATE_KEY,
            vapidSubject
          );

          if (result.success) {
            sent++;
          } else if (result.removed) {
            // Remove expired subscription
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('id', sub.id);
            console.log(`Removed expired subscription ${sub.id}`);
          }
        } catch (e) {
          console.error('Failed to send push to subscription:', sub.id, e);
        }
      }

      return new Response(
        JSON.stringify({ sent, total: subscriptions.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Unknown action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('send-push-notification error:', e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
