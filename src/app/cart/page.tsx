'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  basePrice: number;
  customizations: {
    sizeId: string;
    doughTypeId: string;
    cookingLevelId: string;
    extraIngredients: { ingredientId: string; quantity: number }[];
  };
  totalPrice: number;
  quantity: number;
}

const CartPage = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data pour les références
  const sizeNames = {
    '1': 'Petite (26cm)',
    '2': 'Moyenne (30cm)',
    '3': 'Grande (34cm)',
    '4': 'Familiale (40cm)'
  };

  const doughNames = {
    '1': 'Classique',
    '2': 'Fine',
    '3': 'Épaisse',
    '4': 'Sans Gluten'
  };

  const cookingNames = {
    '1': 'Normale',
    '2': 'Bien Cuite',
    '3': 'Peu Cuite'
  };

  const ingredientNames = {
    '1': 'Mozzarella Extra',
    '2': 'Chèvre',
    '3': 'Parmesan',
    '4': 'Gorgonzola',
    '5': 'Pepperoni',
    '6': 'Jambon',
    '7': 'Chorizo',
    '8': 'Poulet',
    '9': 'Champignons',
    '10': 'Poivrons',
    '11': 'Olives',
    '12': 'Tomates Cerises',
    '13': 'Roquette',
    '14': 'Oignons Rouges'
  };

  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
        toast.error('Erreur lors du chargement du panier');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const updateCart = (newCartItems: CartItem[]) => {
    setCartItems(newCartItems);
    localStorage.setItem('cart', JSON.stringify(newCartItems));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    updateCart(updatedItems);
  };

  const removeItem = (itemId: string) => {
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    updateCart(updatedItems);
    toast.success('Article retiré du panier');
  };

  const clearCart = () => {
    updateCart([]);
    toast.success('Panier vidé');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.totalPrice * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    // Rediriger vers la page de commande
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du panier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShoppingBag className="h-8 w-8" />
              Mon Panier
            </h1>
            <p className="text-gray-600">
              {cartItems.length === 0
                ? 'Votre panier est vide'
                : `${getTotalItems()} article${getTotalItems() > 1 ? 's' : ''} dans votre panier`
              }
            </p>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={clearCart}
              className="text-red-600 hover:text-red-700"
            >
              Vider le panier
            </Button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-4">Votre panier est vide</h2>
            <p className="text-gray-500 mb-8">Découvrez nos délicieuses pizzas et personnalisez-les selon vos goûts !</p>
            <Button onClick={() => router.push('/menu')} size="lg">
              Voir le menu
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Articles du panier */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{item.productName}</CardTitle>
                        <CardDescription>
                          Pizza personnalisée
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Personnalisations */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Taille:</span>
                          <p className="text-gray-600">{sizeNames[item.customizations.sizeId as keyof typeof sizeNames]}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Pâte:</span>
                          <p className="text-gray-600">{doughNames[item.customizations.doughTypeId as keyof typeof doughNames]}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Cuisson:</span>
                          <p className="text-gray-600">{cookingNames[item.customizations.cookingLevelId as keyof typeof cookingNames]}</p>
                        </div>
                      </div>

                      {/* Ingrédients supplémentaires */}
                      {item.customizations.extraIngredients.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 text-sm">Ingrédients supplémentaires:</span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.customizations.extraIngredients.map((extra) => (
                              <Badge key={extra.ingredientId} variant="secondary" className="text-xs">
                                {ingredientNames[extra.ingredientId as keyof typeof ingredientNames]} x{extra.quantity}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Separator />

                      {/* Quantité et prix */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-700">Quantité:</span>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{item.totalPrice.toFixed(2)}€ / unité</p>
                          <p className="text-lg font-semibold text-primary">
                            {(item.totalPrice * item.quantity).toFixed(2)}€
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Résumé de commande */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Résumé de commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sous-total ({getTotalItems()} articles)</span>
                      <span>{getTotalPrice().toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Livraison</span>
                      <span className="text-green-600">Gratuite</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">{getTotalPrice().toFixed(2)}€</span>
                    </div>
                  </div>
                  <Button onClick={handleCheckout} className="w-full" size="lg">
                    Passer commande
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/menu')} className="w-full">
                    Continuer mes achats
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;