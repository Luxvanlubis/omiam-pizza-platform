# 🍕 O'Miam - Plateforme Moderne de Commande de Pizzas

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=for-the-badge&logo=stripe)](https://stripe.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🚀 Vue d'Ensemble

O'Miam est une plateforme web moderne et complète pour la commande de pizzas en ligne, développée avec les dernières technologies web. Elle offre une expérience utilisateur exceptionnelle avec des fonctionnalités avancées d'e-commerce, de gestion de restaurant et d'optimisations de performance.

## ✨ Fonctionnalités

### 🛍️ E-commerce Core
- **Catalogue produits** avec recherche et filtres avancés
- **Panier d'achat** avec gestion d'état persistante
- **Système d'authentification** sécurisé avec NextAuth.js
- **Gestion des commandes** et historique utilisateur
- **Interface responsive** optimisée mobile-first

### 🔒 Sécurité & Performance
- **Headers de sécurité** (CSP, HSTS, X-Frame-Options)
- **Rate limiting** sur les APIs
- **Validation des données** avec Zod
- **Error boundaries** React pour la résilience
- **Logging structuré** pour le monitoring
- **Health checks** pour la surveillance

### 🧪 Qualité & Tests
- **Tests unitaires** avec Jest et React Testing Library
- **Tests E2E** avec Playwright
- **Analyse de performance** avec Lighthouse
- **CI/CD** avec GitHub Actions
- **Scan de sécurité** automatisé

## 🏗️ Architecture

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order processing
│   │   └── health/        # Health check endpoint
│   ├── (auth)/           # Authentication pages
│   ├── products/         # Product pages
│   └── layout.tsx        # Root layout with providers
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI de base
│   ├── forms/            # Formulaires
│   ├── layout/           # Composants de mise en page
│   └── __tests__/        # Tests unitaires
├── lib/                  # Utilitaires et configurations
│   ├── auth.ts          # Configuration NextAuth
│   ├── db.ts            # Configuration base de données
│   ├── validations.ts   # Schémas Zod
│   └── utils.ts         # Fonctions utilitaires
├── hooks/               # Custom React hooks
├── store/              # Gestion d'état (Zustand)
└── types/              # Définitions TypeScript
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Base de données (PostgreSQL recommandé)

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd nextjs-ecommerce

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# Initialiser la base de données
npm run db:push
npm run db:generate

# Démarrer en mode développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

### Variables d'Environnement

```env
# Base de données
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Providers OAuth (optionnel)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Monitoring (optionnel)
SENTRY_DSN="..."
```

## 🧪 Tests

### Tests Unitaires
```bash
# Exécuter tous les tests
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

### Tests E2E
```bash
# Installer Playwright
npx playwright install

# Exécuter les tests E2E
npm run test:e2e

# Mode interactif
npm run test:e2e:ui
```

## 🔧 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrage en mode développement |
| `npm run build` | Build de production |
| `npm run start` | Démarrage du serveur de production |
| `npm run lint` | Linting avec ESLint |
| `npm test` | Tests unitaires |
| `npm run test:e2e` | Tests end-to-end |
| `npm run db:push` | Synchroniser le schéma DB |
| `npm run db:generate` | Générer le client Prisma |

## 📊 Monitoring & Observabilité

### Health Checks
- **Endpoint**: `GET /api/health`
- **Métriques**: Status DB, mémoire, uptime
- **Format**: JSON avec codes de statut HTTP appropriés

### Logging
- **Structured logging** avec Winston/Pino
- **Niveaux**: error, warn, info, debug
- **Contexte**: Request ID, User ID, timestamps

### Error Tracking
- **Error Boundaries** React pour capturer les erreurs UI
- **API Error Handling** centralisé
- **Integration Sentry** pour le monitoring en production

## 🔒 Sécurité

### Headers de Sécurité
- **Content Security Policy (CSP)**
- **HTTP Strict Transport Security (HSTS)**
- **X-Frame-Options**: Protection contre le clickjacking
- **X-Content-Type-Options**: Protection MIME sniffing

### Rate Limiting
- **API Protection**: 100 req/15min par IP
- **Auth endpoints**: 5 req/15min par IP
- **Bypass pour les IPs whitelistées**

### Validation des Données
- **Zod schemas** pour toutes les entrées
- **Sanitization** automatique
- **Type safety** end-to-end

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Docker
```bash
# Build l'image
docker build -t nextjs-ecommerce .

# Exécuter le container
docker run -p 3000:3000 nextjs-ecommerce
```

## 🤝 Contribution

### Workflow de Développement
1. **Fork** le repository
2. **Créer une branche** feature (`git checkout -b feature/amazing-feature`)
3. **Commit** les changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir une Pull Request**

### Standards de Code
- **ESLint + Prettier** pour le formatage
- **Conventional Commits** pour les messages
- **Tests requis** pour les nouvelles fonctionnalités
- **Documentation** mise à jour

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ et les meilleures pratiques de sécurité et performance.**
