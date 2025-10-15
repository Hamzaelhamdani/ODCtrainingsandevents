# 🔐 GUIDE DE SÉCURITÉ - VARIABLES D'ENVIRONNEMENT

## 🚨 ACTIONS URGENTES EFFECTUÉES

### 1. ✅ **Clés Supabase sécurisées**
- Les clés ont été supprimées du code source
- Configuration via variables d'environnement uniquement

### 2. ✅ **System de build sécurisé**
- Script `build.sh` pour injecter les variables à la compilation
- Placeholders remplacés dynamiquement par Netlify

### 3. ✅ **Configuration Netlify mise à jour**
- Build command configurée pour l'injection des variables
- Headers de sécurité renforcés

## 🛠️ CONFIGURATION NETLIFY REQUISE

### Variables d'environnement à configurer :

1. **Aller dans Netlify Dashboard**
2. **Site Settings** → **Environment Variables**
3. **Ajouter ces variables :**

```bash
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_ANON_KEY=votre-cle-publique-supabase
```

### ⚠️ **IMPORTANT - Régénérer vos clés Supabase**

1. **Aller dans Supabase Dashboard**
2. **Settings** → **API**
3. **Cliquer sur "Reset API keys"**
4. **Copier les nouvelles clés**
5. **Les ajouter dans Netlify Environment Variables**

## 🔧 DÉVELOPPEMENT LOCAL

### Pour travailler en local :

1. **Modifier `env.js` temporairement :**
```javascript
// En développement local uniquement
window.ENV = {
    SUPABASE_URL: 'https://votre-nouveau-projet.supabase.co',
    SUPABASE_ANON_KEY: 'votre-nouvelle-cle-publique'
};
```

2. **⚠️ NE JAMAIS commiter ces vraies clés**

## 📁 FICHIERS MODIFIÉS

- ✅ `config/supabase.js` - Utilise maintenant `window.ENV`
- ✅ `env.js` - Script d'injection des variables
- ✅ `build.sh` - Script de build pour Netlify
- ✅ `netlify.toml` - Configuration de build mise à jour
- ✅ `index.html` - Charge `env.js` avant `supabase.js`
- ✅ `admin/index.html` - Charge `env.js` avant `supabase.js`
- ✅ `admin/login.html` - Charge `env.js` avant `supabase.js`

## 🚀 REDÉPLOIEMENT

1. **Commit et push des modifications**
2. **Configurer les variables dans Netlify**
3. **Redéployer le site**
4. **Vérifier que tout fonctionne**

## ✅ VÉRIFICATIONS DE SÉCURITÉ

- [ ] Variables d'environnement configurées dans Netlify
- [ ] Clés Supabase régénérées
- [ ] Site redéployé avec les nouvelles clés
- [ ] Authentification fonctionne
- [ ] Back office accessible
- [ ] Aucune clé visible dans le code source GitHub

## 🔍 MONITORING

Surveillez les logs Netlify pour détecter toute erreur de configuration :
- Build logs pour vérifier l'injection des variables
- Function logs pour les erreurs d'authentification
- Deploy logs pour les problèmes de déploiement

---

**🎯 Votre site est maintenant sécurisé ! Les clés ne sont plus exposées publiquement.**