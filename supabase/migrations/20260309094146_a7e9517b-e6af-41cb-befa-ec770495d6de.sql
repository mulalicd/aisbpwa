-- Seed admin role for existing admin user
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'mulalic.davor@outlook.com'
ON CONFLICT DO NOTHING;