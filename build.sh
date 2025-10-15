
echo "🔧 Injection des variables d'environnement..."

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Erreur: Variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY requises"
    exit 1
fi

sed -i "s|<!-- SUPABASE_URL_PLACEHOLDER -->|$SUPABASE_URL|g" env.js
sed -i "s|<!-- SUPABASE_ANON_KEY_PLACEHOLDER -->|$SUPABASE_ANON_KEY|g" env.js

echo "✅ Variables d'environnement injectées avec succès"
