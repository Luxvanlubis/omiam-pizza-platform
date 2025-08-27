
import { renderHook, act } from '@testing-library/react';
import { useCartStore } from '../cart-store';
import { CartItem } from '@/types';
import path from 'path';

/**
 * Valide et sécurise un chemin de fichier
 * @param {string} userPath - Chemin fourni par l'utilisateur
 * @param {string} basePath - Chemin de base autorisé
 * @returns {string} - Chemin sécurisé
 */
function validateSecurePath(userPath: string, basePath: string = process.cwd()): string {
  if (!userPath || typeof userPath !== 'string') {
    throw new Error('Chemin invalide');
  }
  
  // Normaliser le chemin et vérifier qu'il reste dans le répertoire autorisé
  const normalizedPath = path.normalize(path.join(basePath, userPath));
  const normalizedBase = path.normalize(basePath);
  
  if (!normalizedPath.startsWith(normalizedBase)) {
    throw new Error('Accès au chemin non autorisé');
  }
  
  return normalizedPath;
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Cart Store', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Reset store state
    useCartStore.setState({
      items: [],
      isOpen: false,
    });
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCartStore());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCartStore());
    const testItem: CartItem = {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.50,
      quantity: 1,
      image: '/pizza.jpg',
      category: 'pizza'
    };

    act(() => {
      result.current.addItem(testItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(testItem);
    expect(result.current.getTotalItems()).toBe(1);
    expect(result.current.getTotalPrice()).toBe(12.50);
  });

  it('should increase quantity when adding existing item', () => {
    const { result } = renderHook(() => useCartStore());
    const testItem: CartItem = {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.50,
      quantity: 1,
      image: '/pizza.jpg',
      category: 'pizza'
    };

    act(() => {
      result.current.addItem(testItem);
      result.current.addItem(testItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.getTotalItems()).toBe(2);
    expect(result.current.getTotalPrice()).toBe(25.00);
  });

  it('should remove item from cart', () => {
    const { result } = renderHook(() => useCartStore());
    const testItem: CartItem = {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.50,
      quantity: 2,
      image: '/pizza.jpg',
      category: 'pizza'
    };

    act(() => {
      result.current.addItem(testItem);
    });

    act(() => {
      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
  });

  it('should update item quantity', () => {
    const { result } = renderHook(() => useCartStore());
    const testItem: CartItem = {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.50,
      quantity: 1,
      image: '/pizza.jpg',
      category: 'pizza'
    };

    act(() => {
      result.current.addItem(testItem);
    });

    act(() => {
      result.current.updateQuantity('1', 3);
    });

    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.getTotalItems()).toBe(3);
    expect(result.current.getTotalPrice()).toBe(37.50);
  });

  it('should remove item when quantity is set to 0', () => {
    const { result } = renderHook(() => useCartStore());
    const testItem: CartItem = {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.50,
      quantity: 1,
      image: '/pizza.jpg',
      category: 'pizza'
    };

    act(() => {
      result.current.addItem(testItem);
    });

    act(() => {
      result.current.updateQuantity('1', 0);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should clear cart', () => {
    const { result } = renderHook(() => useCartStore());
    const testItem: CartItem = {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.50,
      quantity: 1,
      image: '/pizza.jpg',
      category: 'pizza'
    };

    act(() => {
      result.current.addItem(testItem);
    });

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.getTotalItems()).toBe(0);
    expect(result.current.getTotalPrice()).toBe(0);
  });

  it('should toggle cart visibility', () => {
    const { result } = renderHook(() => useCartStore());
    
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggleCart();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggleCart();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should open cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.openCart();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('should close cart', () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.openCart();
    });

    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.closeCart();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('should calculate total price correctly with multiple items', () => {
    const { result } = renderHook(() => useCartStore());
    const item1 = {
      id: '1',
      name: 'Pizza',
      price: 12.50,
      quantity: 1,
      image: '/pizza.jpg',
      category: 'pizza'
    };
    const item2 = {
      id: '2',
      name: 'Burger',
      price: 8.00,
      quantity: 1,
      image: '/burger.jpg',
      category: 'burger'
    };

    act(() => {
      result.current.addItem(item1);
      result.current.addItem(item1); // Add same item again to get quantity 2
      result.current.addItem(item2);
    });

    expect(result.current.getTotalPrice()).toBe(33.00); // (12.50 * 2) + (8.00 * 1)
    expect(result.current.getTotalItems()).toBe(3);
  });

  it('should handle edge cases for quantity updates', () => {
    const { result } = renderHook(() => useCartStore());
    const testItem: CartItem = {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.50,
      quantity: 1,
      image: '/pizza.jpg',
      category: 'pizza'
    };

    act(() => {
      result.current.addItem(testItem);
    });

    // Try to update quantity of non-existent item
    act(() => {
      result.current.updateQuantity('999', 5);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(1);

    // Try to set negative quantity
    act(() => {
      result.current.updateQuantity('1', -1);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('should handle removing non-existent item', () => {
    const { result } = renderHook(() => useCartStore());
    const testItem: CartItem = {
      id: '1',
      name: 'Margherita Pizza',
      price: 12.50,
      quantity: 1,
      image: '/pizza.jpg',
      category: 'pizza'
    };

    act(() => {
      result.current.addItem(testItem);
    });

    act(() => {
      result.current.removeItem('999');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].id).toBe('1');
  });
});