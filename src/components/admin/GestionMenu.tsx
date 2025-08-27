"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pizza, Plus, Edit, Trash2, Image as ImageIcon, Clock, DollarSign } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparationTime: number;
  image?: string;
  available: boolean;
  allergens: string[];
  ingredients: string[];
}

const categories = ["Pizzas", "Entrées", "Salades", "Boissons", "Desserts", "Menus"];

export function GestionMenu() {
  const [items, setItems] = useState<MenuItem[]>([
    {
      id: "1",
      name: "Margherita Royale",
      description: "Tomate, mozzarella, basilic frais",
      price: 12,
      category: "Pizzas",
      preparationTime: 15,
      available: true,
      allergens: ["Gluten", "Lactose"],
      ingredients: ["Tomate", "Mozzarella", "Basilic"]
    },
    {
      id: "2",
      name: "O'Miam Spéciale",
      description: "Tomate, mozzarella, jambon, champignons, olives",
      price: 15,
      category: "Pizzas",
      preparationTime: 18,
      available: true,
      allergens: ["Gluten", "Lactose"],
      ingredients: ["Tomate", "Mozzarella", "Jambon", "Champignons", "Olives"]
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "Pizzas",
    preparationTime: 15,
    available: true,
    allergens: [],
    ingredients: []
  });

  const handleSubmit = () => {
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...item, ...formData } as MenuItem : item
      ));
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        name: formData.name || "",
        description: formData.description || "",
        price: formData.price || 0,
        category: formData.category || "Pizzas",
        preparationTime: formData.preparationTime || 15,
        available: formData.available ?? true,
        allergens: formData.allergens || [],
        ingredients: formData.ingredients || []
      };
      setItems([...items, newItem]);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      category: "Pizzas",
      preparationTime: 15,
      available: true,
      allergens: [],
      ingredients: []
    });
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleAvailability = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, available: !item.available } : item
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Pizza className="h-6 w-6" />
            Gestion du Menu
          </h2>
          <p className="text-muted-foreground">Gérez votre carte de pizzas et autres produits</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un produit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produits du menu</CardTitle>
          <CardDescription>
            Liste complète des produits disponibles à la vente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Temps prép.</TableHead>
                <TableHead>Disponible</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>{item.price}€</TableCell>
                  <TableCell>{item.preparationTime}min</TableCell>
                  <TableCell>
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => toggleAvailability(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier le produit" : "Ajouter un produit"}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Modifiez les informations du produit existant"
                : "Créez un nouveau produit pour votre menu"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Margherita Royale"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category || "Pizzas"}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description détaillée du produit..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Prix (€)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.1"
                  value={formData.price || ""}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  placeholder="12.50"
                />
              </div>
              
              <div>
                <Label htmlFor="preparationTime">Temps de préparation (min)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  value={formData.preparationTime || ""}
                  onChange={(e) => setFormData({ ...formData, preparationTime: parseInt(e.target.value) })}
                  placeholder="15"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor="available">Disponible</Label>
                <Switch
                  id="available"
                  checked={formData.available ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ingredients">Ingrédients</Label>
              <Textarea
                id="ingredients"
                value={(formData.ingredients || []).join(", ")}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ingredients: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                })}
                placeholder="Tomate, Mozzarella, Basilic, ..."
              />
            </div>

            <div>
              <Label htmlFor="allergens">Allergènes</Label>
              <Textarea
                id="allergens"
                value={(formData.allergens || []).join(", ")}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  allergens: e.target.value.split(",").map(s => s.trim()).filter(s => s) 
                })}
                placeholder="Gluten, Lactose, ..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? "Mettre à jour" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}