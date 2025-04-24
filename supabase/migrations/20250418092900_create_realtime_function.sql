CREATE OR REPLACE FUNCTION public.enable_realtime_for_table(table_name text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE REPLICA TRIGGER ALL', table_name);
  EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', table_name);
END;
$$;