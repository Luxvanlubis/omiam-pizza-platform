# 🍕 Structure Complète du Projet O'Miam - Organisation Fonctionnelle

> **Projet**: Application Web Complète de Pizzeria  
> **Technologies**: Next.js 14, TypeScript, Tailwind CSS, Supabase, Stripe  
> **Status**: Production Ready ✅

---

## 📁 Architecture Générale du Projet

```
OMIAM/
├── 🏗️ Configuration & Build
├── 📱 Application Frontend (src/)
├── 🔧 Scripts & Utilitaires
├── 📚 Documentation
├── 🧪 Tests & Qualité
└── 🚀 Déploiement
```

---

## 🏗️ Configuration & Build

### Fichiers de Configuration Principaux
```
├── package.json                    # Dépendances et scripts npm
├── next.config.js                  # Configuration Next.js
├── tailwind.config.ts              # Configuration Tailwind CSS
├── tsconfig.json                   # Configuration TypeScript
├── components.json                 # Configuration shadcn/ui
├── eslint.config.mjs              # Configuration ESLint
├── postcss.config.mjs             # Configuration PostCSS
├── playwright.config.ts           # Configuration tests E2E
└── jest.config.js                 # Configuration tests unitaires
```

### Variables d'Environnement
```
├── .env                           # Variables locales
├── .env.example                   # Template des variables
├── .env.local                     # Variables locales sécurisées
├── .env.production                # Variables de production
└── .env.production.example        # Template production
```

### Docker & Déploiement
```
├── Dockerfile                     # Image Docker
├── docker-compose.yml             # Orchestration Docker
├── nginx.conf                     # Configuration Nginx
└── vercel.json                    # Configuration Vercel
```

---

## 📱 Application Frontend (src/)

### 🎯 Pages Principales (src/app/)

#### Pages Client
```
src/app/
├── page.tsx                       # 🏠 Page d'accueil
├── menu/page.tsx                  # 🍕 Menu interactif
├── cart/page.tsx                  # 🛒 Panier
├── reservation/page.tsx           # 📅 Réservations
├── contact/page.tsx               # 📞 Contact
├── blog/page.tsx                  # 📝 Blog
├── galerie/page.tsx              # 📸 Galerie photos
├── restaurant/page.tsx            # 🏪 Profil restaurant
├── fidelite/page.tsx             # 🎁 Programme fidélité
└── partenaires/page.tsx          # 🤝 Partenaires
```

#### Pages Utilisateur
```
src/app/
├── auth/
│   ├── login/page.tsx             # 🔐 Connexion
│   └── signup/page.tsx            # ✍️ Inscription
├── profile/page.tsx               # 👤 Profil utilisateur
├── orders/
│   ├── page.tsx                   # 📋 Historique commandes
│   └── [id]/page.tsx             # 📄 Détail commande
├── suivi-commande/page.tsx        # 📍 Suivi en temps réel
└── waitlist/page.tsx             # ⏳ Liste d'attente
```

#### Pages Légales & Conformité
```
src/app/
├── mentions-legales/page.tsx      # ⚖️ Mentions légales
├── politique-confidentialite/page.tsx # 🔒 RGPD
├── cgv/page.tsx                   # 📋 CGV
├── conditions-generales-vente/page.tsx # 📋 CGV détaillées
├── mes-droits-rgpd/page.tsx       # 🛡️ Droits RGPD
└── allergenes/page.tsx            # ⚠️ Informations allergènes
```

#### Interface d'Administration
```
src/app/admin/
├── page.tsx                       # 🎛️ Dashboard principal
├── dashboard/page.tsx             # 📊 Tableau de bord avancé
├── notifications/page.tsx         # 🔔 Centre de notifications
├── stripe-config/page.tsx         # 💳 Configuration Stripe
├── tables/page.tsx               # 🪑 Gestion des tables
└── waitlist/page.tsx             # ⏳ Gestion liste d'attente
```

### 🧩 Composants (src/components/)

#### Composants UI Génériques
```
src/components/
├── Header.tsx                     # 🎯 En-tête principal
├── Footer.tsx                     # 🎯 Pied de page
├── ErrorBoundary.tsx              # 🛡️ Gestion d'erreurs
├── ScrollIndicator.tsx            # 📊 Indicateur de scroll
├── AnimateOnScroll.tsx            # ✨ Animations scroll
├── SkipToContent.tsx              # ♿ Accessibilité
├── CookieConsent.tsx              # 🍪 Consentement cookies
└── UnifiedLoginModal.tsx          # 🔐 Modal de connexion
```

#### Composants Accessibilité
```
src/components/
├── AccessibleButton.tsx           # ♿ Boutons accessibles
├── AccessibleForm.tsx             # ♿ Formulaires accessibles
├── AccessibleImage.tsx            # ♿ Images accessibles
└── AllergenDisplay.tsx            # ⚠️ Affichage allergènes
```

#### Composants PWA
```
src/components/
├── PWAInstallPrompt.tsx           # 📱 Installation PWA
├── PWANotifications.tsx           # 🔔 Notifications PWA
├── OfflineSync.tsx                # 🔄 Synchronisation hors-ligne
└── OfflineMenuExample.tsx         # 📋 Menu hors-ligne
```

#### Composants Administration
```
src/components/admin/
├── EnhancedDashboard.tsx          # 📊 Dashboard avancé
├── MenuManagement.tsx             # 🍕 Gestion menu
├── InventoryManagement.tsx        # 📦 Gestion stock
├── ReservationManagement.tsx      # 📅 Gestion réservations
├── NotificationCenter.tsx         # 🔔 Centre notifications
├── AnalyticsReports.tsx           # 📈 Rapports analytiques
├── SecurityManagement.tsx         # 🔒 Gestion sécurité
├── SystemSettings.tsx             # ⚙️ Paramètres système
├── UnifiedPOSModule.tsx           # 💰 Module POS unifié
└── StripeConfigTest.tsx           # 💳 Test configuration Stripe
```

#### Composants Métier Spécialisés
```
src/components/
├── cart/                          # 🛒 Composants panier
├── order/                         # 📋 Composants commandes
├── payment/                       # 💳 Composants paiement
├── reservation/                   # 📅 Composants réservation
├── loyalty/                       # 🎁 Composants fidélité
├── notifications/                 # 🔔 Composants notifications
├── reviews/                       # ⭐ Composants avis
├── pizza/                         # 🍕 Composants pizza
├── customer/                      # 👤 Composants client
├── referral/                      # 🤝 Composants parrainage
├── waitlist/                      # ⏳ Composants liste d'attente
├── analytics/                     # 📊 Composants analytiques
├── gdpr/                          # 🛡️ Composants RGPD
├── legal/                         # ⚖️ Composants légaux
└── ui/                            # 🎨 Composants UI de base
```

### 🔌 API Routes (src/app/api/)

#### Authentification
```
src/app/api/auth/
├── [...nextauth]/                 # 🔐 NextAuth.js
├── login/                         # 🔑 Connexion
├── signup/                        # ✍️ Inscription
└── admin/                         # 👑 Auth admin
```

#### Gestion des Commandes
```
src/app/api/
├── orders/
│   ├── route.ts                   # 📋 CRUD commandes
│   └── [id]/                      # 📄 Commande spécifique
├── products/
│   └── [id]/                      # 🍕 Produit spécifique
└── customization/route.ts         # 🎨 Personnalisation produits
```

#### Paiements & Stripe
```
src/app/api/
├── payments/
│   └── create-intent/             # 💳 Création intent paiement
├── create-payment-intent/route.ts # 💰 Intent paiement direct
├── stripe/
│   └── health/                    # 🏥 Santé Stripe
└── webhooks/
    └── stripe/                    # 🔗 Webhooks Stripe
```

#### Gestion Restaurant
```
src/app/api/
├── restaurant/route.ts            # 🏪 Données restaurant
├── restaurant-simple/route.ts     # 🏪 Version simplifiée
├── inventory/
│   ├── route.ts                   # 📦 Gestion stock
│   ├── items/                     # 📋 Articles
│   ├── movements/                 # 📊 Mouvements
│   └── alerts/                    # ⚠️ Alertes stock
└── reviews/route.ts               # ⭐ Avis clients
```

#### Notifications & Communication
```
src/app/api/
├── notifications/
│   ├── route.ts                   # 🔔 Notifications
│   ├── preferences/               # ⚙️ Préférences
│   ├── stats/                     # 📊 Statistiques
│   ├── stream/                    # 📡 Stream temps réel
│   └── subscribe/                 # 📧 Abonnements
└── emails/
    └── send/                      # 📧 Envoi emails
```

#### Santé & Monitoring
```
src/app/api/health/
├── route.ts                       # 🏥 Santé générale
├── database/                      # 🗄️ Santé base de données
├── email/                         # 📧 Santé emails
├── inventory/                     # 📦 Santé stock
├── stripe/                        # 💳 Santé Stripe
└── supabase/                      # 🗄️ Santé Supabase
```

#### Utilitaires & Debug
```
src/app/api/
├── debug/route.ts                 # 🐛 Debug
├── test/route.ts                  # 🧪 Tests
└── translations/
    └── [lang]/                    # 🌍 Traductions
```

### 🛠️ Utilitaires & Services (src/)

#### Configuration & Providers
```
src/
├── config/                        # ⚙️ Configuration app
├── providers/                     # 🔌 Providers React
├── lib/                           # 📚 Bibliothèques utilitaires
├── services/                      # 🔧 Services métier
├── hooks/                         # 🎣 Hooks React personnalisés
├── store/                         # 🗄️ État global (Zustand/Redux)
├── utils/                         # 🛠️ Fonctions utilitaires
└── types/                         # 📝 Types TypeScript
```

#### Styles & Thèmes
```
src/
├── styles/                        # 🎨 Styles globaux
├── app/globals.css               # 🎨 CSS global
├── app/animations.css            # ✨ Animations CSS
└── app/performance.css           # ⚡ Optimisations CSS
```

#### Internationalisation
```
src/locales/                       # 🌍 Fichiers de traduction
├── fr.json                        # 🇫🇷 Français
├── en.json                        # 🇬🇧 Anglais
└── ...
```

#### Tests
```
src/
├── test-utils/                    # 🧪 Utilitaires de test
├── components/__tests__/          # 🧪 Tests composants
├── app/__tests__/                 # 🧪 Tests pages
└── app/api/__tests__/             # 🧪 Tests API
```

---

## 🔧 Scripts & Utilitaires (Racine)

### Scripts de Configuration
```
├── setup-env.js                  # ⚙️ Configuration environnement
├── complete-setup.js              # 🚀 Configuration complète
├── supabase-setup.js              # 🗄️ Configuration Supabase
├── setup-cms-table.js             # 📝 Configuration CMS
└── reconfigure-supabase.js        # 🔄 Reconfiguration Supabase
```

### Scripts de Base de Données
```
├── harmonize-schemas.js           # 🔄 Harmonisation schémas
├── execute-rls-fixes.js           # 🔒 Corrections RLS
├── seed-restaurant-data.js        # 🌱 Données de test
├── export-supabase-data.js        # 📤 Export données
└── verify-database.js             # ✅ Vérification BDD
```

### Scripts de Test & Validation
```
├── test-supabase-connection.js    # 🧪 Test connexion Supabase
├── test-admin-integration.js      # 🧪 Test intégration admin
├── verify-links.js                # 🔗 Vérification liens
├── verification-liens-admin.js    # 🔗 Vérification liens admin
└── check-links-simple.js          # 🔗 Vérification simple
```

### Scripts d'Optimisation
```
├── optimize-project.js            # ⚡ Optimisation projet
├── cleanup-cache.js               # 🧹 Nettoyage cache
├── clear-localstorage.js          # 🧹 Nettoyage localStorage
└── fix-dependencies.js            # 🔧 Correction dépendances
```

### Scripts de Sécurité
```
├── clean-security-corruptions.js  # 🛡️ Nettoyage sécurité
└── restore-omiam-complete.js      # 🔄 Restauration complète
```

---

## 📚 Documentation

### Documentation Technique
```
├── README.md                      # 📖 Documentation principale
├── ARCHITECTURE.md                # 🏗️ Architecture technique
├── DEPLOYMENT.md                  # 🚀 Guide déploiement
├── SECURITY-GUIDE.md              # 🔒 Guide sécurité
├── QUICK-START.md                 # ⚡ Démarrage rapide
└── CONFIGURATION-COMPLETE.md      # ⚙️ Configuration complète
```

### Documentation Métier
```
├── MODELE-FINAL-OMIAM-PIZZERIA.md # 🍕 Modèle métier
├── ANALYSE-COMPLETE-OMIAM-PIZZERIA.md # 📊 Analyse complète
├── EVALUATION-COMPLETE-100-POINTS.md # 📈 Évaluation
└── ETAT-PROJET-FINAL.md           # 📋 État final projet
```

### Documentation Stripe & Paiements
```
├── README_STRIPE.md               # 💳 Documentation Stripe
├── STRIPE_SETUP.md                # ⚙️ Configuration Stripe
├── STRIPE_KEYS_SETUP.md           # 🔑 Configuration clés
├── STRIPE_PRODUCTION_VALIDATION.md # ✅ Validation production
└── PCI_DSS_SECURITY.md            # 🔒 Sécurité PCI DSS
```

### Documentation Légale & Conformité
```
├── CONFORMITE-TVA-RESTAURATION.md # 💰 Conformité TVA
├── OBLIGATIONS-LEGALES-MANQUANTES.md # ⚖️ Obligations légales
├── FORMATION-HACCP.md             # 🧪 Formation HACCP
├── ASSURANCES-PROFESSIONNELLES-RESTAURATION.md # 🛡️ Assurances
└── AUDIT-RGAA-ACCESSIBILITE.md    # ♿ Audit accessibilité
```

### Rapports & Analyses
```
├── RAPPORT-FINAL-TESTS-ADMIN.md   # 📊 Tests admin
├── RAPPORT-VERIFICATION-LIENS.md  # 🔗 Vérification liens
├── SYNTHESE-FINALE-TESTS-ADMIN.md # 📋 Synthèse tests
└── EVALUATION-DETAILLEE-OMIAM-100-POINTS.md # 📈 Évaluation détaillée
```

---

## 🧪 Tests & Qualité

### Configuration Tests
```
├── jest.config.js                 # 🧪 Configuration Jest
├── jest.setup.js                  # ⚙️ Setup Jest
├── playwright.config.ts           # 🎭 Configuration Playwright
└── .lighthouserc.json             # 🏮 Configuration Lighthouse
```

### Tests E2E
```
e2e/
├── global-setup.ts                # ⚙️ Setup global E2E
├── global-teardown.ts             # 🧹 Teardown global E2E
└── homepage.spec.ts               # 🧪 Tests page d'accueil
```

### Résultats Tests
```
├── test-results/                  # 📊 Résultats tests
├── test-screenshots/              # 📸 Captures d'écran tests
└── coverage/                      # 📈 Couverture de code
```

---

## 🗄️ Base de Données & Schémas

### Schémas Supabase
```
├── supabase-schema.sql            # 🗄️ Schéma principal
├── supabase-harmonized-schema.sql # 🔄 Schéma harmonisé
├── fix-rls-issues.sql             # 🔒 Corrections RLS
└── optimize-rls-policies.sql      # ⚡ Optimisation RLS
```

### Configuration Supabase
```
supabase/
├── config.toml                    # ⚙️ Configuration Supabase
├── migrations/                    # 🔄 Migrations
└── seed.sql                       # 🌱 Données initiales
```

### Exports & Sauvegardes
```
├── supabase-export/               # 📤 Exports Supabase
├── backups/                       # 💾 Sauvegardes
└── db/custom.db                   # 🗄️ Base locale SQLite
```

---

## 🚀 Déploiement & CI/CD

### GitHub Actions
```
.github/workflows/
├── ci.yml                         # 🔄 Intégration continue
├── ci-cd.yml                      # 🚀 CI/CD complet
└── security-scan.yml              # 🔒 Scan sécurité
```

### Configuration IDE
```
.vscode/
├── settings.json                  # ⚙️ Paramètres VS Code
└── extensions.json                # 🧩 Extensions recommandées
```

### Fichiers de Build
```
├── .next/                         # 🏗️ Build Next.js
├── .swc/                          # ⚡ Cache SWC
└── tsconfig.tsbuildinfo           # 📝 Cache TypeScript
```

---

## 📊 Rapports & Monitoring

### Rapports de Production
```
├── production-build-test-*.json   # 🏗️ Tests build production
├── production-preparation-report.json # 📋 Rapport préparation
├── stripe-validation-report.json  # 💳 Validation Stripe
└── security-fixes-report.json     # 🔒 Corrections sécurité
```

### Logs & Monitoring
```
├── optimization.log               # ⚡ Logs optimisation
├── link-verification-report.md    # 🔗 Rapport vérification liens
└── critical-security-fixes-report.json # 🚨 Corrections critiques
```

---

## 🎯 Points Clés de l'Organisation

### ✅ Structure Modulaire
- **Séparation claire** entre composants UI, logique métier et API
- **Composants réutilisables** organisés par domaine fonctionnel
- **Architecture en couches** avec services, hooks et utilitaires

### ✅ Conformité & Sécurité
- **RGPD compliant** avec gestion des consentements
- **Accessibilité WCAG** avec composants dédiés
- **Sécurité PCI DSS** pour les paiements
- **Tests de sécurité** automatisés

### ✅ Performance & Scalabilité
- **PWA optimisée** avec service workers
- **Lazy loading** et code splitting
- **Cache stratégique** et optimisations
- **Monitoring** et analytics intégrés

### ✅ Expérience Développeur
- **TypeScript strict** avec types complets
- **Tests automatisés** (unitaires, intégration, E2E)
- **Documentation complète** et à jour
- **Scripts d'automatisation** pour toutes les tâches

---

## 🚀 Status Final

**✅ Application 100% Fonctionnelle**  
**✅ Prête pour la Production**  
**✅ Conforme aux Standards**  
**✅ Optimisée et Sécurisée**  

> 🌐 **Accès**: http://localhost:3000  
> 👑 **Admin**: http://localhost:3000/admin  
> 📱 **PWA**: Installation disponible  
> 🔒 **Sécurité**: PCI DSS + RGPD compliant

---

*Dernière mise à jour: 2025-01-27*  
*Version: 1.0.0 - Production Ready* 🎉