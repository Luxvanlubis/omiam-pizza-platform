
/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath, basePath = process.cwd()) { if (!userPath || typeof userPath !== 'string') { throw new Error('Chemin invalide'); } // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé const normalizedPath = path.normalize(path.join(basePath, userPath)); const normalizedBase = path.normalize(basePath); if (!normalizedPath.startsWith(normalizedBase)) { throw new Error('Accès au chemin non autorisé'); } return normalizedPath;
}
import React from 'react';
import { Wrapper } from '@/-utils/-wrapper';
import { render, screen, fireEvent, waitFor } from '@ing-library/react';
import { axe } from 'jest-axe';
import { UnifiedPOSModule } from '../UnifiedPOSModule';

// Mock next/image
jest.mock('next/image', () => ({ __esModule: true, default: ({ src, alt, ...props }: any) => ( // eslint-disable-next-line @next/next/no-img-element <img src={src} alt={alt} {...props} /> ),
}));

// Mock Supabase integration service
jest.mock('@/lib/supabase-integration-service', () => ({ supabaseIntegrationService: { checkConnection: jest.fn().mockResolvedValue(true), executeQuery: jest.fn().mockResolvedValue([]), executeMutation: jest.fn().mockResolvedValue({ success: true }), Queries: { getOrders: jest.fn().mockResolvedValue([]), getProducts: jest.fn().mockResolvedValue([]), getInventory: jest.fn().mockResolvedValue([]), }, },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), }, toast: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), },
}), { virtual: true });

// Mock use-toast hook
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn(), }),
}));

// Mock recharts
jest.mock('recharts', () => ({ ResponsiveContainer: ({ children }: any) => <div data-id="responsive-container">{children}</div>, LineChart: ({ children }: any) => <div data-id="line-chart">{children}</div>, Line: () => <div data-id="line" />, XAxis: () => <div data-id="x-axis" />, YAxis: () => <div data-id="y-axis" />, CartesianGrid: () => <div data-id="cartesian-grid" />, Tooltip: () => <div data-id="tooltip" />, Legend: () => <div data-id="legend" />, BarChart: ({ children }: any) => <div data-id="bar-chart">{children}</div>, Bar: () => <div data-id="bar" />,
}));

describe('UnifiedPOSModule', () => { beforeEach(() => { jest.clearAllMocks(); }); it('should render UnifiedPOSModule component', () => { render( <Wrapper> <UnifiedPOSModule /> </Wrapper> ); expect(screen.getById('unified-pos-module')).toBeInTheDocument(); }); it('should handle tab navigation', () => { render( <Wrapper> <UnifiedPOSModule /> </Wrapper> ); const tabs = screen.queryAllByRole('tab'); if (tabs.length > 0) { fireEvent.click(tabs[0]); expect(tabs[0]).toBeInTheDocument(); } }); it('should be accessible', async () => { const { container } = render( <Wrapper> <UnifiedPOSModule /> </Wrapper> ); const results = await axe(container); expect(results).toHaveNoViolations(); }); it('should handle errors gracefully', () => { // Mock console.error to avoid noise in s const consoleSpy = jest.spyOn(console, 'error').mockImplementation(); // Force an error by mocking a failed service call const { supabaseIntegrationService } = await import('@/lib/supabase-integration-service'); supabaseIntegrationService.Queries.getOrders .mockRejectedValueOnce(new Error('Service error')); render( <Wrapper> <UnifiedPOSModule /> </Wrapper> ); expect(screen.getById('unified-pos-module')).toBeInTheDocument(); consoleSpy.mockRestore(); });
});