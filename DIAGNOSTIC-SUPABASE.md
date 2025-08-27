# 🔍 Diagnostic Supabase - OMIAM Pizza

## 📊 État Actuel du Projet

### ✅ Configuration Détectée
- **URL Supabase**: `https://bnjmxkjpngvkmelkhnjv.supabase.co`
- **Clé Anon**: Configurée ✅
- **NextAuth Secret**: Configuré ✅

### ❌ Problèmes Identifiés
1. **Connexion réseau échouée**: `ENOTFOUND bnjmxkjpngvkmelkhnjv.supabase.co`
2. **Service Role Key**: Non configurée
3. **Mot de passe DB**: Non configuré

---

## 🚨 Diagnostic du Problème Principal

### Cause Probable
L'erreur `ENOTFOUND` indique que :
- Le projet Supabase n'existe pas encore
- L'URL est incorrecte
- Le projet a été supprimé
- Problème de réseau temporaire

---

## 🛠️ Solutions par Étapes

### 🎯 Solution 1: Vérifier l'Existence du Projet

1. **Connectez-vous à Supabase**
   ```
   https://supabase.com/dashboard
   ```

2. **Vérifiez vos projets**
   - Cherchez un projet nommé "OMIAM Pizza" ou similaire
   - Notez l'URL réelle du projet

3. **Si le projet existe**
   - Copiez la vraie URL depuis le dashboard
   - Mettez à jour `.env.local`

### 🎯 Solution 2: Créer le Projet Supabase

**Si aucun projet n'existe, créez-en un nouveau :**

1. **Création du projet**
   ```
   Nom: OMIAM Pizza
   Organisation: Votre organisation
   Région: Europe West (recommandé)
   Mot de passe DB: [Choisissez un mot de passe fort]
   ```

2. **Récupération des informations**
   - URL du projet
   - Clé Anon (anon key)
   - Clé Service Role (service_role key)

### 🎯 Solution 3: Configuration Complète

1. **Mise à jour de `.env.local`**
   ```env
   # Remplacez par les vraies valeurs
   NEXT_PUBLIC_SUPABASE_URL=https://[votre-projet].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[votre-clé-anon]
   SUPABASE_SERVICE_ROLE_KEY=[votre-clé-service-role]
   DATABASE_URL=postgresql://postgres:[mot-de-passe]@db.[votre-projet].supabase.co:5432/postgres
   ```

2. **Test de connexion**
   ```bash
   node test-connection.js
   ```

---

## 📋 Checklist de Vérification

### Avant de Continuer
- [ ] Projet Supabase créé et accessible
- [ ] URL correcte dans `.env.local`
- [ ] Clés API récupérées
- [ ] Mot de passe DB noté
- [ ] Test de connexion réussi

### Après Configuration
- [ ] Script SQL exécuté (`supabase-schema.sql`)
- [ ] Tables créées (users, products, orders, etc.)
- [ ] Données de test insérées
- [ ] RLS activé
- [ ] Application testée

---

## 🚀 Scripts de Test Disponibles

### Test de Connexion Basique
```bash
node test-connection.js
```
*Vérifie la connectivité réseau et les variables d'environnement*

### Test Complet de la Base
```bash
node verify-database.js
```
*Vérifie les tables, données et fonctionnalités (après exécution SQL)*

### Configuration Interactive
```bash
node setup-env.js
```
*Assistant interactif pour configurer `.env.local`*

---

## 🆘 Dépannage Avancé

### Si le Problème Persiste

1. **Vérifiez votre connexion internet**
   ```bash
   ping supabase.com
   ```

2. **Testez avec curl**
   ```bash
   curl -I https://supabase.com
   ```

3. **Vérifiez les DNS**
   ```bash
   nslookup [votre-projet].supabase.co
   ```

### Erreurs Communes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `ENOTFOUND` | URL incorrecte/projet inexistant | Vérifier l'URL sur le dashboard |
| `401 Unauthorized` | Clé API incorrecte | Régénérer les clés API |
| `403 Forbidden` | RLS mal configuré | Vérifier les politiques RLS |
| `Connection timeout` | Problème réseau | Vérifier firewall/proxy |

---

## 📞 Support

### Ressources Utiles
- [Documentation Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://supabase.com/dashboard)
- [Status Supabase](https://status.supabase.com)

### Fichiers de Configuration
- `.env.local` - Variables d'environnement
- `supabase-schema.sql` - Script de création de la base
- `test-connection.js` - Test de connectivité
- `verify-database.js` - Vérification complète

---

## ⚡ Actions Immédiates Recommandées

1. **Vérifiez l'existence du projet sur supabase.com**
2. **Si inexistant, créez un nouveau projet**
3. **Mettez à jour `.env.local` avec les vraies valeurs**
4. **Testez avec `node test-connection.js`**
5. **Exécutez le script SQL dans l'éditeur Supabase**
6. **Vérifiez avec `node verify-database.js`**

---

*🎯 Objectif : Avoir une connexion Supabase fonctionnelle pour l'application OMIAM Pizza*