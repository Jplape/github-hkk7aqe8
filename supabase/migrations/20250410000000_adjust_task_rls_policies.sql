-- Autorise les mises à jour de statut pour les utilisateurs authentifiés
CREATE POLICY "Enable status updates for authenticated users"
ON public.task FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Politique cohérente avec le schéma existant
CREATE POLICY "Enable limited update for authenticated users"
ON public.task FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');