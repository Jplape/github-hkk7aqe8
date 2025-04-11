-- Active les politiques RLS pour la table task (cohérent avec schema.sql)
ALTER TABLE public.task ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : accès à tous
CREATE POLICY "Enable read access for all users"
ON public.task FOR SELECT USING (true);

-- Politique d'insertion : seulement pour utilisateurs authentifiés
CREATE POLICY "Enable insert for authenticated users"
ON public.task FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Politique de mise à jour : seulement pour utilisateurs authentifiés
CREATE POLICY "Enable update for authenticated users"
ON public.task FOR UPDATE USING (auth.role() = 'authenticated');

-- Politique de suppression : seulement pour utilisateurs authentifiés
CREATE POLICY "Enable delete for authenticated users"
ON public.task FOR DELETE USING (auth.role() = 'authenticated');