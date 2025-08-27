// Configuration du menu O'Miam - Données réelles août 2025
// Source : Menu Deliveroo officiel

export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'pizza' | 'calzone' | 'dessert';
  ingredients: string[];
  allergens?: string[];
  vegetarian?: boolean;
  spicy?: boolean;
  image: string;
}

export interface Beverage {
  id: string;
  name: string;
  size: string;
  price: number;
  category: 'soft' | 'beer' | 'water';
  alcohol?: boolean;
  image: string;
}

export const PIZZAS: Pizza[] = [
  { id: 'margarita', name: 'Margarita', description: 'Tomate, mozzarella', price: 10.00, category: 'pizza', ingredients: ['tomate', 'mozzarella'], vegetarian: true, image: '/images/pizzas/margarita.svg' },
  { id: 'royale', name: 'Royale', description: 'Tomate, mozzarella, jambon, champignons', price: 12.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'jambon', 'champignons'], image: '/images/pizzas/royale.svg' },
  { id: 'calzone-regina', name: 'Calzone Regina', description: 'Crème, champignons, jambon, mozzarella (calzone)', price: 12.00, category: 'calzone', ingredients: ['crème', 'champignons', 'jambon', 'mozzarella'], image: '/images/pizzas/calzone-regina.jpg' },
  { id: 'napolitaine', name: 'Napolitaine', description: 'Tomate, mozzarella, anchois, câpre', price: 12.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'anchois', 'câpre'], image: '/images/pizzas/napolitaine.svg' },
  { id: 'flamenkuche', name: 'Flamenkuche', description: 'Crème, mozzarella, oignons, lardons', price: 12.00, category: 'pizza', ingredients: ['crème', 'mozzarella', 'oignons', 'lardons'], image: '/images/pizzas/flamenkuche.svg' },
  { id: 'italienne', name: 'Italienne', description: 'Tomate, bille de mozzarella, basilic frais, tomate cerise', price: 12.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'basilic frais', 'tomate cerise'], vegetarian: true, image: '/images/pizzas/italienne.svg' },
  { id: 'campagnarde', name: 'Campagnarde', description: 'Tomate, champignons, mozzarella, oignons, lardon, jambon', price: 13.00, category: 'pizza', ingredients: ['tomate', 'champignons', 'mozzarella', 'oignons', 'lardons', 'jambon'], image: '/images/pizzas/campagnarde.jpg' },
  { id: 'capra', name: 'Capra', description: 'Crème, miel, mozzarella, chèvre, tomate fraîche', price: 13.00, category: 'pizza', ingredients: ['crème', 'miel', 'mozzarella', 'chèvre', 'tomate fraîche'], vegetarian: true, image: '/images/pizzas/capra.jpg' },
  { id: 'tona', name: 'Tona', description: 'Tomate, mozzarella, olives, poivrons, basilic, thon', price: 13.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'olives', 'poivrons', 'basilic', 'thon'], image: '/images/pizzas/tona.jpg' },
  { id: 'pepperonni', name: 'Pepperonni', description: 'Tomate, mozzarella, pepperonni', price: 13.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'pepperonni'], spicy: true, image: '/images/pizzas/pepperonni.jpg' },
  { id: 'vegetarienne', name: 'Végétarienne', description: 'Tomate, mozzarella, aubergine, cœur d\'artichaut, poivrons, huile de basilic', price: 13.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'aubergine', 'cœur d\'artichaut', 'poivrons', 'huile de basilic'], vegetarian: true, image: '/images/pizzas/vegetarienne.jpg' },
  { id: 'bombay', name: 'Bombay', description: 'Crème, miel, mozzarella, oignons, poivron, poulet curry', price: 14.00, category: 'pizza', ingredients: ['crème', 'miel', 'mozzarella', 'oignons', 'poivrons', 'poulet curry'], spicy: true, image: '/images/pizzas/bombay.jpg' },
  { id: 'louisiane', name: 'Louisiane', description: 'Barbecue, mozzarella, lardons, poulet, bœuf, poivrons, curry', price: 14.00, category: 'pizza', ingredients: ['barbecue', 'mozzarella', 'lardons', 'poulet', 'bœuf', 'poivrons', 'curry'], spicy: true, image: '/images/pizzas/louisiane.jpg' },
  { id: 'kebab', name: 'Kébab', description: 'Tomate, mozzarella, oignons, kebab, crème', price: 14.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'oignons', 'kebab', 'crème'], image: '/images/pizzas/kebab.jpg' },
  { id: 'orientale', name: 'Orientale', description: 'Tomate, mozzarella, pomme de terre, merguez, bœuf, poivrons', price: 14.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'pomme de terre', 'merguez', 'bœuf', 'poivrons'], spicy: true, image: '/images/pizzas/orientale.jpg' },
  { id: 'bolognaise', name: 'Bolognaise', description: 'Tomate, mozzarella, oignons, bœuf haché', price: 14.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'oignons', 'bœuf haché'], image: '/images/pizzas/bolognaise.jpg' },
  { id: 'cactus', name: 'Cactus', description: 'Tomate, mozzarella, chorizo, merguez, bœuf, poivrons', price: 14.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'chorizo', 'merguez', 'bœuf', 'poivrons'], spicy: true, image: '/images/pizzas/cactus.jpg' },
  { id: 'los-angeles', name: 'Los Angeles', description: 'Barbecue, mozzarella, oignons, bœuf, pepperoni', price: 14.00, category: 'pizza', ingredients: ['barbecue', 'mozzarella', 'oignons', 'bœuf', 'pepperoni'], spicy: true, image: '/images/pizzas/los-angeles.jpg' },
  { id: 'savoyarde', name: 'Savoyarde', description: 'Crème, mozzarella, oignons, lardons, pomme de terre, raclette', price: 15.00, category: 'pizza', ingredients: ['crème', 'mozzarella', 'oignons', 'lardons', 'pomme de terre', 'raclette'], image: '/images/pizzas/savoyarde.jpg' },
  { id: 'rustique', name: 'Rustique', description: 'Tomate, mozzarella, saucisse fumée, raclette, crème, pommes de terre', price: 15.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'saucisse fumée', 'raclette', 'crème', 'pommes de terre'], image: '/images/pizzas/rustique.jpg' },
  { id: 'norvegienne', name: 'Norvégienne', description: 'Tomate, mozzarella, crème, persillade, saumon fumé', price: 15.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'crème', 'persillade', 'saumon fumé'], image: '/images/pizzas/norvegienne.jpg' },
  { id: 'parma-roquette', name: 'La Parma Roquette', description: 'Tomate, mozzarella, basilic, jambon cru, tomates cerises, roquette, parmesan', price: 15.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'basilic', 'jambon cru', 'tomates cerises', 'roquette', 'parmesan'], image: '/images/pizzas/parma-roquette.jpg' },
  { id: '4-fromages', name: '4 Fromages', description: 'Tomate, mozzarella, chèvre, raclette, gorgonzola', price: 15.00, category: 'pizza', ingredients: ['tomate', 'mozzarella', 'chèvre', 'raclette', 'gorgonzola'], vegetarian: true, image: '/images/pizzas/4-fromages.jpg' },
  { id: 'pizza-nutella', name: 'Pizza Nutella', description: 'Pizza dessert au Nutella', price: 8.50, category: 'dessert', ingredients: ['pâte à pizza', 'nutella'], vegetarian: true, image: '/images/pizzas/pizza-nutella.jpg' }
];

export const BEVERAGES: Beverage[] = [
  // Softs - Bouteilles
  { id: 'coca-125l', name: 'Coca-Cola', size: '1,25 L', price: 3.50, category: 'soft', image: '/images/beverages/coca-125l.jpg' },
  { id: 'oasis-2l', name: 'Oasis Tropical', size: '2 L', price: 3.50, category: 'soft', image: '/images/beverages/oasis-2l.jpg' },
  // Softs - Canettes 33cL
  { id: 'coca-33cl', name: 'Coca-Cola', size: '33 cL', price: 2.00, category: 'soft', image: '/images/beverages/coca-33cl.jpg' },
  { id: 'coca-cherry-33cl', name: 'Coca Cherry', size: '33 cL', price: 2.00, category: 'soft', image: '/images/beverages/coca-cherry-33cl.jpg' },
  { id: 'fanta-orange-33cl', name: 'Fanta Orange', size: '33 cL', price: 2.00, category: 'soft', image: '/images/beverages/fanta-orange-33cl.jpg' },
  { id: 'fanta-passion-33cl', name: 'Fanta Passion', size: '33 cL', price: 2.00, category: 'soft', image: '/images/beverages/fanta-passion-33cl.jpg' },
  { id: 'fanta-mangue-33cl', name: 'Fanta Mangue-Fruit du Dragon', size: '33 cL', price: 2.00, category: 'soft', image: '/images/beverages/fanta-mangue-33cl.jpg' },
  { id: 'ice-tea-33cl', name: 'Ice Tea', size: '33 cL', price: 2.00, category: 'soft', image: '/images/beverages/ice-tea-33cl.jpg' },
  { id: 'oasis-tropical-33cl', name: 'Oasis Tropical', size: '33 cL', price: 2.00, category: 'soft', image: '/images/beverages/oasis-tropical-33cl.jpg' },
  // Eau
  { id: 'eau-50cl', name: 'Eau', size: '50 cL', price: 1.00, category: 'water', image: '/images/beverages/eau-50cl.jpg' },
  // Bières
  { id: 'heineken-33cl', name: 'Heineken', size: '33 cL', price: 3.00, category: 'beer', alcohol: true, image: '/images/beverages/heineken-33cl.jpg' },
  { id: 'desperados-33cl', name: 'Desperados', size: '33 cL', price: 3.50, category: 'beer', alcohol: true, image: '/images/beverages/desperados-33cl.jpg' }
];

export interface Specialty {
  id: string;
  name: string;
  description: string;
  price?: number;
  originalValue?: number;
  availability?: string[];
  service?: string[];
  note?: string;
  packaging?: number;
  image: string;
}

export const SPECIALTIES: Specialty[] = [
  {
    id: 'couscous',
    name: 'Couscous',
    description: 'Spécialité du weekend (vendredi-dimanche)',
    availability: ['friday', 'saturday', 'sunday'],
    service: ['sur place', 'à emporter'],
    note: 'Prix non publié - se renseigner',
    image: '/images/ingredients.jpg'
  },
  {
    id: 'tooGoodToGo',
    name: 'Panier Too Good To Go',
    price: 3.99,
    originalValue: 12.00,
    description: 'Panier surprise : pizzas, couscous, salades, desserts',
    packaging: 0.50,
    note: 'Emballage 0,50€ si oubli de contenant',
    image: '/images/pizza-margherita.jpg'
  },
  {
    id: 'pizza-artisanale',
    name: 'Pizza Artisanale du Chef',
    description: 'Création unique avec ingrédients de saison',
    price: 16.00,
    image: '/images/pizza-chef.jpg'
  },
  {
    id: 'calzone-special',
    name: 'Calzone Spécial Maison',
    description: 'Calzone farci aux spécialités italiennes',
    price: 14.50,
    image: '/images/pizza-oven.jpg'
  },
  {
    id: 'dessert-tiramisu',
    name: 'Tiramisu Maison',
    description: 'Recette traditionnelle italienne',
    price: 6.50,
    image: '/images/restaurant-interior.jpg'
  },
  {
    id: 'salade-fraicheur',
    name: 'Salade Fraîcheur',
    description: 'Salade composée avec produits frais du marché',
    price: 9.50,
    image: '/images/restaurant-exterior.jpg'
  }
];

// Utilitaires
export const getMenuByCategory = () => { return { pizzas: PIZZAS.filter(p => p.category === 'pizza'), calzones: PIZZAS.filter(p => p.category === 'calzone'), desserts: PIZZAS.filter(p => p.category === 'dessert'), beverages: BEVERAGES };
};

export const getPizzasByPriceRange = (min: number, max: number) => { return PIZZAS.filter(p => p.price >= min && p.price <= max);
};

export const getVegetarianPizzas = () => { return PIZZAS.filter(p => p.vegetarian === true);
};

export const getSpicyPizzas = () => { return PIZZAS.filter(p => p.spicy === true);
};