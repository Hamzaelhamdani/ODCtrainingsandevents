-- Script SQL pour créer la table des utilisateurs administrateurs
-- À exécuter dans l'interface Supabase SQL Editor

-- 1. Créer la table admin_users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    last_login TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 2. Activer RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Créer une politique pour permettre la lecture par les utilisateurs authentifiés
CREATE POLICY "Admin users can read admin_users" ON admin_users
    FOR SELECT
    TO authenticated
    USING (true);

-- 4. Créer une politique pour permettre l'insertion uniquement aux super_admin
CREATE POLICY "Super admin can insert admin_users" ON admin_users
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'super_admin' 
            AND active = true
        )
    );

-- 5. Créer une politique pour permettre la mise à jour uniquement aux super_admin
CREATE POLICY "Super admin can update admin_users" ON admin_users
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE email = auth.jwt() ->> 'email' 
            AND role = 'super_admin' 
            AND active = true
        )
    );

-- 6. Insérer le premier administrateur (remplacez par votre email)
INSERT INTO admin_users (email, role, active, notes)
VALUES (
    'admin@orangedigitalcenter.ma', 
    'super_admin', 
    true, 
    'Administrateur principal créé lors de l''installation'
) ON CONFLICT (email) DO NOTHING;

-- 7. Créer une fonction pour mettre à jour last_login
CREATE OR REPLACE FUNCTION update_admin_last_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE admin_users 
    SET last_login = NOW() 
    WHERE email = NEW.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Créer un trigger pour mettre à jour automatiquement last_login
-- (Note: Ceci nécessiterait un webhook ou une fonction personnalisée)

-- 9. Créer une vue pour les statistiques admin (optionnel)
CREATE VIEW admin_stats AS
SELECT 
    COUNT(*) as total_admins,
    COUNT(*) FILTER (WHERE active = true) as active_admins,
    COUNT(*) FILTER (WHERE role = 'super_admin') as super_admins,
    COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '30 days') as active_last_30_days
FROM admin_users;

-- 10. Accorder les permissions sur la vue
GRANT SELECT ON admin_stats TO authenticated;