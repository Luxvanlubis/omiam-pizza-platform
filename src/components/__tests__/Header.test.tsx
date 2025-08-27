import { validateSecurePath, securePathJoin } from '@/lib/security-utils';
import React from 'react';
import { render, screen } from '@ing-library/react';
import '@ing-library/jest-dom';
import { Header } from '../Header';

// Mock useAuth hook and AuthProvider
jest.mock('@/components/auth-provider', () => ({ useAuth: () => ({ user: null, session: null, loading: false, signIn: jest.fn(), signUp: jest.fn(), signOut: jest.fn(), reset: jest.fn(), }), AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), }), usePathname: () => '/',
}));

// Mock cart store
jest.mock('@/store/cart-store', () => ({ useCartStore: () => ({ items: [], isOpen: false, setIsOpen: jest.fn(), getTotalItems: () => 0, getTotalPrice: () => 0, openCart: jest.fn(), closeCart: jest.fn(), toggleCart: jest.fn(), addItem: jest.fn(), removeItem: jest.fn(), updateQuantity: jest.fn(), clearCart: jest.fn(), }),
}));

// Mock contact config
jest.mock('@/config/contact', () => ({ formatters: { phoneLink: jest.fn(() => 'tel:+33296146153'), emailLink: jest.fn(() => 'mailto:contact@omiam-guingamp.fr'), fullAddress: jest.fn(() => '12 Rue des Ponts Saint-Michel, 22200 Guingamp, France'), }, CONTACT_INFO: { contact: { phone: '+33 2 96 14 61 53', email: 'contact@omiam-guingamp.fr', }, address: { full: '12 Rue des Ponts Saint-Michel, 22200 Guingamp, France', }, },
}));

// Mock ScrollIndicator
jest.mock('@/components/ScrollIndicator', () => { return function MockScrollIndicator() { return <div data-id="scroll-indicator" />; };
});

// Mock ThemeToggle
jest.mock('@/components/theme-toggle', () => ({ ThemeToggle: () => <button data-id="theme-toggle">Theme</button>,
}));

describe('Header Component', () => { beforeEach(() => { jest.clearAllMocks(); }); it('should render without crashing', () => { render(<Header />); expect(screen.getByRole('banner')).toBeInTheDocument(); }); it('should render the logo', () => { render(<Header />); const logoText = screen.getByText('O\'Miam'); expect(logoText).toBeInTheDocument(); }); it('should render navigation links', () => { render(<Header />); expect(screen.getByText('accueil')).toBeInTheDocument(); expect(screen.getByText('menu')).toBeInTheDocument(); expect(screen.getByText('contact')).toBeInTheDocument(); }); it('should render theme toggle', () => { render(<Header />); expect(screen.getById('theme-toggle')).toBeInTheDocument(); }); it('should render scroll indicator', () => { render(<Header />); expect(screen.getById('scroll-indicator')).toBeInTheDocument(); }); it('should have proper accessibility structure', () => { render(<Header />); const header = screen.getByRole('banner'); expect(header).toBeInTheDocument(); const navigation = screen.getByRole('navigation'); expect(navigation).toBeInTheDocument(); });
});