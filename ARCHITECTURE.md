# 🏗️ Architecture du Projet OMIAM

> Guide de structure après optimisation et nettoyage des doublons

## 📁 Structure des Dossiers

### `/src/services/`
- **`analyticsService.ts`** - Service principal pour les données analytiques
- **`customerService.ts`** - Gestion des clients
- **`waitlistService.ts`** - Gestion de la liste d'attente

### `/src/types/`
- **`supabase.ts`** - Types TypeScript harmonisés Prisma/Supabase (PRINCIPAL)
- **`analytics.ts`** - Types pour les données analytiques
- **`customer.ts`** - Types pour les clients
- **`waitlist.ts`** - Types pour la liste d'attente
- **`archive/`** - Anciens types archivés
  - `supabase-old.ts` - Ancienne version des types Supabase
  - `supabase-harmonized.ts` - Version intermédiaire archivée

### `/src/components/admin/`
- **`AnalyticsReports.tsx`** - Rapports analytiques historiques
- **`RealTimeAnalytics.tsx`** - Métriques temps réel
- Autres composants d'administration spécialisés

### `/src/hooks/`
- **`useAnalytics.ts`** - Hook pour les données analytiques
- Autres hooks utilitaires

### `/src/lib/`
- Services et utilitaires généraux
- Intégrations Supabase
- Services de notification et médias

## 🔧 Services Principaux

### Analytics Service
```typescript
// src/services/analyticsService.ts
// Service unifié pour toutes les données analytiques
// - Simulation de données
// - Intégration future avec Supabase
// - Types harmonisés
```

### Types Supabase
```typescript
// src/types/supabase.ts
// Types harmonisés Prisma/Supabase
// - User, Product, Order
// - Champs loyalty_points, is_active
```

## 🚀 Ports et Configuration

- **Port 3000** - Application Next.js principale
- **Port 3001** - Serveur de développement (si nécessaire)
- **Conflits résolus** - Processus Node.js nettoyés

## 📦 Composants Analytics

### AnalyticsReports
- Rapports historiques
- Données de vente et clients
- Exportation de rapports
- Utilise `useAnalytics` hook

### RealTimeAnalytics
- Métriques temps réel
- Alertes et notifications
- Monitoring des performances
- Interface interactive

## 🧹 Nettoyage Effectué

### ✅ Fichiers Supprimés
- `src/lib/analytics-service.ts` (doublon)
- `src/app/page-original.tsx`
- `src/app/menu-page-original.tsx`
- `src/app/galerie-page-original.tsx`
- `src/app/page.tsx.backup`

### 📁 Fichiers Archivés
- `src/types/supabase-old.ts` → `src/types/archive/`
- `src/types/supabase-harmonized.ts` → `src/types/archive/`

### 🔗 Imports Corrigés
- `useAnalytics.ts` - Import corrigé vers le service principal
- Tous les imports vérifiés et mis à jour

## 🎯 Bonnes Pratiques

### Éviter les Doublons
1. **Un seul service par fonctionnalité**
2. **Types centralisés dans `/types/`**
3. **Archive plutôt que suppression**
4. **Nommage cohérent**

### Structure Recommandée
```
src/
├── services/          # Services métier
├── types/            # Définitions TypeScript
├── components/       # Composants React
├── hooks/           # Hooks personnalisés
├── lib/             # Utilitaires et intégrations
└── app/             # Pages Next.js
```

### Gestion des Ports
- Vérifier les processus avant démarrage
- Utiliser `netstat` pour diagnostiquer
- Arrêter proprement les serveurs

## 🔄 Maintenance

### Vérifications Régulières
- [ ] Rechercher les doublons avec `grep -r "pattern" src/`
- [ ] Vérifier les imports cassés
- [ ] Nettoyer les fichiers temporaires
- [ ] Archiver les anciennes versions

### Commandes Utiles
```bash
# Rechercher les doublons
find src/ -name "*-original*" -o -name "*.backup"

# Vérifier les ports
netstat -ano | findstr :3000

# Nettoyer les processus
Stop-Process -Id <PID> -Force
```

---

**Dernière mise à jour** : 26 août 2025  
**Version** : 1.0 - Post-nettoyage  
**Statut** : ✅ Architecture optimisée et documentée