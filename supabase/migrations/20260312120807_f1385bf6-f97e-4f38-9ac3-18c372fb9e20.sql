-- Update wiany's password to padded 4-digit PIN (1234 -> 123400)
UPDATE auth.users 
SET encrypted_password = crypt('123400', gen_salt('bf'))
WHERE id = '94c5f14d-b78f-44f8-9977-0dd66c73e70c';