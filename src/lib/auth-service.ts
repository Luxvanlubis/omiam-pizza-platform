import { User, Session } from '@supabase/supabase-js';
import { getUnifiedService } from './unified-database-service';

/**
 * Service d'authentification simplifié qui délègue toutes les opérations
 * au UnifiedDatabaseService pour assurer une source unique de vérité.
 */
export class AuthService {
  private unifiedService = getUnifiedService();

  // ==================== AUTHENTIFICATION ====================
  
  async signUp(email: string, password: string, userData?: { full_name?: string; phone?: string }) {
    return this.unifiedService.signUp(email, password, userData);
  }

  async signIn(email: string, password: string) {
    return this.unifiedService.signIn(email, password);
  }

  async signOut() {
    return this.unifiedService.signOut();
  }

  async reset(email: string) {
    return this.unifiedService.resetPassword(email);
  }

  getCurrentUser(): User | null {
    return this.unifiedService.getCurrentUser();
  }

  getCurrentSession(): Session | null {
    return this.unifiedService.getCurrentSession();
  }

  // ==================== PROFIL UTILISATEUR ====================
  
  async getUserProfile(userId: string) {
    return this.unifiedService.getUserProfile(userId);
  }

  async updateUserProfile(userId: string, updates: any) {
    return this.unifiedService.updateUserProfile(userId, updates);
  }

  // ==================== UTILITAIRES ====================
  
  async isAuthenticated(): Promise<boolean> {
    const user = this.getCurrentUser();
    return user !== null;
  }

  async requireAuth(): Promise<User> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('Authentification requise');
    }
    return user;
  }

  async healthCheck(): Promise<boolean> {
    return this.unifiedService.healthCheck();
  }
}

// Instance singleton
let authService: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authService) {
    authService = new AuthService();
  }
  return authService;
}

export default AuthService;