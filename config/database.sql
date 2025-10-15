-- ========================================
-- 🚀 SCRIPT SQL COMPLET POUR SUPABASE - ODC LANDING PAGE
-- ========================================
-- 📋 À exécuter dans l'éditeur SQL de votre projet Supabase
-- 🎯 Ce script crée toute l'architecture de base de données nécessaire

-- ========================================
-- 🗄️ SUPPRESSION ET CRÉATION DES TABLES
-- ========================================

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Lecture publique formations actives" ON formations;
DROP POLICY IF EXISTS "Admin gestion formations" ON formations;
DROP POLICY IF EXISTS "Lecture publique événements actifs" ON events;
DROP POLICY IF EXISTS "Admin gestion événements" ON events;
DROP POLICY IF EXISTS "Lecture publique paramètres" ON settings;
DROP POLICY IF EXISTS "Admin gestion paramètres" ON settings;

-- Supprimer les tables existantes (si elles existent) pour reset complet
DROP TABLE IF EXISTS formations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Supprimer les fonctions et triggers existants
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ========================================
-- 📊 TABLE DES FORMATIONS (ÉCOLE DU CODE + FABLAB)
-- ========================================

CREATE TABLE formations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('ecole-du-code', 'fablab')),
    description TEXT,
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    city VARCHAR(50) NOT NULL CHECK (city IN ('rabat', 'agadir', 'benmisk', 'sidimaarouf')),
    location VARCHAR(255),
    image VARCHAR(500),
    max_participants INTEGER NOT NULL DEFAULT 0 CHECK (max_participants >= 0),
    current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
    registration_link VARCHAR(500),
    price DECIMAL(10,2) DEFAULT 0 CHECK (price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_formations_status ON formations(status);
CREATE INDEX idx_formations_city ON formations(city);
CREATE INDEX idx_formations_category ON formations(category);
CREATE INDEX idx_formations_dates ON formations(date_start, date_end);

-- ========================================
-- 🎉 TABLE DES ÉVÉNEMENTS (ORANGE FAB)
-- ========================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_start DATE NOT NULL,
    time_start TIME NOT NULL,
    time_end TIME NOT NULL,
    city VARCHAR(50) NOT NULL CHECK (city IN ('rabat', 'agadir', 'benmisk', 'sidimaarouf')),
    location VARCHAR(255),
    image VARCHAR(500),
    max_participants INTEGER NOT NULL DEFAULT 0 CHECK (max_participants >= 0),
    current_participants INTEGER NOT NULL DEFAULT 0 CHECK (current_participants >= 0),
    registration_link VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_city ON events(city);
CREATE INDEX idx_events_date ON events(date_start);

-- ========================================
-- ⚙️ TABLE DES PARAMÈTRES DU SITE
-- ========================================

CREATE TABLE settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Une seule ligne de paramètres
    site_title VARCHAR(255),
    hero_title VARCHAR(255),
    hero_subtitle TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    odc_centers JSONB,
    social_media JSONB DEFAULT '{}',
    site_config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 🔄 TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- ========================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Appliquer le trigger aux tables
CREATE TRIGGER update_formations_updated_at 
    BEFORE UPDATE ON formations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at 
    BEFORE UPDATE ON events 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 🔒 POLITIQUES DE SÉCURITÉ RLS (ROW LEVEL SECURITY)
-- ========================================

-- Activer RLS sur toutes les tables
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 📖 POLITIQUES POUR FORMATIONS
-- Lecture publique des formations actives (pour la landing page)
CREATE POLICY "Lecture publique formations actives" ON formations
    FOR SELECT 
    USING (status = 'active');

-- Gestion complète pour les administrateurs (pour le back-office)
CREATE POLICY "Admin gestion formations" ON formations
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 📖 POLITIQUES POUR ÉVÉNEMENTS
-- Lecture publique des événements actifs (pour la landing page)
CREATE POLICY "Lecture publique événements actifs" ON events
    FOR SELECT 
    USING (status = 'active');

-- Gestion complète pour les administrateurs (pour le back-office)
CREATE POLICY "Admin gestion événements" ON events
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 📖 POLITIQUES POUR PARAMÈTRES
-- Lecture publique des paramètres (pour la landing page)
CREATE POLICY "Lecture publique paramètres" ON settings
    FOR SELECT 
    USING (true);

-- Gestion complète pour les administrateurs (pour le back-office)
CREATE POLICY "Admin gestion paramètres" ON settings
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- ========================================
-- 📸 CRÉATION ET CONFIGURATION DU STOCKAGE D'IMAGES
-- ========================================

-- Créer le bucket odc-images s'il n'existe pas
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'odc-images',
    'odc-images', 
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Images publiques lisibles" ON storage.objects;
DROP POLICY IF EXISTS "Upload d'images autorisé" ON storage.objects;
DROP POLICY IF EXISTS "Suppression d'images autorisée" ON storage.objects;
DROP POLICY IF EXISTS "Mise à jour d'images autorisée" ON storage.objects;

-- Permettre la lecture publique des images
CREATE POLICY "Images publiques lisibles" ON storage.objects
FOR SELECT USING (bucket_id = 'odc-images');

-- Permettre l'upload d'images
CREATE POLICY "Upload d'images autorisé" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'odc-images');

-- Permettre la suppression d'images
CREATE POLICY "Suppression d'images autorisée" ON storage.objects
FOR DELETE USING (bucket_id = 'odc-images');

-- Permettre la mise à jour d'images
CREATE POLICY "Mise à jour d'images autorisée" ON storage.objects
FOR UPDATE USING (bucket_id = 'odc-images');

-- ========================================
-- 🎨 DONNÉES DE DÉMONSTRATION COMPLÈTES
-- ========================================

-- 📚 FORMATIONS DE DÉMONSTRATION (ÉCOLE DU CODE)
INSERT INTO formations (
    title, category, description, date_start, date_end, 
    time_start, time_end, city, location, image, 
    max_participants, current_participants, registration_link, status
) VALUES 
(
    'Développement Web Full Stack',
    'ecole-du-code',
    'Apprenez les bases du développement web moderne avec HTML5, CSS3, JavaScript et React. Formation intensive sur 3 jours avec projet final et certification.',
    '2025-10-15',
    '2025-10-17',
    '09:00',
    '17:00',
    'rabat',
    'ODC Rabat - École du Code',
    NULL,
    25,
    18,
    'https://forms.google.com/d/e/1FAIpQLSe0xyz123/viewform',
    'active'
),
(
    'Python pour Data Science',
    'ecole-du-code',
    'Découvrez Python, pandas, numpy et matplotlib pour l''analyse de données. Idéal pour débuter en data science avec des projets concrets.',
    '2025-10-20',
    '2025-10-22',
    '14:00',
    '18:00',
    'agadir',
    'ODC Agadir - École du Code',
    NULL,
    20,
    12,
    'https://forms.google.com/d/e/1FAIpQLSe0abc456/viewform',
    'active'
),
(
    'Mobile App Development avec Flutter',
    'ecole-du-code',
    'Créez votre première application mobile avec Flutter. Formation pratique avec publication sur les stores.',
    '2025-10-25',
    '2025-10-27',
    '09:00',
    '16:00',
    'benmisk',
    'ODC Club Ben M''sik - École du Code',
    NULL,
    15,
    8,
    'https://forms.google.com/d/e/1FAIpQLSe0def789/viewform',
    'active'
),
(
    'Intelligence Artificielle et Machine Learning',
    'ecole-du-code',
    'Introduction à l''IA et au Machine Learning avec des outils pratiques et des cas d''usage concrets.',
    '2025-10-28',
    '2025-10-30',
    '10:00',
    '17:00',
    'sidimaarouf',
    'ODC Club Sidi Maarouf - École du Code',
    NULL,
    18,
    15,
    'https://forms.google.com/d/e/1FAIpQLSe0ghi012/viewform',
    'active'
),
(
    'Cybersécurité et Ethical Hacking',
    'ecole-du-code',
    'Apprenez les bases de la cybersécurité, les tests de pénétration et la sécurisation des applications.',
    '2025-11-05',
    '2025-11-07',
    '09:00',
    '17:00',
    'rabat',
    'ODC Rabat - École du Code',
    NULL,
    12,
    5,
    'https://forms.google.com/d/e/1FAIpQLSe0jkl345/viewform',
    'active'
);

-- 🛠️ FORMATIONS DE DÉMONSTRATION (FABLAB)
INSERT INTO formations (
    title, category, description, date_start, date_end, 
    time_start, time_end, city, location, image, 
    max_participants, current_participants, registration_link, status
) VALUES 
(
    'Impression 3D et Prototypage',
    'fablab',
    'Maîtrisez les techniques d''impression 3D, de la conception à la réalisation. Créez vos propres prototypes.',
    '2025-10-18',
    '2025-10-19',
    '09:00',
    '17:00',
    'rabat',
    'ODC FabLab Rabat',
    NULL,
    12,
    9,
    'https://forms.google.com/d/e/1FAIpQLSe0mno678/viewform',
    'active'
),
(
    'Arduino et Électronique',
    'fablab',
    'Initiez-vous à l''électronique et à la programmation Arduino. Créez vos premiers objets connectés.',
    '2025-10-21',
    '2025-10-22',
    '14:00',
    '18:00',
    'agadir',
    'ODC FabLab Agadir',
    NULL,
    10,
    7,
    'https://forms.google.com/d/e/1FAIpQLSe0pqr901/viewform',
    'active'
),
(
    'Découpe Laser et Design',
    'fablab',
    'Apprenez les techniques de découpe laser pour créer des objets personnalisés en bois, acrylique et carton.',
    '2025-10-26',
    '2025-10-27',
    '10:00',
    '16:00',
    'benmisk',
    'ODC FabLab Ben M''sik',
    NULL,
    8,
    5,
    'https://forms.google.com/d/e/1FAIpQLSe0stu234/viewform',
    'active'
),
(
    'Robotique et Programmation',
    'fablab',
    'Construisez et programmez votre premier robot. Introduction à la robotique éducative.',
    '2025-11-02',
    '2025-11-03',
    '09:00',
    '17:00',
    'sidimaarouf',
    'ODC FabLab Sidi Maarouf',
    NULL,
    15,
    8,
    'https://forms.google.com/d/e/1FAIpQLSe0vwx567/viewform',
    'active'
);

-- 🚀 ÉVÉNEMENTS DE DÉMONSTRATION (ORANGE FAB)
INSERT INTO events (
    title, description, date_start, time_start, time_end,
    city, location, image, max_participants, current_participants, 
    registration_link, status
) VALUES 
(
    'Startup Pitch Night',
    'Soirée de présentation des startups de l''écosystème ODC. Venez découvrir les projets innovants et rencontrer les entrepreneurs de demain.',
    '2025-10-25',
    '18:00',
    '21:00',
    'rabat',
    'ODC Rabat - Orange Fab',
    NULL,
    100,
    45,
    'https://forms.google.com/d/e/1FAIpQLSe0event01/viewform',
    'active'
),
(
    'Tech Talk: IA et Futur du Travail',
    'Conférence sur l''Intelligence Artificielle et son impact sur l''avenir des technologies et du marché du travail.',
    '2025-10-29',
    '16:00',
    '18:00',
    'agadir',
    'ODC Agadir - Orange Fab',
    NULL,
    80,
    32,
    'https://forms.google.com/d/e/1FAIpQLSe0event02/viewform',
    'active'
),
(
    'Demo Day - Applications Mobiles',
    'Présentation des meilleures applications mobiles développées par nos apprenants. Vote du public et prix.',
    '2025-11-08',
    '14:00',
    '17:00',
    'benmisk',
    'ODC Ben M''sik - Orange Fab',
    NULL,
    60,
    28,
    'https://forms.google.com/d/e/1FAIpQLSe0event03/viewform',
    'active'
),
(
    'Networking Tech Entrepreneurs',
    'Soirée networking pour connecter développeurs, entrepreneurs et investisseurs de l''écosystème tech marocain.',
    '2025-11-15',
    '17:00',
    '20:00',
    'sidimaarouf',
    'ODC Sidi Maarouf - Orange Fab',
    NULL,
    120,
    67,
    'https://forms.google.com/d/e/1FAIpQLSe0event04/viewform',
    'active'
),
(
    'FinTech Innovation Summit',
    'Sommet sur l''innovation dans les technologies financières. Conférences, ateliers et démonstrations.',
    '2025-11-22',
    '09:00',
    '17:00',
    'rabat',
    'ODC Rabat - Orange Fab',
    NULL,
    150,
    89,
    'https://forms.google.com/d/e/1FAIpQLSe0event05/viewform',
    'active'
);

-- ⚙️ PARAMÈTRES PAR DÉFAUT DU SITE
INSERT INTO settings (
    site_title, hero_title, hero_subtitle, contact_email, contact_phone, 
    odc_centers, social_media, site_config
) VALUES (
    'Orange Digital Center - Formations & Événements du Mois',
    'Orange Digital Center',
    'Découvrez nos formations et événements dans tous nos centres Orange Digital Center au Maroc. Développez vos compétences numériques avec nos experts.',
    'contact@odc.orange.ma',
    '+212 5 22-12-34-56',
    '[
        {
            "name": "ODC Rabat", 
            "address": "Technopolis Rabat-Shore, Rabat", 
            "phone": "+212 5 37-12-34-56",
            "email": "rabat@odc.orange.ma",
            "coordinates": {"lat": 34.0209, "lng": -6.8416}
        },
        {
            "name": "ODC Agadir", 
            "address": "Quartier Industriel, Agadir", 
            "phone": "+212 5 28-12-34-56",
            "email": "agadir@odc.orange.ma",
            "coordinates": {"lat": 30.4278, "lng": -9.5981}
        },
        {
            "name": "ODC Ben M''sik", 
            "address": "Ben M''sik, Casablanca", 
            "phone": "+212 5 22-34-56-78",
            "email": "benmisk@odc.orange.ma",
            "coordinates": {"lat": 33.5731, "lng": -7.5898}
        },
        {
            "name": "ODC Sidi Maarouf", 
            "address": "Sidi Maarouf, Casablanca", 
            "phone": "+212 5 22-56-78-90",
            "email": "sidimaarouf@odc.orange.ma",
            "coordinates": {"lat": 33.5073, "lng": -7.6573}
        }
    ]'::jsonb,
    '{
        "facebook": "https://facebook.com/orangedigitalcentermaroc",
        "twitter": "https://twitter.com/odc_maroc",
        "linkedin": "https://linkedin.com/company/orange-digital-center-maroc",
        "instagram": "https://instagram.com/odc_maroc",
        "youtube": "https://youtube.com/channel/odcmaroc"
    }'::jsonb,
    '{
        "maintenance_mode": false,
        "registration_enabled": true,
        "max_file_size": 5242880,
        "allowed_image_types": ["image/jpeg", "image/png", "image/gif", "image/webp"],
        "default_event_duration": 120,
        "notification_email": "admin@odc.orange.ma"
    }'::jsonb
);

-- ========================================
-- 📈 VUES POUR STATISTIQUES ET RAPPORTS
-- ========================================

-- Vue des statistiques des formations
CREATE OR REPLACE VIEW formations_stats AS
SELECT 
    category,
    city,
    COUNT(*) as total_formations,
    SUM(max_participants) as total_capacity,
    SUM(current_participants) as total_registered,
    ROUND(AVG(current_participants::DECIMAL / max_participants * 100), 2) as avg_fill_rate,
    COUNT(*) FILTER (WHERE status = 'active') as active_formations
FROM formations
GROUP BY category, city
ORDER BY category, city;

-- Vue des statistiques des événements
CREATE OR REPLACE VIEW events_stats AS
SELECT 
    city,
    COUNT(*) as total_events,
    SUM(max_participants) as total_capacity,
    SUM(current_participants) as total_registered,
    ROUND(AVG(current_participants::DECIMAL / max_participants * 100), 2) as avg_fill_rate,
    COUNT(*) FILTER (WHERE status = 'active') as active_events
FROM events
GROUP BY city
ORDER BY city;

-- Vue calendrier des activités
CREATE OR REPLACE VIEW calendar_view AS
SELECT 
    'formation' as type,
    id,
    title,
    category as sub_type,
    date_start,
    date_end,
    time_start,
    time_end,
    city,
    location,
    max_participants,
    current_participants,
    status
FROM formations
UNION ALL
SELECT 
    'event' as type,
    id,
    title,
    'orange-fab' as sub_type,
    date_start,
    date_start as date_end,
    time_start,
    time_end,
    city,
    location,
    max_participants,
    current_participants,
    status
FROM events
ORDER BY date_start, time_start;

-- ========================================
-- 🔧 FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour calculer le taux de remplissage
CREATE OR REPLACE FUNCTION calculate_fill_rate(current_participants INTEGER, max_participants INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    IF max_participants = 0 THEN
        RETURN 0;
    END IF;
    RETURN ROUND((current_participants::DECIMAL / max_participants * 100), 2);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les prochaines activités
CREATE OR REPLACE FUNCTION get_upcoming_activities(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
    type TEXT,
    id UUID,
    title VARCHAR,
    date_start DATE,
    time_start TIME,
    city VARCHAR,
    location VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM calendar_view
    WHERE calendar_view.date_start BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '1 day' * days_ahead
    AND calendar_view.status = 'active'
    ORDER BY calendar_view.date_start, calendar_view.time_start;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 📊 DONNÉES DE TEST POUR DÉVELOPPEMENT
-- ========================================

-- Quelques formations inactives pour tester les filtres
INSERT INTO formations (
    title, category, description, date_start, date_end, 
    time_start, time_end, city, location, image, 
    max_participants, current_participants, status
) VALUES 
(
    'Formation Test Inactive',
    'ecole-du-code',
    'Cette formation est inactive et ne doit pas apparaître sur la landing page.',
    '2025-12-01',
    '2025-12-03',
    '09:00',
    '17:00',
    'rabat',
    'ODC Rabat - Test',
    NULL,
    20,
    0,
    'inactive'
);

-- ========================================
-- ✅ VÉRIFICATIONS FINALES
-- ========================================

-- Compter le nombre d'enregistrements créés
SELECT 
    'formations' as table_name, 
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'active') as active_records
FROM formations
UNION ALL
SELECT 
    'events' as table_name,
    COUNT(*) as total_records,
    COUNT(*) FILTER (WHERE status = 'active') as active_records
FROM events
UNION ALL
SELECT 
    'settings' as table_name,
    COUNT(*) as total_records,
    COUNT(*) as active_records
FROM settings;

-- Afficher un résumé des données créées
SELECT 
    '🎉 Base de données ODC initialisée avec succès!' as message,
    (SELECT COUNT(*) FROM formations WHERE status = 'active') as formations_actives,
    (SELECT COUNT(*) FROM events WHERE status = 'active') as evenements_actifs,
    (SELECT COUNT(*) FROM settings) as parametres_configures;

-- ========================================
-- 📋 INSTRUCTIONS POST-INSTALLATION
-- ========================================

/*
🎯 ÉTAPES SUIVANTES APRÈS EXÉCUTION DE CE SCRIPT:

1. 📸 CONFIGURER LE STOCKAGE D'IMAGES:
   - Aller dans Storage > Create bucket
   - Nom: "odc-images" 
   - Public: true
   - File size limit: 5242880 (5MB)

2. 🔑 CONFIGURER LES CLÉS SUPABASE:
   - Copier URL et clé anon depuis Settings > API
   - Mettre à jour config/supabase.js

3. 🚀 TESTER L'APPLICATION:
   - Ouvrir la landing page
   - Vérifier l'affichage des formations/événements
   - Tester l'interface d'administration

4. 📊 DONNÉES PERSONNALISÉES:
   - Modifier les données de démonstration
   - Ajouter vos vraies formations/événements
   - Configurer les paramètres du site

5. 🔒 SÉCURITÉ PRODUCTION:
   - Configurer l'authentification pour l'admin
   - Restreindre les politiques RLS si nécessaire
   - Sauvegarder régulièrement la base

✅ Votre plateforme ODC est maintenant prête à l'emploi!
*/
