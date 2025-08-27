
"use client";

import React, { useState } from "react";
import { AllergenDisplay, MAJOR_ALLERGENS, type AllergenId } from '../AllergenDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Pizza, 
  Utensils, 
  Wine, 
  IceCream, 
  Coffee, 
  Star, 
  Euro, 
  Image as ImageIcon 
} from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'pizza' | 'entree' | 'main' | 'dessert' | 'drink' | 'other';
  subcategory?: string;
  ingredients: string[];
  allergens?: AllergenId[];
  traces?: AllergenId[];
  isAvailable: boolean;
  isFeatured: boolean;
  image?: string;
  preparationTime: number;
  spicyLevel?: 0 | 1 | 2 | 3;
}

const categoryConfig = {
  pizza: { label: "Pizza", icon: Pizza, color: "bg-red-100 text-red-800" },
  entree: { label: "Entrée", icon: Utensils, color: "bg-green-100 text-green-800" },
  main: { label: "Plat principal", icon: Utensils, color: "bg-blue-100 text-blue-800" },
  dessert: { label: "Dessert", icon: IceCream, color: "bg-pink-100 text-pink-800" },
  drink: { label: "Boisson", icon: Wine, color: "bg-purple-100 text-purple-800" },
  other: { label: "Autre", icon: Coffee, color: "bg-gray-100 text-gray-800" }
};

const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Royale",
    description: "Sauce tomate, mozzarella di bufala, basilic frais, huile d'olive extra vierge",
    price: 12,
    category: "pizza",
    subcategory: "Classiques",
    ingredients: ["Sauce tomate", "Mozzarella", "Basilic", "Huile d'olive"],
    allergens: ["lait", "gluten"],
    isAvailable: true,
    isFeatured: true,
    preparationTime: 15,
    spicyLevel: 0
  },
  {
    id: "2",
    name: "O'Miam Spéciale",
    description: "Sauce tomate, mozzarella, chorizo, champignons, poivrons, oignons",
    price: 15,
    category: "pizza",
    subcategory: "Spéciales",
    ingredients: ["Sauce tomate", "Mozzarella", "Chorizo", "Champignons", "Poivrons", "Oignons"],
    allergens: ["lait", "gluten"],
    isAvailable: true,
    isFeatured: true,
    preparationTime: 18,
    spicyLevel: 2
  },
  {
    id: "3",
    name: "4 Fromages",
    description: "Sauce tomate, mozzarella, gorgonzola, parmesan, chèvre",
    price: 14,
    category: "pizza",
    subcategory: "Classiques",
    ingredients: ["Sauce tomate", "Mozzarella", "Gorgonzola", "Parmesan", "Chèvre"],
    allergens: ["lait", "gluten"],
    isAvailable: true,
    isFeatured: false,
    preparationTime: 16,
    spicyLevel: 0
  },
  {
    id: "4",
    name: "Reine",
    description: "Sauce tomate, mozzarella, jambon, champignons",
    price: 13,
    category: "pizza",
    subcategory: "Classiques",
    ingredients: ["Sauce tomate", "Mozzarella", "Jambon", "Champignons"],
    allergens: ["lait", "gluten"],
    isAvailable: true,
    isFeatured: false,
    preparationTime: 15,
    spicyLevel: 0
  },
  {
    id: "5",
    name: "Coca-Cola",
    description: "Boisson gazeuse classique",
    price: 3,
    category: "drink",
    subcategory: "Sodas",
    ingredients: ["Eau gazéifiée", "Sucre", "Arôme naturel"],
    isAvailable: true,
    isFeatured: false,
    preparationTime: 0
  },
  {
    id: "6",
    name: "Tiramisu",
    description: "Dessert italien traditionnel au café et mascarpone",
    price: 6,
    category: "dessert",
    subcategory: "Classiques",
    ingredients: ["Mascarpone", "Café", "Biscuits", "Cacao"],
    allergens: ["lait", "oeufs", "gluten"],
    isAvailable: true,
    isFeatured: true,
    preparationTime: 5
  }
];

export function MenuManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Mock data - to be replaced with actual API calls
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Pizza Margherita', category: 'Pizzas', price: 12.50, available: true, description: 'Sauce tomate, mozzarella, basilic frais.', imageUrl: '/images/pizzas/margherita.jpg' },
    { id: '2', name: 'Pizza 4 Fromages', category: 'Pizzas', price: 15.00, available: true, description: 'Mozzarella, gorgonzola, chèvre, parmesan.', imageUrl: '/images/pizzas/4-fromages.jpg' },
    { id: '3', name: 'Pizza Reine', category: 'Pizzas', price: 14.00, available: true, description: 'Sauce tomate, mozzarella, jambon, champignons.', imageUrl: '/images/pizzas/reine.jpg' },
    { id: '4', name: 'Salade César', category: 'Salades', price: 10.50, available: true, description: 'Laitue romaine, poulet grillé, croûtons, parmesan.', imageUrl: '/images/salades/cesar.jpg' },
    { id: '5', name: 'Tiramisu', category: 'Desserts', price: 7.50, available: false, description: 'Le classique dessert italien.', imageUrl: '/images/desserts/tiramisu.jpg' },
    { id: '6', name: 'Coca-Cola', category: 'Boissons', price: 3.00, available: true, description: '33cl', imageUrl: '/images/boissons/coca.jpg' },
  ]);

  const filteredAndSortedItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

  const handleCreateItem = (itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `ITEM-${Date.now()}`
    };
    setMenuItems(prev => [...prev, newItem]);
    setIsCreateOpen(false);
  };

  const handleUpdateItem = (itemId: string, updatedData: Partial<MenuItem>) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updatedData } : item
    ));
    setIsEditOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      setMenuItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const toggleAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  const toggleFeatured = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isFeatured: !item.isFeatured } : item
    ));
  };

  const MenuItemForm = ({ item, onSubmit, onCancel }: {
    item?: MenuItem;
    onSubmit: (data: Omit<MenuItem, 'id'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || 0,
      category: item?.category || "pizza",
      subcategory: item?.subcategory || "",
      ingredients: item?.ingredients.join(", ") || "",
      allergens: item?.allergens?.join(", ") || "",
      isAvailable: item?.isAvailable ?? true,
      isFeatured: item?.isFeatured ?? false,
      preparationTime: item?.preparationTime || 0,
      spicyLevel: item?.spicyLevel || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit({
        ...formData,
        ingredients: formData.ingredients.split(",").map(i => i.trim()).filter(i => i),
        allergens: formData.allergens ? 
          formData.allergens.split(",").map(a => a.trim()).filter(a => a)
            .filter((a): a is AllergenId => Object.keys(MAJOR_ALLERGENS).includes(a as AllergenId)) : 
          undefined,
        spicyLevel: formData.spicyLevel as 0 | 1 | 2 | 3 | undefined
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Prix (€) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Catégorie *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="subcategory">Sous-catégorie</Label>
            <Input
              id="subcategory"
              value={formData.subcategory}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="ingredients">Ingrédients (séparés par des virgules)</Label>
          <Textarea
            id="ingredients"
            value={formData.ingredients}
            onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
          />
        </div>

        <div>
          <Label htmlFor="allergens">Allergènes (séparés par des virgules)</Label>
          <Textarea
            id="allergens"
            value={formData.allergens}
            onChange={(e) => setFormData(prev => ({ ...prev, allergens: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preparationTime">Temps de préparation (minutes)</Label>
            <Input
              id="preparationTime"
              type="number"
              value={formData.preparationTime}
              onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="spicyLevel">Niveau de piquant</Label>
            <Select value={formData.spicyLevel.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, spicyLevel: parseInt(value) as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Aucun</SelectItem>
                <SelectItem value="1">Léger</SelectItem>
                <SelectItem value="2">Moyen</SelectItem>
                <SelectItem value="3">Fort</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
            />
            Disponible
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
            />
            En vedette
          </label>
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            {item ? "Mettre à jour" : "Créer"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6" data-id="menu-management">
      {/* En-tête et actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600">Gestion du menu</h2>
          <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des articles du menu</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
              data-id="search-menu-items"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40" data-id="filter-category">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button data-id="add-menu-item">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouvel article</DialogTitle>
                <DialogDescription>
                  Créez un nouvel article pour le menu
                </DialogDescription>
              </DialogHeader>
              <MenuItemForm
                onSubmit={handleCreateItem}
                onCancel={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {menuItems.length}
              </div>
              <div className="text-sm text-muted-foreground">Articles totaux</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {menuItems.filter(i => i.isAvailable).length}
              </div>
              <div className="text-sm text-muted-foreground">Disponibles</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {menuItems.filter(i => i.isFeatured).length}
              </div>
              <div className="text-sm text-muted-foreground">En vedette</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {menuItems.filter(i => i.category === 'pizza').length}
              </div>
              <div className="text-sm text-muted-foreground">Pizzas</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des articles */}
      <div className="grid gap-4">
        {filteredItems.map((item) => {
          const category = categoryConfig[item.category];
          const CategoryIcon = category.icon;
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CategoryIcon className="h-5 w-5 text-red-600" />
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <Badge className={category.color}>
                        {category.label}
                      </Badge>
                      {item.subcategory && (
                        <Badge variant="outline">{item.subcategory}</Badge>
                      )}
                      {item.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Vedette
                        </Badge>
                      )}
                      {!item.isAvailable && (
                        <Badge variant="destructive">Indisponible</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Euro className="h-4 w-4" />
                        <span className="font-medium">{item.price}€</span>
                      </div>
                      {item.preparationTime > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Préparation:</span>
                          <span>{item.preparationTime} min</span>
                        </div>
                      )}
                      {item.spicyLevel !== undefined && item.spicyLevel > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Piquant:</span>
                          <span>{"🌶️".repeat(item.spicyLevel)}</span>
                        </div>
                      )}
                    </div>
                    {item.ingredients.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">Ingrédients: </span>
                        <span className="text-sm">{item.ingredients.join(", ")}</span>
                      </div>
                    )}
                    {(item.allergens && item.allergens.length > 0) || (item.traces && item.traces.length > 0) ? (
                      <div className="mt-2">
                        <AllergenDisplay
                          allergens={item.allergens || []}
                          traces={item.traces || []}
                          variant="default"
                          showWarning={false}
                        />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailability(item.id)}
                    >
                      {item.isAvailable ? "Masquer" : "Afficher"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog d'édition */}
      {selectedItem && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'article</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'article
              </DialogDescription>
            </DialogHeader>
            <MenuItemForm
              item={selectedItem}
              onSubmit={(data) => handleUpdateItem(selectedItem.id, data)}
              onCancel={() => setIsEditOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}