-- Create the fejlsogning_reports table for storing error reports
CREATE TABLE IF NOT EXISTS fejlsogning_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity TEXT NOT NULL,
  activity_name TEXT NOT NULL,
  date DATE NOT NULL,
  gear TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  reported_by TEXT NOT NULL,
  reported_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by TEXT,
  resolved_at TIMESTAMPTZ
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_fejlsogning_activity ON fejlsogning_reports(activity);
CREATE INDEX IF NOT EXISTS idx_fejlsogning_created_at ON fejlsogning_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fejlsogning_resolved ON fejlsogning_reports(resolved);

-- Enable Row Level Security
ALTER TABLE fejlsogning_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON fejlsogning_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to read all reports
CREATE POLICY "Allow authenticated users to read" ON fejlsogning_reports
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to update (for resolved status)
CREATE POLICY "Allow authenticated users to update" ON fejlsogning_reports
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete" ON fejlsogning_reports
  FOR DELETE
  TO authenticated
  USING (true);

-- Grant permissions
GRANT ALL ON fejlsogning_reports TO authenticated;
GRANT ALL ON fejlsogning_reports TO service_role;
