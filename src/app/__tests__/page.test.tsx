
/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath, basePath = process.cwd()) { if (!userPath || typeof userPath !== 'string') { throw new Error('Chemin invalide'); } // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé const normalizedPath = path.normalize(path.join(basePath, userPath)); const normalizedBase = path.normalize(basePath); if (!normalizedPath.startsWith(normalizedBase)) { throw new Error('Accès au chemin non autorisé'); } return normalizedPath;
}
import React from 'react';
import { render, screen } from '@ing-library/react';
import Home from '../page';

// Mock next/navigation
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() }), useSearchParams: () => ({ get: jest.fn(), has: jest.fn() }), usePathname: () => '/'
}));

// Mock next/image
jest.mock('next/image', () => { return function MockImage({ src, alt, ...props }: any) { return <img src={src} alt={alt} {...props} />; };
});

// Mock Header component
jest.mock('@/components/Header', () => { return function MockHeader() { return <header data-id="header">Header</header>; };
}); describe('Home Page', () => { it('should have Home component defined', () => { expect(typeof Home).toBe('function'); }); it('should be a valid React component', () => { expect(Home).toBeDefined(); expect(Home.name).toBe('Home'); });
});