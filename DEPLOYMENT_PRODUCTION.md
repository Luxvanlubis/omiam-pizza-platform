# 🚀 Guide de Déploiement Production - O'MIAM

## 📋 Prérequis

- Docker et Docker Compose installés
- Domaine configuré avec DNS
- Certificats SSL (Let's Encrypt recommandé)
- Clés de production Stripe et Supabase

## 🔧 Configuration

### 1. Variables d'environnement

```bash
# Copier et configurer les variables de production
cp .env.production .env.local
# Éditer .env.local avec vos vraies clés de production
```

### 2. Certificats SSL

```bash
# Créer le dossier SSL
mkdir ssl

# Avec Let's Encrypt (recommandé)
certbot certonly --standalone -d your-domain.com
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

### 3. Configuration Nginx

```bash
# Modifier nginx.conf avec votre domaine
sed -i 's/your-domain.com/votredomaine.com/g' nginx.conf
```

## 🚀 Déploiement

### Build et démarrage

```bash
# Build de l'image Docker
docker-compose build

# Démarrage des services
docker-compose up -d

# Vérification des logs
docker-compose logs -f omiam-app
```

### Vérifications

```bash
# Health check
curl https://your-domain.com/api/health

# Test de l'application
curl -I https://your-domain.com
```

## 📊 Monitoring

### Logs

```bash
# Logs de l'application
docker-compose logs omiam-app

# Logs Nginx
docker-compose logs nginx
```

### Métriques

- Health check: `https://your-domain.com/api/health`
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

```bash
# Mise à jour de l'application
git pull origin main
docker-compose build
docker-compose up -d
```

## 🆘 Dépannage

### Problèmes courants

1. **Erreur 502 Bad Gateway**
   - Vérifier que l'application démarre: `docker-compose logs omiam-app`
   - Vérifier la configuration Nginx

2. **Erreur SSL**
   - Vérifier les certificats dans le dossier `ssl/`
   - Renouveler les certificats Let's Encrypt

3. **Performance lente**
   - Vérifier l'utilisation mémoire: `docker stats`
   - Optimiser la base de données
   - Vérifier les logs d'erreur

### Support

Pour toute question technique, consulter :
- Logs de l'application
- Documentation Next.js
- Documentation Docker
- Health check endpoint
