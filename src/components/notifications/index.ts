// Export des composants de notifications
export { NotificationBell } from './NotificationBell';
export { NotificationCenter } from './NotificationCenter';
export { NotificationPanel } from './NotificationPanel';
export { PushNotificationManager } from './PushNotificationManager';

// Fonction utilitaire pour afficher des notifications
export const showNotification = (options: { type: 'success' | 'error' | 'info' | 'warning'; title: string; message: string;
}) => { // Cette fonction peut être implémentée avec votre système de toast préféré console.log(`[${options.type.toUpperCase()}] ${options.title}: ${options.message}`); // Exemple d'implémentation avec une notification native du navigateur if ('Notification' in window && Notification.permission === 'granted') { new Notification(options.title, { body: options.message, icon: '/logo.svg', badge: '/logo.svg' }); }
};