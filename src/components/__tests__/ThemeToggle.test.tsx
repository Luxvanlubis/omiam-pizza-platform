
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
import { ThemeToggle, SimpleThemeToggle } from '../theme-toggle';

// Mock next-themes
jest.mock('next-themes', () => ({ useTheme: () => ({ theme: 'light', setTheme: jest.fn(), }),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({ Button: ({ children, ...props }: any) => ( <button {...props}>{children}</button> ),
}));

jest.mock('@/components/ui/dropdown-menu', () => ({ DropdownMenu: ({ children }: any) => <div>{children}</div>, DropdownMenuContent: ({ children }: any) => <div>{children}</div>, DropdownMenuItem: ({ children, onClick }: any) => ( <div onClick={onClick}>{children}</div> ), DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({ Monitor: () => <span>Monitor</span>, Moon: () => <span>Moon</span>, Sun: () => <span>Sun</span>,
}));

describe('ThemeToggle Component', () => { it('should be defined', () => { expect(ThemeToggle).toBeDefined(); expect(typeof ThemeToggle).toBe('function'); }); it('should be a valid React component', () => { expect(ThemeToggle.name).toBe('ThemeToggle'); });
});

describe('SimpleThemeToggle Component', () => { it('should be defined', () => { expect(SimpleThemeToggle).toBeDefined(); expect(typeof SimpleThemeToggle).toBe('function'); }); it('should be a valid React component', () => { expect(SimpleThemeToggle.name).toBe('SimpleThemeToggle'); });
});