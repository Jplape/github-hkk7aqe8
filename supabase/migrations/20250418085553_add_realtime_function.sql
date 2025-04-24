-- Fonction pour activer/désactiver le suivi en temps réel
CREATE OR REPLACE FUNCTION public.alter_table_realtime(table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE REPLICA TRIGGER ALL', table_name);
  EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
END;
$$;

-- Donne les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.alter_table_realtime(text) TO service_role;