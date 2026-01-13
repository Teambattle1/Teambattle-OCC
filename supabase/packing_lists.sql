-- Create the packing_lists table for storing custom packing lists
CREATE TABLE IF NOT EXISTS packing_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity TEXT NOT NULL,
  list_type TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT,
  UNIQUE(activity, list_type)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_packing_lists_activity ON packing_lists(activity);
CREATE INDEX IF NOT EXISTS idx_packing_lists_lookup ON packing_lists(activity, list_type);

-- Enable Row Level Security
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all lists
CREATE POLICY "Allow authenticated users to read" ON packing_lists
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy to allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to insert" ON packing_lists
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" ON packing_lists
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON packing_lists TO authenticated;
GRANT ALL ON packing_lists TO service_role;
