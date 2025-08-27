"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Clock,
  Package,
  Eye,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Calendar,
  Euro,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Types pour les commandes
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  customizations?: any;
  product: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
  };
}

interface Order {
  id: string;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
  totalAmount: number;
  deliveryAddress?: string;
  phone?: string;
  notes?: string;
  customerNotes?: string;
  Notes?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  user: {
    id: string;
    name?: string;
    email: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Fonction utilitaire pour obtenir le libellé du statut
const getStatusLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    'PENDING': 'En attente',
    'CONFIRMED': 'Confirmée',
    'PREPARING': 'En préparation',
    'READY': 'Prête',
    'OUT_FOR_DELIVERY': 'En cours de livraison',
    'DELIVERED': 'Livrée',
    'CANCELLED': 'Annulée'
  };
  return statusLabels[status] || status;
};

// Fonction utilitaire pour obtenir la couleur du badge de statut
const getStatusColor = (status: string): string => {
  const statusColors: Record<string, string> = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'PREPARING': 'bg-orange-100 text-orange-800',
    'READY': 'bg-purple-100 text-purple-800',
    'OUT_FOR_DELIVERY': 'bg-indigo-100 text-indigo-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

// Fonction utilitaire pour obtenir l'icône du statut
const getStatusIcon = (status: string) => {
  const statusIcons: Record<string, any> = {
    'PENDING': Clock,
    'CONFIRMED': CheckCircle,
    'PREPARING': Timer,
    'READY': Package,
    'OUT_FOR_DELIVERY': Truck,
    'DELIVERED': CheckCircle,
    'CANCELLED': XCircle
  };
  const Icon = statusIcons[status] || AlertCircle;
  return <Icon className="h-4 w-4" />;
};

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Charger les commandes
  const fetchOrders = async (page: number = 1, status?: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (status && status !== 'all') {
        params.append('status', status);
      }
      
      const response = await fetch(`/api/orders?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des commandes');
      }
      
      const data: OrdersResponse = await response.json();
      setOrders(data.orders);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.pages);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // Charger les commandes au montage du composant
  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [user, statusFilter]);

  // Filtrer les commandes par terme de recherche
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.items.some(item => item.product.name.toLowerCase().includes(searchLower))
    );
  });

  // Gérer la pagination
  const handlePageChange = (page: number) => {
    fetchOrders(page, statusFilter);
  };

  // Gérer le changement de filtre de statut
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Ouvrir les détails d'une commande
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  // Annuler une commande
  const handleCancelOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation de la commande');
      }
      
      // Recharger les commandes
      fetchOrders(currentPage, statusFilter);
      setIsDetailModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'annulation');
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vous devez être connecté pour voir votre historique de commandes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Historique des commandes
          </CardTitle>
          <CardDescription>
            Consultez et gérez vos commandes passées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro de commande ou produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filtre par statut */}
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="CONFIRMED">Confirmée</SelectItem>
                <SelectItem value="PREPARING">En préparation</SelectItem>
                <SelectItem value="READY">Prête</SelectItem>
                <SelectItem value="OUT_FOR_DELIVERY">En livraison</SelectItem>
                <SelectItem value="DELIVERED">Livrée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Bouton de rafraîchissement */}
            <Button
              variant="outline"
              onClick={() => fetchOrders(currentPage, statusFilter)}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message d'erreur */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Liste des commandes */}
      {loading ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Chargement des commandes...
            </div>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucune commande trouvée</p>
              {searchTerm && (
                <p className="text-sm mt-2">
                  Essayez de modifier vos critères de recherche
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const deliveryAddress = order.deliveryAddress ? JSON.parse(order.deliveryAddress) : null;
            return (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Informations principales */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">
                          Commande #{order.id.slice(-8).toUpperCase()}
                        </h3>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{getStatusLabel(order.status)}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(order.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className="h-4 w-4" />
                          {order.totalAmount.toFixed(2)}€
                        </div>
                        {deliveryAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {deliveryAddress.city}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          {order.items.length} article{order.items.length > 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      {/* Aperçu des articles */}
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Articles:</p>
                        <div className="flex flex-wrap gap-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {item.quantity}x {item.product.name}
                            </Badge>
                          ))}
                          {order.items.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{order.items.length - 3} autre{order.items.length - 3 > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleViewOrder(order)}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Détails
                      </Button>
                      {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de détails de commande */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de la commande #{selectedOrder?.id.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Commande passée le {selectedOrder && format(new Date(selectedOrder.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Statut et informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statut de la commande</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Badge className={`${getStatusColor(selectedOrder.status)} text-sm p-2`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-2">{getStatusLabel(selectedOrder.status)}</span>
                      </Badge>
                      <div className="text-sm space-y-1">
                        <p><strong>Créée le:</strong> {format(new Date(selectedOrder.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                        <p><strong>Dernière mise à jour:</strong> {format(new Date(selectedOrder.updatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                        {selectedOrder.estimatedDelivery && (
                          <p><strong>Livraison estimée:</strong> {format(new Date(selectedOrder.estimatedDelivery), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations de livraison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {selectedOrder.deliveryAddress ? (
                        <div>
                          <p className="font-medium">Adresse de livraison:</p>
                          {(() => {
                            const address = JSON.parse(selectedOrder.deliveryAddress);
                            return (
                              <div className="text-muted-foreground">
                                <p>{address.street}</p>
                                <p>{address.postalCode} {address.city}</p>
                                {address.additionalInfo && <p>{address.additionalInfo}</p>}
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Commande à emporter</p>
                      )}
                      {selectedOrder.phone && (
                        <div>
                          <p className="font-medium">Téléphone:</p>
                          <p className="text-muted-foreground">{selectedOrder.phone}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Articles de la commande */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.name}</h4>
                          {item.product.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.product.description}
                            </p>
                          )}
                          
                          {/* Personnalisations */}
                          {item.customizations && Object.keys(item.customizations).length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-muted-foreground">Personnalisations:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(item.customizations).map(([key, value]) => (
                                  value && (
                                    <Badge key={key} variant="outline" className="text-xs">
                                      {key}: {String(value)}
                                    </Badge>
                                  )
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <p className="font-medium">Quantité: {item.quantity}</p>
                          <p className="text-lg font-semibold">{item.price.toFixed(2)}€</p>
                        </div>
                      </div>
                    ))}
                    
                    <Separator />
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">{selectedOrder.totalAmount.toFixed(2)}€</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Notes */}
              {(selectedOrder.notes || selectedOrder.customerNotes || selectedOrder.Notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.customerNotes && (
                        <div>
                          <p className="font-medium text-sm">Notes du client:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {selectedOrder.customerNotes}
                          </p>
                        </div>
                      )}
                      {selectedOrder.Notes && (
                        <div>
                          <p className="font-medium text-sm">Notes administratives:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {selectedOrder.Notes}
                          </p>
                        </div>
                      )}
                      {selectedOrder.notes && (
                        <div>
                          <p className="font-medium text-sm">Notes générales:</p>
                          <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                            {selectedOrder.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Actions */}
              <div className="flex justify-end gap-3">
                {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') && (
                  <Button
                    variant="destructive"
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Annuler la commande
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}