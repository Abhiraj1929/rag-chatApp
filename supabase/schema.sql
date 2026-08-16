DROP TABLE IF EXISTS documents CASCADE;
DROP FUNCTION IF EXISTS match_documents;
DROP FUNCTION IF EXISTS insert_document;

-- Recreate table with 384 dimensions (all-MiniLM-L6-v2)
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(384),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_embedding_idx
  ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 2);

-- Similarity search function - accepts TEXT and casts to vector
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding TEXT,
  match_count INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.1
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
DECLARE
  q_vec vector(384);
BEGIN
  q_vec := query_embedding::vector;
  RETURN QUERY
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> q_vec) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> q_vec) > match_threshold
  ORDER BY documents.embedding <=> q_vec
  LIMIT match_count;
END;
$$;

CREATE OR REPLACE FUNCTION insert_document(
  p_content TEXT,
  p_metadata JSONB,
  p_embedding TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO documents (content, metadata, embedding)
  VALUES (p_content, p_metadata, p_embedding::vector)
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

-- RLS policies
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for service role" ON documents USING (true);
