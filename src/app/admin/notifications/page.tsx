"use client";

import React from 'react';
import NotificationSystem from '@/components/notifications/NotificationSystem';

export default function AdminNotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <NotificationSystem />
      </main>
    </div>
  );
}