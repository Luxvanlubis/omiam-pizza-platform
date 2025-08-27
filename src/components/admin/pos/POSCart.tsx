"use client";

import { useState } from "react";
import { Plus, Minus, Trash2, CreditCard, Banknote, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  preparationTime: number;
}

interface POSCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: (orderData: {
    paymentMethod: 'cash' | 'card' | 'online';
    orderType: 'dine-in' | 'takeaway' | 'delivery';
    customerNotes?: string;
    tableNumber?: number;
  }) => void;
}

export function POSCart({ items, onUpdateQuantity, onRemoveItem, onClearCart, onCheckout }: POSCartProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'online'>('cash');
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway' | 'delivery'>('dine-in');
  const [customerNotes, setCustomerNotes] = useState('');
  const [tableNumber, setTableNumber] = useState<number | undefined>();

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% TVA
  const total = subtotal + tax;

  const estimatedTime = items.length > 0 
    ? Math.max(...items.map(item => item.preparationTime)) + 5
    : 0;

  const handleCheckout = () => {
    onCheckout({
      paymentMethod,
      orderType,
      customerNotes,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined
    });
  };

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500">Aucun article dans le panier</p>
          <p className="text-sm text-gray-400 mt-2">Ajoutez des produits pour commencer une commande</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Panier</span>
          <Badge variant="secondary">{items.length} articles</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-3 border-b">
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600">€{item.price} chacun</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemoveItem(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div>
            <Label>Type de commande</Label>
            <Select value={orderType} onValueChange={(value) => setOrderType(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dine-in">Sur place</SelectItem>
                <SelectItem value="takeaway">À emporter</SelectItem>
                <SelectItem value="delivery">Livraison</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {orderType === 'dine-in' && (
            <div>
              <Label>Numéro de table</Label>
              <Input
                type="number"
                placeholder="Table n°"
                value={tableNumber || ''}
                onChange={(e) => setTableNumber(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          )}

          <div>
            <Label>Mode de paiement</Label>
            <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="card">Carte bancaire</SelectItem>
                <SelectItem value="online">Paiement en ligne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Notes client</Label>
            <Input
              placeholder="Instructions spéciales..."
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>TVA (10%)</span>
              <span>€{tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              <span>Temps estimé: {estimatedTime} min</span>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="p-4 border-t">
        <Button 
          onClick={handleCheckout} 
          className="w-full"
          size="lg"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Valider la commande
        </Button>
        <Button 
          variant="outline" 
          onClick={onClearCart}
          className="w-full mt-2"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Vider le panier
        </Button>
      </div>
    </div>
  );
}