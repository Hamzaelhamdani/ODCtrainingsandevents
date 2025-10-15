#!/bin/bash
# Script de build pour Netlify - Injection des variables d'environnement

echo "🔧 Injection des variables d'environnement..."

# Vérifier que les variables d'environnement existent
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Erreur: Variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY requises"
    exit 1
fi

# Remplacer les placeholders dans env.js
sed -i "s|<!-- SUPABASE_URL_PLACEHOLDER -->|$SUPABASE_URL|g" env.js
sed -i "s|<!-- SUPABASE_ANON_KEY_PLACEHOLDER -->|$SUPABASE_ANON_KEY|g" env.js

echo "✅ Variables d'environnement injectées avec succès"