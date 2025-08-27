"use client";

import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Clock, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import Link from 'next/link';
import CheckoutModal from '@/components/payment/CheckoutModal';

export function CartDrawer() {
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
  } = useCartStore();
  const { user } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay avec animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Cart Drawer avec animations améliorées */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col h-full">
              {/* Header amélioré */}
              <div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Votre Panier</h2>
                      {totalItems > 0 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {totalItems} {totalItems > 1 ? 'articles' : 'article'} • {totalPrice.toFixed(2)}€
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 rounded-full w-10 h-10 p-0 transition-all duration-200"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Indicateur de temps de préparation */}
                {totalItems > 0 && (
                  <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Temps de préparation estimé: 15-20 min</span>
                  </div>
                )}
              </div>

              {/* Cart Content amélioré */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400"
                  >
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">Votre panier est vide</h3>
                    <p className="text-sm text-center max-w-xs">Découvrez nos délicieuses pizzas artisanales et ajoutez-les à votre panier !</p>
                    <Button
                      onClick={() => setIsOpen(false)}
                      className="mt-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white"
                    >
                      Voir le menu
                    </Button>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 transition-colors">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                {item.price.toFixed(2)}€
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Sous-total: {(item.price * item.quantity).toFixed(2)}€
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end space-y-3">
                            {/* Contrôles de quantité */}
                            <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                                {item.quantity}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            {/* Bouton supprimer */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer amélioré */}
              {items.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 space-y-4"
                >
                  {/* Résumé de la commande */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Sous-total ({totalItems} articles)</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{totalPrice.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Frais de livraison</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">Gratuit</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="text-xl font-bold text-red-600 dark:text-red-400">{totalPrice.toFixed(2)}€</span>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                      size="lg"
                      onClick={() => setIsCheckoutOpen(true)}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Commander maintenant
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                        onClick={() => setIsOpen(false)}
                      >
                        Continuer mes achats
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                        onClick={clearCart}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Vider
                      </Button>
                    </div>
                    
                    {/* Lien vers l'historique des commandes */}
                    {user && (
                      <Link href="/orders" onClick={() => setIsOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                        >
                          <History className="h-4 w-4 mr-2" />
                          Voir mes commandes
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                    <p>🚚 Livraison gratuite à partir de 20€</p>
                    <p>⏱️ Commande prête en 15-20 minutes</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
          
          {/* Modal de checkout */}
          <CheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onSuccess={() => {
              setIsCheckoutOpen(false);
              setIsOpen(false);
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}