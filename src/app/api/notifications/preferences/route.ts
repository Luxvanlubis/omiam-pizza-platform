import { NextRequest, NextResponse } from 'next/server';
import { pushNotificationService } from '@/lib/push-notification-service';

// GET /api/notifications/preferences - Récupérer les préférences de notification
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 });
    }

    const preferences = await pushNotificationService.getUserNotificationPreferences(userId);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Erreur lors de la récupération des préférences'
    }, { status: 500 });
  }
}

// PUT /api/notifications/preferences - Mettre à jour les préférences de notification
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...preferences } = body;

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 });
    }

    // Valider les champs de préférences
    const validFields = [
      'orderStatusUpdates',
      'promotions',
      'newProducts',
      'loyaltyRewards',
      'systemMessages',
      'emailNotifications',
      'pushNotifications',
      'smsNotifications'
    ];

    const filteredPreferences = Object.keys(preferences)
      .filter(key => validFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = preferences[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredPreferences).length === 0) {
      return NextResponse.json({
        error: 'No valid preference fields provided'
      }, { status: 400 });
    }

    const updatedPreferences = await pushNotificationService.updateNotificationPreferences(
      userId,
      filteredPreferences
    );

    return NextResponse.json(updatedPreferences);
  } catch (error) {
    console.error('Error updating notification preferences:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({
      error: 'Erreur lors de la mise à jour des préférences'
    }, { status: 500 });
  }
}