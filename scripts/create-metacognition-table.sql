-- Create table for metacognition dialogue history
CREATE TABLE IF NOT EXISTS metacognition_dialogues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  stage TEXT NOT NULL, -- 'objective', 'qualitative', 'quantitative', 'complete'
  question_index INTEGER NOT NULL,
  objective_progress NUMERIC DEFAULT 0,
  qualitative_progress NUMERIC DEFAULT 0,
  quantitative_progress NUMERIC DEFAULT 0
);

-- Create index on session_id for faster queries
CREATE INDEX IF NOT EXISTS idx_metacognition_session_id ON metacognition_dialogues(session_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_metacognition_created_at ON metacognition_dialogues(created_at DESC);

-- Enable RLS
ALTER TABLE metacognition_dialogues ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "allow_insert_metacognition" ON metacognition_dialogues FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "allow_select_metacognition" ON metacognition_dialogues FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "allow_delete_metacognition" ON metacognition_dialogues FOR DELETE USING (true);
