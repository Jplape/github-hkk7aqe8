// Configuration minimale pour les tests
import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
const { server } = require('./src/mocks/server');

// Initialisation de expect
(global as any).expect = expect;

// Variables d'environnement de test
process.env.VITE_SUPABASE_URL = 'http://localhost:54321';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

// Configuration MSW avec gestion d'erreur
try {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
} catch (error) {
  console.warn('MSW initialization failed, continuing without it');
}

// Mock très simple de Supabase
jest.mock('./src/lib/supabase', () => ({
  __esModule: true,
  default: {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: [], error: null }),
      update: () => Promise.resolve({ data: [], error: null }),
      delete: () => Promise.resolve({ data: [], error: null })
    }),
    auth: {
      getSession: () => Promise.resolve({
        data: { session: { user: { id: 'test-user-id' } } },
        error: null
      }),
      signOut: jest.fn()
    }
  }
}));