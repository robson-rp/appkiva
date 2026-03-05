
-- Create child auth user via raw insert (service role)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at, 
  raw_user_meta_data, role, aud, created_at, updated_at, confirmation_token
) VALUES (
  '1cf237d7-cd52-40af-a57d-f41404f3f626',
  '00000000-0000-0000-0000-000000000000',
  'sofia@kivara.com',
  crypt('test1234', gen_salt('bf')),
  now(),
  '{"display_name": "Sofia Teste", "avatar": "👧", "role": "child"}'::jsonb,
  'authenticated',
  'authenticated',
  now(),
  now(),
  ''
);
