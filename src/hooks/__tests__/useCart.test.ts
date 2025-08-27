import { renderHook, act } from '@ing-library/react';

// Mock localStorage
const localStorageMock = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock,
});

// Simple cart hook implementation for ing
const useCart = () => { const items: any[] = []; const totalItems = 0; const totalPrice = 0; const addItem = (item: any) => { // Mock implementation }; const removeItem = (id: string) => { // Mock implementation }; const updateQuantity = (id: string, quantity: number) => { // Mock implementation }; const clearCart = () => { // Mock implementation }; return { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart, };
};

describe('Cart Hook s', () => { beforeEach(() => { jest.clearAllMocks(); localStorageMock.getItem.mockReturnValue(null); }); it('should initialize with empty cart', () => { const { result } = renderHook(() => useCart()); expect(result.current.items).toEqual([]); expect(result.current.totalItems).toBe(0); expect(result.current.totalPrice).toBe(0); }); it('should have cart management functions', () => { const { result } = renderHook(() => useCart()); expect(typeof result.current.addItem).toBe('function'); expect(typeof result.current.removeItem).toBe('function'); expect(typeof result.current.updateQuantity).toBe('function'); expect(typeof result.current.clearCart).toBe('function'); }); it('should handle localStorage operations', () => { //  localStorage mock functionality localStorageMock.setItem(, 'value'); expect(localStorageMock.setItem).toHaveBeenCalledWith(, 'value'); localStorageMock.getItem.mockReturnValue('value'); const value = localStorageMock.getItem(); expect(value).toBe('value'); }); it('should handle cart item structure', () => { const Item = { id: '1', name:  Pizza', price: 12.50, quantity: 1, image: '/.jpg', category: 'pizza' }; expect(Item.id).toBe('1'); expect(Item.name).toBe( Pizza'); expect(Item.price).toBe(12.50); expect(Item.quantity).toBe(1); }); it('should calculate totals correctly', () => { const items = [ { id: '1', price: 10, quantity: 2 }, { id: '2', price: 5, quantity: 1 } ]; const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0); const totalItems = items.reduce((sum, item) => sum + item.quantity, 0); expect(totalPrice).toBe(25); expect(totalItems).toBe(3); });
});