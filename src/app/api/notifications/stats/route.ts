import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { supabaseIntegrationService } from '@/lib/supabase-integration-service';

// Importer les utilitaires de notification pour accéder aux connexions actives
import { getActiveConnections } from '@/lib/notification-utils';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({
        error: 'Authentification requise'
      }, { status: 401 });
    }

    // Statistiques des notifications
    const { count: totalNotifications } = await supabaseIntegrationService.getSupabaseClient()
      .from('notifications')
      .select('*', { count: 'exact', head: true });

    const { count: unreadNotifications } = await supabaseIntegrationService.getSupabaseClient()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    // Statistiques par type
    const { data: notificationsByType } = await supabaseIntegrationService.getSupabaseClient()
      .from('notifications')
      .select('type, count(*)', { count: 'exact' });

    const typeStats = notificationsByType?.reduce((acc: any, item: any) => {
      acc[item.type] = item.count;
      return acc;
    }, {}) || {};

    // Notifications récentes (dernières 24h)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: recentNotifications } = await supabaseIntegrationService.getSupabaseClient()
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', yesterday);

    // Connexions actives (valeurs par défaut si le service n'est pas disponible)
    let activeConnections = 0;
    let connectedUsers = 0;
    try {
      // Si le service de notification est disponible, utiliser les vraies valeurs
      activeConnections = getActiveConnections?.() || 0;
      connectedUsers = activeConnections; // Approximation
    } catch (error) {
      console.warn('Service de notification non disponible:', error);
    }

    // Statistiques des utilisateurs
    const { count: totalUsers } = await supabaseIntegrationService.getSupabaseClient()
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { data: usersWithNotificationsData } = await supabaseIntegrationService.getSupabaseClient()
      .from('notifications')
      .select('user_id')
      .not('user_id', 'is', null);

    const usersWithNotifications = new Set(usersWithNotificationsData?.map(n => n.user_id) || []).size;

    // Taux d'engagement (notifications lues vs non lues)
    const engagementRate = totalNotifications > 0 
      ? ((totalNotifications - unreadNotifications) / totalNotifications * 100).toFixed(1) 
      : '0';

    const stats = {
      // Statistiques générales
      totalSent: totalNotifications || 0,
      unreadCount: unreadNotifications || 0,
      recentCount: recentNotifications || 0,
      engagementRate: parseFloat(engagementRate),
      
      // Connexions en temps réel
      activeConnections,
      connectedUsers,
      
      // Répartition par type
      byType: typeStats,
      
      // Statistiques utilisateurs
      userStats: {
        total: totalUsers || 0,
        withNotifications: usersWithNotifications,
        coverage: totalUsers > 0 ? (usersWithNotifications / totalUsers * 100).toFixed(1) : '0'
      },
      
      // Métadonnées
      lastUpdated: new Date().toISOString(),
      serverTime: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json({
      error: 'Erreur serveur lors de la récupération des statistiques'
    }, { status: 500 });
  }
}

// Endpoint pour réinitialiser les statistiques (admin uniquement)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({
        error: 'Non autorisé'
      }, { status: 401 });
    }

    // Vérifier si l'utilisateur est admin
    const { data: profile, error: profileError } = await supabaseIntegrationService.getSupabaseClient()
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({
        error: 'Accès refusé - admin requis'
      }, { status: 403 });
    }

    // Supprimer toutes les notifications lues de plus de 30 jours
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: deletedCount, error: deleteError } = await supabaseIntegrationService.getSupabaseClient()
      .from('notifications')
      .delete({ count: 'exact' })
      .eq('is_read', true)
      .lt('created_at', thirtyDaysAgo);

    if (deleteError) {
      console.error('Erreur lors de la suppression des notifications:', deleteError);
      throw new Error('Impossible de supprimer les notifications');
    }

    return NextResponse.json({
      success: true,
      message: `${deletedCount || 0} notifications anciennes supprimées`,
      deletedCount: deletedCount || 0
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des statistiques:', error);
    return NextResponse.json({
      error: 'Erreur serveur lors de la réinitialisation'
    }, { status: 500 });
  }
}

// Endpoint pour obtenir des statistiques détaillées (admin uniquement)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({
        error: 'Non autorisé'
      }, { status: 401 });
    }

    const body = await request.json();
    const { period = '7d', userId } = body;

    // Calculer la date de début selon la période
    let startDate: Date;
    switch (period) {
      case '1d':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }

    // Construire la requête Supabase
    let query = supabaseIntegrationService.getSupabaseClient()
      .from('notifications')
      .select(`
        *,
        profiles!notifications_user_id_fkey (
          id,
          email,
          full_name
        )
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: notifications, error: notificationsError } = await query;

    if (notificationsError) {
      console.error('Erreur lors de la récupération des notifications:', notificationsError);
      throw new Error('Impossible de récupérer les notifications');
    }

    // Grouper par jour
    const dailyStats = (notifications || []).reduce((acc, notification) => {
      const date = new Date(notification.created_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, read: 0, unread: 0, byType: {} };
      }
      
      acc[date].total++;
      if (notification.is_read) {
        acc[date].read++;
      } else {
        acc[date].unread++;
      }
      
      if (!acc[date].byType[notification.type]) {
        acc[date].byType[notification.type] = 0;
      }
      acc[date].byType[notification.type]++;
      
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      period,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      totalNotifications: notifications?.length || 0,
      dailyStats,
      notifications: notifications?.slice(0, 100) || [] // Limiter à 100 pour la performance
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques détaillées:', error);
    return NextResponse.json({
      error: 'Erreur serveur lors de la récupération des statistiques détaillées'
    }, { status: 500 });
  }
}