
-- 1. Add user_id to chat_messages and restrict access
ALTER TABLE public.chat_messages 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Note: We are not making it NOT NULL yet because there might be existing data.
-- In a real deployment, you'd backfill and then set NOT NULL.

DROP POLICY "Chat messages are public" ON public.chat_messages;
DROP POLICY "Anyone can insert chat messages" ON public.chat_messages;

CREATE POLICY "Users can only access own messages"
ON public.chat_messages FOR ALL
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 2. Restrict problems table to authenticated users
DROP POLICY "Problems are public" ON public.problems;
CREATE POLICY "Authenticated users can read problems"
ON public.problems FOR SELECT
TO authenticated
USING (true);

-- 3. Drop unused PostGIS extension
DROP EXTENSION IF EXISTS postgisCASCADE;
