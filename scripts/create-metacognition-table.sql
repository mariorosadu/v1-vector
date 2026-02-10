-- Create table for metacognition dialogue history
CREATE TABLE IF NOT EXISTS metacognition_dialogues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  stage TEXT NOT NULL,
  question_index INTEGER NOT NULL,
  objective_progress NUMERIC DEFAULT 0,
  qualitative_progress NUMERIC DEFAULT 0,
  quantitative_progress NUMERIC DEFAULT 0
);

-- Create index on session_id for faster queries
DROP INDEX IF EXISTS idx_metacognition_session_id;
CREATE INDEX idx_metacognition_session_id ON metacognition_dialogues(session_id);

-- Create index on created_at for sorting
DROP INDEX IF EXISTS idx_metacognition_created_at;
CREATE INDEX idx_metacognition_created_at ON metacognition_dialogues(created_at DESC);

-- Enable RLS
ALTER TABLE metacognition_dialogues ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_insert_metacognition" ON metacognition_dialogues;
DROP POLICY IF EXISTS "allow_select_metacognition" ON metacognition_dialogues;
DROP POLICY IF EXISTS "allow_delete_metacognition" ON metacognition_dialogues;

-- Create policies
CREATE POLICY "allow_insert_metacognition" ON metacognition_dialogues FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_select_metacognition" ON metacognition_dialogues FOR SELECT USING (true);
CREATE POLICY "allow_delete_metacognition" ON metacognition_dialogues FOR DELETE USING (true);
