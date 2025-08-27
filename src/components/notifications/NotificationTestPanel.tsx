'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Send,
  Tube,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Zap
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/components/auth-provider';
import { PushNotificationManager } from './PushNotificationManager';

interface NotificationPanelProps {
  className?: string;
}

export function NotificationPanel({ className }: NotificationPanelProps) {
  const { user, loading } = useAuth();
  const {
    isSupported,
    permission,
    isSubscribed,
    subscribe,
    unsubscribe,
    sendNotification,
    notifications,
    refreshNotifications
  } = usePushNotifications({ userId: user?.id || '' });
  
  const [form, setForm] = useState({
    title: 'Test de notification',
    message: 'Ceci est un test de notification push',
    type: 'SYSTEM' as const,
    orderId: '',
    data: '{}'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Panel de test des Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Veuillez vous connecter pour utiliser le panel de test.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Gérer l'envoi de notification de test
  const handleSend = async () => {
    if (!user?.id) {
      setLastResult({ success: false, message: 'Utilisateur non connecté' });
      return;
    }

    setIsLoading(true);
    try {
      let parsedData = {};
      if (form.data.trim()) {
        try {
          parsedData = JSON.parse(form.data);
        } catch (e) {
          throw new Error('Format JSON invalide dans les données');
        }
      }

      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          type: form.type,
          title: form.title,
          message: form.message,
          orderId: form.orderId || undefined,
          data: Object.keys(parsedData).length > 0 ? parsedData : undefined
        })
      });

      if (response.ok) {
        setLastResult({ success: true, message: 'Notification envoyée avec succès!' });
        await refreshNotifications();
      } else {
        const error = await response.json();
        setLastResult({ success: false, message: error.error || 'Erreur lors de l\'envoi' });
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'envoi de notification push de test
  const handleSendPush = async () => {
    setIsLoading(true);
    try {
      await sendNotification();
      setLastResult({ success: true, message: 'Notification push envoyée!' });
    } catch (error) {
      setLastResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur push'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtenir l'icône de statut
  const getStatusIcon = () => {
    if (!isSupported) return <XCircle className="h-4 w-4 text-red-500" />;
    if (permission === 'denied') return <XCircle className="h-4 w-4 text-red-500" />;
    if (permission === 'granted' && isSubscribed) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-yellow-500" />;
  };

  // Obtenir le statut textuel
  const getStatusText = () => {
    if (!isSupported) return 'Non supporté';
    if (permission === 'denied') return 'Permission refusée';
    if (permission === 'granted' && isSubscribed) return 'Actif';
    if (permission === 'granted') return 'Permission accordée';
    return 'En attente';
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tube className="h-5 w-5" />
            Panel de test des Notifications Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statut des notifications push */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-medium">Statut:</span>
                <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                  {getStatusText()}
                </Badge>
              </div>
              <PushNotificationManager userId={user.id} />
            </div>

            {/* Informations de support */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Support navigateur:</span>
                <Badge variant={isSupported ? 'default' : 'destructive'}>
                  {isSupported ? 'Oui' : 'Non'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Permission:</span>
                <Badge variant={
                  permission === 'granted' ? 'default' :
                  permission === 'denied' ? 'destructive' : 'secondary'
                }>
                  {permission || 'Inconnue'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Formulaire de test */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Send className="h-4 w-4" />
              Envoyer une notification de test
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-title">Titre</Label>
                <Input
                  id="test-title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de la notification"
                />
              </div>
              <div>
                <Label htmlFor="test-type">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm(prev => ({ ...prev, type: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORDER_STATUS_UPDATE">Mise à jour commande</SelectItem>
                    <SelectItem value="PROMOTION">Promotion</SelectItem>
                    <SelectItem value="NEW_PRODUCT">Nouveau produit</SelectItem>
                    <SelectItem value="SYSTEM">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="test-message">Message</Label>
              <Textarea
                id="test-message"
                value={form.message}
                onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Contenu de la notification"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-order-id">ID Commande (optionnel)</Label>
                <Input
                  id="test-order-id"
                  value={form.orderId}
                  onChange={(e) => setForm(prev => ({ ...prev, orderId: e.target.value }))}
                  placeholder="ID de commande"
                />
              </div>
              <div>
                <Label htmlFor="test-data">Données JSON (optionnel)</Label>
                <Input
                  id="test-data"
                  value={form.data}
                  onChange={(e) => setForm(prev => ({ ...prev, data: e.target.value }))}
                  placeholder='{"key": "value"}'
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2">
              <Button
                onClick={handleSend}
                disabled={isLoading || !form.title || !form.message}
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Envoi...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Envoyer Notification
                  </div>
                )}
              </Button>
              {isSubscribed && (
                <Button
                  onClick={handleSendPush}
                  disabled={isLoading}
                  variant="outline"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Push
                </Button>
              )}
            </div>
          </div>

          {/* Résultat du dernier test */}
          {lastResult && (
            <div className={`p-4 rounded-lg border ${
              lastResult.success
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {lastResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {lastResult.success ? 'Succès' : 'Erreur'}
                </span>
              </div>
              <p className="text-sm mt-1">{lastResult.message}</p>
            </div>
          )}

          <Separator />

          {/* Statistiques */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Info className="h-4 w-4" />
              Statistiques
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Notifications totales:</span>
                <Badge variant="outline">{notifications.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Non lues:</span>
                <Badge variant="outline">
                  {notifications.filter(n => !n.isRead).length}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}