-- Lexicon Tables Schema

-- 1. Terms
CREATE TABLE IF NOT EXISTS lexicon_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lexicon_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lexicon_terms_select_all" ON lexicon_terms FOR SELECT USING (true);

-- 2. Relation Types
CREATE TABLE IF NOT EXISTS lexicon_relation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lexicon_relation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lexicon_relation_types_select_all" ON lexicon_relation_types FOR SELECT USING (true);

-- 3. Term Relations (semantic edges)
CREATE TABLE IF NOT EXISTS lexicon_term_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES lexicon_terms(id) ON DELETE CASCADE,
  type_id UUID NOT NULL REFERENCES lexicon_relation_types(id) ON DELETE CASCADE,
  object_id UUID NOT NULL REFERENCES lexicon_terms(id) ON DELETE CASCADE,
  weight FLOAT DEFAULT 1.0,
  provenance TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE lexicon_term_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lexicon_term_relations_select_all" ON lexicon_term_relations FOR SELECT USING (true);

-- 4. Taxon Edges (parent-child hierarchy)
CREATE TABLE IF NOT EXISTS lexicon_taxon_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES lexicon_terms(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES lexicon_terms(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  provenance TEXT DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_id, child_id)
);

ALTER TABLE lexicon_taxon_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lexicon_taxon_edges_select_all" ON lexicon_taxon_edges FOR SELECT USING (true);
