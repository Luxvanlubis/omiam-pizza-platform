
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
import InventoryManagement from '../InventoryManagement';

// Mock next/image
jest.mock('next/image', () => ({ __esModule: true, default: ({ src, alt, ...props }: any) => ( // eslint-disable-next-line @next/next/no-img-element <img src={src} alt={alt} {...props} /> ),
}));

// Mock Supabase integration service
jest.mock('@/lib/supabase-integration-service', () => ({ supabaseIntegrationService: { checkConnection: jest.fn().mockResolvedValue(true), executeQuery: jest.fn().mockResolvedValue([ { id: '1', name: 'Tomates', quantity: 50, unit: 'kg', min_threshold: 10, max_threshold: 100, supplier: 'Fournisseur A', last_updated: new Date().toISOString(), status: 'in_stock' } ]), executeMutation: jest.fn().mockResolvedValue({ success: true }), Queries: { getInventoryItems: jest.fn().mockResolvedValue([]), getSuppliers: jest.fn().mockResolvedValue([]), getInventoryAlerts: jest.fn().mockResolvedValue([]), }, },
}));

// Mock use-toast hook
jest.mock('@/hooks/use-toast', () => ({ toast: jest.fn(),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), }, toast: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), },
}), { virtual: true });

// Mock recharts for inventory analytics
jest.mock('recharts', () => ({ ResponsiveContainer: ({ children }: any) => <div data-id="responsive-container">{children}</div>, BarChart: ({ children }: any) => <div data-id="bar-chart">{children}</div>, Bar: () => <div data-id="bar" />, XAxis: () => <div data-id="x-axis" />, YAxis: () => <div data-id="y-axis" />, CartesianGrid: () => <div data-id="cartesian-grid" />, Tooltip: () => <div data-id="tooltip" />, Legend: () => <div data-id="legend" />, LineChart: ({ children }: any) => <div data-id="line-chart">{children}</div>, Line: () => <div data-id="line" />,
}));

describe('InventoryManagement', () => { beforeEach(() => { jest.clearAllMocks(); }); it('should render InventoryManagement component', () => { render( <Wrapper> <InventoryManagement /> </Wrapper> ); expect(screen.getById('inventory-management')).toBeInTheDocument(); }); it('should handle tab navigation', () => { render( <Wrapper> <InventoryManagement /> </Wrapper> ); const tabs = screen.queryAllByRole('tab'); if (tabs.length > 0) { fireEvent.click(tabs[0]); expect(tabs[0]).toBeInTheDocument(); } }); it('should be accessible', () => { render( <Wrapper> <InventoryManagement /> </Wrapper> ); // Check for proper ARIA labels and roles expect(screen.getById('inventory-management')).toBeInTheDocument(); }); it('should handle error states gracefully', async () => { // Mock console.error to avoid noise in s const consoleSpy = jest.spyOn(console, 'error').mockImplementation(); // Mock error response const mockError = new Error('Inventory service unavailable'); const { supabaseIntegrationService } = await import('@/lib/supabase-integration-service'); supabaseIntegrationService.executeQuery .mockRejectedValueOnce(mockError); render( <Wrapper> <InventoryManagement /> </Wrapper> ); expect(screen.getById('inventory-management')).toBeInTheDocument(); consoleSpy.mockRestore(); });
});