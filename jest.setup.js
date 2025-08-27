import '@ing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import 'jest-axe/extend-expect';

// Mock Next.js router
jest.mock('next/navigation', () => ({ useRouter() { return { push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn(), }; }, useSearchParams() { return new URLSearchParams(); }, usePathname() { return '/'; },
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({ __esModule: true, default: (props) => { // eslint-disable-next-line @next/next/no-img-element return <img {...props} />; },
}));

// Mock next-i18next
jest.mock('next-i18next', () => ({ useTranslation: () => ({ t: () => , i18n: { changeLanguage: jest.fn(), language: 'fr', }, }), Trans: ({ children }) => children,
}));

jest.mock('next-i18next/serverSideTranslations', () => ({ serverSideTranslations: jest.fn(() => Promise.resolve({ props: { _nextI18Next: { initialI18nStore: { fr: {}, en: {}, }, initialLocale: 'fr', userConfig: { i18n: { defaultLocale: 'fr', locales: ['fr', 'en'], }, }, }, }, })),
}));

// Mock environment variables
process.env.NODE_ENV = ;
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_ = -anon-;
process.env.DATABASE_URL = 'postgresql://:@localhost:5432/;
process.env.NEXTAUTH_ = ---for-ing-purposes-only';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver { constructor() {} observe() { return null; } disconnect() { return null; } unobserve() { return null; }
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver { constructor() {} observe() { return null; } disconnect() { return null; } unobserve() { return null; }
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', { writable: true, value: jest.fn().mockImplementation(query => ({ matches: false, media: query, onchange: null, addListener: jest.fn(), // deprecated removeListener: jest.fn(), // deprecated addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn(), })),
});

// Mock localStorage
const localStorageMock = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock
});

// Mock sessionStorage
const sessionStorageMock = { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock
});

// Polyfill for Web APIs
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Request, Response, Headers for API route s
global.Request = class Request { constructor(input, init = {}) { this.url = typeof input === 'string' ? input : input.url; this.method = init.method || 'GET'; this.headers = new Headers(init.headers); this.body = init.body; } async json() { return JSON.parse(this.body || '{}'); } async text() { return this.body || ''; }
};

global.Response = class Response { constructor(body, init = {}) { this.body = body; this.status = init.status || 200; this.statusText = init.statusText || 'OK'; this.headers = new Headers(init.headers); this.ok = this.status >= 200 && this.status < 300; } static json(data, init = {}) { return new Response(JSON.stringify(data), { ...init, headers: { 'Content-Type': 'application/json', ...init.headers } }); } async json() { return JSON.parse(this.body); } async text() { return this.body; }
};

global.Headers = class Headers { constructor(init = {}) { this.map = new Map(); if (init) { Object.entries(init).forEach(([key, value]) => { this.set(key, value); }); } } get(name) { return this.map.get(name.toLowerCase()); } set(name, value) { this.map.set(name.toLowerCase(), value); } has(name) { return this.map.has(name.toLowerCase()); } delete(name) { this.map.delete(name.toLowerCase()); }
};

// Mock fetch
global.fetch = jest.fn();

// Setup pour les s async
jest.setTimeout(10000);

// Cleanup après chaque 
afterEach(() => { jest.clearAllMocks(); localStorageMock.clear(); sessionStorageMock.clear();
});

// Supprimer les warnings de console pendant les s
const originalError = console.error;
beforeAll(() => { console.error = (...args) => { if ( typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render is no longer supported') ) { return; } originalError.call(console, ...args); };
});

afterAll(() => { console.error = originalError;
});