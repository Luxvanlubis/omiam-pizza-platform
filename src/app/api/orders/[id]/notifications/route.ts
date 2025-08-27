
import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseIntegrationService } from '../../../../../lib/supabase-integration-service';
import { PushNotificationService } from '../../../../../lib/push-notification-service';

// Envoyer une notification pour une mise à jour de commande
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({
        error: 'Non autorisé'
      }, { status: 401 });
    }

    const orderId = id;
    const body = await request.json();
    const { status, message, notifyCustomer = true } = body;

    // Vérifier que la commande existe
    const { data: order, error: orderError } = await supabaseIntegrationService.getSupabaseClient()
      .from('orders')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          phone
        ),
        order_items (
          id,
          quantity,
          price,
          customizations,
          products (
            id,
            name,
            description,
            price,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({
        error: 'Commande non trouvée'
      }, { status: 404 });
    }

    // Mettre à jour le statut de la commande si fourni
    if (status) {
      const { error: updateError } = await supabaseIntegrationService.getSupabaseClient()
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) {
        console.error('Erreur lors de la mise à jour du statut:', updateError);
      }
    }

    // Envoyer la notification au client si demandé
    if (notifyCustomer && order.profiles) {
      const notificationTitle = getNotificationTitle(status || order.status);
      const notificationMessage = message || getDefaultMessage(status || order.status, order);

      // Créer la notification en base
      const { data: notification, error: notificationError } = await supabaseIntegrationService.getSupabaseClient()
        .from('notifications')
        .insert({
          user_id: order.user_id,
          order_id: order.id,
          type: 'SYSTEM_MESSAGE',
          title: notificationTitle,
          message: notificationMessage,
          data: JSON.stringify({
            orderId: order.id,
            orderNumber: `#${order.id.slice(-6)}`,
            status: status || order.status,
            totalAmount: order.total_amount
          }),
          is_read: false
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Erreur lors de la création de la notification:', notificationError);
        throw new Error('Impossible de créer la notification');
      }

      // Envoyer la notification push
      try {
        const pushNotificationService = new PushNotificationService();
        await pushNotificationService.sendPushNotification({
          userId: order.user_id,
          type: 'SYSTEM_MESSAGE',
          title: notificationTitle,
          message: notificationMessage,
          data: {
            orderId: order.id,
            orderNumber: `#${order.id.slice(-6)}`,
            status: status || order.status
          }
        });
      } catch (pushError) {
        console.error('Erreur lors de l\'envoi de la notification push:', pushError instanceof Error ? pushError.message : String(pushError));
        // Ne pas faire échouer la requête si la notification push échoue
      }

      return NextResponse.json({
        success: true,
        notification,
        message: 'Notification envoyée avec succès'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Commande mise à jour'
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Récupérer l'historique des notifications pour une commande
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({
        error: 'Non autorisé'
      }, { status: 401 });
    }

    const orderId = id;

    // Vérifier que la commande existe et appartient à l'utilisateur
    const { data: order, error: orderError } = await supabaseIntegrationService.getSupabaseClient()
      .from('orders')
      .select('id, user_id')
      .eq('id', orderId)
      .eq('user_id', session.user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({
        error: 'Commande non trouvée'
      }, { status: 404 });
    }

    // Récupérer les notifications liées à cette commande
    const { data: notifications, error: notificationsError } = await supabaseIntegrationService.getSupabaseClient()
      .from('notifications')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (notificationsError) {
      console.error('Erreur lors de la récupération des notifications:', notificationsError);
      throw new Error('Impossible de récupérer les notifications');
    }

    return NextResponse.json({
      notifications,
      count: notifications?.length || 0
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Erreur interne du serveur'
    }, { status: 500 });
  }
}

// Fonctions utilitaires pour générer les messages de notification
function getNotificationTitle(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'Commande reçue';
    case 'CONFIRMED':
      return 'Commande confirmée';
    case 'PREPARING':
      return 'Préparation en cours';
    case 'READY':
      return 'Commande prête';
    case 'OUT_FOR_DELIVERY':
      return 'En cours de livraison';
    case 'DELIVERED':
      return 'Commande livrée';
    case 'CANCELLED':
      return 'Commande annulée';
    default:
      return 'Mise à jour de commande';
  }
}

function getDefaultMessage(status: string, order: any): string {
  const orderRef = order.orderNumber || `#${order.id.slice(-6)}`;
  
  switch (status) {
    case 'PENDING':
      return `Votre commande ${orderRef} a été reçue et est en attente de confirmation.`;
    case 'CONFIRMED':
      return `Votre commande ${orderRef} a été confirmée et va être préparée.`;
    case 'PREPARING':
      return `Votre commande ${orderRef} est en cours de préparation par nos chefs.`;
    case 'READY':
      return `Votre commande ${orderRef} est prête ! ${order.deliveryType === 'PICKUP' ? 'Vous pouvez venir la récupérer.' : 'Le livreur va bientôt partir.'}`;
    case 'OUT_FOR_DELIVERY':
      return `Votre commande ${orderRef} est en cours de livraison. Temps estimé : ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '30 minutes'}.`;
    case 'DELIVERED':
      return `Votre commande ${orderRef} a été livrée avec succès ! Bon appétit ! 🍕`;
    case 'CANCELLED':
      return `Votre commande ${orderRef} a été annulée. Si vous avez des questions, contactez-nous.`;
    default:
      return `Votre commande ${orderRef} a été mise à jour.`;
  }
}