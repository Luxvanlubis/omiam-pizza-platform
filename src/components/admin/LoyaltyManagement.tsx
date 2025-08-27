"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoyaltyStore } from "@/store/loyalty-store";
import { 
  Users, 
  Search, 
  Star, 
  Gift, 
  Award, 
  Crown, 
  TrendingUp, 
  Plus, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  ShoppingCart, 
  DollarSign,
  Trash2,
  Eye,
  Download
} from "lucide-react";

// Utilisation des types du store
import type { LoyaltyCustomer, LoyaltyTransaction } from "@/store/loyalty-store";

// Alias pour la compatibilité
type Customer = LoyaltyCustomer;
type LoyaltyAction = LoyaltyTransaction;

const levelConfig = {
  Bronze: { 
    label: "Bronze", 
    color: "bg-amber-100 text-amber-800", 
    icon: Award,
    minPoints: 0,
    benefits: ["5% de réduction", "Points sur chaque achat"]
  },
  Argent: { 
    label: "Argent", 
    color: "bg-gray-100 text-gray-800", 
    icon: Star,
    minPoints: 500,
    benefits: ["10% de réduction", "Boisson offerte", "Priorité réservation"]
  },
  Or: { 
    label: "Or", 
    color: "bg-yellow-100 text-yellow-800", 
    icon: Crown,
    minPoints: 1500,
    benefits: ["15% de réduction", "Dessert offert", "Accès événements VIP"]
  },
  Platine: { 
    label: "Platine", 
    color: "bg-purple-100 text-purple-800", 
    icon: Gift,
    minPoints: 3000,
    benefits: ["20% de réduction", "Menu dégustation", "Service prioritaire"]
  }
};

// Les récompenses sont maintenant gérées par le store

// Les données sont maintenant gérées par le store Zustand

export function LoyaltyManagement() {
  // Utilisation du store Zustand
  const { 
    customers, 
    addCustomer, 
    addPoints, 
    removePoints, 
    addPurchase, 
    redeemReward, 
    getCustomerLevel, 
    getAvailableRewards, 
    getCustomerTransactions,
    currentCustomer,
    setCurrentCustomer
  } = useLoyaltyStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<'points' | 'purchase' | 'reward'>('points');
  const [activeTab, setActiveTab] = useState("customers");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "all" || customer.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const handleAddCustomer = (customerData: Partial<Customer>) => {
    addCustomer({
      name: customerData.name || "",
      email: customerData.email || "",
      phone: customerData.phone || "",
      points: customerData.points || 0,
      totalSpent: customerData.totalSpent || 0,
      totalOrders: customerData.totalOrders || 0
    });
    setIsAddOpen(false);
  };

  const handlePointsAction = (customerId: string, points: number, isAdd: boolean) => {
    if (isAdd) {
      addPoints(customerId, points, `Ajout manuel de ${points} points`);
    } else {
      removePoints(customerId, points, `Retrait manuel de ${points} points`);
    }
  };

  const handlePurchaseAction = (customerId: string, amount: number) => {
    addPurchase(customerId, amount);
  };

  const handleRewardAction = (customerId: string, reward: string) => {
    // Récupérer le coût de la récompense depuis le store
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      const availableRewards = getAvailableRewards(customer.level);
      const rewardData = availableRewards.find(r => r.name === reward);
      if (rewardData) {
        redeemReward(customerId, reward, rewardData.pointsCost);
      }
    }
  };

  const getLevelBadge = (level: keyof typeof levelConfig) => {
    const config = levelConfig[level];
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const AddCustomerForm = ({ onSubmit, onCancel }: { 
    onSubmit: (data: Partial<Customer>) => void; 
    onCancel: () => void 
  }) => {
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      points: 0,
      totalSpent: 0,
      totalOrders: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
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
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required 
            />
          </div>
        </div>
        <div>
          <Label htmlFor="phone">Téléphone *</Label>
          <Input 
            id="phone" 
            value={formData.phone} 
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required 
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="points">Points initiaux</Label>
            <Input 
              id="points" 
              type="number" 
              value={formData.points} 
              onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="totalSpent">Total dépensé (€)</Label>
            <Input 
              id="totalSpent" 
              type="number" 
              step="0.01" 
              value={formData.totalSpent} 
              onChange={(e) => setFormData(prev => ({ ...prev, totalSpent: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <Label htmlFor="totalOrders">Nombre de commandes</Label>
            <Input 
              id="totalOrders" 
              type="number" 
              value={formData.totalOrders} 
              onChange={(e) => setFormData(prev => ({ ...prev, totalOrders: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit">Ajouter le client</Button>
          <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        </div>
      </form>
    );
  };

  const CustomerActionDialog = ({ customer }: { customer: Customer }) => {
    const [actionData, setActionData] = useState({ points: 0, amount: 0, reward: "" });

    const handleSubmit = () => {
      if (actionType === 'points') {
        handlePointsAction(customer.id, Math.abs(actionData.points), actionData.points > 0);
      } else if (actionType === 'purchase') {
        handlePurchaseAction(customer.id, actionData.amount);
      } else if (actionType === 'reward') {
        handleRewardAction(customer.id, actionData.reward);
      }
      setIsActionOpen(false);
    };

    return (
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Action pour {customer.name}</DialogTitle>
            <DialogDescription>
              Effectuez une action sur le compte client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Type d'action</Label>
              <Select value={actionType} onValueChange={(value: any) => setActionType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Gérer les points</SelectItem>
                  <SelectItem value="purchase">Ajouter un achat</SelectItem>
                  <SelectItem value="reward">Offrir une récompense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {actionType === 'points' && (
              <div>
                <Label htmlFor="points">Points (positif ou négatif)</Label>
                <Input 
                  id="points" 
                  type="number" 
                  value={actionData.points} 
                  onChange={(e) => setActionData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                />
              </div>
            )}

            {actionType === 'purchase' && (
              <div>
                <Label htmlFor="amount">Montant de l'achat (€)</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  step="0.01" 
                  value={actionData.amount} 
                  onChange={(e) => setActionData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            )}

            {actionType === 'reward' && (
              <div>
                <Label>Récompense</Label>
                <Select value={actionData.reward} onValueChange={(value) => setActionData(prev => ({ ...prev, reward: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une récompense" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableRewards(customer.level).map((reward, index) => (
                      <SelectItem key={index} value={reward.name}>
                        {reward.name} ({reward.pointsCost} points)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSubmit}>Exécuter</Button>
              <Button variant="outline" onClick={() => setIsActionOpen(false)}>Annuler</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const LoyaltyStats = () => {
    const totalCustomers = customers.length;
    const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const avgOrderValue = totalSpent / customers.reduce((sum, c) => sum + c.totalOrders, 0) || 0;

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{totalCustomers}</div>
              <div className="text-sm text-muted-foreground">Clients totaux</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{totalPoints.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Points totaux</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalSpent.toFixed(2)}€</div>
              <div className="text-sm text-muted-foreground">CA fidélité</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{avgOrderValue.toFixed(2)}€</div>
              <div className="text-sm text-muted-foreground">Panier moyen</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600">Gestion de la fidélité</h2>
          <p className="text-muted-foreground">Gérez les clients fidèles et leurs récompenses</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="levels">Niveaux</TabsTrigger>
          <TabsTrigger value="rewards">Récompenses</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <LoyaltyStats />

          {/* Filtres et actions */}
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un client..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64" 
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                {Object.entries(levelConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un client
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau client</DialogTitle>
                  <DialogDescription>
                    Créez un nouveau client dans le programme de fidélité
                  </DialogDescription>
                </DialogHeader>
                <AddCustomerForm 
                  onSubmit={handleAddCustomer} 
                  onCancel={() => setIsAddOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Liste des clients */}
          <div className="space-y-4">
            {filteredCustomers
              .sort((a, b) => b.points - a.points)
              .map((customer, index) => {
                const level = levelConfig[customer.level];
                const LevelIcon = level.icon;
                return (
                  <Card key={customer.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                            <div>
                              <h3 className="text-lg font-semibold">{customer.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                {getLevelBadge(customer.level)}
                                <span className="text-sm text-muted-foreground">{customer.points} points</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Dernière visite: {customer.lastVisit}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              <span>{customer.totalOrders} commandes</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>{customer.totalSpent.toFixed(2)}€ dépensés</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4" />
                              <span>{customer.rewards.length} récompenses</span>
                            </div>
                          </div>
                          
                          {customer.rewards.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium">Récompenses obtenues: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {customer.rewards.map((reward, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {reward.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setIsActionOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="levels" className="space-y-6">
          <div className="grid gap-4">
            {Object.entries(levelConfig).map(([key, config]) => {
              const Icon = config.icon;
              const customersAtLevel = customers.filter(c => c.level === key).length;
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      Niveau {config.label}
                      <Badge className={config.color}>{customersAtLevel} clients</Badge>
                    </CardTitle>
                    <CardDescription>
                      À partir de {config.minPoints} points
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium">Avantages :</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {config.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <div className="grid gap-4">
            {(['Bronze', 'Argent', 'Or', 'Platine'] as const).map((level) => {
              const rewards = getAvailableRewards(level);
              return (
                <Card key={level}>
                  <CardHeader>
                    <CardTitle>Récompenses niveau {level}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2">
                      {rewards.map((reward, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span>{reward.name}</span>
                          <div className="flex gap-2">
                            <Badge variant="outline">{reward.pointsCost} points</Badge>
                            <Badge variant="outline">{level}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog d'action */}
      {selectedCustomer && <CustomerActionDialog customer={selectedCustomer} />}
    </div>
  );
}