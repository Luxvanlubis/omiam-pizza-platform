
/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath, basePath = process.cwd()) { if (!userPath || typeof userPath !== 'string') { throw new Error('Chemin invalide'); } // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé const normalizedPath = path.normalize(path.join(basePath, userPath)); const normalizedBase = path.normalize(basePath); if (!normalizedPath.startsWith(normalizedBase)) { throw new Error('Accès au chemin non autorisé'); } return normalizedPath;
}
import React from 'react';
import { render } from '@ing-library/react';
import ScrollIndicator from '../ScrollIndicator';

// Mock window.scrollY and document properties
Object.defineProperty(window, 'scrollY', { value: 0, writable: true
});

Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, writable: true
});

Object.defineProperty(document.documentElement, 'clientHeight', { value: 800, writable: true
});

describe('ScrollIndicator Component', () => { it('should be defined', () => { expect(ScrollIndicator).toBeDefined(); expect(typeof ScrollIndicator).toBe('function'); }); it('should be a valid React component', () => { expect(ScrollIndicator.name).toBe('ScrollIndicator'); });
});