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
import { Gift, Trophy, Star, User, Calendar, Percent, Award } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  currentStamps: number;
  freePizzaCount: number;
  joinDate: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  type: "discount" | "free_item" | "upgrade";
  value: number;
  active: boolean;
}

export function GestionFidelite() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: "1",
      name: "Marie Dupont",
      email: "marie@email.com",
      phone: "06 12 34 56 78",
      totalOrders: 24,
      totalSpent: 312,
      loyaltyPoints: 312,
      currentStamps: 8,
      freePizzaCount: 2,
      joinDate: "2024-01-15",
      tier: "Gold"
    },
    {
      id: "2",
      name: "Jean Martin",
      email: "jean@email.com",
      phone: "06 98 76 54 32",
      totalOrders: 12,
      totalSpent: 156,
      loyaltyPoints: 156,
      currentStamps: 3,
      freePizzaCount: 0,
      joinDate: "2024-03-20",
      tier: "Silver"
    }
  ]);

  const [rewards] = useState<Reward[]>([
    {
      id: "1",
      name: "Pizza gratuite",
      description: "10ème pizza offerte",
      pointsRequired: 100,
      type: "free_item",
      value: 12,
      active: true
    },
    {
      id: "2",
      name: "Remise 10%",
      description: "10% de remise sur toute commande",
      pointsRequired: 50,
      type: "discount",
      value: 10,
      active: true
    },
    {
      id: "3",
      name: "Boisson offerte",
      description: "Une boisson offerte",
      pointsRequired: 25,
      type: "free_item",
      value: 3,
      active: true
    }
  ]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Bronze": return "text-orange-600 bg-orange-100";
      case "Silver": return "text-gray-600 bg-gray-100";
      case "Gold": return "text-yellow-600 bg-yellow-100";
      case "Platinum": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStampsProgress = (stamps: number) => {
    return (stamps % 10) * 10;
  };

  const redeemReward = (customerId: string, reward: Reward) => {
    setCustomers(customers.map(customer => {
      if (customer.id === customerId && customer.loyaltyPoints >= reward.pointsRequired) {
        return {
          ...customer,
          loyaltyPoints: customer.loyaltyPoints - reward.pointsRequired,
          freePizzaCount: reward.type === "free_item" && reward.name.includes("pizza") 
            ? customer.freePizzaCount + 1 
            : customer.freePizzaCount
        };
      }
      return customer;
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="h-6 w-6" />
          Programme de Fidélité
        </h2>
        <p className="text-muted-foreground">Gérez vos clients fidèles et leurs récompenses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Statistiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Clients actifs</span>
                <span className="font-semibold">{customers.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Points totaux</span>
                <span className="font-semibold">
                  {customers.reduce((sum, c) => sum + c.loyaltyPoints, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pizzas offertes</span>
                <span className="font-semibold">
                  {customers.reduce((sum, c) => sum + c.freePizzaCount, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Récompenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rewards.filter(r => r.active).map(reward => (
                <div key={reward.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{reward.name}</div>
                    <div className="text-xs text-muted-foreground">{reward.pointsRequired} pts</div>
                  </div>
                  <Badge variant="secondary">{reward.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5" />
              Palier actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length || 0)}€
              </div>
              <div className="text-sm text-muted-foreground">
                Dépense moyenne par client
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clients fidèles</CardTitle>
          <CardDescription>
            Liste des clients inscrits au programme de fidélité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Commandes</TableHead>
                <TableHead>Dépensé</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Carte fidélité</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-muted-foreground">{customer.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTierColor(customer.tier)}>
                      {customer.tier}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.totalOrders}</TableCell>
                  <TableCell>{customer.totalSpent}€</TableCell>
                  <TableCell>
                    <span className="font-semibold">{customer.loyaltyPoints}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={getStampsProgress(customer.currentStamps)} 
                          className="h-2 w-20" 
                        />
                        <span className="text-xs text-muted-foreground">
                          {customer.currentStamps % 10}/10
                        </span>
                      </div>
                      {customer.freePizzaCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {customer.freePizzaCount} pizza(s) gratuite(s)
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsDialogOpen(true);
                      }}
                    >
                      Récompenses
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Récompenses disponibles</DialogTitle>
            <DialogDescription>
              Sélectionnez une récompense pour {selectedCustomer?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Points disponibles:</span>
                  <span className="font-bold">{selectedCustomer.loyaltyPoints}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {rewards.filter(r => r.active && selectedCustomer.loyaltyPoints >= r.pointsRequired).map(reward => (
                  <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{reward.name}</div>
                      <div className="text-sm text-muted-foreground">{reward.description}</div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        redeemReward(selectedCustomer.id, reward);
                        setIsDialogOpen(false);
                      }}
                    >
                      Utiliser ({reward.pointsRequired} pts)
                    </Button>
                  </div>
                ))}
              </div>
              
              {rewards.filter(r => r.active && selectedCustomer.loyaltyPoints >= r.pointsRequired).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune récompense disponible pour le moment
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}