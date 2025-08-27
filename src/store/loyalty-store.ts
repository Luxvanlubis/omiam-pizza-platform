import { create } from 'zustand';

export interface LoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'purchase' | 'points_added' | 'points_redeemed' | 'reward_claimed' | 'bonus';
  amount?: number;
  points: number;
  description: string;
  date: string;
}

export interface LoyaltyCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  level: 'Bronze' | 'Argent' | 'Or' | 'Platine';
  points: number;
  totalSpent: number;
  totalOrders: number;
  joinDate: string;
  lastVisit: string;
  rewards: string[];
  transactions: LoyaltyTransaction[];
}

interface LoyaltyStore {
  customers: LoyaltyCustomer[];
  currentCustomer: LoyaltyCustomer | null;
  addCustomer: (customer: Omit<LoyaltyCustomer, 'id' | 'joinDate' | 'transactions'>) => void;
  addPoints: (customerId: string, points: number, description?: string) => void;
  removePoints: (customerId: string, points: number, description?: string) => void;
  addPurchase: (customerId: string, amount: number) => void;
  redeemReward: (customerId: string, reward: string, pointsCost: number) => void;
  getCustomerLevel: (points: number) => 'Bronze' | 'Argent' | 'Or' | 'Platine';
  getAvailableRewards: (level: 'Bronze' | 'Argent' | 'Or' | 'Platine') => Array<{name: string, cost: number}>;
  getPointsMultiplier: (level: 'Bronze' | 'Argent' | 'Or' | 'Platine') => number;
  calculatePointsFromPurchase: (amount: number, level: 'Bronze' | 'Argent' | 'Or' | 'Platine') => number;
  setCurrentCustomer: (customer: LoyaltyCustomer | null) => void;
  getCustomerTransactions: (customerId: string) => LoyaltyTransaction[];
}

const rewardsByLevel = {
  Bronze: [
    { name: 'Boisson offerte', cost: 250 },
    { name: '10% de réduction sur la prochaine commande', cost: 400 }
  ],
  Argent: [
    { name: 'Pizza offerte', cost: 600 },
    { name: '20% de réduction', cost: 800 },
    { name: 'Dessert maison gratuit', cost: 500 }
  ],
  Or: [
    { name: 'Menu complet offert', cost: 1200 },
    { name: '30% de réduction', cost: 1000 },
    { name: 'Bouteille de vin offerte', cost: 800 },
    { name: 'Priorité sur les réservations', cost: 600 }
  ],
  Platine: [
    { name: 'Dîner pour 2 personnes offert', cost: 2000 },
    { name: '40% de réduction permanente', cost: 1500 },
    { name: 'Accès VIP aux événements', cost: 1000 },
    { name: 'Menu dégustation exclusif', cost: 1800 }
  ]
};

const pointsMultipliers = {
  Bronze: 1.0,
  Argent: 1.2,
  Or: 1.5,
  Platine: 2.0
};

export const useLoyaltyStore = create<LoyaltyStore>((set, get) => ({
  customers: [
    {
      id: '1',
      name: 'Marie Dupont',
      email: 'marie.dupont@email.com',
      phone: '02 96 12 34 56',
      level: 'Or',
      points: 1250,
      totalSpent: 456,
      totalOrders: 23,
      joinDate: '2023-01-15',
      lastVisit: '2024-01-15',
      rewards: ['Boisson offerte', 'Pizza offerte'],
      transactions: [
        {
          id: 't1',
          customerId: '1',
          type: 'purchase',
          amount: 45.50,
          points: 68,
          description: 'Achat - Pizza Margherita + Boisson',
          date: '2024-01-15'
        },
        {
          id: 't2',
          customerId: '1',
          type: 'reward_claimed',
          points: -600,
          description: 'Récompense utilisée: Pizza offerte',
          date: '2024-01-10'
        }
      ]
    },
    {
      id: '2',
      name: 'Jean Martin',
      email: 'jean.martin@email.com',
      phone: '02 96 23 45 67',
      level: 'Argent',
      points: 780,
      totalSpent: 298,
      totalOrders: 15,
      joinDate: '2023-03-20',
      lastVisit: '2024-01-14',
      rewards: ['Boisson offerte'],
      transactions: [
        {
          id: 't3',
          customerId: '2',
          type: 'purchase',
          amount: 32.80,
          points: 39,
          description: 'Achat - Salade César',
          date: '2024-01-14'
        },
        {
          id: 't4',
          customerId: '2',
          type: 'reward_claimed',
          points: -250,
          description: 'Récompense utilisée: Boisson offerte',
          date: '2024-01-12'
        }
      ]
    },
    {
      id: '3',
      name: 'Sophie Bernard',
      email: 'sophie.bernard@email.com',
      phone: '02 96 34 56 78',
      level: 'Bronze',
      points: 450,
      totalSpent: 156,
      totalOrders: 8,
      joinDate: '2023-06-10',
      lastVisit: '2024-01-13',
      rewards: [],
      transactions: [
        {
          id: 't5',
          customerId: '3',
          type: 'purchase',
          amount: 28.50,
          points: 29,
          description: 'Achat - Burger Classic',
          date: '2024-01-13'
        },
        {
          id: 't6',
          customerId: '3',
          type: 'bonus',
          points: 100,
          description: 'Bonus inscription',
          date: '2023-06-10'
        }
      ]
    }
  ],
  currentCustomer: null,
  
  addCustomer: (customer) => {
    const newCustomer: LoyaltyCustomer = {
      ...customer,
      id: Date.now().toString(),
      joinDate: new Date().toISOString().split('T')[0],
      level: get().getCustomerLevel(customer.points),
      transactions: [
        {
          id: `t_${Date.now()}`,
          customerId: Date.now().toString(),
          type: 'bonus',
          points: 100,
          description: 'Bonus inscription - Bienvenue !',
          date: new Date().toISOString().split('T')[0]
        }
      ]
    };
    // Ajouter les points de bienvenue
    newCustomer.points += 100;
    newCustomer.level = get().getCustomerLevel(newCustomer.points);
    
    set((state) => ({
      customers: [...state.customers, newCustomer]
    }));
  },
  
  addPoints: (customerId, points, description = 'Ajout manuel de points') => {
    set((state) => ({
      customers: state.customers.map((customer) => {
        if (customer.id === customerId) {
          const newPoints = customer.points + points;
          const newLevel = get().getCustomerLevel(newPoints);
          const transaction: LoyaltyTransaction = {
            id: `t_${Date.now()}`,
            customerId,
            type: 'points_added',
            points,
            description,
            date: new Date().toISOString().split('T')[0]
          };
          return {
            ...customer,
            points: newPoints,
            level: newLevel,
            transactions: [...customer.transactions, transaction]
          };
        }
        return customer;
      })
    }));
  },
  
  removePoints: (customerId, points, description = 'Retrait manuel de points') => {
    set((state) => ({
      customers: state.customers.map((customer) => {
        if (customer.id === customerId) {
          const newPoints = Math.max(0, customer.points - points);
          const newLevel = get().getCustomerLevel(newPoints);
          const transaction: LoyaltyTransaction = {
            id: `t_${Date.now()}`,
            customerId,
            type: 'points_redeemed',
            points: -points,
            description,
            date: new Date().toISOString().split('T')[0]
          };
          return {
            ...customer,
            points: newPoints,
            level: newLevel,
            transactions: [...customer.transactions, transaction]
          };
        }
        return customer;
      })
    }));
  },
  
  addPurchase: (customerId, amount) => {
    set((state) => ({
      customers: state.customers.map((customer) => {
        if (customer.id === customerId) {
          const pointsEarned = get().calculatePointsFromPurchase(amount, customer.level);
          const newPoints = customer.points + pointsEarned;
          const newLevel = get().getCustomerLevel(newPoints);
          const transaction: LoyaltyTransaction = {
            id: `t_${Date.now()}`,
            customerId,
            type: 'purchase',
            amount,
            points: pointsEarned,
            description: `Achat de ${amount.toFixed(2)}€ (+${pointsEarned} points)`,
            date: new Date().toISOString().split('T')[0]
          };
          return {
            ...customer,
            points: newPoints,
            level: newLevel,
            totalSpent: customer.totalSpent + amount,
            totalOrders: customer.totalOrders + 1,
            lastVisit: new Date().toISOString().split('T')[0],
            transactions: [...customer.transactions, transaction]
          };
        }
        return customer;
      })
    }));
  },
  
  redeemReward: (customerId, reward, pointsCost) => {
    set((state) => ({
      customers: state.customers.map((customer) => {
        if (customer.id === customerId && customer.points >= pointsCost) {
          const newPoints = customer.points - pointsCost;
          const newLevel = get().getCustomerLevel(newPoints);
          const transaction: LoyaltyTransaction = {
            id: `t_${Date.now()}`,
            customerId,
            type: 'reward_claimed',
            points: -pointsCost,
            description: `Récompense utilisée: ${reward}`,
            date: new Date().toISOString().split('T')[0]
          };
          return {
            ...customer,
            points: newPoints,
            level: newLevel,
            rewards: [...customer.rewards, reward],
            transactions: [...customer.transactions, transaction]
          };
        }
        return customer;
      })
    }));
  },
  
  getCustomerLevel: (points) => {
    if (points >= 3000) return 'Platine';
    if (points >= 1500) return 'Or';
    if (points >= 500) return 'Argent';
    return 'Bronze';
  },
  
  getAvailableRewards: (level) => {
    return rewardsByLevel[level];
  },
  
  getPointsMultiplier: (level) => {
    return pointsMultipliers[level];
  },
  
  calculatePointsFromPurchase: (amount, level) => {
    const basePoints = Math.floor(amount); // 1 point par euro
    const multiplier = get().getPointsMultiplier(level);
    return Math.floor(basePoints * multiplier);
  },
  
  getCustomerTransactions: (customerId) => {
    const customer = get().customers.find(c => c.id === customerId);
    return customer ? customer.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  },
  
  setCurrentCustomer: (customer) => {
    set({ currentCustomer: customer });
  }
}));