import { supabase } from './supabase-integration';
import { PushNotificationService, pushNotificationService } from './push-notification-service';

// Types pour les commandes
interface Order {
  id: string;
  userId: string;
  status: string;
  totalAmount: number;
  estimatedDelivery?: Date;
  orderNumber?: string;
  deliveryType?: string;
  createdAt?: Date;
  updatedAt?: Date;
  items: OrderItem[];
  user?: {
    name: string | null;
    email: string;
    phone?: string | null;
  };
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    description?: string | null;
    imageUrl?: string;
  };
}

// Types pour les événements de commande
export interface OrderStatusChangeEvent {
  orderId: string;
  previousStatus: string;
  newStatus: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  totalAmount: number;
  estimatedDelivery?: Date;
  metadata?: Record<string, any>;
}

// Middleware pour gérer automatiquement les notifications de commande
export class OrderNotificationMiddleware {
  // Gérer la création d'une nouvelle commande
  static async handleOrderCreated(event: OrderCreatedEvent) {
    try {
      const { orderId, userId, totalAmount, estimatedDelivery, metadata } = event;

      // Récupérer les détails de la commande
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(*),
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        return;
      }

      if (!orderData) {
        console.error(`Commande ${orderId} non trouvée`);
        return;
      }

      // Mapper les données Supabase vers l'interface Order
      const order: Order = {
        id: orderData.id,
        userId: orderData.user_id,
        status: orderData.status,
        totalAmount: orderData.total_amount,
        estimatedDelivery: orderData.estimated_delivery ? new Date(orderData.estimated_delivery) : undefined,
        orderNumber: orderData.id,
        deliveryType: 'delivery',
        createdAt: new Date(orderData.created_at),
        updatedAt: orderData.updated_at ? new Date(orderData.updated_at) : undefined,
        items: (orderData.items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product: item.product ? {
            name: item.product.name,
            description: item.product.description,
            imageUrl: item.product.image
          } : undefined
        })),
        user: orderData.user ? {
          name: orderData.user.full_name,
          email: orderData.user.email,
          phone: orderData.user.phone
        } : undefined
      };

      // Vérifier les préférences de notification de l'utilisateur
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferences && !preferences.order_status_updates) {
        console.log(`Notifications désactivées pour l'utilisateur ${userId}`);
        return;
      }

      const orderRef = `#${order.id.slice(-6)}`;
      const itemCount = order.items.length;
      const itemText = itemCount > 1 ? `${itemCount} articles` : '1 article';

      // Créer la notification en base
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          order_id: orderId,
          type: 'SYSTEM_MESSAGE',
          title: 'Nouvelle commande reçue',
          message: `Votre commande ${orderRef} (${itemText}, ${totalAmount.toFixed(2)}€) a été reçue et va être traitée.`,
          data: JSON.stringify({
            orderId,
            orderNumber: `#${order.id.slice(-6)}`,
            status: order.status,
            totalAmount,
            itemCount,
            estimatedDelivery: estimatedDelivery?.toISOString(),
            ...metadata
          }),
          is_read: false,
          created_at: new Date(),
          updated_at: new Date()
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Erreur lors de la création de la notification:', notificationError);
        throw new Error('Impossible de créer la notification');
      }

      // Envoyer la notification push
      await pushNotificationService.sendPushNotification({
        userId,
        type: 'ORDER_CONFIRMED',
        title: 'Commande confirmée',
        message: notification?.message || `Votre commande ${orderRef} a été confirmée`,
        orderId,
        data: {
          orderNumber: orderRef,
          status: order.status
        }
      });

      console.log(`Notification de création de commande envoyée pour ${orderId}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de création:', error instanceof Error ? error.message : String(error));
    }
  }

  // Gérer le changement de statut d'une commande
  static async handleOrderStatusChange(event: OrderStatusChangeEvent) {
    try {
      const { orderId, previousStatus, newStatus, userId, metadata } = event;

      // Ignorer si le statut n'a pas vraiment changé
      if (previousStatus === newStatus) {
        return;
      }

      // Récupérer les détails de la commande
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          user:users(*),
          items:order_items(
            *,
            product:products(*)
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('Erreur lors de la récupération de la commande:', orderError);
        return;
      }

      // Mapper les données Supabase vers l'interface Order
      const order: Order = {
        id: orderData.id,
        userId: orderData.user_id,
        status: orderData.status,
        totalAmount: orderData.total_amount,
        estimatedDelivery: orderData.estimated_delivery ? new Date(orderData.estimated_delivery) : undefined,
        orderNumber: orderData.id,
        deliveryType: 'delivery',
        createdAt: new Date(orderData.created_at),
        updatedAt: orderData.updated_at ? new Date(orderData.updated_at) : undefined,
        items: (orderData.items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product: item.product ? {
            name: item.product.name,
            description: item.product.description,
            imageUrl: item.product.image
          } : undefined
        })),
        user: orderData.user ? {
          name: orderData.user.full_name,
          email: orderData.user.email,
          phone: orderData.user.phone
        } : undefined
      };

      if (!order) {
        console.error(`Commande ${orderId} non trouvée`);
        return;
      }

      // Vérifier les préférences de notification
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferences && !preferences.order_status_updates) {
        console.log(`Notifications désactivées pour l'utilisateur ${userId}`);
        return;
      }

      // Générer le message de notification
      const { title, message } = this.generateStatusChangeMessage(
        newStatus,
        `#${order.id.slice(-6)}`,
        order
      );

      // Créer la notification en base
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          order_id: orderId,
          type: 'SYSTEM_MESSAGE',
          title,
          message,
          data: JSON.stringify({
            orderId,
            orderNumber: `#${order.id.slice(-6)}`,
            previousStatus,
            newStatus,
            totalAmount: order.totalAmount,
            estimatedDelivery: order.createdAt?.toISOString(),
            ...metadata
          }),
          is_read: false
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Erreur lors de la création de la notification:', notificationError);
        return;
      }

      // Envoyer la notification push
      const notificationType = this.getNotificationTypeFromStatus(newStatus);
      await pushNotificationService.sendPushNotification({
        userId,
        type: notificationType,
        title: 'Mise à jour de commande',
        message,
        orderId,
        data: {
          orderNumber: `#${order.id.slice(-6)}`,
          status: newStatus
        }
      });

      // Envoyer des notifications spéciales pour certains statuts
      await this.handleSpecialStatusNotifications(newStatus, order, notification);

      console.log(`Notification de changement de statut envoyée: ${previousStatus} -> ${newStatus} pour ${orderId}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de changement de statut:', error instanceof Error ? error.message : String(error));
    }
  }

  // Gérer les notifications spéciales pour certains statuts
  private static async handleSpecialStatusNotifications(
    status: string,
    order: any,
    notification: any
  ) {
    try {
      switch (status) {
        case 'READY':
          // Notification spéciale quand la commande est prête
          await pushNotificationService.sendPushNotification({
            userId: order.user_id,
            type: 'ORDER_READY',
            title: 'Commande prête pour récupération',
            message: `Votre commande est prête ! Venez la récupérer au restaurant.`,
            orderId: order.id,
            data: {
              orderId: order.id,
              type: 'PICKUP_READY',
              restaurantAddress: process.env.RESTAURANT_ADDRESS || 'Restaurant OMIAM',
              actions: ['get_directions', 'call_restaurant']
            }
          });
          break;

        case 'OUT_FOR_DELIVERY':
          // Notification avec suivi de livraison
          await pushNotificationService.sendPushNotification({
            userId: order.user_id,
            type: 'ORDER_PREPARING',
            title: 'Livraison en cours',
            message: `Votre livreur est en route ! Temps estimé: ${this.getEstimatedDeliveryTime(order)}.`,
            orderId: order.id,
            data: {
              orderId: order.id,
              type: 'DELIVERY_TRACKING',
              trackingUrl: `/orders/${order.id}/tracking`,
              estimatedDelivery: order.created_at?.toISOString(),
              actions: ['track_delivery', 'contact_driver']
            }
          });
          break;

        case 'DELIVERED':
          // Notification de livraison avec demande d'avis
          setTimeout(async () => {
            await pushNotificationService.sendPushNotification({
              userId: order.user_id,
              type: 'ORDER_DELIVERED',
              title: 'Comment était votre repas ?',
              message: 'Votre avis nous aide à nous améliorer. Laissez une note et un commentaire !',
              orderId: order.id,
              data: {
                orderId: order.id,
                type: 'REVIEW_REQUEST',
                reviewUrl: `/orders/${order.id}/review`,
                actions: ['leave_review', 'rate_order']
              }
            });
          }, 30 * 60 * 1000); // Attendre 30 minutes après la livraison
          break;

        case 'CANCELLED':
          // Notification d'annulation avec options
          await pushNotificationService.sendPushNotification({
            userId: order.userId,
            type: 'ORDER_CANCELLED',
            title: 'Commande annulée',
            message: 'Votre commande a été annulée. Le remboursement sera traité sous 3-5 jours ouvrés.',
            orderId: order.id,
            data: {
              orderId: order.id,
              type: 'ORDER_CANCELLED',
              refundAmount: order.totalAmount,
              supportUrl: '/support',
              actions: ['contact_support', 'reorder']
            }
          });
          break;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications spéciales:', error instanceof Error ? error.message : String(error));
    }
  }

  // Générer le message de notification pour un changement de statut
  private static generateStatusChangeMessage(
    status: string,
    orderRef: string,
    order: Order
  ): { title: string; message: string } {
    switch (status) {
      case 'CONFIRMED':
        return {
          title: 'Commande confirmée',
          message: `Votre commande ${orderRef} a été confirmée et va être préparée.`
        };
      case 'PREPARING':
        return {
          title: 'Préparation en cours',
          message: `Nos chefs préparent votre commande ${orderRef} avec soin.`
        };
      case 'READY':
        return {
          title: 'Commande prête',
          message: `Votre commande ${orderRef} est prête ! Vous pouvez venir la récupérer.`
        };
      case 'OUT_FOR_DELIVERY':
        return {
          title: 'En cours de livraison',
          message: `Votre commande ${orderRef} est en route ! ${this.getEstimatedDeliveryTime(order)}`
        };
      case 'DELIVERED':
        return {
          title: 'Commande livrée',
          message: `Votre commande ${orderRef} a été livrée ! Bon appétit ! 🍕`
        };
      case 'CANCELLED':
        return {
          title: 'Commande annulée',
          message: `Votre commande ${orderRef} a été annulée. Contactez-nous si vous avez des questions.`
        };
      default:
        return {
          title: 'Mise à jour de commande',
          message: `Votre commande ${orderRef} a été mise à jour.`
        };
    }
  }

  // Calculer le temps de livraison estimé
  private static getEstimatedDeliveryTime(order: any): string {
    // Estimation par défaut basée sur l'heure de création
    return 'Temps de livraison: 25-35 minutes.';
  }

  // Mapper les statuts de commande aux types de notification
  private static getNotificationTypeFromStatus(status: string): 'ORDER_CONFIRMED' | 'ORDER_PREPARING' | 'ORDER_READY' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' {
    switch (status) {
      case 'CONFIRMED':
        return 'ORDER_CONFIRMED';
      case 'PREPARING':
        return 'ORDER_PREPARING';
      case 'READY':
        return 'ORDER_READY';
      case 'DELIVERED':
        return 'ORDER_DELIVERED';
      case 'CANCELLED':
        return 'ORDER_CANCELLED';
      default:
        return 'ORDER_CONFIRMED'; // Fallback
    }
  }

  // Envoyer une notification de promotion
  static async sendPromotionNotification(
    userId: string,
    promotion: {
      title: string;
      description: string;
      discountPercent?: number;
      validUntil?: Date;
      promoCode?: string;
    }
  ) {
    try {
      // Vérifier les préférences
      const { data: preferences } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferences && !preferences.promotions) {
        return;
      }

      // Créer la notification
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'PROMOTION',
          title: promotion.title,
          message: promotion.description,
          data: JSON.stringify({
            discountPercent: promotion.discountPercent,
            validUntil: promotion.validUntil?.toISOString(),
            promoCode: promotion.promoCode
          }),
          is_read: false
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Erreur lors de la création de la notification de promotion:', notificationError);
        return;
      }

      // Envoyer la notification push
      await pushNotificationService.sendPushNotification({
        userId,
        type: 'PROMOTION',
        title: promotion.title,
        message: promotion.description,
        data: {
          type: 'PROMOTION',
          promoCode: promotion.promoCode,
          discountPercent: promotion.discountPercent,
          validUntil: promotion.validUntil?.toISOString(),
          actions: ['view_menu', 'use_promo']
        }
      });

      console.log(`Notification de promotion envoyée à l'utilisateur ${userId}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de promotion:', error instanceof Error ? error.message : String(error));
    }
  }

  // Envoyer une notification de nouveau produit
  static async sendNewProductNotification(
    userIds: string[],
    product: {
      name: string;
      description: string;
      price: number;
      imageUrl?: string;
    }
  ) {
    try {
      for (const userId of userIds) {
        // Vérifier les préférences
        const { data: preferences } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (preferences && !preferences.new_products) {
          continue;
        }

        // Créer la notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            type: 'NEW_PRODUCT',
            title: 'Nouveau produit disponible !',
            message: `Découvrez ${product.name} - ${product.description}`,
            data: JSON.stringify({
              productName: product.name,
              productPrice: product.price,
              productImage: product.imageUrl
            }),
            is_read: false,
            created_at: new Date(),
            updated_at: new Date()
          });

        if (notificationError) {
          console.error('Erreur lors de la création de la notification produit:', notificationError);
          continue; // Continue avec le prochain utilisateur
        }

        // Envoyer la notification push
        await pushNotificationService.sendPushNotification({
          userId,
          type: 'NEW_PRODUCT',
          title: 'Nouveau produit disponible !',
          message: `Découvrez ${product.name} à partir de ${product.price}€`,
          data: {
            type: 'NEW_PRODUCT',
            productName: product.name,
            actions: ['view_menu', 'order_now']
          }
        });
      }

      console.log(`Notifications de nouveau produit envoyées à ${userIds.length} utilisateurs`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi des notifications de nouveau produit:', error instanceof Error ? error.message : String(error));
    }
  }
}