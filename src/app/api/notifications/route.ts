import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseIntegrationService } from '@/lib/supabase-integration-service';
import { pushNotificationService } from '@/lib/push-notification-service';

// GET /api/notifications - Récupérer les notifications d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const notifications = await pushNotificationService.getUserNotifications(
      userId,
      limit,
      offset
    );

    // Compter les notifications non lues avec Supabase
    const { count: unreadCount, error: countError } = await supabaseIntegrationService
      .getSupabaseClient()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (countError) {
      console.error('Erreur lors du comptage des notifications:', countError);
      throw new Error('Impossible de compter les notifications non lues');
    }

    return NextResponse.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === limit
    });
  } catch (error) {
    console.error('Error fetching notifications:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Créer une nouvelle notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, title, message, orderId, data } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const notification = await pushNotificationService.sendPushNotification({
      userId,
      type,
      title,
      message,
      orderId,
      data
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Erreur lors de la création de la notification' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Marquer des notifications comme lues
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notificationId, markAllAsRead } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (markAllAsRead) {
      await pushNotificationService.markAllNotificationsAsRead(userId);
      return NextResponse.json({ success: true });
    } else if (notificationId) {
      await pushNotificationService.markNotificationAsRead(notificationId, userId);
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAllAsRead must be provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notifications:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour des notifications' },
      { status: 500 }
    );
  }
}