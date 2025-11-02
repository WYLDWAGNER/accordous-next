-- Migration: adiciona coluna linked_persons (JSONB) à tabela properties
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS linked_persons JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN properties.linked_persons IS
  'Array de pessoas vinculadas ao imóvel (fiadores, procuradores, etc)';