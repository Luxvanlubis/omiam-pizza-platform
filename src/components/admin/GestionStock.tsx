"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Package, Plus, Edit, Trash2, AlertTriangle, TrendingUp, TrendingDown, Archive } from "lucide-react";

interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  expiryDate: string;
  status: "sufficient" | "low" | "out" | "expired";
}

interface StockAlert {
  id: string;
  type: "low_stock" | "expired" | "expiring_soon";
  message: string;
  item: string;
  severity: "warning" | "critical";
}

const categories = [
  "Fromages",
  "Charcuterie",
  "Légumes",
  "Pâtes à pizza",
  "Sauces",
  "Épices",
  "Boissons",
  "Emballages"
];

export function GestionStock() {
  const [items, setItems] = useState<StockItem[]>([
    {
      id: "1",
      name: "Mozzarella di bufala",
      category: "Fromages",
      quantity: 25,
      minQuantity: 20,
      unit: "kg",
      costPerUnit: 12.50,
      supplier: "Fromagerie Dupont",
      lastRestocked: "2024-01-10",
      expiryDate: "2024-01-25",
      status: "sufficient"
    },
    {
      id: "2",
      name: "Tomates San Marzano",
      category: "Sauces",
      quantity: 8,
      minQuantity: 15,
      unit: "kg",
      costPerUnit: 3.20,
      supplier: "Primeur Bio",
      lastRestocked: "2024-01-08",
      expiryDate: "2024-01-20",
      status: "low"
    },
    {
      id: "3",
      name: "Jambon de Parme",
      category: "Charcuterie",
      quantity: 0,
      minQuantity: 5,
      unit: "kg",
      costPerUnit: 18.00,
      supplier: "Charcuterie Italienne",
      lastRestocked: "2024-01-05",
      expiryDate: "2024-01-22",
      status: "out"
    }
  ]);

  const [alerts] = useState<StockAlert[]>([
    {
      id: "1",
      type: "low_stock",
      message: "Stock bas : Tomates San Marzano",
      item: "Tomates San Marzano",
      severity: "warning"
    },
    {
      id: "2",
      type: "out",
      message: "Stock épuisé : Jambon de Parme",
      item: "Jambon de Parme",
      severity: "critical"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState<Partial<StockItem>>({
    name: "",
    category: "Fromages",
    quantity: 0,
    minQuantity: 10,
    unit: "kg",
    costPerUnit: 0,
    supplier: "",
    expiryDate: ""
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sufficient": return "text-green-600 bg-green-100";
      case "low": return "text-orange-600 bg-orange-100";
      case "out": return "text-red-600 bg-red-100";
      case "expired": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStockLevel = (item: StockItem) => {
    const percentage = (item.quantity / item.minQuantity) * 100;
    if (item.quantity === 0) return { level: 0, color: "bg-red-500" };
    if (percentage < 50) return { level: percentage, color: "bg-orange-500" };
    return { level: percentage, color: "bg-green-500" };
  };

  const handleSubmit = () => {
    if (editingItem) {
      setItems(items.map(item => 
        item.id === editingItem.id ? { ...item, ...formData } as StockItem : item
      ));
    } else {
      const newItem: StockItem = {
        id: Date.now().toString(),
        name: formData.name || "",
        category: formData.category || "Fromages",
        quantity: formData.quantity || 0,
        minQuantity: formData.minQuantity || 10,
        unit: formData.unit || "kg",
        costPerUnit: formData.costPerUnit || 0,
        supplier: formData.supplier || "",
        lastRestocked: new Date().toISOString().split('T')[0],
        expiryDate: formData.expiryDate || "",
        status: formData.quantity === 0 ? "out" : 
                (formData.quantity || 0) < (formData.minQuantity || 10) ? "low" : "sufficient"
      };
      setItems([...items, newItem]);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      name: "",
      category: "Fromages",
      quantity: 0,
      minQuantity: 10,
      unit: "kg",
      costPerUnit: 0,
      supplier: "",
      expiryDate: ""
    });
  };

  const handleRestock = (itemId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.minQuantity * 2;
        return {
          ...item,
          quantity: newQuantity,
          lastRestocked: new Date().toISOString().split('T')[0],
          status: newQuantity >= item.minQuantity ? "sufficient" : "low"
        };
      }
      return item;
    }));
  };

  const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
  const lowStockItems = items.filter(item => item.quantity < item.minQuantity).length;
  const outOfStockItems = items.filter(item => item.quantity === 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Gestion des Stocks
          </h2>
          <p className="text-muted-foreground">Gérez votre inventaire d'ingrédients et fournitures</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un article
        </Button>
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <Alert key={alert.id} variant={alert.severity === "critical" ? "destructive" : "default"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Valeur totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValue.toFixed(2)}€</div>
            <div className="text-sm text-muted-foreground">Valeur de l'inventaire</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Stock faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
            <div className="text-sm text-muted-foreground">Articles concernés</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Stock épuisé
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
            <div className="text-sm text-muted-foreground">Articles à réapprovisionner</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventaire des stocks</CardTitle>
          <CardDescription>
            Liste complète des articles en stock
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const stockLevel = getStockLevel(item);
                const itemValue = item.quantity * item.costPerUnit;
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Expire: {new Date(item.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={stockLevel.level > 100 ? 100 : stockLevel.level} 
                          className={`h-2 w-16 ${stockLevel.color}`} 
                        />
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{item.costPerUnit.toFixed(2)}€</TableCell>
                    <TableCell>{itemValue.toFixed(2)}€</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestock(item.id)}
                          disabled={item.status !== "low" && item.status !== "out"}
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingItem(item);
                            setFormData(item);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setItems(items.filter(i => i.id !== item.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Modifier l'article" : "Ajouter un article"}
            </DialogTitle>
            <DialogDescription>
              {editingItem 
                ? "Modifiez les informations de l'article en stock"
                : "Ajoutez un nouvel article à votre inventaire"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom de l'article</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Mozzarella di bufala"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category || "Fromages"}
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantité actuelle</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <Label htmlFor="minQuantity">Quantité minimale</Label>
                <Input
                  id="minQuantity"
                  type="number"
                  value={formData.minQuantity || ""}
                  onChange={(e) => setFormData({ ...formData, minQuantity: parseFloat(e.target.value) })}
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <Label htmlFor="unit">Unité</Label>
                <Input
                  id="unit"
                  value={formData.unit || ""}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, L, pièces..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="costPerUnit">Prix unitaire (€)</Label>
                <Input
                  id="costPerUnit"
                  type="number"
                  value={formData.costPerUnit || ""}
                  onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <Label htmlFor="expiryDate">Date d'expiration</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="supplier">Fournisseur</Label>
              <Input
                id="supplier"
                value={formData.supplier || ""}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Nom du fournisseur"
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