-- Seed lexicon_relation_types
INSERT INTO lexicon_relation_types (name) VALUES
  ('is_a'),
  ('part_of'),
  ('related_to'),
  ('opposite_of'),
  ('derived_from')
ON CONFLICT (name) DO NOTHING;

-- Seed initial terms (SAFARI taxonomy example)
INSERT INTO lexicon_terms (term, definition) VALUES
  ('KNOWLEDGE', 'The totality of structured understanding across all domains'),
  ('NATURAL SCIENCES', 'Systematic study of the natural world through observation and experiment'),
  ('FORMAL SCIENCES', 'Study of abstract formal systems such as logic, mathematics, and computation'),
  ('SOCIAL SCIENCES', 'Study of human society, behavior, and social relationships'),
  ('BIOLOGY', 'The science of life and living organisms'),
  ('PHYSICS', 'The study of matter, energy, and fundamental forces of nature'),
  ('CHEMISTRY', 'The study of substances, their properties, and transformations'),
  ('MATHEMATICS', 'The abstract science of number, quantity, and space'),
  ('COMPUTER SCIENCE', 'The study of computation, algorithms, and information processing'),
  ('LOGIC', 'The systematic study of valid inference and reasoning'),
  ('ECONOMICS', 'The study of production, distribution, and consumption of goods and services'),
  ('PSYCHOLOGY', 'The scientific study of mind and behavior'),
  ('SOCIOLOGY', 'The study of social life, change, and causes of human behavior'),
  ('ECOLOGY', 'The study of organisms and their interactions with the environment'),
  ('GENETICS', 'The study of heredity and variation in living organisms'),
  ('ZOOLOGY', 'The study of animals and animal life'),
  ('BOTANY', 'The study of plants and plant life'),
  ('QUANTUM MECHANICS', 'The branch of physics dealing with subatomic phenomena'),
  ('THERMODYNAMICS', 'The branch of physics dealing with heat and energy transfer'),
  ('ORGANIC CHEMISTRY', 'The study of carbon-containing compounds'),
  ('ALGEBRA', 'The branch of mathematics dealing with symbols and rules for manipulating them'),
  ('STATISTICS', 'The science of collecting, analyzing, and interpreting numerical data'),
  ('ARTIFICIAL INTELLIGENCE', 'The simulation of human intelligence by machines'),
  ('ALGORITHMS', 'Step-by-step procedures for calculations and problem-solving'),
  ('MICROECONOMICS', 'The study of individual economic agents and their interactions'),
  ('MACROECONOMICS', 'The study of economy-wide phenomena such as inflation and growth'),
  ('COGNITIVE PSYCHOLOGY', 'The study of mental processes including attention, memory, and reasoning'),
  ('BEHAVIORAL PSYCHOLOGY', 'The study of observable behavior and stimulus-response relationships')
ON CONFLICT (term) DO NOTHING;

-- Build taxon edges (parent-child hierarchy)
-- Level 0 → 1: KNOWLEDGE → top-level categories
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'KNOWLEDGE' AND c.term = 'NATURAL SCIENCES'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'KNOWLEDGE' AND c.term = 'FORMAL SCIENCES'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'KNOWLEDGE' AND c.term = 'SOCIAL SCIENCES'
ON CONFLICT DO NOTHING;

-- Level 1 → 2: NATURAL SCIENCES children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'NATURAL SCIENCES' AND c.term = 'BIOLOGY'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'NATURAL SCIENCES' AND c.term = 'PHYSICS'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'NATURAL SCIENCES' AND c.term = 'CHEMISTRY'
ON CONFLICT DO NOTHING;

-- Level 1 → 2: FORMAL SCIENCES children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'FORMAL SCIENCES' AND c.term = 'MATHEMATICS'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'FORMAL SCIENCES' AND c.term = 'COMPUTER SCIENCE'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'FORMAL SCIENCES' AND c.term = 'LOGIC'
ON CONFLICT DO NOTHING;

-- Level 1 → 2: SOCIAL SCIENCES children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'SOCIAL SCIENCES' AND c.term = 'ECONOMICS'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'SOCIAL SCIENCES' AND c.term = 'PSYCHOLOGY'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'SOCIAL SCIENCES' AND c.term = 'SOCIOLOGY'
ON CONFLICT DO NOTHING;

-- Level 2 → 3: BIOLOGY children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'BIOLOGY' AND c.term = 'ECOLOGY'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'BIOLOGY' AND c.term = 'GENETICS'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'BIOLOGY' AND c.term = 'ZOOLOGY'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'BIOLOGY' AND c.term = 'BOTANY'
ON CONFLICT DO NOTHING;

-- Level 2 → 3: PHYSICS children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'PHYSICS' AND c.term = 'QUANTUM MECHANICS'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'PHYSICS' AND c.term = 'THERMODYNAMICS'
ON CONFLICT DO NOTHING;

-- Level 2 → 3: CHEMISTRY children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'CHEMISTRY' AND c.term = 'ORGANIC CHEMISTRY'
ON CONFLICT DO NOTHING;

-- Level 2 → 3: MATHEMATICS children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'MATHEMATICS' AND c.term = 'ALGEBRA'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'MATHEMATICS' AND c.term = 'STATISTICS'
ON CONFLICT DO NOTHING;

-- Level 2 → 3: COMPUTER SCIENCE children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'COMPUTER SCIENCE' AND c.term = 'ARTIFICIAL INTELLIGENCE'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'COMPUTER SCIENCE' AND c.term = 'ALGORITHMS'
ON CONFLICT DO NOTHING;

-- Level 2 → 3: ECONOMICS children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'ECONOMICS' AND c.term = 'MICROECONOMICS'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'ECONOMICS' AND c.term = 'MACROECONOMICS'
ON CONFLICT DO NOTHING;

-- Level 2 → 3: PSYCHOLOGY children
INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'PSYCHOLOGY' AND c.term = 'COGNITIVE PSYCHOLOGY'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_taxon_edges (parent_id, child_id)
SELECT p.id, c.id FROM lexicon_terms p, lexicon_terms c
WHERE p.term = 'PSYCHOLOGY' AND c.term = 'BEHAVIORAL PSYCHOLOGY'
ON CONFLICT DO NOTHING;

-- Build term_relations (is_a relationships)
INSERT INTO lexicon_term_relations (term_id, related_term_id, relation_type_id)
SELECT t.id, rt.id, rtype.id 
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.term = 'BIOLOGY' AND rt.term = 'NATURAL SCIENCES' AND rtype.name = 'is_a'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_term_relations (term_id, related_term_id, relation_type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.term = 'PHYSICS' AND rt.term = 'NATURAL SCIENCES' AND rtype.name = 'is_a'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_term_relations (term_id, related_term_id, relation_type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.term = 'CHEMISTRY' AND rt.term = 'NATURAL SCIENCES' AND rtype.name = 'is_a'
ON CONFLICT DO NOTHING;

-- Cross-domain relations
INSERT INTO lexicon_term_relations (term_id, related_term_id, relation_type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.term = 'ARTIFICIAL INTELLIGENCE' AND rt.term = 'COGNITIVE PSYCHOLOGY' AND rtype.name = 'related_to'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_term_relations (term_id, related_term_id, relation_type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.term = 'STATISTICS' AND rt.term = 'ECONOMICS' AND rtype.name = 'related_to'
ON CONFLICT DO NOTHING;

INSERT INTO lexicon_term_relations (term_id, related_term_id, relation_type_id)
SELECT t.id, rt.id, rtype.id
FROM lexicon_terms t, lexicon_terms rt, lexicon_relation_types rtype
WHERE t.term = 'GENETICS' AND rt.term = 'ORGANIC CHEMISTRY' AND rtype.name = 'related_to'
ON CONFLICT DO NOTHING;
