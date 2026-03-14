DROP POLICY IF EXISTS "Problems are public" ON public.problems;

CREATE POLICY "Authenticated users can read problems"
  ON public.problems FOR SELECT
  USING (auth.role() = 'authenticated');
