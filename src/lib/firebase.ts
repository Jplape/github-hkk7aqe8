// Mock Firebase implementation
const ADMIN_EMAIL = 'admin@esttmco.com';
const ADMIN_PASSWORD = 'admin';

interface MockUser {
  email: string;
  id: string;
  role: 'admin' | 'technician' | 'manager';
}

class MockAuth {
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  async signInWithEmailAndPassword(email: string, password: string): Promise<MockUser> {
    return new Promise((resolve, reject) => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const user = { 
          email: ADMIN_EMAIL, 
          id: '1',
          role: 'admin' as const
        };
        this.currentUser = user;
        this.notifyListeners();
        resolve(user);
      } else {
        reject(new Error('Email ou mot de passe incorrect'));
      }
    });
  }

  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.notifyListeners();
    return Promise.resolve();
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const auth = new MockAuth();