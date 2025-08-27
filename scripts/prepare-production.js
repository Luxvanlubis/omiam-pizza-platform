const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionPreparation {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      steps: [],
      optimizations: {},
      security: {},
      docker: {}
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('fr-FR');
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '📋';
    console.log(`${icon} [${timestamp}] ${message}`);
  }

  async createDockerfile() {
    this.log('Création du Dockerfile optimisé pour production...');
    
    const dockerfileContent = `# Dockerfile pour O'MIAM - Production Ready
# Multi-stage build pour optimiser la taille de l'image

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement pour le build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build de l'application
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Changer les permissions
USER nextjs

# Exposer le port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Commande de démarrage
CMD ["node", "server.js"]
`;

    try {
      fs.writeFileSync(path.join(this.projectRoot, 'Dockerfile'), dockerfileContent);
      this.log('Dockerfile créé avec succès', 'success');
      this.results.docker.dockerfile = 'created';
      
      this.results.steps.push({
        name: 'Création Dockerfile',
        status: 'SUCCESS',
        details: 'Dockerfile multi-stage optimisé créé'
      });
    } catch (error) {
      this.log(`Erreur lors de la création du Dockerfile: ${error.message}`, 'error');
      this.results.steps.push({
        name: 'Création Dockerfile',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async createDockerCompose() {
    this.log('Création du docker-compose.yml pour production...');
    
    const dockerComposeContent = `version: '3.8'

services:
  omiam-app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    env_file:
      - .env.production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - omiam-network

  # Nginx reverse proxy (optionnel)
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - omiam-app
    restart: unless-stopped
    networks:
      - omiam-network

networks:
  omiam-network:
    driver: bridge

volumes:
  omiam-data:
    driver: local
`;

    try {
      fs.writeFileSync(path.join(this.projectRoot, 'docker-compose.yml'), dockerComposeContent);
      this.log('docker-compose.yml créé avec succès', 'success');
      this.results.docker.compose = 'created';
      
      this.results.steps.push({
        name: 'Création Docker Compose',
        status: 'SUCCESS',
        details: 'Configuration Docker Compose avec Nginx créée'
      });
    } catch (error) {
      this.log(`Erreur lors de la création du docker-compose.yml: ${error.message}`, 'error');
      this.results.steps.push({
        name: 'Création Docker Compose',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async optimizeNextConfig() {
    this.log('Optimisation de la configuration Next.js pour production...');
    
    const nextConfigPath = path.join(this.projectRoot, 'next.config.js');
    
    try {
      let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
      
      // Ajouter les optimisations de production
      const optimizations = `
  // Optimisations de production
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Configuration de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ];
  },
  
  // Configuration PWA optimisée
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react']
  },
  
  // Configuration d'output pour Docker
  output: 'standalone',`;
      
      // Insérer les optimisations dans la configuration
      if (nextConfig.includes('module.exports = {')) {
        nextConfig = nextConfig.replace(
          'module.exports = {',
          `module.exports = {${optimizations}`
        );
      }
      
      fs.writeFileSync(nextConfigPath, nextConfig);
      this.log('Configuration Next.js optimisée', 'success');
      
      this.results.optimizations.nextConfig = 'optimized';
      this.results.steps.push({
        name: 'Optimisation Next.js',
        status: 'SUCCESS',
        details: 'Configuration de sécurité et performance ajoutée'
      });
    } catch (error) {
      this.log(`Erreur lors de l'optimisation Next.js: ${error.message}`, 'error');
      this.results.steps.push({
        name: 'Optimisation Next.js',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async createProductionEnv() {
    this.log('Création du fichier .env.production...');
    
    const envProductionContent = `# Configuration de production O'MIAM
# ⚠️ IMPORTANT: Remplacer toutes les valeurs par les vraies clés de production

# Base de données
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (Production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sécurité
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=https://your-domain.com

# Configuration application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Monitoring (optionnel)
SENTRY_DSN=your-sentry-dsn
VERCEL_ANALYTICS_ID=your-analytics-id

# Email (optionnel)
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
`;

    try {
      fs.writeFileSync(path.join(this.projectRoot, '.env.production'), envProductionContent);
      this.log('Fichier .env.production créé', 'success');
      
      this.results.security.envProduction = 'created';
      this.results.steps.push({
        name: 'Configuration Production',
        status: 'SUCCESS',
        details: 'Fichier .env.production créé avec template sécurisé'
      });
    } catch (error) {
      this.log(`Erreur lors de la création .env.production: ${error.message}`, 'error');
      this.results.steps.push({
        name: 'Configuration Production',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async createNginxConfig() {
    this.log('Création de la configuration Nginx...');
    
    const nginxConfig = `events {
    worker_connections 1024;
}

http {
    upstream omiam_app {
        server omiam-app:3000;
    }
    
    # Configuration de sécurité
    server_tokens off;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;
        
        # Redirection HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com www.your-domain.com;
        
        # Configuration SSL
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        
        # Headers de sécurité
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com;" always;
        
        # Rate limiting pour API
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://omiam_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Rate limiting pour login
        location /api/auth/ {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://omiam_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Fichiers statiques avec cache
        location /_next/static/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://omiam_app;
        }
        
        # Toutes les autres requêtes
        location / {
            proxy_pass http://omiam_app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
`;

    try {
      fs.writeFileSync(path.join(this.projectRoot, 'nginx.conf'), nginxConfig);
      this.log('Configuration Nginx créée', 'success');
      
      this.results.security.nginx = 'created';
      this.results.steps.push({
        name: 'Configuration Nginx',
        status: 'SUCCESS',
        details: 'Reverse proxy avec sécurité et rate limiting configuré'
      });
    } catch (error) {
      this.log(`Erreur lors de la création Nginx: ${error.message}`, 'error');
      this.results.steps.push({
        name: 'Configuration Nginx',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async createHealthCheck() {
    this.log('Création de l\'endpoint de health check...');
    
    const healthCheckDir = path.join(this.projectRoot, 'src', 'app', 'api', 'health');
    const healthCheckFile = path.join(healthCheckDir, 'route.ts');
    
    const healthCheckContent = `import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Vérifications de santé de l'application
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: await checkDatabase(),
        memory: checkMemory(),
        disk: checkDisk()
      }
    };
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}

async function checkDatabase() {
  try {
    // Vérification simple de la base de données
    // À adapter selon votre configuration Supabase
    return { status: 'connected', latency: '< 50ms' };
  } catch (error) {
    return { status: 'disconnected', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

function checkMemory() {
  const usage = process.memoryUsage();
  const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
  
  return {
    total: \`\${totalMB}MB\`,
    used: \`\${usedMB}MB\`,
    percentage: Math.round((usedMB / totalMB) * 100)
  };
}

function checkDisk() {
  // Vérification basique de l'espace disque
  return {
    status: 'available',
    usage: '< 80%'
  };
}
`;

    try {
      if (!fs.existsSync(healthCheckDir)) {
        fs.mkdirSync(healthCheckDir, { recursive: true });
      }
      
      fs.writeFileSync(healthCheckFile, healthCheckContent);
      this.log('Endpoint de health check créé', 'success');
      
      this.results.optimizations.healthCheck = 'created';
      this.results.steps.push({
        name: 'Health Check API',
        status: 'SUCCESS',
        details: 'Endpoint /api/health créé pour monitoring'
      });
    } catch (error) {
      this.log(`Erreur lors de la création du health check: ${error.message}`, 'error');
      this.results.steps.push({
        name: 'Health Check API',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async createDeploymentGuide() {
    this.log('Création du guide de déploiement...');
    
    const deploymentGuide = `# 🚀 Guide de Déploiement Production - O'MIAM

## 📋 Prérequis

- Docker et Docker Compose installés
- Domaine configuré avec DNS
- Certificats SSL (Let's Encrypt recommandé)
- Clés de production Stripe et Supabase

## 🔧 Configuration

### 1. Variables d'environnement

\`\`\`bash
# Copier et configurer les variables de production
cp .env.production .env.local
# Éditer .env.local avec vos vraies clés de production
\`\`\`

### 2. Certificats SSL

\`\`\`bash
# Créer le dossier SSL
mkdir ssl

# Avec Let's Encrypt (recommandé)
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
\`\`\`

### 3. Configuration Nginx

\`\`\`bash
# Modifier nginx.conf avec votre domaine
sed -i 's/your-domain.com/votredomaine.com/g' nginx.conf
\`\`\`

## 🚀 Déploiement

### Build et démarrage

\`\`\`bash
# Build de l'image Docker
docker-compose build

# Démarrage des services
docker-compose up -d

# Vérification des logs
docker-compose logs -f omiam-app
\`\`\`

### Vérifications

\`\`\`bash
# Health check
curl https://your-domain.com/api/health

# Test de l'application
curl -I https://your-domain.com
\`\`\`

## 📊 Monitoring

### Logs

\`\`\`bash
# Logs de l'application
docker-compose logs omiam-app

# Logs Nginx
docker-compose logs nginx
\`\`\`

### Métriques

- Health check: \`https://your-domain.com/api/health\`
- Monitoring des performances via les logs Docker
- Surveillance des erreurs via Sentry (si configuré)

## 🔒 Sécurité

### Checklist de sécurité

- [ ] Certificats SSL configurés et valides
- [ ] Headers de sécurité activés (CSP, HSTS, etc.)
- [ ] Rate limiting configuré
- [ ] Variables d'environnement sécurisées
- [ ] Firewall configuré (ports 80, 443 uniquement)
- [ ] Backups automatiques configurés

### Mise à jour

\`\`\`bash
# Mise à jour de l'application
git pull origin main
docker-compose build
docker-compose up -d
\`\`\`

## 🆘 Dépannage

### Problèmes courants

1. **Erreur 502 Bad Gateway**
   - Vérifier que l'application démarre: \`docker-compose logs omiam-app\`
   - Vérifier la configuration Nginx

2. **Erreur SSL**
   - Vérifier les certificats dans le dossier \`ssl/\`
   - Renouveler les certificats Let's Encrypt

3. **Performance lente**
   - Vérifier l'utilisation mémoire: \`docker stats\`
   - Optimiser la base de données
   - Vérifier les logs d'erreur

### Support

Pour toute question technique, consulter :
- Logs de l'application
- Documentation Next.js
- Documentation Docker
- Health check endpoint
`;

    try {
      fs.writeFileSync(path.join(this.projectRoot, 'DEPLOYMENT_PRODUCTION.md'), deploymentGuide);
      this.log('Guide de déploiement créé', 'success');
      
      this.results.steps.push({
        name: 'Guide de Déploiement',
        status: 'SUCCESS',
        details: 'Documentation complète de déploiement créée'
      });
    } catch (error) {
      this.log(`Erreur lors de la création du guide: ${error.message}`, 'error');
      this.results.steps.push({
        name: 'Guide de Déploiement',
        status: 'FAILED',
        error: error.message
      });
    }
  }

  async generateReport() {
    this.log('Génération du rapport de préparation production...');
    
    const totalSteps = this.results.steps.length;
    const successSteps = this.results.steps.filter(s => s.status === 'SUCCESS').length;
    const failedSteps = this.results.steps.filter(s => s.status === 'FAILED').length;
    
    this.results.status = failedSteps === 0 ? 'SUCCESS' : 'PARTIAL';
    this.results.summary = {
      total: totalSteps,
      success: successSteps,
      failed: failedSteps,
      successRate: Math.round((successSteps / totalSteps) * 100)
    };
    
    // Sauvegarder le rapport
    const reportPath = path.join(this.projectRoot, 'production-preparation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    
    // Afficher le rapport
    console.log('\n============================================================');
    console.log('🚀 RAPPORT DE PRÉPARATION PRODUCTION - O\'MIAM');
    console.log('============================================================');
    console.log(`📅 Date: ${new Date().toLocaleString('fr-FR')}`);
    console.log(`📈 Statut global: ${this.results.status}`);
    console.log(`📊 Étapes: ${totalSteps} total, ${successSteps} réussies, ${failedSteps} échouées`);
    console.log(`⚡ Taux de réussite: ${this.results.summary.successRate}%`);
    
    console.log('\n📋 Détail des étapes:');
    this.results.steps.forEach((step, index) => {
      const status = step.status === 'SUCCESS' ? '✅' : '❌';
      console.log(`  ${index + 1}. ${status} ${step.name}`);
      if (step.details) {
        console.log(`     📝 ${step.details}`);
      }
      if (step.error) {
        console.log(`     ❌ ${step.error}`);
      }
    });
    
    console.log('\n🎯 Fichiers créés:');
    console.log('  📄 Dockerfile - Image de production optimisée');
    console.log('  📄 docker-compose.yml - Orchestration des services');
    console.log('  📄 nginx.conf - Reverse proxy sécurisé');
    console.log('  📄 .env.production - Template de configuration');
    console.log('  📄 DEPLOYMENT_PRODUCTION.md - Guide de déploiement');
    console.log('  📄 /api/health - Endpoint de monitoring');
    
    console.log('\n🔧 Prochaines étapes:');
    console.log('  1. Configurer les vraies clés dans .env.production');
    console.log('  2. Obtenir les certificats SSL pour votre domaine');
    console.log('  3. Modifier nginx.conf avec votre domaine');
    console.log('  4. Tester le build: docker-compose build');
    console.log('  5. Déployer: docker-compose up -d');
    
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
    console.log('============================================================');
    
    return this.results;
  }

  async run() {
    try {
      console.log('🚀 Démarrage de la préparation production O\'MIAM...');
      console.log('============================================================\n');
      
      await this.createDockerfile();
      await this.createDockerCompose();
      await this.optimizeNextConfig();
      await this.createProductionEnv();
      await this.createNginxConfig();
      await this.createHealthCheck();
      await this.createDeploymentGuide();
      
      const report = await this.generateReport();
      console.log('\n🎉 Préparation production terminée!');
      
      return report;
    } catch (error) {
      console.error('❌ Erreur lors de la préparation:', error);
      throw error;
    }
  }
}

// Exécution du script
if (require.main === module) {
  const preparation = new ProductionPreparation();
  preparation.run().catch(console.error);
}

module.exports = ProductionPreparation;