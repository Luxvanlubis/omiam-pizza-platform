import { SupabaseIntegrationService } from './supabase-integration';

// Types et interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'customer' | 'staff' | 'manager';
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  dateOfBirth?: Date;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  preferences: {
    language: string;
    currency: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    dietary: string[];
  };
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  favoriteItems: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  userId: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  pointsEarned: number;
  pointsRedeemed: number;
  nextLevelPoints: number;
  benefits: string[];
  expirationDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
  averageOrderValue: number;
  topCustomers: User[];
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'admin' | 'customer' | 'staff' | 'manager';
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role?: 'admin' | 'customer' | 'staff' | 'manager';
  isActive?: boolean;
}

/**
 * Service de gestion des utilisateurs intégré avec Supabase
 * Fournit des fonctionnalités complètes pour la gestion des utilisateurs,
 * profils et programmes de fidélité avec fallback mock pour le développement
 */
export class UserService {
  private integrationService: SupabaseIntegrationService;
  private mockMode: boolean;

  constructor(mockMode = false) {
    this.integrationService = SupabaseIntegrationService.getInstance();
    this.mockMode = mockMode;
  }

  /**
   * Créer un nouvel utilisateur
   */
  async createUser(userData: CreateUserData): Promise<User> {
    try {
      if (this.mockMode) {
        return this.createMockUser(userData);
      }

      const profileData = {
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'customer',
        is_active: true,
        email_verified: false,
        phone_verified: false,
        created_at: new Date().toISOString()
      };

      const result = await this.integrationService.executeMutation(
        'user_profiles',
        'insert',
        profileData
      );

      return this.mapDBUserToUser(result);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Obtenir un utilisateur par ID
   */
  async getUserById(id: string): Promise<User | null> {
    try {
      if (this.mockMode) {
        return this.getMockUsers().find(u => u.id === id) || null;
      }

      const result = await this.integrationService.executeQuery(
        'user_profiles',
        { filters: { user_id: id } }
      );

      return result && result.length > 0 ? this.mapDBUserToUser(result[0]) : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Obtenir un utilisateur par email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      if (this.mockMode) {
        return this.getMockUsers().find(u => u.email === email) || null;
      }

      const result = await this.integrationService.executeQuery(
        'user_profiles',
        { filters: { email } }
      );

      return result && result.length > 0 ? this.mapDBUserToUser(result[0]) : null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  /**
   * Obtenir tous les utilisateurs
   */
  async getAllUsers(
    filters?: {
      role?: string;
      isActive?: boolean;
      search?: string;
    },
    limit = 50,
    offset = 0
  ): Promise<User[]> {
    try {
      if (this.mockMode) {
        return this.getMockUsers();
      }

      const queryFilters: any = {};
      if (filters?.role) {
        queryFilters.role = filters.role;
      }
      if (filters?.isActive !== undefined) {
        queryFilters.is_active = filters.isActive;
      }
      if (filters?.search) {
        queryFilters.or = [
          { first_name: { ilike: `%${filters.search}%` } },
          { last_name: { ilike: `%${filters.search}%` } },
          { email: { ilike: `%${filters.search}%` } }
        ];
      }

      const result = await this.integrationService.executeQuery(
        'user_profiles',
        {
          filters: queryFilters,
          orderBy: { created_at: 'desc' },
          limit,
          offset
        }
      );

      return result ? result.map(this.mapDBUserToUser) : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return this.getMockUsers();
    }
  }

  // Méthodes utilitaires privées
  private mapDBUserToUser(dbUser: any): User {
    return {
      id: dbUser.user_id || dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      phone: dbUser.phone,
      avatar: dbUser.avatar,
      role: dbUser.role || 'customer',
      isActive: dbUser.is_active ?? true,
      emailVerified: dbUser.email_verified ?? false,
      phoneVerified: dbUser.phone_verified ?? false,
      createdAt: new Date(dbUser.created_at),
      updatedAt: new Date(dbUser.updated_at || dbUser.created_at),
      lastLoginAt: dbUser.last_login_at ? new Date(dbUser.last_login_at) : undefined
    };
  }

  // Méthodes mock pour les tests et le développement
  private createMockUser(userData: CreateUserData): User {
    return {
      id: `user-${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      role: userData.role || 'customer',
      isActive: true,
      emailVerified: false,
      phoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private getMockUsers(): User[] {
    return [
      {
        id: '1',
        email: 'admin@omiam.fr',
        firstName: 'Admin',
        lastName: 'OMIAM',
        role: 'admin',
        isActive: true,
        emailVerified: true,
        phoneVerified: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
      },
      {
        id: '2',
        email: 'client@example.com',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '+33789',
        role: 'customer',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      }
    ];
  }
}

// Instance par défaut
export const userService = new UserService();