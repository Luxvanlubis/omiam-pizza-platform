"use client";

import { useState } from "react";
import { ChefHat, Flame, Truck, Clock, CheckCircle, XCircle, MessageSquare, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";

interface Order {
  id: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'cooking' | 'ready' | 'delivered' | 'cancelled';
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  tableNumber?: number;
  createdAt: Date;
  estimatedTime?: number;
  customerName?: string;
}

interface POSOrdersProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
  onViewDetails: (orderId: string) => void;
}

const statusConfig = {
  pending: { label: "En attente", color: "bg-gray-100 text-gray-800", icon: Clock },
  confirmed: { label: "Confirmée", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  preparing: { label: "En préparation", color: "bg-yellow-100 text-yellow-800", icon: ChefHat },
  cooking: { label: "En cuisson", color: "bg-orange-100 text-orange-800", icon: Flame },
  ready: { label: "Prête", color: "bg-green-100 text-green-800", icon: CheckCircle },
  delivered: { label: "Livrée", color: "bg-purple-100 text-purple-800", icon: Truck },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-800", icon: XCircle }
};

const orderTypeConfig = {
  'dine-in': { label: "Sur place", icon: "🍽️" },
  'takeaway': { label: "À emporter", icon: "🥡" },
  'delivery': { label: "Livraison", icon: "🚚" }
};

export function POSOrders({ orders, onUpdateStatus, onViewDetails }: POSOrdersProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredOrders = orders.filter(order => {
    switch (filter) {
      case 'active':
        return !['delivered', 'cancelled'].includes(order.status);
      case 'completed':
        return ['delivered', 'cancelled'].includes(order.status);
      default:
        return true;
    }
  });

  const activeOrders = orders.filter(order => !['delivered', 'cancelled'].includes(order.status));

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'cooking',
      cooking: 'ready',
      ready: 'delivered',
      delivered: null,
      cancelled: null
    };
    return statusFlow[currentStatus];
  };

  const getStatusButtonText = (status: Order['status']) => {
    const nextStatus = getNextStatus(status);
    if (!nextStatus) return null;
    
    const labels: Record<NonNullable<Order['status']>, string> = {
      pending: "Confirmer",
      confirmed: "Préparer",
      preparing: "Cuisson",
      cooking: "Prête",
      ready: "Livrée"
    };
    
    return labels[nextStatus as NonNullable<Order['status']>] || "Suivant";
  };

  return (
    <div className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Commandes en cours</span>
          <Badge variant="secondary">{activeOrders.length} active{activeOrders.length > 1 ? 's' : ''}</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={filter === 'active' ? 'default' : 'outline'}
            onClick={() => setFilter('active')}
          >
            Active{activeOrders.length > 1 ? 's' : ''} ({activeOrders.length})
          </Button>
          <Button
            size="sm"
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Toutes
          </Button>
        </div>

        <ScrollArea className="h-full">
          <div className="space-y-4">
            {filteredOrders.map(order => {
              const StatusIcon = statusConfig[order.status].icon;
              const nextButtonText = getStatusButtonText(order.status);
              
              return (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">#{order.id.slice(-4)}</span>
                          <Badge className={statusConfig[order.status].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[order.status].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <span>{orderTypeConfig[order.orderType].icon}</span>
                          <span>{orderTypeConfig[order.orderType].label}</span>
                          {order.tableNumber && (
                            <>
                              <span>•</span>
                              <span>Table {order.tableNumber}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">€{order.total.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="text-sm flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>€{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-2" />

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewDetails(order.id)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Détails
                      </Button>
                      
                      {nextButtonText && (
                        <Button
                          size="sm"
                          onClick={() => {
                            const nextStatus = getNextStatus(order.status);
                            if (nextStatus) onUpdateStatus(order.id, nextStatus);
                          }}
                          className="flex-1"
                        >
                          {nextButtonText}
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateStatus(order.id, 'cancelled')}
                        className="text-red-500 hover:text-red-700"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {filter === 'active' ? "Aucune commande active" : "Aucune commande"}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </div>
  );
}