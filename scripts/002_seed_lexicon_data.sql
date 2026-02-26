-- Seed lexicon_relation_types
INSERT INTO lexicon_relation_types (code, description) VALUES
  ('is_a', 'Denotes an is-a relationship'),
  ('part_of', 'Denotes a part-of relationship'),
  ('related_to', 'Denotes a general relation'),
  ('opposite_of', 'Denotes an opposite relation'),
  ('derived_from', 'Denotes a derivation relation')
ON CONFLICT (code) DO NOTHING;

-- Seed initial terms (KNOWLEDGE taxonomy)
INSERT INTO lexicon_terms (label) VALUES
  ('KNOWLEDGE'),
  ('NATURAL SCIENCES'),
  ('FORMAL SCIENCES'),
  ('SOCIAL SCIENCES'),
  ('BIOLOGY'),
  ('PHYSICS'),
  ('CHEMISTRY'),
  ('MATHEMATICS'),
  ('COMPUTER SCIENCE'),
  ('LOGIC'),
  ('ECONOMICS'),
  ('PSYCHOLOGY'),
  ('SOCIOLOGY'),
  ('ECOLOGY'),
  ('GENETICS'),
  ('ZOOLOGY'),
  ('BOTANY'),
  ('QUANTUM MECHANICS'),
  ('THERMODYNAMICS'),
  ('ORGANIC CHEMISTRY'),
  ('ALGEBRA'),
  ('STATISTICS'),
  ('ARTIFICIAL INTELLIGENCE'),
  ('ALGORITHMS'),
  ('MICROECONOMICS'),
  ('MACROECONOMICS'),
  ('COGNITIVE PSYCHOLOGY'),
  ('BEHAVIORAL PSYCHOLOGY')
ON CONFLICT (label) DO NOTHING;

-- Build taxon edges (parent-child hierarchy)
-- Level 0 -> 1: KNOWLEDGE -> top-level categories
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'KNOWLEDGE' AND c.label = 'NATURAL SCIENCES'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'KNOWLEDGE' AND c.label = 'FORMAL SCIENCES'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 2 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'KNOWLEDGE' AND c.label = 'SOCIAL SCIENCES'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 1 -> 2: NATURAL SCIENCES children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'NATURAL SCIENCES' AND c.label = 'BIOLOGY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'NATURAL SCIENCES' AND c.label = 'PHYSICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 2 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'NATURAL SCIENCES' AND c.label = 'CHEMISTRY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 1 -> 2: FORMAL SCIENCES children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'FORMAL SCIENCES' AND c.label = 'MATHEMATICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'FORMAL SCIENCES' AND c.label = 'COMPUTER SCIENCE'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 2 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'FORMAL SCIENCES' AND c.label = 'LOGIC'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 1 -> 2: SOCIAL SCIENCES children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'SOCIAL SCIENCES' AND c.label = 'ECONOMICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'SOCIAL SCIENCES' AND c.label = 'PSYCHOLOGY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 2 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'SOCIAL SCIENCES' AND c.label = 'SOCIOLOGY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 2 -> 3: BIOLOGY children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'BIOLOGY' AND c.label = 'ECOLOGY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'BIOLOGY' AND c.label = 'GENETICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 2 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'BIOLOGY' AND c.label = 'ZOOLOGY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 3 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'BIOLOGY' AND c.label = 'BOTANY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 2 -> 3: PHYSICS children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'PHYSICS' AND c.label = 'QUANTUM MECHANICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'PHYSICS' AND c.label = 'THERMODYNAMICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 2 -> 3: CHEMISTRY children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'CHEMISTRY' AND c.label = 'ORGANIC CHEMISTRY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 2 -> 3: MATHEMATICS children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'MATHEMATICS' AND c.label = 'ALGEBRA'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'MATHEMATICS' AND c.label = 'STATISTICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 2 -> 3: COMPUTER SCIENCE children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'COMPUTER SCIENCE' AND c.label = 'ARTIFICIAL INTELLIGENCE'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'COMPUTER SCIENCE' AND c.label = 'ALGORITHMS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 2 -> 3: ECONOMICS children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'ECONOMICS' AND c.label = 'MICROECONOMICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'ECONOMICS' AND c.label = 'MACROECONOMICS'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Level 2 -> 3: PSYCHOLOGY children
INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 0 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'PSYCHOLOGY' AND c.label = 'COGNITIVE PSYCHOLOGY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id, sort_order)
SELECT p.id, c.id, 1 FROM lexicon_terms p, lexicon_terms c
WHERE p.label = 'PSYCHOLOGY' AND c.label = 'BEHAVIORAL PSYCHOLOGY'
ON CONFLICT (parent_id, child_id) DO NOTHING;

-- Build term_relations (semantic edges)
INSERT INTO lexicon_term_relations (subject_id, object_id, type_id)
SELECT t.id, rt.id, rtype.id 
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.label = 'BIOLOGY' AND rt.label = 'NATURAL SCIENCES' AND rtype.code = 'is_a'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_term_relations (subject_id, object_id, type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.label = 'PHYSICS' AND rt.label = 'NATURAL SCIENCES' AND rtype.code = 'is_a'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_term_relations (subject_id, object_id, type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.label = 'CHEMISTRY' AND rt.label = 'NATURAL SCIENCES' AND rtype.code = 'is_a'
ON CONFLICT DO NOTHING;

-- Cross-domain relations
INSERT INTO lexicon_term_relations (subject_id, object_id, type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.label = 'ARTIFICIAL INTELLIGENCE' AND rt.label = 'COGNITIVE PSYCHOLOGY' AND rtype.code = 'related_to'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_term_relations (subject_id, object_id, type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.label = 'STATISTICS' AND rt.label = 'ECONOMICS' AND rtype.code = 'related_to'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_term_relations (subject_id, object_id, type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.label = 'GENETICS' AND rt.label = 'ORGANIC CHEMISTRY' AND rtype.code = 'related_to'
ON CONFLICT DO NOTHING;
