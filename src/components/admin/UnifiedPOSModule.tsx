"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { POSHeader } from "./pos/POSHeader";
import { POSMenu } from "./pos/POSMenu";
import { POSCart } from "./pos/POSCart";
import { POSOrders } from "./pos/POSOrders";

// Interfaces
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  available: boolean;
  preparationTime: number;
}

interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

interface Customer {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  loyaltyPoints?: number;
}

interface Order {
  id: string;
  items: CartItem[];
  customer?: Customer;
  total: number;
  paymentMethod: 'cash' | 'card' | 'online';
  status: 'pending' | 'confirmed' | 'preparing' | 'cooking' | 'ready' | 'delivered' | 'cancelled';
  orderType: 'dine-in' | 'takeaway' | 'delivery';
  notes?: string;
  createdAt: Date;
  estimatedTime?: number;
  actualTime?: number;
  tableNumber?: number;
  deliveryAddress?: string;
}

// Données de démonstration
const menuItems: MenuItem[] = [
  { id: "pizza-1", name: "Margherita Royale", price: 12, category: "Pizzas", description: "Tomate, mozzarella, basilic frais", available: true, preparationTime: 15 },
  { id: "pizza-2", name: "O'Miam Spéciale", price: 15, category: "Pizzas", description: "Tomate, mozzarella, jambon, champignons, olives", available: true, preparationTime: 18 },
  { id: "pizza-3", name: "4 Fromages", price: 14, category: "Pizzas", description: "Mozzarella, chèvre, roquefort, emmental", available: true, preparationTime: 16 },
  { id: "pizza-4", name: "Pepperoni", price: 13, category: "Pizzas", description: "Mozzarella, pepperoni, origan", available: true, preparationTime: 15 },
  { id: "pizza-5", name: "Végétarienne", price: 13, category: "Pizzas", description: "Mozzarella, légumes grillés, olives", available: true, preparationTime: 17 },
  { id: "drink-1", name: "Coca-Cola", price: 3, category: "Boissons", description: "33cl", available: true, preparationTime: 1 },
  { id: "drink-2", name: "Eau Minérale", price: 2, category: "Boissons", description: "50cl", available: true, preparationTime: 1 },
  { id: "drink-3", name: "Jus d'Orange", price: 4, category: "Boissons", description: "Pressé frais", available: true, preparationTime: 2 },
  { id: "dessert-1", name: "Tiramisu", price: 6, category: "Desserts", description: "Tiramisu maison", available: true, preparationTime: 2 },
  { id: "dessert-2", name: "Panna Cotta", price: 5, category: "Desserts", description: "Vanille, coulis de fruits rouges", available: true, preparationTime: 2 },
  { id: "dessert-3", name: "Glace Vanille", price: 4, category: "Desserts", description: "Boule de glace vanille", available: true, preparationTime: 1 }
];

export function UnifiedPOSModule() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');

  // Charger les commandes depuis le localStorage
  useEffect(() => {
    const savedOrders = localStorage.getItem('pos-orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders).map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt)
      })));
    }
  }, []);

  // Sauvegarder les commandes dans le localStorage
  useEffect(() => {
    localStorage.setItem('pos-orders', JSON.stringify(orders));
  }, [orders]);

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleCheckout = (orderData: {
    paymentMethod: 'cash' | 'card' | 'online';
    orderType: 'dine-in' | 'takeaway' | 'delivery';
    customerNotes?: string;
    tableNumber?: number;
  }) => {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const estimatedTime = cart.length > 0 
      ? Math.max(...cart.map(item => item.preparationTime)) + 5
      : 0;

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items: [...cart],
      total,
      paymentMethod: orderData.paymentMethod,
      orderType: orderData.orderType,
      status: 'pending',
      notes: orderData.customerNotes,
      createdAt: new Date(),
      estimatedTime,
      tableNumber: orderData.tableNumber,
      timeline: [{
        status: 'pending',
        timestamp: new Date().toISOString(),
        description: 'Commande créée',
        employee: 'Système'
      }],
      messages: []
    };

    setOrders(prevOrders => [...prevOrders, newOrder]);
    clearCart();
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              timeline: [
                ...order.timeline,
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  description: `Statut mis à jour: ${newStatus}`,
                  employee: 'Équipe'
                }
              ]
            }
          : order
      )
    );
  };

  const viewOrderDetails = (orderId: string) => {
    console.log("Voir détails de la commande:", orderId);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const activeOrders = orders.filter(order => !['delivered', 'cancelled'].includes(order.status));

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <POSHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeOrdersCount={activeOrders.length}
        userName="Équipe O'Miam"
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Section principale - Menu ou Commandes */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b px-4 py-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Menu & Commande
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Commandes en cours ({activeOrders.length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'menu' ? (
              <div className="h-full flex">
                <div className="flex-1 overflow-hidden">
                  <POSMenu
                    items={menuItems}
                    onAddToCart={addToCart}
                    searchTerm={searchTerm}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full">
                <POSOrders
                  orders={orders}
                  onUpdateStatus={updateOrderStatus}
                  onViewDetails={viewOrderDetails}
                />
              </div>
            )}
          </div>
        </div>

        {/* Panier - visible uniquement en mode menu */}
        {activeTab === 'menu' && (
          <div className="w-96 border-l bg-white flex flex-col">
            <POSCart
              items={cart}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onClearCart={clearCart}
              onCheckout={handleCheckout}
            />
          </div>
        )}
      </div>
    </div>
  );
}