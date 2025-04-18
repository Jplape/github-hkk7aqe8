-- Crée une fonction pour lister les tables
CREATE OR REPLACE FUNCTION public.list_tables(schema_name text)
RETURNS TABLE(table_name text) 
LANGUAGE sql
AS $$
  SELECT table_name::text 
  FROM information_schema.tables
  WHERE table_schema = schema_name
  AND table_type = 'BASE TABLE';
$$;

-- Donne les permissions au rôle anon
GRANT EXECUTE ON FUNCTION public.list_tables(text) TO anon;