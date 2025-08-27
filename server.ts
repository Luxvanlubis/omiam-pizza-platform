// server.ts - Next.js Standalone + Socket.IO
// Force restart trigger - v3
import { setupSocket } from '@/lib/socket';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import helmet from 'helmet';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

import winston from 'winston';
import cors from 'cors';
import { parse } from 'url';
import { env } from './src/lib/env';

// Configuration du logger
const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const dev = env.NODE_ENV !== 'production';
const hostname = 'localhost';
const defaultPort = 3000;

// Fonction pour démarrer le serveur en trouvant un port disponible
function startServer(port: number) {
  // Create Next.js app
  const nextApp = next({
    dev,
    dir: process.cwd(),
    conf: dev ? undefined : { distDir: './.next' }
  });

  nextApp.prepare().then(() => {
    const handle = nextApp.getRequestHandler();

    // Configuration CORS sécurisée
    const corsOptions = {
      origin: dev 
        ? [
            'http://localhost:3000', 'http://localhost:3001', 
            'http://localhost:3002', 'http://localhost:3003', 
            'http://localhost:3004'
          ]
        : [env.NEXTAUTH_URL, 'https://omiam.com'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    };

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: dev ? 1000 : 100,
      message: {
        error: 'Trop de requêtes, veuillez réessayer plus tard.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown',
      handler: (req, res, next, options) => {
        res.status(options.statusCode).json({ error: options.message });
      }
    });

    // Création du serveur HTTP
    const server = createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      
      const middlewares = [
        helmet({
          contentSecurityPolicy: dev
            ? {
                directives: {
                  ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                  "script-src": ["'self'", "'unsafe-eval'"],
                },
              }
            : undefined,
        }),
        cors(corsOptions),
        limiter as any
      ];

      // Chaînage des middlewares
      const runMiddlewares = (index: number) => {
        if (index >= middlewares.length) {
          handle(req, res, parsedUrl);
          return;
        }
        middlewares[index](req, res, () => runMiddlewares(index + 1));
      };

      runMiddlewares(0);
    });

    // Gestion des erreurs serveur AVANT l'écoute
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.warn(`Le port ${port} est déjà utilisé. Tentative avec le port ${port + 1}.`);
        setTimeout(() => {
            server.close();
            startServer(port + 1);
        }, 100); // petit délai pour s'assurer que le port est libéré
      } else {
        logger.error('Erreur serveur:', err);
        process.exit(1);
      }
    });

    // Initialisation de Socket.IO
    const io = new Server(server, {
      cors: corsOptions,
      transports: ['websocket', 'polling'],
      pingInterval: 10000,
      pingTimeout: 5000,
      cookie: true
    });

    setupSocket(io);

    server.listen(port, hostname, () => {
      logger.info(`✅ Serveur Next.js prêt sur http://${hostname}:${port}`);
    });

  }).catch(err => {
    logger.error('Erreur fatale lors de la préparation de Next.js', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    });
    process.exit(1);
  });
}

// Start the server
startServer(defaultPort);
""
