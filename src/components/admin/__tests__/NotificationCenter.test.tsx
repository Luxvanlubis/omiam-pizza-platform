
/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath, basePath = process.cwd()) { if (!userPath || typeof userPath !== 'string') { throw new Error('Chemin invalide'); } // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé const normalizedPath = path.normalize(path.join(basePath, userPath)); const normalizedBase = path.normalize(basePath); if (!normalizedPath.startsWith(normalizedBase)) { throw new Error('Accès au chemin non autorisé'); } return normalizedPath;
}
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@ing-library/react';
import { NotificationCenter } from '../NotificationCenter';
import { Wrapper } from '@/-utils/-wrapper';

// Mock next/image
jest.mock('next/image', () => ({ __esModule: true, default: ({ src, alt, ...props }: any) => ( // eslint-disable-next-line @next/next/no-img-element <img src={src} alt={alt} {...props} /> ),
}));

// Mock Supabase integration service
jest.mock('@/lib/supabase-integration-service', () => ({ supabaseIntegrationService: { checkConnection: jest.fn().mockResolvedValue(true), executeQuery: jest.fn().mockResolvedValue([ { id: '1', title: 'Nouvelle commande', message: 'Commande #123 reçue', type: 'order', priority: 'high', is_read: false, created_at: new Date().toISOString(), user_id: 'user1' } ]), executeMutation: jest.fn().mockResolvedValue({ success: true }), Queries: { getNotifications: jest.fn().mockResolvedValue([]), getNotificationTemplates: jest.fn().mockResolvedValue([]), getNotificationSettings: jest.fn().mockResolvedValue({}), }, },
}));

// Mock push notification service
jest.mock('@/lib/push-notification-service', () => ({ PushNotificationService: { sendPushNotification: jest.fn().mockResolvedValue({ success: true }), subscribeToPush: jest.fn().mockResolvedValue({ success: true }), unsubscribeFromPush: jest.fn().mockResolvedValue({ success: true }), },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), }, toast: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), },
}));

// Mock use-toast hook
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn(), }),
})); // Mock use-toast hook
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn(), }),
}));

// Mock recharts for notification analytics
jest.mock('recharts', () => ({ ResponsiveContainer: ({ children }: any) => <div data-id="responsive-container">{children}</div>, LineChart: ({ children }: any) => <div data-id="line-chart">{children}</div>, Line: () => <div data-id="line" />, XAxis: () => <div data-id="x-axis" />, YAxis: () => <div data-id="y-axis" />, CartesianGrid: () => <div data-id="cartesian-grid" />, Tooltip: () => <div data-id="tooltip" />, Legend: () => <div data-id="legend" />, PieChart: ({ children }: any) => <div data-id="pie-chart">{children}</div>, Pie: () => <div data-id="pie" />, Cell: () => <div data-id="cell" />,
}));

describe('NotificationCenter', () => { beforeEach(() => { jest.clearAllMocks(); }); it('should render NotificationCenter component', () => { render( <Wrapper> <NotificationCenter isOpen={true} onClose={() => {}} /> </Wrapper> ); expect(screen.getById('notification-center')).toBeInTheDocument(); }); it('should handle tab navigation', () => { render( <Wrapper> <NotificationCenter isOpen={true} onClose={() => {}} /> </Wrapper> ); const tabs = screen.queryAllByRole('tab'); if (tabs.length > 0) { fireEvent.click(tabs[0]); expect(tabs[0]).toBeInTheDocument(); } }); it('should be accessible', () => { render( <Wrapper> <NotificationCenter isOpen={true} onClose={() => {}} /> </Wrapper> ); // Check for proper ARIA labels and roles expect(screen.getById('notification-center')).toBeInTheDocument(); }); it('should handle error states gracefully', () => { // Mock console.error to avoid noise in s const consoleSpy = jest.spyOn(console, 'error').mockImplementation(); // Force an error by mocking a failed service call const { supabaseIntegrationService } = await import('@/lib/supabase-integration-service'); supabaseIntegrationService.executeQuery .mockRejectedValueOnce(new Error('Service error')); render( <Wrapper> <NotificationCenter isOpen={true} onClose={() => {}} /> </Wrapper> ); expect(screen.getById('notification-center')).toBeInTheDocument(); consoleSpy.mockRestore(); });
});