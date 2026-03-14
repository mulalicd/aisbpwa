
-- AISBS Admin Access Fixes (ACA Compliance)

-- 1. Ensure user_roles has a strict unique constraint on user_id (Single role per user model)
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);

-- 2. Seed owner admin role (using deterministic identification)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'mulalic.davor@outlook.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- 3. Robust RLS for user_roles
-- Drop existing policies if they exist to avoid confusion
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Allow users to read their own role (Critical for frontend guard)
CREATE POLICY "Users can read own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow service role (migrations/database actions) to manage everything
CREATE POLICY "Service role can manage roles"
  ON public.user_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow existing admins to manage other roles (Operational admin access)
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Verify existing admin functions stay secured
ALTER FUNCTION public.has_role(_user_id uuid, _role app_role) SECURITY DEFINER;
