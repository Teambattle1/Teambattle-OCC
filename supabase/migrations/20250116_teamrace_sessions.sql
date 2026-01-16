-- Create teamrace_sessions table for storing TeamRace tournament data
CREATE TABLE IF NOT EXISTS public.teamrace_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_name TEXT NOT NULL,
  tournament_data JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.teamrace_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all sessions
CREATE POLICY "Allow authenticated read teamrace sessions"
ON public.teamrace_sessions FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert sessions
CREATE POLICY "Allow authenticated insert teamrace sessions"
ON public.teamrace_sessions FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Allow authenticated users to update sessions
CREATE POLICY "Allow authenticated update teamrace sessions"
ON public.teamrace_sessions FOR UPDATE
TO authenticated
USING (true);

-- Policy: Allow authenticated users to delete sessions
CREATE POLICY "Allow authenticated delete teamrace sessions"
ON public.teamrace_sessions FOR DELETE
TO authenticated
USING (true);

-- Grant access to authenticated users
GRANT ALL ON public.teamrace_sessions TO authenticated;
GRANT ALL ON public.teamrace_sessions TO service_role;
