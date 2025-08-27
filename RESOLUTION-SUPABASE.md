# 🚨 Résolution Problème Supabase - OMIAM Pizza

## 📊 Diagnostic Actuel

**❌ PROBLÈME IDENTIFIÉ**
```
Erreur: getaddrinfo ENOTFOUND bnjmxkjpngvkmelkhnjv.supabase.co
```

**🔍 CAUSE PROBABLE**
Le projet Supabase avec l'ID `bnjmxkjpngvkmelkhnjv` n'existe pas ou n'est pas accessible.

---

## 🛠️ SOLUTION ÉTAPE PAR ÉTAPE

### 🎯 Étape 1: Vérifier l'Existence du Projet

1. **Connectez-vous à Supabase**
   ```
   https://supabase.com/dashboard
   ```

2. **Vérifiez vos projets existants**
   - Recherchez un projet nommé "OMIAM Pizza" ou similaire
   - Notez l'URL réelle si le projet existe

3. **Si le projet existe mais avec une URL différente**
   - Copiez la vraie URL depuis le dashboard
   - Passez à l'Étape 3 pour mettre à jour la configuration

### 🎯 Étape 2: Créer un Nouveau Projet (si nécessaire)

**Si aucun projet n'existe, créez-en un nouveau :**

1. **Cliquez sur "New Project"**

2. **Configuration recommandée :**
   ```
   Nom du projet: OMIAM Pizza
   Organisation: [Votre organisation]
   Région: Europe West (eu-west-1)
   Plan: Free (pour commencer)
   ```

3. **Mot de passe de la base de données :**
   - Choisissez un mot de passe fort
   - **IMPORTANT**: Notez-le immédiatement !
   - Exemple: `OmiamPizza2024!`

4. **Attendez la création** (2-3 minutes)

### 🎯 Étape 3: Récupérer les Informations du Projet

1. **Accédez aux paramètres API**
   ```
   Dashboard → Votre Projet → Settings → API
   ```

2. **Copiez les informations suivantes :**
   - **Project URL** : `https://[nouveau-id].supabase.co`
   - **anon public** : `eyJ...` (clé publique)
   - **service_role** : `eyJ...` (clé privée)

### 🎯 Étape 4: Mettre à Jour la Configuration

1. **Ouvrez le fichier `.env.local`**

2. **Remplacez les valeurs :**
   ```env
   # Remplacez par les VRAIES valeurs de votre projet
   NEXT_PUBLIC_SUPABASE_URL=https://[votre-nouveau-id].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre-clé-anon]
   SUPABASE_SERVICE_ROLE_KEY=[votre-clé-service-role]
   DATABASE_URL=postgresql://postgres:[votre-mot-de-passe]@db.[votre-nouveau-id].supabase.co:5432/postgres
   ```

### 🎯 Étape 5: Tester la Connexion

```bash
node test-connection.js
```

**Résultat attendu :**
```
✅ Connexion Supabase réussie!
```

### 🎯 Étape 6: Configurer la Base de Données

1. **Accédez à l'éditeur SQL**
   ```
   Dashboard → Votre Projet → SQL Editor
   ```

2. **Exécutez le script de création**
   - Copiez tout le contenu de `supabase-schema.sql`
   - Collez dans l'éditeur SQL
   - Cliquez sur "Run" ou "RUN"

3. **Vérifiez l'exécution**
   - Aucune erreur ne doit apparaître
   - Les tables doivent être créées

### 🎯 Étape 7: Vérification Finale

```bash
node verify-database.js
```

**Résultat attendu :**
```
✅ Toutes les tables créées
✅ Données de test insérées
✅ Politiques RLS actives
```

---

## 🚀 Script de Configuration Automatique

**Pour une configuration rapide, utilisez :**

```bash
node setup-env.js
```

Ce script vous guidera interactivement pour :
- Saisir l'URL Supabase
- Configurer les clés API
- Générer le fichier `.env.local`

---

## 🆘 Dépannage Avancé

### Si le Problème Persiste

1. **Vérifiez votre connexion internet**
   ```bash
   ping supabase.com
   ```

2. **Testez l'accès au dashboard**
   - Ouvrez https://supabase.com dans votre navigateur
   - Vérifiez que vous pouvez vous connecter

3. **Vérifiez les paramètres réseau**
   - Firewall d'entreprise
   - Proxy ou VPN
   - Restrictions DNS

### Erreurs Communes

| Erreur | Solution |
|--------|----------|
| `ENOTFOUND` | Projet inexistant → Créer/vérifier le projet |
| `401 Unauthorized` | Clé API incorrecte → Régénérer les clés |
| `403 Forbidden` | Permissions insuffisantes → Vérifier les rôles |
| `Connection timeout` | Problème réseau → Vérifier firewall/proxy |

---

## 📞 Support

### Ressources Utiles
- [Documentation Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://supabase.com/dashboard)
- [Status Supabase](https://status.supabase.com)
- [Communauté Discord](https://discord.supabase.com)

### Fichiers de Configuration
- `.env.local` - Variables d'environnement
- `supabase-schema.sql` - Script de création de la base
- `test-connection.js` - Test de connectivité
- `verify-database.js` - Vérification complète
- `setup-env.js` - Configuration interactive

---

## ⚡ Checklist de Résolution

- [ ] 1. Vérifier l'existence du projet sur supabase.com
- [ ] 2. Créer un nouveau projet si nécessaire
- [ ] 3. Récupérer URL, clés API et mot de passe DB
- [ ] 4. Mettre à jour `.env.local` avec les vraies valeurs
- [ ] 5. Tester avec `node test-connection.js`
- [ ] 6. Exécuter `supabase-schema.sql` dans l'éditeur SQL
- [ ] 7. Vérifier avec `node verify-database.js`
- [ ] 8. Tester l'application sur `http://localhost:3000`

---

**🎯 Objectif Final :** Avoir une connexion Supabase fonctionnelle pour l'application OMIAM Pizza avec toutes les tables et données de test configurées.

**⏱️ Temps estimé :** 10-15 minutes pour une configuration complète.