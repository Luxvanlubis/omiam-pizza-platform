"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { ReviewSystem } from "@/components/reviews/ReviewSystem";
import { useCartStore } from "@/store/cart-store";
import { getMenuByCategory } from "@/config/menu";
import {
  Pizza,
  Crown,
  Sparkles,
  ChefHat,
  Heart,
  Leaf,
  Flame,
  Clock,
  Award,
  Star,
  Eye,
  MessageCircle,
  Settings,
  Search,
  Filter,
  SlidersHorizontal,
  TrendingUp,
  Zap,
  Shield,
  Users,
  ThumbsUp,
  ChevronDown,
  X,
  Plus,
  Minus
} from "lucide-react";

const convertPizzaToMenuItem = (pizza: any) => ({
  name: pizza.name,
  description: pizza.description,
  price: `${pizza.price.toFixed(2)}€`,
  image: pizza.image || "/images/pizza-margherita.jpg",
  badge: pizza.price >= 15 ? "Premium" : pizza.price >= 13 ? "Signature" : "",
  isPopular: pizza.name.includes("Margherita") || pizza.name.includes("Regina"),
  ingredients: pizza.ingredients || ["Tomate", "Mozzarella"],
  preparationTime: "12-15 min"
});

const convertBeverageToMenuItem = (beverage: any) => ({
  name: `${beverage.name} ${beverage.size}`,
  description: `Boisson ${beverage.category === 'beer' ? 'alcoolisée' : 'rafraîchissante'}`,
  price: `${beverage.price.toFixed(2)}€`,
  image: beverage.image || "/images/pizza-margherita.jpg",
  badge: beverage.alcohol ? "Alcool" : "",
  isPopular: beverage.name.includes("Coca") || beverage.name.includes("Eau"),
  ingredients: [beverage.name],
  preparationTime: "Immédiat"
});

const menuData = getMenuByCategory();

const menuCategories = [
  {
    id: "pizzas-10-12",
    name: "Classiques",
    fullName: "Pizzas Classiques (10€-12€)",
    icon: <Pizza className="h-5 w-5" />,
    description: "Les incontournables à prix doux",
    items: menuData.pizzas.filter(p => p.price >= 10 && p.price <= 12).map(convertPizzaToMenuItem)
  },
  {
    id: "pizzas-13-14",
    name: "Gourmandes",
    fullName: "Pizzas Gourmandes (13€-14€)",
    icon: <Crown className="h-5 w-5" />,
    description: "Nos spécialités savoureuses",
    items: menuData.pizzas.filter(p => p.price >= 13 && p.price <= 14).map(convertPizzaToMenuItem)
  },
  {
    id: "pizzas-15",
    name: "Premium",
    fullName: "Pizzas Premium (15€)",
    icon: <Sparkles className="h-5 w-5" />,
    description: "Les créations raffinées d'O'Miam",
    items: menuData.pizzas.filter(p => p.price === 15).map(convertPizzaToMenuItem)
  },
  {
    id: "calzones",
    name: "Calzones",
    fullName: "Calzones",
    icon: <ChefHat className="h-5 w-5" />,
    description: "Nos pizzas pliées et dorées au four",
    items: menuData.calzones.map(convertPizzaToMenuItem)
  },
  {
    id: "desserts",
    name: "Desserts",
    fullName: "Desserts",
    icon: <Heart className="h-5 w-5" />,
    description: "Pour finir en douceur",
    items: menuData.desserts.map(convertPizzaToMenuItem)
  },
  {
    id: "drinks",
    name: "Boissons",
    fullName: "Boissons",
    icon: <Leaf className="h-5 w-5" />,
    description: "Boissons rafraîchissantes et bières pour accompagner votre repas",
    items: menuData.beverages.map(convertBeverageToMenuItem)
  }
];

export default function EnhancedMenuPage() {
  const { addItem } = useCartStore();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("pizzas-10-12");
  
  // États pour les filtres avancés
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState([0, 20]);
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showVegetarian, setShowVegetarian] = useState(false);
  const [showPopular, setShowPopular] = useState(false);
  const [animatedItems, setAnimatedItems] = useState<Set<string>>(new Set());
  
  // Animation des éléments au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentCategory = menuCategories.find(cat => cat.id === selectedCategory);
      if (currentCategory) {
        const itemNames = new Set(currentCategory.items.map(item => item.name));
        setAnimatedItems(itemNames);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  // Fonction de filtrage et tri avancé
  const filteredAndSortedItems = useMemo(() => {
    const currentCategory = menuCategories.find(cat => cat.id === selectedCategory);
    if (!currentCategory) return [];
    
    let items = [...currentCategory.items];
    
    // Filtrage par recherche
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filtrage par prix
    items = items.filter(item => {
      const price = parseFloat(item.price.replace('€', ''));
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Filtrage par ingrédients sélectionnés
    if (selectedIngredients.length > 0) {
      items = items.filter(item => 
        selectedIngredients.every(ingredient => 
          item.ingredients.some(ing => ing.toLowerCase().includes(ingredient.toLowerCase()))
        )
      );
    }
    
    // Filtrage végétarien
    if (showVegetarian) {
      items = items.filter(item => 
        !item.ingredients.some(ing => 
          ['jambon', 'chorizo', 'saucisse', 'bacon', 'anchois', 'thon'].includes(ing.toLowerCase())
        )
      );
    }
    
    // Filtrage populaire
    if (showPopular) {
      items = items.filter(item => item.isPopular);
    }
    
    // Tri
    switch (sortBy) {
      case 'price-asc':
        items.sort((a, b) => parseFloat(a.price.replace('€', '')) - parseFloat(b.price.replace('€', '')));
        break;
      case 'price-desc':
        items.sort((a, b) => parseFloat(b.price.replace('€', '')) - parseFloat(a.price.replace('€', '')));
        break;
      case 'name':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popularity':
      default:
        items.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
        break;
    }
    
    return items;
  }, [selectedCategory, searchTerm, priceRange, sortBy, selectedIngredients, showVegetarian, showPopular]);
  
  // Obtenir tous les ingrédients uniques pour les filtres
  const allIngredients = useMemo(() => {
    const ingredients = new Set<string>();
    menuCategories.forEach(category => {
      category.items.forEach(item => {
        item.ingredients.forEach(ingredient => ingredients.add(ingredient));
      });
    });
    return Array.from(ingredients).sort();
  }, []);

  const addToCart = (item: any) => {
    addItem({
      id: item.name.toLowerCase().replace(/\s+/g, '-'),
      name: item.name,
      price: parseFloat(item.price.replace('€', '')),
      description: item.description,
    });
  };

  const handleCustomize = (item: any) => {
    const productId = item.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/customize/${productId}`);
  };

  const isPizza = (categoryId: string) => {
    return ['pizzas-10-12', 'pizzas-13-14', 'pizzas-15'].includes(categoryId);
  };
  
  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient) 
        ? prev.filter(ing => ing !== ingredient)
        : [...prev, ingredient]
    );
  };
  
  const clearAllFilters = () => {
    setSearchTerm("");
    setPriceRange([0, 20]);
    setSortBy("popularity");
    setSelectedIngredients([]);
    setShowVegetarian(false);
    setShowPopular(false);
  };

  return (
    <div className="min-h-screen bg-background">
      
      {/* Menu Hero Section Premium */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-40 h-40 bg-red-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        
        <div className="absolute inset-0">
          <Image 
            src="/images/restaurant-interior.jpg" 
            alt="Restaurant interior" 
            fill 
            style={{ objectFit: 'cover' }} 
            className="opacity-20" 
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <div className="flex items-center justify-center gap-4 mb-8">
            <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white border-0 px-6 py-3 text-lg font-bold">
              <ChefHat className="h-5 w-5 mr-2" />
              Menu Artisanal Premium
            </Badge>
            <Badge className="bg-gradient-to-r from-green-400 to-blue-400 text-white border-0 px-4 py-2">
              <TrendingUp className="h-4 w-4 mr-2" />
              IA Recommandations
            </Badge>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400">
            Notre Menu
          </h1>
          
          <p className="text-2xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed">
            Découvrez nos créations artisanales préparées avec passion et des ingrédients d'exception, 
            cuites dans notre four à bois traditionnel. Une expérience culinaire révolutionnaire.
          </p>
          
          {/* Stats Premium */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-orange-400 mb-2">50+</div>
              <div className="text-sm text-white/80">Créations Uniques</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-red-400 mb-2">485°C</div>
              <div className="text-sm text-white/80">Four à Bois</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-yellow-400 mb-2">90s</div>
              <div className="text-sm text-white/80">Cuisson Express</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-sm text-white/80">Ingrédients Bio</div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-6 py-3 text-lg">
              <Flame className="h-5 w-5 mr-2" />
              Four à bois traditionnel
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-6 py-3 text-lg">
              <Leaf className="h-5 w-5 mr-2" />
              Ingrédients premium
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-6 py-3 text-lg">
              <Zap className="h-5 w-5 mr-2" />
              IA Personnalisée
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-6 py-3 text-lg">
              <Shield className="h-5 w-5 mr-2" />
              Qualité garantie
            </Badge>
          </div>
        </div>
      </section>
      
      {/* Barre de Recherche et Filtres Premium */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Rechercher une pizza, ingrédient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-lg border-2 border-gray-200 focus:border-orange-500 rounded-xl"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Tri */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 border-2 border-gray-200 focus:border-orange-500 rounded-xl">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">🔥 Popularité</SelectItem>
                <SelectItem value="price-asc">💰 Prix croissant</SelectItem>
                <SelectItem value="price-desc">💎 Prix décroissant</SelectItem>
                <SelectItem value="name">🔤 Nom A-Z</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filtres rapides */}
            <div className="flex gap-3">
              <Button
                variant={showPopular ? "default" : "outline"}
                onClick={() => setShowPopular(!showPopular)}
                className={`rounded-xl ${showPopular ? 'bg-orange-500 hover:bg-orange-600' : 'border-2 border-gray-200 hover:border-orange-500'}`}
              >
                <Star className="h-4 w-4 mr-2" />
                Populaires
              </Button>
              
              <Button
                variant={showVegetarian ? "default" : "outline"}
                onClick={() => setShowVegetarian(!showVegetarian)}
                className={`rounded-xl ${showVegetarian ? 'bg-green-500 hover:bg-green-600' : 'border-2 border-gray-200 hover:border-green-500'}`}
              >
                <Leaf className="h-4 w-4 mr-2" />
                Végétarien
              </Button>
            </div>
            
            {/* Bouton Filtres Avancés */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-2 border-gray-200 hover:border-purple-500 rounded-xl"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtres
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Bouton Reset */}
            {(searchTerm || showPopular || showVegetarian || selectedIngredients.length > 0) && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
          
          {/* Panneau de Filtres Avancés */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Filtre Prix */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💰 Fourchette de prix: {priceRange[0]}€ - {priceRange[1]}€
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={20}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                {/* Filtre Ingrédients */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    🧄 Ingrédients ({selectedIngredients.length} sélectionnés)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allIngredients.slice(0, 20).map((ingredient) => (
                      <Button
                        key={ingredient}
                        variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleIngredient(ingredient)}
                        className={`text-xs rounded-full ${
                          selectedIngredients.includes(ingredient)
                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                            : 'border border-gray-300 hover:border-orange-500'
                        }`}
                      >
                        {selectedIngredients.includes(ingredient) ? (
                          <Minus className="h-3 w-3 mr-1" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        {ingredient}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Résultats */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              <span className="font-semibold text-orange-600">{filteredAndSortedItems.length}</span> résultats trouvés
              {searchTerm && (
                <span className="ml-2">pour "<span className="font-semibold">{searchTerm}</span>"</span>
              )}
            </div>
            
            {/* Filtres actifs */}
            {(selectedIngredients.length > 0 || showVegetarian || showPopular) && (
              <div className="flex items-center gap-2">
                <span className="text-xs">Filtres actifs:</span>
                {showPopular && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="h-3 w-3 mr-1" />Populaires
                  </Badge>
                )}
                {showVegetarian && (
                  <Badge variant="secondary" className="text-xs">
                    <Leaf className="h-3 w-3 mr-1" />Végétarien
                  </Badge>
                )}
                {selectedIngredients.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{selectedIngredients.length} ingrédients
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Menu Content */}
      <main className="container mx-auto px-4 py-16">
        {/* Category Navigation Premium */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Explorez Nos Catégories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chaque création est un voyage culinaire unique, préparée avec passion et expertise.
            </p>
          </div>
          
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-transparent p-0 h-auto">
              {menuCategories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 data-[state=active]:border-orange-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-2xl p-6 h-24 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="text-red-600 group-data-[state=active]:text-white mb-2">{category.icon}</div>
                    <span className="text-sm font-semibold text-center leading-tight">{category.name}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {menuCategories.map((category) => (
              <TabsContent key={category.id} value={category.id} className="mt-16">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white">
                      {category.icon}
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900">{category.fullName}</h2>
                  </div>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    {category.description}
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <Badge className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-2 text-sm">
                      {filteredAndSortedItems.length} produits disponibles
                    </Badge>
                    <Badge className="bg-gradient-to-r from-green-400 to-blue-400 text-white px-4 py-2 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Préparation rapide
                    </Badge>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredAndSortedItems.map((item, index) => (
                    <div key={index} className="menu-item-enhanced relative group">
                      {item.badge && (
                        <Badge className={`absolute top-4 right-4 z-10 ${
                          item.badge === "Best Seller" ? "bg-red-600 text-white" :
                          item.badge === "Premium" ? "bg-purple-600 text-white" :
                          item.badge === "Signature" ? "bg-orange-600 text-white" :
                          "bg-blue-600 text-white"
                        }`}>
                          {item.badge}
                        </Badge>
                      )}
                      
                      {item.isPopular && (
                        <div className="absolute top-4 left-4 z-10">
                          <div className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
                            <Star className="h-4 w-4 fill-current" />
                            Populaire
                          </div>
                        </div>
                      )}
                      
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden mb-6">
                        <Image 
                          src={item.image} 
                          alt={item.name} 
                          fill 
                          style={{ objectFit: 'cover' }} 
                          className="group-hover:scale-110 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Preparation Time */}
                        <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {item.preparationTime}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-red-800 mb-2">{item.name}</h3>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                            {item.description}
                          </p>
                          
                          {/* Ingredients */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            {item.ingredients.map((ingredient, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {ingredient}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-red-600">{item.price}</span>
                            {item.badge === "Premium" && (
                              <span className="text-xs text-muted-foreground ml-2">Premium</span>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => addToCart(item)}
                              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                            
                            {/* Bouton Voir les Avis */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Avis clients - {item.name}</DialogTitle>
                                  <DialogDescription>
                                    Découvrez ce que nos clients pensent de ce produit
                                  </DialogDescription>
                                </DialogHeader>
                                <ReviewSystem 
                                  productId={item.name.toLowerCase().replace(/\s+/g, '-')} 
                                  productName={item.name} 
                                />
                              </DialogContent>
                            </Dialog>
                            
                            {/* Bouton Laisser un Avis */}
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white"
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Laisser un avis - {item.name}</DialogTitle>
                                  <DialogDescription>
                                    Partagez votre expérience avec ce produit
                                  </DialogDescription>
                                </DialogHeader>
                                <ReviewSystem 
                                  productId={item.name.toLowerCase().replace(/\s+/g, '-')} 
                                  productName={item.name} 
                                  showOnlyForm={true} 
                                />
                              </DialogContent>
                            </Dialog>
                            
                            {/* Bouton Personnaliser (uniquement pour les pizzas) */}
                            {isPizza(selectedCategory) && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleCustomize(item)}
                                className="border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white"
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                            
                            <Button 
                              onClick={() => addToCart(item)} 
                              className="btn-primary"
                            >
                              <Pizza className="h-4 w-4 mr-2" />
                              Ajouter
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
        
        {/* Section Statistiques Premium */}
        <div className="mt-20 bg-gradient-to-r from-gray-900 via-red-900 to-orange-900 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold mb-4">Excellence Culinaire en Chiffres</h3>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Notre engagement qualité se reflète dans chaque création
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-400 mb-2">15,000+</div>
                <div className="text-white/80">Pizzas Servies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400 mb-2">4.9/5</div>
                <div className="text-white/80">Note Moyenne</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-2">98%</div>
                <div className="text-white/80">Clients Satisfaits</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-2">12min</div>
                <div className="text-white/80">Temps Moyen</div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-500 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold">Communauté Active</h4>
                </div>
                <p className="text-white/80">Plus de 5,000 clients fidèles nous font confiance chaque mois</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <ThumbsUp className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold">Avis Positifs</h4>
                </div>
                <p className="text-white/80">96% de nos clients recommandent O'Miam à leurs proches</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold">Récompenses</h4>
                </div>
                <p className="text-white/80">Élu "Meilleure Pizzeria" 3 années consécutives</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Menu Info Section */}
        <div className="mt-20 bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-12 shadow-2xl border border-orange-100">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="heading-secondary mb-6">Informations Importantes</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Flame className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Cuisson au Four à Bois</h4>
                    <p className="text-muted-foreground">
                      Nos pizzas sont cuites à 485°C dans notre four à bois traditionnel, garantissant une croûte parfaite et des saveurs authentiques.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Ingrédients Frais</h4>
                    <p className="text-muted-foreground">
                      Nous utilisons uniquement des produits frais et de saison, sélectionnés auprès de producteurs locaux et partenaires italiens.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">Qualité Garantie</h4>
                    <p className="text-muted-foreground">
                      Chaque pizza est préparée sur commande et servie brûlante, pour garantir une expérience culinaire exceptionnelle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h4 className="text-xl font-semibold text-red-800 mb-6">Allergènes & Régimes</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-red-700 mb-2">Allergènes principaux :</h5>
                  <p className="text-sm text-muted-foreground">
                    Gluten • Produits laitiers • Fruits à coque • Œufs
                  </p>
                </div>
                
                <div>
                  <h5 className="font-medium text-red-700 mb-2">Options disponibles :</h5>
                  <p className="text-sm text-muted-foreground">
                    • Pâte sans gluten (supplément 2€)<br/>
                    • Option végétarienne sur demande<br/>
                    • Contrôle des allergènes sur demande
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Important :</strong> Notre cuisine utilise des farines, des produits laitiers et des fruits à coque. Si vous avez des allergies sévères, veuillez en informer notre personnel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}