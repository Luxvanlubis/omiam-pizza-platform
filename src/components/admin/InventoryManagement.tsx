'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Search, Plus, Package, Edit } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  cost: number;
  supplier: string;
  lastUpdated: Date;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
}

interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  date: Date;
  userId: string;
}

export default function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: '',
    cost: 0,
    supplier: ''
  });

  const [newMovement, setNewMovement] = useState({
    itemId: '',
    type: 'in' as 'in' | 'out' | 'adjustment',
    quantity: 0,
    reason: '',
    reference: ''
  });

  // Charger les données
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setIsLoading(true);
    try {
      // Simuler le chargement des données
      const mockItems: InventoryItem[] = [
        {
          id: '1',
          name: 'Farine type 00',
          category: 'Ingrédients',
          currentStock: 25,
          minStock: 10,
          maxStock: 50,
          unit: 'kg',
          cost: 1.2,
          supplier: 'Fournisseur A',
          lastUpdated: new Date(),
          status: 'in_stock'
        },
        {
          id: '2',
          name: 'Mozzarella',
          category: 'Fromages',
          currentStock: 5,
          minStock: 8,
          maxStock: 30,
          unit: 'kg',
          cost: 8.5,
          supplier: 'Fournisseur B',
          lastUpdated: new Date(),
          status: 'low_stock'
        }
      ];
      setItems(mockItems);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données d'inventaire",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadInventoryData();
  };

  const handleAddItem = async () => {
    try {
      const item: InventoryItem = {
        id: Date.now().toString(),
        ...newItem,
        lastUpdated: new Date(),
        status: newItem.currentStock <= newItem.minStock ? 'low_stock' : 'in_stock'
      };
      setItems(prev => [...prev, item]);
      setShowAddDialog(false);
      setNewItem({
        name: '',
        category: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unit: '',
        cost: 0,
        supplier: ''
      });
      toast({
        title: "Succès",
        description: "Article ajouté avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article",
        variant: "destructive"
      });
    }
  };

  const handleSaveMovement = async () => {
    try {
      const movement: StockMovement = {
        id: Date.now().toString(),
        ...newMovement,
        date: new Date(),
        userId: 'current-user'
      };
      setMovements(prev => [...prev, movement]);

      // Mettre à jour le stock de l'article
      setItems(prev => prev.map(item => {
        if (item.id === newMovement.itemId) {
          let newStock = item.currentStock;
          if (newMovement.type === 'in') {
            newStock += newMovement.quantity;
          } else if (newMovement.type === 'out') {
            newStock -= newMovement.quantity;
          } else {
            newStock = newMovement.quantity;
          }
          return {
            ...item,
            currentStock: Math.max(0, newStock),
            lastUpdated: new Date(),
            status: newStock <= item.minStock ? 'low_stock' :
                   newStock === 0 ? 'out_of_stock' :
                   newStock > item.maxStock ? 'overstocked' : 'in_stock'
          };
        }
        return item;
      }));

      setShowMovementDialog(false);
      setNewMovement({
        itemId: '',
        type: 'in',
        quantity: 0,
        reason: '',
        reference: ''
      });
      toast({
        title: "Succès",
        description: "Mouvement de stock enregistré"
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le mouvement",
        variant: "destructive"
      });
    }
  };

  // Filtrage et tri
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof InventoryItem];
      let bValue: any = b[sortBy as keyof InventoryItem];
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getStatusBadge = (status: string) => {
    const variants = {
      in_stock: 'default',
      low_stock: 'secondary',
      out_of_stock: 'destructive',
      overstocked: 'outline'
    };
    const labels = {
      in_stock: 'En stock',
      low_stock: 'Stock faible',
      out_of_stock: 'Rupture',
      overstocked: 'Surstock'
    };
    return (
      <Badge variant={variants[status as keyof typeof variants] as any}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6" data-id="inventory-management">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Stocks</h1>
          <p className="text-muted-foreground">
            Gérez votre inventaire et suivez les mouvements de stock
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              <SelectItem value="Pizzas">Pizzas</SelectItem>
              <SelectItem value="Ingrédients">Ingrédients</SelectItem>
              <SelectItem value="Fromages">Fromages</SelectItem>
              <SelectItem value="Sauces">Sauces</SelectItem>
              <SelectItem value="Charcuterie">Charcuterie</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Article
          </Button>
          <Button variant="outline" onClick={() => setShowMovementDialog(true)}>
            <Package className="h-4 w-4 mr-2" />
            Mouvement Stock
          </Button>
        </div>
      </div>

      {/* Grille des articles */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {getStatusBadge(item.status)}
              </div>
              <p className="text-sm text-muted-foreground">{item.category}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Stock actuel:</span>
                  <span className="font-bold">{item.currentStock} {item.unit}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span>Min: {item.minStock}</span>
                  <span>Max: {item.maxStock}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all",
                      item.status === 'low_stock' ? 'bg-yellow-500' :
                      item.status === 'out_of_stock' ? 'bg-red-500' :
                      item.status === 'overstocked' ? 'bg-orange-500' : 'bg-green-500'
                    )}
                    style={{
                      width: `${Math.min(100, (item.currentStock / item.maxStock) * 100)}%`
                    }}
                  />
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Coût: {item.cost}€/{item.unit}</span>
                  <span>{item.supplier}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-3 w-3 mr-1" />
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline">
                    <Package className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Ajouter Article */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'article</Label>
              <Input
                id="name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Farine type 00"
              />
            </div>
            <div>
              <Label htmlFor="category">Catégorie</Label>
              <Select
                value={newItem.category}
                onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ingrédients">Ingrédients</SelectItem>
                  <SelectItem value="Fromages">Fromages</SelectItem>
                  <SelectItem value="Sauces">Sauces</SelectItem>
                  <SelectItem value="Charcuterie">Charcuterie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentStock">Stock actuel</Label>
                <Input
                  id="currentStock"
                  type="number"
                  value={newItem.currentStock}
                  onChange={(e) => setNewItem(prev => ({ ...prev, currentStock: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unité</Label>
                <Input
                  id="unit"
                  value={newItem.unit}
                  onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                  placeholder="kg, L, pièce..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minStock">Stock minimum</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="maxStock">Stock maximum</Label>
                <Input
                  id="maxStock"
                  type="number"
                  value={newItem.maxStock}
                  onChange={(e) => setNewItem(prev => ({ ...prev, maxStock: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost">Coût unitaire (€)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={newItem.cost}
                  onChange={(e) => setNewItem(prev => ({ ...prev, cost: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="supplier">Fournisseur</Label>
                <Input
                  id="supplier"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddItem}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Mouvement de Stock */}
      <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mouvement de Stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="movementType">Type de mouvement</Label>
              <Select
                value={newMovement.type}
                onValueChange={(value: 'in' | 'out' | 'adjustment') => setNewMovement(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Entrée</SelectItem>
                  <SelectItem value="out">Sortie</SelectItem>
                  <SelectItem value="adjustment">Ajustement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="itemSelect">Article</Label>
              <Select
                value={newMovement.itemId}
                onValueChange={(value) => setNewMovement(prev => ({ ...prev, itemId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un article" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.currentStock} {item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                value={newMovement.quantity}
                onChange={(e) => setNewMovement(prev => ({ ...prev, quantity: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="reason">Raison</Label>
              <Textarea
                id="reason"
                value={newMovement.reason}
                onChange={(e) => setNewMovement(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Motif du mouvement..."
              />
            </div>
            <div>
              <Label htmlFor="reference">Référence (optionnel)</Label>
              <Input
                id="reference"
                value={newMovement.reference}
                onChange={(e) => setNewMovement(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Bon de livraison, commande..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMovementDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveMovement}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}