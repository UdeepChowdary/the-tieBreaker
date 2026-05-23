-- Create the decisions table
CREATE TABLE public.decisions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  "analysisType" text NOT NULL,
  "analysisData" jsonb NOT NULL,
  weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  "updatedAt" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.decisions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own decisions"
  ON public.decisions FOR SELECT
  USING (auth.uid() = "userId");

CREATE POLICY "Users can insert their own decisions"
  ON public.decisions FOR INSERT
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their own decisions"
  ON public.decisions FOR UPDATE
  USING (auth.uid() = "userId")
  WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can delete their own decisions"
  ON public.decisions FOR DELETE
  USING (auth.uid() = "userId");

-- Create realtime publication (if you want real-time updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.decisions;
