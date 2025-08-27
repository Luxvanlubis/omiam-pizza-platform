# 📋 Documentation Interface Admin O'Miam

> **Version:** 2.0  
> **Dernière mise à jour:** Janvier 2025  
> **Statut:** Production Ready

---

## 🎯 Vue d'ensemble

L'interface d'administration O'Miam est une plateforme complète de gestion pour les restaurants, offrant des outils avancés pour la gestion des commandes, du menu, des clients, de l'analytics et de la sécurité.

### ✨ Fonctionnalités principales

- **Gestion des commandes** - Suivi en temps réel, statuts, historique
- **Gestion du menu** - CRUD complet, catégories, prix, disponibilité
- **Analytics avancés** - KPIs, graphiques, exports, prédictions
- **Sécurité & Permissions** - Gestion des utilisateurs, audit logs, 2FA
- **Notifications temps réel** - Alertes, nouvelles commandes, système
- **Optimisation des performances** - Cache, lazy loading, monitoring
- **Gestion des médias** - Upload, optimisation, CDN
- **Système de fidélité** - Points, récompenses, campagnes

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Next.js 14+
- Supabase configuré
- Permissions admin

### Accès à l'interface

1. **URL d'accès:** `/admin`
2. **Authentification:** Connexion avec compte admin
3. **Permissions:** Rôles `admin`, `super_admin`, `manager`, ou `staff`

### Navigation principale

L'interface utilise un système d'onglets pour organiser les différents modules :

```
📊 Dashboard    → Vue d'ensemble et statistiques
📦 Commandes    → Gestion des commandes
🎯 Suivi        → Tracking en temps réel
🍕 Menu         → Gestion du menu
💎 Fidélité     → Programme de fidélité
📈 Analytics    → Rapports et analyses
📈 Analytics+   → Analytics avancés avec IA
🔔 Notifications → Centre de notifications
🔒 Sécurité     → Gestion utilisateurs et audit
⚙️ Paramètres   → Configuration système
🎨 Médias       → Gestion des fichiers
📝 Contenu      → CMS et pages
🌍 Localisation → Traductions
🔗 Liens        → Gestion des liens
```

---

## 📊 Module Dashboard

### Vue d'ensemble

Le dashboard fournit une vue synthétique de l'activité du restaurant :

#### Métriques clés
- **Commandes totales** - Nombre de commandes du jour
- **Chiffre d'affaires** - CA journalier et évolution
- **Clients actifs** - Nombre de clients uniques
- **Panier moyen** - Valeur moyenne des commandes

#### Widgets disponibles
- **Commandes récentes** - Liste des dernières commandes
- **Articles populaires** - Top des ventes
- **Clients fidèles** - Meilleurs clients
- **Graphiques de tendance** - Évolution des ventes

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="admin-dashboard"
data-testid="stats-cards"
data-testid="recent-orders"
data-testid="popular-items"
```

---

## 📦 Module Gestion des Commandes

### Fonctionnalités

#### Affichage des commandes
- **Liste paginée** - 20 commandes par page
- **Filtres avancés** - Par statut, date, client
- **Recherche** - Par numéro, nom client, produit
- **Tri** - Par date, montant, statut

#### Statuts des commandes
```typescript
type OrderStatus = 
  | 'pending'     // En attente
  | 'confirmed'   // Confirmée
  | 'preparing'   // En préparation
  | 'ready'       // Prête
  | 'delivered'   // Livrée
  | 'cancelled';  // Annulée
```

#### Actions disponibles
- **Changer le statut** - Workflow de commande
- **Voir les détails** - Informations complètes
- **Imprimer** - Ticket de commande
- **Contacter le client** - Email/SMS
- **Rembourser** - Gestion des remboursements

### Interface utilisateur

#### Filtres et recherche
```tsx
// Barre de recherche
<Input 
  placeholder="Rechercher une commande..."
  data-testid="search-orders"
/>

// Filtre par statut
<Select data-testid="filter-status">
  <SelectItem value="all">Tous les statuts</SelectItem>
  <SelectItem value="pending">En attente</SelectItem>
  <SelectItem value="confirmed">Confirmées</SelectItem>
  // ...
</Select>
```

#### Carte de commande
Chaque commande est affichée dans une carte contenant :
- **Numéro de commande** - Identifiant unique
- **Client** - Nom et contact
- **Articles** - Liste des produits
- **Montant total** - Prix TTC
- **Statut** - Badge coloré
- **Actions** - Boutons d'action

### Tests E2E
```typescript
// Sélecteurs principaux
data-testid="order-management"
data-testid="search-orders"
data-testid="filter-status"
data-testid="refresh-orders"
data-testid="order-card-{orderId}"
data-testid="change-status-{orderId}"
```

---

## 🍕 Module Gestion du Menu

### Structure des données

#### Article de menu
```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  allergens: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  preparationTime: number; // en minutes
  popularity: number; // score de popularité
}
```

#### Catégories
```typescript
interface Category {
  id: string;
  name: string;
  description: string;
  order: number;
  active: boolean;
  image?: string;
}
```

### Fonctionnalités

#### Gestion des articles
- **Créer** - Nouvel article avec formulaire complet
- **Modifier** - Édition en place ou modal
- **Supprimer** - Suppression avec confirmation
- **Dupliquer** - Copie d'un article existant
- **Activer/Désactiver** - Disponibilité

#### Gestion des catégories
- **Créer des catégories** - Organisation du menu
- **Réorganiser** - Drag & drop pour l'ordre
- **Filtrer par catégorie** - Vue filtrée

#### Import/Export
- **Export CSV** - Sauvegarde du menu
- **Import CSV** - Import en masse
- **Synchronisation** - Avec systèmes externes

### Interface utilisateur

#### Barre d'outils
```tsx
<div className="flex justify-between items-center">
  <div className="flex gap-4">
    <Input 
      placeholder="Rechercher un plat..."
      data-testid="search-menu-items"
    />
    <Select data-testid="filter-category">
      <SelectItem value="all">Toutes catégories</SelectItem>
      <SelectItem value="pizzas">Pizzas</SelectItem>
      // ...
    </Select>
  </div>
  <Button data-testid="add-menu-item">
    <Plus /> Ajouter un plat
  </Button>
</div>
```

#### Grille d'articles
Affichage en grille responsive avec :
- **Image** - Photo du plat
- **Nom et description** - Informations principales
- **Prix** - Tarif actuel
- **Statut** - Disponible/Indisponible
- **Actions** - Modifier, supprimer, dupliquer

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="menu-management"
data-testid="search-menu-items"
data-testid="filter-category"
data-testid="add-menu-item"
data-testid="menu-item-{itemId}"
data-testid="edit-item-{itemId}"
data-testid="delete-item-{itemId}"
data-testid="toggle-availability-{itemId}"
```

---

## 📈 Module Analytics Avancés

### Métriques disponibles

#### KPIs principaux
- **Chiffre d'affaires** - CA journalier, hebdomadaire, mensuel
- **Nombre de commandes** - Volume de commandes
- **Panier moyen** - Valeur moyenne des commandes
- **Taux de conversion** - Visiteurs → Commandes
- **Satisfaction client** - Notes et avis

#### Analytics produits
- **Top des ventes** - Articles les plus vendus
- **Analyse de rentabilité** - Marge par produit
- **Tendances saisonnières** - Évolution des ventes
- **Analyse des stocks** - Rotation et optimisation

#### Analytics clients
- **Segmentation** - Groupes de clients
- **Valeur vie client (LTV)** - Valeur à long terme
- **Rétention** - Taux de fidélisation
- **Acquisition** - Canaux d'acquisition

### Graphiques et visualisations

#### Types de graphiques
- **Courbes** - Évolution temporelle
- **Barres** - Comparaisons
- **Camemberts** - Répartitions
- **Heatmaps** - Données géographiques
- **Funnels** - Parcours client

#### Exports disponibles
- **PDF** - Rapports formatés
- **Excel** - Données brutes
- **CSV** - Import dans autres outils
- **Images** - Graphiques pour présentations

### Interface utilisateur

#### Filtres temporels
```tsx
<Select data-testid="time-range">
  <SelectItem value="today">Aujourd'hui</SelectItem>
  <SelectItem value="week">Cette semaine</SelectItem>
  <SelectItem value="month">Ce mois</SelectItem>
  <SelectItem value="quarter">Ce trimestre</SelectItem>
  <SelectItem value="year">Cette année</SelectItem>
  <SelectItem value="custom">Période personnalisée</SelectItem>
</Select>
```

#### Dashboard personnalisable
- **Widgets déplaçables** - Drag & drop
- **Tailles ajustables** - Redimensionnement
- **Filtres par widget** - Configuration individuelle
- **Sauvegarde des vues** - Layouts personnalisés

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="advanced-analytics"
data-testid="time-range"
data-testid="export-report"
data-testid="kpi-card-{metric}"
data-testid="chart-{chartType}"
data-testid="filter-{filterName}"
```

---

## 🔒 Module Sécurité & Permissions

### Gestion des utilisateurs

#### Rôles disponibles
```typescript
type UserRole = 
  | 'super_admin'  // Accès complet
  | 'admin'        // Gestion complète sauf utilisateurs
  | 'manager'      // Gestion opérationnelle
  | 'staff';       // Accès limité aux commandes
```

#### Permissions par rôle
| Permission | Super Admin | Admin | Manager | Staff |
|------------|-------------|-------|---------|-------|
| Gestion commandes | ✅ | ✅ | ✅ | ✅ |
| Gestion menu | ✅ | ✅ | ✅ | ❌ |
| Analytics | ✅ | ✅ | ❌ | ❌ |
| Gestion utilisateurs | ✅ | ❌ | ❌ | ❌ |
| Paramètres système | ✅ | ❌ | ❌ | ❌ |
| Audit & Sécurité | ✅ | ✅ | ❌ | ❌ |

### Audit et logs

#### Types d'événements trackés
- **Connexions** - Login/logout, échecs
- **Modifications** - CRUD sur toutes les entités
- **Accès** - Consultation de données sensibles
- **Erreurs** - Tentatives non autorisées
- **Système** - Changements de configuration

#### Informations capturées
```typescript
interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;        // LOGIN, UPDATE, DELETE, etc.
  resource: string;      // Menu, Order, User, etc.
  details: string;       // Description de l'action
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
}
```

### Sécurité des mots de passe

#### Politique par défaut
- **Longueur minimale** - 8 caractères
- **Complexité** - Majuscules, minuscules, chiffres, caractères spéciaux
- **Expiration** - 90 jours
- **Historique** - 5 derniers mots de passe
- **Tentatives** - 5 échecs max avant blocage

#### Authentification à deux facteurs (2FA)
- **TOTP** - Google Authenticator, Authy
- **SMS** - Code par SMS (optionnel)
- **Email** - Code par email (fallback)
- **Codes de récupération** - Codes de secours

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="security-management"
data-testid="tab-users"
data-testid="tab-permissions"
data-testid="tab-audit"
data-testid="tab-security-settings"
data-testid="search-users"
data-testid="add-user"
data-testid="toggle-user-{userId}"
data-testid="search-logs"
```

---

## ⚡ Module Optimisation des Performances

### Monitoring en temps réel

#### Métriques système
- **Temps de réponse API** - Latence moyenne
- **Utilisation CPU** - Charge processeur
- **Utilisation mémoire** - RAM utilisée
- **Taux de cache hit** - Efficacité du cache
- **Requêtes DB/sec** - Charge base de données
- **Temps de chargement page** - Performance frontend

#### Alertes automatiques
- **Seuils configurables** - Alertes personnalisées
- **Notifications** - Email, SMS, Slack
- **Escalade** - Notification hiérarchique
- **Historique** - Journal des alertes

### Gestion du cache

#### Types de cache
- **Memory** - Cache en mémoire (Redis)
- **Database** - Cache base de données
- **CDN** - Cache de contenu statique
- **Browser** - Cache navigateur

#### Stratégies d'éviction
- **LRU** - Least Recently Used
- **LFU** - Least Frequently Used
- **FIFO** - First In, First Out
- **TTL** - Time To Live

### Optimisation des requêtes

#### Analyse automatique
- **Détection des requêtes lentes** - > 100ms
- **Analyse des index** - Recommandations
- **Optimisation des jointures** - Suggestions
- **Pagination automatique** - Limitation des résultats

#### Suggestions d'optimisation
- **Index manquants** - Création d'index
- **Requêtes N+1** - Eager loading
- **Dénormalisation** - Optimisation de structure
- **Vues matérialisées** - Pré-calculs

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="performance-optimization"
data-testid="tab-metrics"
data-testid="tab-cache"
data-testid="tab-database"
data-testid="tab-perf-settings"
data-testid="refresh-performance"
data-testid="clear-cache-{cacheId}"
data-testid="optimize-query-{queryId}"
```

---

## 🔔 Module Notifications

### Types de notifications

#### Notifications système
- **Nouvelles commandes** - Commande reçue
- **Changements de statut** - Évolution commande
- **Alertes stock** - Stock faible
- **Erreurs système** - Problèmes techniques
- **Maintenance** - Opérations de maintenance

#### Notifications métier
- **Objectifs atteints** - CA, commandes
- **Avis clients** - Nouveaux avis
- **Promotions** - Campagnes actives
- **Rapports** - Rapports automatiques

### Configuration

#### Canaux de notification
- **In-app** - Notifications dans l'interface
- **Email** - Notifications par email
- **SMS** - Notifications par SMS
- **Push** - Notifications push
- **Webhook** - Intégrations externes

#### Préférences utilisateur
- **Fréquence** - Immédiate, groupée, quotidienne
- **Filtres** - Types de notifications
- **Horaires** - Plages de notification
- **Priorité** - Niveau d'importance

### Interface utilisateur

#### Centre de notifications
```tsx
<NotificationCenter 
  isOpen={notificationsOpen}
  onClose={() => setNotificationsOpen(false)}
  data-testid="notification-center"
>
  <NotificationList 
    notifications={notifications}
    onMarkAsRead={handleMarkAsRead}
    onDelete={handleDelete}
  />
</NotificationCenter>
```

#### Badge de notifications
```tsx
<Button 
  variant="outline" 
  onClick={() => setNotificationsOpen(true)}
  data-testid="notifications-button"
>
  <Bell className="h-4 w-4" />
  {unreadCount > 0 && (
    <Badge className="ml-2" data-testid="notification-badge">
      {unreadCount}
    </Badge>
  )}
</Button>
```

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="notification-center"
data-testid="notifications-button"
data-testid="notification-badge"
data-testid="notification-{notificationId}"
data-testid="mark-as-read-{notificationId}"
data-testid="delete-notification-{notificationId}"
```

---

## 🎨 Module Gestion des Médias

### Types de fichiers supportés

#### Images
- **Formats** - JPEG, PNG, WebP, SVG
- **Taille max** - 10MB par fichier
- **Résolutions** - Optimisation automatique
- **Compression** - Réduction de taille

#### Documents
- **Formats** - PDF, DOC, XLS
- **Taille max** - 50MB par fichier
- **Prévisualisation** - Aperçu intégré

### Fonctionnalités

#### Upload et gestion
- **Drag & drop** - Interface intuitive
- **Upload multiple** - Plusieurs fichiers
- **Barre de progression** - Suivi upload
- **Validation** - Vérification format/taille

#### Optimisation automatique
- **Redimensionnement** - Tailles multiples
- **Compression** - Réduction de poids
- **Formats modernes** - WebP, AVIF
- **CDN** - Distribution globale

#### Organisation
- **Dossiers** - Structure hiérarchique
- **Tags** - Étiquetage
- **Recherche** - Recherche par nom, tag
- **Filtres** - Par type, date, taille

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="media-management"
data-testid="upload-area"
data-testid="file-{fileId}"
data-testid="delete-file-{fileId}"
data-testid="search-media"
data-testid="filter-media-type"
```

---

## 💎 Module Fidélité

### Programme de points

#### Règles de gain
- **Achat** - 1 point par euro dépensé
- **Inscription** - 100 points de bienvenue
- **Parrainage** - 500 points par filleul
- **Avis** - 50 points par avis
- **Anniversaire** - 200 points bonus

#### Règles d'utilisation
- **Taux de conversion** - 100 points = 1€
- **Minimum d'utilisation** - 500 points
- **Expiration** - 12 mois d'inactivité
- **Cumul** - Avec promotions

### Récompenses

#### Types de récompenses
- **Réductions** - Pourcentage ou montant fixe
- **Produits gratuits** - Articles offerts
- **Livraison gratuite** - Frais de port offerts
- **Accès VIP** - Avantages exclusifs

#### Niveaux de fidélité
```typescript
type LoyaltyTier = 
  | 'bronze'   // 0-999 points
  | 'silver'   // 1000-2999 points
  | 'gold'     // 3000-4999 points
  | 'platinum' // 5000+ points
```

### Campagnes

#### Types de campagnes
- **Points bonus** - Multiplication des points
- **Défis** - Objectifs à atteindre
- **Événements** - Promotions temporaires
- **Parrainage** - Programmes de recommandation

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="loyalty-management"
data-testid="loyalty-stats"
data-testid="loyalty-rules"
data-testid="loyalty-campaigns"
data-testid="create-campaign"
```

---

## ⚙️ Configuration et Paramètres

### Paramètres généraux

#### Informations restaurant
- **Nom** - Nom du restaurant
- **Adresse** - Adresse complète
- **Contact** - Téléphone, email
- **Horaires** - Heures d'ouverture
- **Description** - Présentation

#### Paramètres de commande
- **Commande minimum** - Montant minimum
- **Frais de livraison** - Tarifs de livraison
- **Zones de livraison** - Périmètre de livraison
- **Temps de préparation** - Délais par défaut

### Intégrations

#### Paiements
- **Stripe** - Cartes bancaires
- **PayPal** - Portefeuille électronique
- **Apple Pay** - Paiement mobile
- **Google Pay** - Paiement mobile

#### Livraisons
- **Uber Eats** - Plateforme de livraison
- **Deliveroo** - Plateforme de livraison
- **Just Eat** - Plateforme de livraison
- **Livraison interne** - Équipe propre

#### Marketing
- **Mailchimp** - Email marketing
- **Google Analytics** - Analyse web
- **Facebook Pixel** - Publicité Facebook
- **Google Ads** - Publicité Google

### Tests E2E
```typescript
// Sélecteurs de test
data-testid="system-settings"
data-testid="restaurant-info"
data-testid="order-settings"
data-testid="payment-settings"
data-testid="delivery-settings"
data-testid="save-settings"
```

---

## 🧪 Tests et Qualité

### Tests E2E avec Playwright

#### Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
```

#### Tests principaux
```typescript
// tests/e2e/admin.spec.ts
test.describe('Admin Interface', () => {
  test('should navigate through all admin tabs', async ({ page }) => {
    await page.goto('/admin');
    
    // Test navigation
    await page.getByTestId('tab-dashboard').click();
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    
    await page.getByTestId('tab-orders').click();
    await expect(page.getByTestId('order-management')).toBeVisible();
    
    // ... autres onglets
  });
  
  test('should manage orders', async ({ page }) => {
    await page.goto('/admin');
    await page.getByTestId('tab-orders').click();
    
    // Test recherche
    await page.getByTestId('search-orders').fill('ORD-123');
    await expect(page.getByTestId('order-card-123')).toBeVisible();
    
    // Test changement de statut
    await page.getByTestId('change-status-123').click();
    // ...
  });
});
```

### Sélecteurs de test standardisés

#### Convention de nommage
- **Modules** - `data-testid="{module}-management"`
- **Actions** - `data-testid="{action}-{entity}"`
- **Filtres** - `data-testid="filter-{type}"`
- **Recherche** - `data-testid="search-{entity}"`
- **Éléments** - `data-testid="{entity}-{id}"`

#### Exemples
```typescript
// Modules
data-testid="order-management"
data-testid="menu-management"
data-testid="security-management"

// Actions
data-testid="add-menu-item"
data-testid="edit-order-123"
data-testid="delete-user-456"

// Filtres et recherche
data-testid="filter-status"
data-testid="search-orders"
data-testid="filter-category"
```

---

## 🚀 Déploiement et Production

### Environnements

#### Développement
- **URL** - `http://localhost:3000/admin`
- **Base de données** - Supabase local
- **Cache** - Redis local
- **Logs** - Console

#### Staging
- **URL** - `https://staging.omiam.fr/admin`
- **Base de données** - Supabase staging
- **Cache** - Redis Cloud
- **Logs** - Structured logging

#### Production
- **URL** - `https://admin.omiam.fr`
- **Base de données** - Supabase production
- **Cache** - Redis Enterprise
- **Logs** - Centralized logging
- **Monitoring** - Sentry, DataDog

### Performance

#### Métriques cibles
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Cumulative Layout Shift** - < 0.1
- **Time to Interactive** - < 3s

#### Optimisations
- **Code splitting** - Lazy loading des modules
- **Image optimization** - WebP, responsive images
- **Caching** - Service worker, CDN
- **Bundle analysis** - Webpack Bundle Analyzer

### Sécurité

#### Headers de sécurité
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

#### Authentification
- **JWT** - Tokens sécurisés
- **Refresh tokens** - Renouvellement automatique
- **Rate limiting** - Protection contre les attaques
- **CSRF protection** - Protection CSRF

---

## 📚 Ressources et Support

### Documentation technique

- **API Documentation** - `/docs/api`
- **Component Library** - Storybook
- **Database Schema** - `/docs/database`
- **Architecture** - `/docs/architecture`

### Outils de développement

- **Next.js DevTools** - Debugging React
- **Supabase Dashboard** - Gestion BDD
- **Redis CLI** - Gestion cache
- **Sentry** - Monitoring erreurs

### Support

- **Documentation** - Cette documentation
- **Issues GitHub** - Rapports de bugs
- **Slack** - Support équipe
- **Email** - support@omiam.fr

### Changelog

#### Version 2.0 (Janvier 2025)
- ✅ Interface admin complètement refactorisée
- ✅ Module de sécurité avancé avec audit logs
- ✅ Analytics avancés avec IA
- ✅ Système de notifications temps réel
- ✅ Optimisation des performances
- ✅ Tests E2E complets
- ✅ Documentation complète

#### Version 1.0 (Décembre 2024)
- ✅ Interface admin de base
- ✅ Gestion des commandes
- ✅ Gestion du menu
- ✅ Analytics simples
- ✅ Système de fidélité

---

## 🎯 Roadmap

### Q1 2025
- 🔄 Intégration IA pour recommandations
- 🔄 API mobile pour app native
- 🔄 Système de réservations
- 🔄 Multi-restaurant support

### Q2 2025
- 🔄 Marketplace intégré
- 🔄 Système de franchise
- 🔄 Analytics prédictifs
- 🔄 Automatisation marketing

---

*Cette documentation est maintenue par l'équipe O'Miam et mise à jour régulièrement.*