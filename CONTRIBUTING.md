# 🤝 Guide de Contribution - O'Miam

Merci de votre intérêt pour contribuer à O'Miam ! Ce guide vous aidera à démarrer.

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Git
- Compte Supabase (pour le développement)
- Compte Stripe (pour les paiements)

### Installation
```bash
# Cloner le repository
git clone https://github.com/Djezeone/omiam-pizza-platform.git
cd omiam-pizza-platform

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer les variables d'environnement
# Voir DEPLOYMENT_GUIDE.md pour les détails

# Lancer le serveur de développement
npm run dev
```

## 📋 Types de Contributions

### 🐛 Corrections de Bugs
1. Créer une issue avec le template "Bug Report"
2. Fork le repository
3. Créer une branche: `git checkout -b fix/nom-du-bug`
4. Faire les corrections
5. Ajouter des tests si nécessaire
6. Créer une Pull Request

### ✨ Nouvelles Fonctionnalités
1. Créer une issue avec le template "Feature Request"
2. Attendre l'approbation avant de commencer
3. Fork le repository
4. Créer une branche: `git checkout -b feature/nom-de-la-fonctionnalite`
5. Développer la fonctionnalité
6. Ajouter des tests
7. Mettre à jour la documentation
8. Créer une Pull Request

### 📚 Documentation
1. Fork le repository
2. Créer une branche: `git checkout -b docs/sujet`
3. Améliorer la documentation
4. Créer une Pull Request

## 🔧 Standards de Code

### Style de Code
- **TypeScript** pour tout le code
- **ESLint** et **Prettier** configurés
- **Tailwind CSS** pour les styles
- **Conventions de nommage** :
  - Composants: `PascalCase`
  - Fichiers: `kebab-case`
  - Variables: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

### Structure des Commits
```
type(scope): description

[body optionnel]

[footer optionnel]
```

**Types:**
- `feat`: nouvelle fonctionnalité
- `fix`: correction de bug
- `docs`: documentation
- `style`: formatage, point-virgules manquants, etc.
- `refactor`: refactoring de code
- `test`: ajout de tests
- `chore`: maintenance

**Exemples:**
```
feat(auth): ajouter authentification Google
fix(cart): corriger calcul du total
docs(readme): mettre à jour les instructions d'installation
```

## 🧪 Tests

### Lancer les Tests
```bash
# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:coverage
```

### Écrire des Tests
- **Jest** pour les tests unitaires
- **Playwright** pour les tests e2e
- **Testing Library** pour les composants React
- Minimum 80% de couverture de code

## 📝 Pull Request Process

### Checklist PR
- [ ] Code testé localement
- [ ] Tests ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Lint et format passent
- [ ] Build réussit
- [ ] Description claire de la PR
- [ ] Issue liée (si applicable)

### Template PR
```markdown
## 📋 Description
Brève description des changements

## 🔗 Issue Liée
Fixes #123

## 🧪 Tests
- [ ] Tests unitaires ajoutés
- [ ] Tests e2e ajoutés
- [ ] Tests manuels effectués

## 📸 Captures d'écran
(si applicable)

## ✅ Checklist
- [ ] Code review auto-effectué
- [ ] Documentation mise à jour
- [ ] Tests passent
- [ ] Build réussit
```

## 🏗️ Architecture du Projet

```
src/
├── app/                 # Pages Next.js 13+ (App Router)
├── components/          # Composants réutilisables
├── lib/                # Utilitaires et configurations
├── hooks/              # Hooks React personnalisés
├── types/              # Types TypeScript
├── styles/             # Styles globaux
└── middleware.ts       # Middleware Next.js
```

## 🔒 Sécurité

### Signaler une Vulnérabilité
- **NE PAS** créer d'issue publique
- Envoyer un email à: security@omiam.com
- Inclure une description détaillée
- Nous répondrons sous 48h

### Bonnes Pratiques
- Jamais de secrets dans le code
- Validation côté serveur obligatoire
- Sanitisation des entrées utilisateur
- HTTPS uniquement en production

## 🌍 Internationalisation

- Utiliser les clés de traduction dans `src/locales/`
- Français par défaut, Anglais supporté
- Ajouter les nouvelles clés dans les deux langues

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints Tailwind standard
- Tester sur différentes tailles d'écran
- Optimiser les performances mobile

## 🚀 Déploiement

- **Staging**: Automatique sur les PR
- **Production**: Automatique sur merge vers `main`
- **Rollback**: Possible via Vercel dashboard

## 💬 Communication

- **Issues**: Pour les bugs et fonctionnalités
- **Discussions**: Pour les questions générales
- **Discord**: [Lien vers le serveur] (si applicable)

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous licence MIT.

## 🙏 Remerciements

Merci à tous les contributeurs qui rendent O'Miam meilleur ! 🍕

---

**Questions ?** N'hésitez pas à créer une issue ou nous contacter !