-- Create workflows table
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS (Row Level Security) policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own workflows
CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (auth.jwt() ->> 'sub' = user_id);

-- Policy: Users can insert their own workflows
CREATE POLICY "Users can insert own workflows" ON workflows
  FOR INSERT WITH CHECK (auth.jwt() ->> 'sub' = user_id);

-- Policy: Users can update their own workflows
CREATE POLICY "Users can update own workflows" ON workflows
  FOR UPDATE USING (auth.jwt() ->> 'sub' = user_id);

-- Policy: Users can delete their own workflows
CREATE POLICY "Users can delete own workflows" ON workflows
  FOR DELETE USING (auth.jwt() ->> 'sub' = user_id);

-- Create index for better performance
CREATE INDEX workflows_user_id_idx ON workflows(user_id);
CREATE INDEX workflows_updated_at_idx ON workflows(updated_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();