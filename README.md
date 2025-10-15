# ODC Trainings and Events 🚀

Site web officiel pour les formations et événements Orange Digital Center (ODC).

## 📋 Description

Plateforme interactive présentant :
- **Formations** : Programmes de formation ODC avec inscription en ligne
- **Événements** : Orange Fab events, startup pitch nights, tech talks
- **Calendrier** : Navigation interactive des événements à venir
- **Back Office** : Interface d'administration sécurisée

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Backend** : Supabase (Base de données + Authentification)
- **Déploiement** : Netlify
- **Stockage** : Supabase Storage pour les images

## ✨ Fonctionnalités

### 🎯 Interface Utilisateur
- Design responsive et moderne
- Filtres dynamiques par ville et type
- Système de recherche en temps réel
- Carrousel de navigation calendaire
- Gestion d'images avec fallback automatique

### 🔐 Back Office Sécurisé
- Authentification Supabase
- Gestion des formations et événements
- Upload d'images direct vers Supabase
- Interface d'administration intuitive
- Système de diagnostic intégré

### 📊 Gestion de Données
- Base de données Supabase
- Chargement dynamique du contenu
- Gestion des inscriptions
- Système de participants

## 🚀 Installation et Déploiement

### Prérequis
- Compte Supabase configuré
- Variables d'environnement configurées

### Configuration Supabase
1. Créer un projet Supabase
2. Configurer les tables (voir `config/database.sql`)
3. Configurer l'authentification
4. Mettre à jour `config/supabase.js`

### Déploiement Netlify
1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer automatiquement

## 📁 Structure du Projet

```
├── index.html              # Page principale
├── styles.css              # Styles principaux
├── script-dynamic.js       # Logique principale avec Supabase
├── script-calendar-fix.js  # Gestion du calendrier
├── admin/                  # Interface d'administration
│   ├── index.html         # Back office principal
│   ├── login.html         # Page de connexion
│   ├── css/admin.css      # Styles admin
│   └── js/                # Scripts d'administration
├── config/                # Configuration
│   ├── supabase.js       # Configuration Supabase
│   └── database.sql      # Schéma de base de données
└── data/                  # Données de fallback
```

## 🔧 Configuration

### Variables d'Environnement
Créer un fichier de configuration Supabase avec :
- URL du projet Supabase
- Clé publique Supabase
- Configuration d'authentification

### Base de Données
Exécuter le script `config/database.sql` pour créer les tables nécessaires.

## 📱 Responsive Design

Le site est optimisé pour :
- 📱 Mobile (320px+)
- 📟 Tablet (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1200px+)

## 🛡️ Sécurité

- Authentification Supabase sécurisée
- Protection du back office multi-niveaux
- Headers de sécurité HTTP
- Validation côté client et serveur

## 📈 Performance

- Images optimisées avec lazy loading
- Chargement dynamique du contenu
- Cache intelligent des données
- Minification CSS/JS pour la production

## 🤝 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature
3. Commiter les modifications
4. Créer une Pull Request

## 📧 Contact

Orange Digital Center
- Website: [ODC Morocco](https://odc.ma)
- Email: contact@odc.ma

## 📄 Licence

© 2025 Orange Digital Center. Tous droits réservés.

---

**Développé avec ❤️ pour Orange Digital Center**