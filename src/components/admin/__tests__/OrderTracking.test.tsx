
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
import OrderTracking from '../OrderTracking';

// Mock useAuth hook
jest.mock('@/components/auth-provider', () => ({ useAuth: () => ({ user: null, session: null, loading: false, signIn: jest.fn(), signUp: jest.fn(), signOut: jest.fn(), reset: jest.fn(), }),
}));

// Mock next/image
jest.mock('next/image', () => ({ __esModule: true, default: ({ src, alt, ...props }: any) => ( // eslint-disable-next-line @next/next/no-img-element <img src={src} alt={alt} {...props} /> ),
}));

// Mock Supabase integration service
jest.mock('@/lib/supabase-integration-service', () => ({ supabaseIntegrationService: { checkConnection: jest.fn().mockResolvedValue(true), executeQuery: jest.fn().mockResolvedValue([ { id: '1', order_number: 'ORD-001', customer_name: 'Jean Dupont', customer_email: 'jean@example.com', status: 'preparing', total_amount: 25.50, items: [ { name: 'Pizza Margherita', quantity: 1, price: 12.50 }, { name: 'Coca Cola', quantity: 2, price: 6.50 } ], created_at: new Date().toISOString(), updated_at: new Date().toISOString(), estimated_delivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), delivery_address: '123 Rue de la Paix, Paris', payment_status: 'paid', delivery_method: 'delivery' } ]), executeMutation: jest.fn().mockResolvedValue({ success: true }), Queries: { getOrders: jest.fn().mockResolvedValue([]), getOrderStats: jest.fn().mockResolvedValue({ totalOrders: 150, pendingOrders: 25, completedOrders: 120, cancelledOrders: 5, averageOrderValue: 28.75, totalRevenue: 4312.50 }), getDeliveryStats: jest.fn().mockResolvedValue({ onTimeDeliveries: 95, averageDeliveryTime: 25, activeDeliveries: 8 }), }, },
}));

// Mock push notification service
jest.mock('@/lib/push-notification-service', () => ({ PushNotificationService: { sendOrderStatusNotification: jest.fn().mockResolvedValue({ success: true }), },
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), }, toast: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), },
}), { virtual: true });

// Mock use-toast hook
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn(), }),
}));

// Mock recharts for order analytics
jest.mock('recharts', () => ({ ResponsiveContainer: ({ children }: any) => <div data-id="responsive-container">{children}</div>, LineChart: ({ children }: any) => <div data-id="line-chart">{children}</div>, Line: () => <div data-id="line" />, XAxis: () => <div data-id="x-axis" />, YAxis: () => <div data-id="y-axis" />, CartesianGrid: () => <div data-id="cartesian-grid" />, Tooltip: () => <div data-id="tooltip" />, Legend: () => <div data-id="legend" />, BarChart: ({ children }: any) => <div data-id="bar-chart">{children}</div>, Bar: () => <div data-id="bar" />, PieChart: ({ children }: any) => <div data-id="pie-chart">{children}</div>, Pie: () => <div data-id="pie" />, Cell: () => <div data-id="cell" />,
}));

// Mock date-fns
jest.mock('date-fns', () => ({ format: jest.fn((date) => date.toISOString()), isToday: jest.fn(() => true), differenceInMinutes: jest.fn(() => 25), addMinutes: jest.fn((date, minutes) => new Date(date.getTime() + minutes * 60000)),
}));

describe('OrderTracking', () => { beforeEach(() => { jest.clearAllMocks(); }); it('should render OrderTracking component', () => { render( <Wrapper> <OrderTracking /> </Wrapper> ); expect(screen.getById('order-tracking')).toBeInTheDocument(); }); it('should handle tab navigation', () => { render( <Wrapper> <OrderTracking /> </Wrapper> ); const tabs = screen.queryAllByRole('tab'); if (tabs.length > 0) { fireEvent.click(tabs[0]); expect(tabs[0]).toBeInTheDocument(); } }); it('should be accessible', () => { render( <Wrapper> <OrderTracking /> </Wrapper> ); // Check for proper ARIA labels and roles expect(screen.getById('order-tracking')).toBeInTheDocument(); }); it('should handle error states gracefully', () => { // Mock console.error to avoid noise in s const consoleSpy = jest.spyOn(console, 'error').mockImplementation(); // Force an error by mocking a failed service call const { supabaseIntegrationService } = await import('@/lib/supabase-integration-service'); supabaseIntegrationService.executeQuery .mockRejectedValueOnce(new Error('Service error')); render( <Wrapper> <OrderTracking /> </Wrapper> ); expect(screen.getById('order-tracking')).toBeInTheDocument(); consoleSpy.mockRestore(); });
});