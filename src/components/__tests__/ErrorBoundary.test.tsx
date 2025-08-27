
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
import '@ing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

// Composant qui génère une erreur pour les s
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => { if (shouldThrow) { throw new Error( error'); } return <div>No error</div>;
};

// Mock console.error pour éviter les logs pendant les s
const originalError = console.error;
beforeAll(() => { console.error = jest.fn();
});

afterAll(() => { console.error = originalError;
});

describe('ErrorBoundary', () => { beforeEach(() => { jest.clearAllMocks(); }); it('should render children when there is no error', () => { render( <ErrorBoundary> <ThrowError shouldThrow={false} /> </ErrorBoundary> ); expect(screen.getByText('No error')).toBeInTheDocument(); }); it('should render error UI when there is an error', () => { render( <ErrorBoundary> <ThrowError shouldThrow={true} /> </ErrorBoundary> ); expect(screen.getByText('Oups ! Une erreur s\'est produite')).toBeInTheDocument(); expect(screen.getByText('Nous nous excusons pour ce désagrément. L\'équipe technique a été notifiée.')).toBeInTheDocument(); }); it('should render custom fallback when provided', () => { const CustomFallback = () => <div>Custom error message</div>; render( <ErrorBoundary fallback={<CustomFallback />}> <ThrowError shouldThrow={true} /> </ErrorBoundary> ); expect(screen.getByText('Custom error message')).toBeInTheDocument(); }); it('should call onError callback when error occurs', () => { const onErrorMock = jest.fn(); render( <ErrorBoundary onError={onErrorMock}> <ThrowError shouldThrow={true} /> </ErrorBoundary> ); expect(onErrorMock).toHaveBeenCalledWith( expect.any(Error), expect.objectContaining({ componentStack: expect.any(String) }) ); }); it('should have retry functionality', () => { const { rerender } = render( <ErrorBoundary> <ThrowError shouldThrow={true} /> </ErrorBoundary> ); // Vérifier que l'erreur est affichée expect(screen.getByText('Oups ! Une erreur s\'est produite')).toBeInTheDocument(); // Simuler un retry en re-renderant avec une prop différente rerender( <ErrorBoundary ="retry"> <ThrowError shouldThrow={false} /> </ErrorBoundary> ); expect(screen.getByText('No error')).toBeInTheDocument(); }); it('should reset error state when children change', () => { const { rerender } = render( <ErrorBoundary> <ThrowError shouldThrow={true} /> </ErrorBoundary> ); // Vérifier que l'erreur est affichée expect(screen.getByText('Oups ! Une erreur s\'est produite')).toBeInTheDocument(); // Changer les enfants rerender( <ErrorBoundary> <div>New content</div> </ErrorBoundary> ); // L'ErrorBoundary devrait se réinitialiser expect(screen.getByText('New content')).toBeInTheDocument(); }); it('should handle errors in componentDidUpdate', () => { const ProblematicComponent = ({ shouldError }: { shouldError: boolean }) => { if (shouldError) { throw new Error('Render error'); } return <div>Component content</div>; }; const { rerender } = render( <ErrorBoundary> <ProblematicComponent shouldError={false} /> </ErrorBoundary> ); expect(screen.getByText('Component content')).toBeInTheDocument(); // Déclencher une erreur dans le rendu rerender( <ErrorBoundary> <ProblematicComponent shouldError={true} /> </ErrorBoundary> ); // L'ErrorBoundary devrait afficher l'interface d'erreur expect(screen.getByText('Oups ! Une erreur s\'est produite')).toBeInTheDocument(); });
});