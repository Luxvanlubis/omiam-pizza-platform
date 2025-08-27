import { validateSecurePath, securePathJoin } from '@/lib/security-utils';
import React from 'react';
import { Wrapper } from '@/-utils/-wrapper';
import { render, screen } from '@ing-library/react';
import { MenuManagement } from '../MenuManagement';

// Mock next/image
jest.mock('next/image', () => ({ __esModule: true, default: ({ src, alt, ...props }: any) => ( // eslint-disable-next-line @next/next/no-img-element <img src={src} alt={alt} {...props} /> ),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => ({ createClient: () => ({ from: () => ({ select: () => Promise.resolve({ data: [], error: null }), insert: () => Promise.resolve({ data: null, error: null }), update: () => Promise.resolve({ data: null, error: null }), delete: () => Promise.resolve({ data: null, error: null }), }), storage: { from: () => ({ upload: () => Promise.resolve({ data: null, error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }), }), }, }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({ __esModule: true, default: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), }, toast: { success: jest.fn(), error: jest.fn(), loading: jest.fn(), },
}), { virtual: true });

// Mock use-toast hook
jest.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: jest.fn(), }),
}));

describe('MenuManagement', () => { it('should be defined', () => { expect(MenuManagement).toBeDefined(); expect(typeof MenuManagement).toBe('function'); }); it('should be a valid React component', () => { expect(MenuManagement.name).toBe('MenuManagement'); });
});