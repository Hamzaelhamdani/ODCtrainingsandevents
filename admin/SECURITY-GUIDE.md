# 🔐 Guide de Sécurisation du Back Office ODC

## 📋 Étapes d'installation

### 1. Configuration Supabase

1. **Connectez-vous à votre tableau de bord Supabase**
2. **Allez dans l'onglet "SQL Editor"**
3. **Copiez et exécutez le script** `setup-admin-users.sql`
4. **Modifiez l'email dans le script** (ligne 52) par votre email d'administrateur

### 2. Création du premier compte administrateur

1. **Allez dans l'onglet "Authentication" de Supabase**
2. **Cliquez sur "Add user"**
3. **Créez un utilisateur avec l'email que vous avez mis dans le script SQL**
4. **Définissez un mot de passe sécurisé**
5. **Confirmez l'email si nécessaire**

### 3. Test de connexion

1. **Allez sur** `admin/login.html`
2. **Connectez-vous avec les identifiants créés**
3. **Vérifiez que vous accédez bien au back office**

## 🛡️ Fonctionnalités de sécurité

### ✅ Authentification obligatoire
- Impossible d'accéder au back office sans être connecté
- Redirection automatique vers la page de connexion

### ✅ Contrôle des permissions
- Seuls les utilisateurs dans la table `admin_users` peuvent se connecter
- Vérification des rôles (admin / super_admin)

### ✅ Session sécurisée
- Gestion automatique des sessions Supabase
- Déconnexion automatique en cas d'expiration

### ✅ Interface protégée
- Bouton de déconnexion visible
- Protection de toutes les pages admin

## 👥 Gestion des utilisateurs

### Ajouter un nouvel administrateur

1. **Créer le compte dans Supabase Auth** :
   - Onglet Authentication > Add user
   - Email + mot de passe

2. **Ajouter à la table admin_users** :
   ```sql
   INSERT INTO admin_users (email, role, active, notes)
   VALUES ('nouvel.admin@odc.ma', 'admin', true, 'Administrateur ajouté le 2025-10-14');
   ```

### Désactiver un administrateur

```sql
UPDATE admin_users 
SET active = false 
WHERE email = 'admin.a.desactiver@odc.ma';
```

### Voir les statistiques

```sql
SELECT * FROM admin_stats;
```

## 🔧 Configuration avancée

### Emails autorisés en dur (backup)

Dans `auth.js`, ligne 75-79, vous pouvez ajouter des emails de secours :

```javascript
const adminEmails = [
    'admin@orangedigitalcenter.ma',
    'backoffice@odc.ma',
    'votre.email@odc.ma'  // Ajoutez votre email ici
];
```

### Personnalisation des rôles

Vous pouvez modifier les rôles dans la table :
- `admin` : Accès normal au back office
- `super_admin` : Peut gérer d'autres administrateurs

## 🚨 Points importants

1. **Changez l'email par défaut** dans le script SQL
2. **Utilisez des mots de passe forts**
3. **Sauvegardez les identifiants de manière sécurisée**
4. **Testez la connexion avant la mise en production**
5. **Désactivez les comptes inutilisés**

## 📞 En cas de problème

Si vous êtes bloqué :
1. Vérifiez que l'utilisateur existe dans Supabase Auth
2. Vérifiez que l'email est dans la table `admin_users`
3. Vérifiez que `active = true`
4. Consultez la console du navigateur pour les erreurs

## 🎯 URLs importantes

- **Landing page** : `index.html`
- **Connexion admin** : `admin/login.html`
- **Back office** : `admin/index.html` (protégé)

---

**Note** : Gardez ce guide en sécurité et ne partagez les identifiants qu'avec les personnes autorisées !