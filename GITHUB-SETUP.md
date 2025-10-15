# 🔗 Instructions pour créer le repository GitHub

## Étapes à suivre :

### 1. 🌐 Créer le repository sur GitHub
1. Aller sur [GitHub.com](https://github.com)
2. Cliquer sur le bouton **"New"** ou **"+"** → **"New repository"**
3. Nommer le repository : **`ODCtrainingsandevents`**
4. Description : **"ODC Trainings and Events Platform - Dynamic website for Orange Digital Center formations and events"**
5. Choisir **Public** ou **Private** selon vos préférences
6. **NE PAS** cocher "Add a README file" (nous en avons déjà un)
7. **NE PAS** cocher "Add .gitignore" (nous en avons déjà un)
8. Cliquer sur **"Create repository"**

### 2. 📋 Commands à exécuter après création
Après avoir créé le repository sur GitHub, exécutez ces commandes :

```bash
# Ajouter le remote GitHub (remplacez USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/USERNAME/ODCtrainingsandevents.git

# Renommer la branche principale (optionnel, si vous préférez 'main')
git branch -M main

# Pousser le code vers GitHub
git push -u origin main
```

### 3. 🚀 Prêt pour Netlify !
Une fois le repository GitHub créé et le code poussé :

1. **Netlify Dashboard** → **"New site from Git"**
2. **Connecter GitHub** → Sélectionner le repository **`ODCtrainingsandevents`**
3. **Build settings** :
   - Build command : (laisser vide)
   - Publish directory : (laisser vide ou mettre `/`)
4. **Environment variables** : Configurer les variables Supabase si nécessaire
5. **Deploy site** 🎉

### 4. 📝 Variables d'environnement Netlify
Si vous utilisez des variables d'environnement, les ajouter dans :
**Site settings** → **Environment variables**

### 5. ✅ Configuration DNS (optionnel)
Pour un domaine personnalisé :
**Site settings** → **Domain management** → **Add custom domain**

---

**Le repository local est prêt ! Il suffit maintenant de créer le repository sur GitHub et de pousser le code.** 🎯