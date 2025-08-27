"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare, Clock, Send, Settings, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";

interface Notification {
  id: string;
  type: 'email' | 'sms' | 'push';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  recipient: string;
  subject?: string;
  message: string;
  scheduledFor: Date;
  sentAt?: Date;
  reservationId: string;
  customerName: string;
  notificationType: 'confirmation' | 'reminder' | 'cancellation' | 'modification';
  retryCount: number;
  maxRetries: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'confirmation' | 'reminder' | 'cancellation' | 'modification';
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  template: string;
  variables: string[];
  isActive: boolean;
  timing: {
    sendImmediately?: boolean;
    delayMinutes?: number;
    reminderHours?: number[];
  };
}

interface NotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  smtpConfig: {
    host: string;
    port: number;
    username: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
  smsConfig: {
    provider: string;
    apiKey: string;
    fromNumber: string;
  };
  defaultReminders: number[]; // heures avant la réservation
  autoConfirmation: boolean;
  autoReminders: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'email',
    status: 'delivered',
    recipient: 'martin.dubois@email.com',
    subject: 'Confirmation de votre réservation',
    message: 'Votre réservation pour 4 personnes le 15 janvier à 19h30 est confirmée.',
    scheduledFor: new Date('2024-01-14T10:00:00'),
    sentAt: new Date('2024-01-14T10:00:15'),
    reservationId: 'RES-001',
    customerName: 'Martin Dubois',
    notificationType: 'confirmation',
    retryCount: 0,
    maxRetries: 3
  },
  {
    id: '2',
    type: 'sms',
    status: 'pending',
    recipient: '+33123456789',
    message: 'Rappel: Votre réservation chez OMIAM demain à 19h30 pour 4 personnes.',
    scheduledFor: new Date('2024-01-14T19:30:00'),
    reservationId: 'RES-001',
    customerName: 'Martin Dubois',
    notificationType: 'reminder',
    retryCount: 0,
    maxRetries: 3
  },
  {
    id: '3',
    type: 'email',
    status: 'failed',
    recipient: 'sophie.martin@email.com',
    subject: 'Confirmation de votre réservation',
    message: 'Votre réservation pour 2 personnes le 16 janvier à 20h00 est confirmée.',
    scheduledFor: new Date('2024-01-13T14:30:00'),
    reservationId: 'RES-002',
    customerName: 'Sophie Martin',
    notificationType: 'confirmation',
    retryCount: 2,
    maxRetries: 3
  }
];

const INITIAL_TEMPLATES: NotificationTemplate[] = [
  {
    id: '1',
    name: 'Confirmation de réservation - Email',
    type: 'confirmation',
    channel: 'email',
    subject: 'Confirmation de votre réservation chez OMIAM',
    template: `Bonjour {{customerName}},\n\nVotre réservation est confirmée :\n\n📅 Date : {{date}}\n🕐 Heure : {{time}}\n👥 Nombre de personnes : {{guests}}\n🪑 Table : {{tableNumber}}\n\nNous avons hâte de vous accueillir !\n\nCordialement,\nL'équipe OMIAM`,
    variables: ['customerName', 'date', 'time', 'guests', 'tableNumber'],
    isActive: true,
    timing: {
      sendImmediately: true
    }
  },
  {
    id: '2',
    name: 'Rappel 24h - SMS',
    type: 'reminder',
    channel: 'sms',
    template: `Rappel OMIAM: Votre réservation demain {{date}} à {{time}} pour {{guests}} personnes. À bientôt !`,
    variables: ['date', 'time', 'guests'],
    isActive: true,
    timing: {
      reminderHours: [24]
    }
  },
  {
    id: '3',
    name: 'Rappel 2h - SMS',
    type: 'reminder',
    channel: 'sms',
    template: `OMIAM: Votre réservation dans 2h ({{time}}) pour {{guests}} personnes. Merci de nous prévenir en cas d'empêchement.`,
    variables: ['time', 'guests'],
    isActive: true,
    timing: {
      reminderHours: [2]
    }
  }
];

const INITIAL_SETTINGS: NotificationSettings = {
  emailEnabled: true,
  smsEnabled: true,
  pushEnabled: false,
  smtpConfig: {
    host: 'smtp.gmail.com',
    port: 587,
    username: 'restaurant@omiam.com',
    password: '••••••••',
    fromEmail: 'restaurant@omiam.com',
    fromName: 'Restaurant OMIAM'
  },
  smsConfig: {
    provider: 'Twilio',
    apiKey: '••••••••',
    fromNumber: '+33123456789'
  },
  defaultReminders: [24, 2], // 24h et 2h avant
  autoConfirmation: true,
  autoReminders: true
};

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [templates, setTemplates] = useState<NotificationTemplate[]>(INITIAL_TEMPLATES);
  const [settings, setSettings] = useState<NotificationSettings>(INITIAL_SETTINGS);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<NotificationTemplate>>({
    name: '',
    type: 'confirmation',
    channel: 'email',
    template: '',
    variables: [],
    isActive: true,
    timing: {}
  });

  // Simulation de l'envoi de notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.map(notif => {
        if (notif.status === 'pending' && new Date() >= notif.scheduledFor) {
          // Simuler l'envoi avec 90% de succès
          const success = Math.random() > 0.1;
          return {
            ...notif,
            status: success ? 'sent' : 'failed',
            sentAt: success ? new Date() : undefined,
            retryCount: success ? notif.retryCount : notif.retryCount + 1
          };
        }
        return notif;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendNotification = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId 
        ? { ...notif, status: 'pending', scheduledFor: new Date() }
        : notif
    ));
    toast({
      title: "Notification programmée",
      description: "La notification sera envoyée dans quelques instants."
    });
  };

  const handleRetryNotification = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && notification.retryCount < notification.maxRetries) {
      handleSendNotification(notificationId);
    }
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    } else if (newTemplate.name && newTemplate.template) {
      const id = Math.max(...templates.map(t => parseInt(t.id))) + 1;
      const template: NotificationTemplate = {
        id: id.toString(),
        name: newTemplate.name,
        type: newTemplate.type || 'confirmation',
        channel: newTemplate.channel || 'email',
        subject: newTemplate.subject,
        template: newTemplate.template,
        variables: extractVariables(newTemplate.template),
        isActive: newTemplate.isActive !== false,
        timing: newTemplate.timing || {}
      };
      setTemplates(prev => [...prev, template]);
    }
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      type: 'confirmation',
      channel: 'email',
      template: '',
      variables: [],
      isActive: true,
      timing: {}
    });
  };

  const extractVariables = (template: string): string[] => {
    const matches = template.match(/{{(.*?)}}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
  };

  const getStatusIcon = (status: Notification['status']) => {
    switch (status) {
      case 'delivered':
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusText = (status: Notification['status']) => {
    switch (status) {
      case 'delivered': return 'Livré';
      case 'sent': return 'Envoyé';
      case 'failed': return 'Échec';
      case 'pending': return 'En attente';
      default: return 'Inconnu';
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <MessageSquare className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length,
    pending: notifications.filter(n => n.status === 'pending').length,
    failed: notifications.filter(n => n.status === 'failed').length,
    successRate: Math.round((notifications.filter(n => n.status === 'sent' || n.status === 'delivered').length / notifications.length) * 100)
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-red-800 dark:text-red-600">Système de Notifications</h2>
          <p className="text-muted-foreground mt-2">
            Gérez les confirmations, rappels et communications avec vos clients
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Paramètres de notification</DialogTitle>
                <DialogDescription>
                  Configurez les paramètres d'envoi des notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Canaux de communication</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-enabled">Email activé</Label>
                      <Switch
                        id="email-enabled"
                        checked={settings.emailEnabled}
                        onCheckedChange={(checked) => setSettings({...settings, emailEnabled: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-enabled">SMS activé</Label>
                      <Switch
                        id="sms-enabled"
                        checked={settings.smsEnabled}
                        onCheckedChange={(checked) => setSettings({...settings, smsEnabled: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push-enabled">Notifications push activées</Label>
                      <Switch
                        id="push-enabled"
                        checked={settings.pushEnabled}
                        onCheckedChange={(checked) => setSettings({...settings, pushEnabled: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Automatisation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-confirmation">Confirmation automatique</Label>
                      <Switch
                        id="auto-confirmation"
                        checked={settings.autoConfirmation}
                        onCheckedChange={(checked) => setSettings({...settings, autoConfirmation: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="auto-reminders">Rappels automatiques</Label>
                      <Switch
                        id="auto-reminders"
                        checked={settings.autoReminders}
                        onCheckedChange={(checked) => setSettings({...settings, autoReminders: checked})}
                      />
                    </div>
                  </div>
                </div>

                {settings.emailEnabled && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Configuration SMTP</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-host">Serveur SMTP</Label>
                        <Input
                          id="smtp-host"
                          value={settings.smtpConfig.host}
                          onChange={(e) => setSettings({
                            ...settings,
                            smtpConfig: {...settings.smtpConfig, host: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">Port</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={settings.smtpConfig.port}
                          onChange={(e) => setSettings({
                            ...settings,
                            smtpConfig: {...settings.smtpConfig, port: parseInt(e.target.value)}
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-from-email">Email expéditeur</Label>
                        <Input
                          id="smtp-from-email"
                          type="email"
                          value={settings.smtpConfig.fromEmail}
                          onChange={(e) => setSettings({
                            ...settings,
                            smtpConfig: {...settings.smtpConfig, fromEmail: e.target.value}
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-from-name">Nom expéditeur</Label>
                        <Input
                          id="smtp-from-name"
                          value={settings.smtpConfig.fromName}
                          onChange={(e) => setSettings({
                            ...settings,
                            smtpConfig: {...settings.smtpConfig, fromName: e.target.value}
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>Annuler</Button>
                <Button onClick={() => setIsSettingsDialogOpen(false)}>Sauvegarder</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            <div className="text-sm text-muted-foreground">Envoyées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">En attente</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-muted-foreground">Échecs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <div className="text-sm text-muted-foreground">Taux de succès</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Modèles</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-4">
            {notifications.map((notification) => (
              <Card key={notification.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(notification.type)}
                        <h3 className="font-semibold">{notification.customerName}</h3>
                        <Badge variant="outline">{notification.notificationType}</Badge>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(notification.status)}
                          <span className="text-sm">{getStatusText(notification.status)}</span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>Destinataire:</strong> {notification.recipient}</p>
                          <p><strong>Réservation:</strong> {notification.reservationId}</p>
                          <p><strong>Programmé pour:</strong> {notification.scheduledFor.toLocaleString()}</p>
                          {notification.sentAt && (
                            <p><strong>Envoyé le:</strong> {notification.sentAt.toLocaleString()}</p>
                          )}
                        </div>
                        <div>
                          {notification.subject && (
                            <p><strong>Sujet:</strong> {notification.subject}</p>
                          )}
                          <p><strong>Message:</strong></p>
                          <p className="text-muted-foreground italic">{notification.message}</p>
                          {notification.status === 'failed' && (
                            <p><strong>Tentatives:</strong> {notification.retryCount}/{notification.maxRetries}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {notification.status === 'pending' && (
                        <Button size="sm" onClick={() => handleSendNotification(notification.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                      {notification.status === 'failed' && notification.retryCount < notification.maxRetries && (
                        <Button size="sm" variant="outline" onClick={() => handleRetryNotification(notification.id)}>
                          Réessayer
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDeleteNotification(notification.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Modèles de notification</h3>
            <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Bell className="h-4 w-4 mr-2" />
                  Nouveau modèle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? 'Modifier le modèle' : 'Nouveau modèle de notification'}
                  </DialogTitle>
                  <DialogDescription>
                    Créez ou modifiez un modèle de notification personnalisé
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Nom du modèle</Label>
                      <Input
                        id="template-name"
                        value={editingTemplate?.name || newTemplate.name || ''}
                        onChange={(e) => {
                          if (editingTemplate) {
                            setEditingTemplate({...editingTemplate, name: e.target.value});
                          } else {
                            setNewTemplate({...newTemplate, name: e.target.value});
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-type">Type</Label>
                      <Select 
                        value={editingTemplate?.type || newTemplate.type} 
                        onValueChange={(value: NotificationTemplate['type']) => {
                          if (editingTemplate) {
                            setEditingTemplate({...editingTemplate, type: value});
                          } else {
                            setNewTemplate({...newTemplate, type: value});
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="confirmation">Confirmation</SelectItem>
                          <SelectItem value="reminder">Rappel</SelectItem>
                          <SelectItem value="cancellation">Annulation</SelectItem>
                          <SelectItem value="modification">Modification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-channel">Canal</Label>
                      <Select 
                        value={editingTemplate?.channel || newTemplate.channel} 
                        onValueChange={(value: NotificationTemplate['channel']) => {
                          if (editingTemplate) {
                            setEditingTemplate({...editingTemplate, channel: value});
                          } else {
                            setNewTemplate({...newTemplate, channel: value});
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="both">Les deux</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-6">
                      <Switch
                        id="template-active"
                        checked={editingTemplate?.isActive !== false && newTemplate.isActive !== false}
                        onCheckedChange={(checked) => {
                          if (editingTemplate) {
                            setEditingTemplate({...editingTemplate, isActive: checked});
                          } else {
                            setNewTemplate({...newTemplate, isActive: checked});
                          }
                        }}
                      />
                      <Label htmlFor="template-active">Modèle actif</Label>
                    </div>
                  </div>
                  {((editingTemplate?.channel || newTemplate.channel) === 'email' || (editingTemplate?.channel || newTemplate.channel) === 'both') && (
                    <div>
                      <Label htmlFor="template-subject">Sujet (Email)</Label>
                      <Input
                        id="template-subject"
                        value={editingTemplate?.subject || newTemplate.subject || ''}
                        onChange={(e) => {
                          if (editingTemplate) {
                            setEditingTemplate({...editingTemplate, subject: e.target.value});
                          } else {
                            setNewTemplate({...newTemplate, subject: e.target.value});
                          }
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="template-content">Contenu du message</Label>
                    <Textarea
                      id="template-content"
                      rows={6}
                      value={editingTemplate?.template || newTemplate.template || ''}
                      onChange={(e) => {
                        if (editingTemplate) {
                          setEditingTemplate({...editingTemplate, template: e.target.value});
                        } else {
                          setNewTemplate({...newTemplate, template: e.target.value});
                        }
                      }}
                      placeholder="Utilisez {{variable}} pour insérer des données dynamiques"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Variables disponibles: {{customerName}}, {{date}}, {{time}}, {{guests}}, {{tableNumber}}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setIsTemplateDialogOpen(false);
                    setEditingTemplate(null);
                  }}>Annuler</Button>
                  <Button onClick={handleSaveTemplate}>Sauvegarder</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline">{template.type}</Badge>
                        <Badge variant={template.channel === 'email' ? 'default' : template.channel === 'sms' ? 'secondary' : 'outline'}>
                          {template.channel}
                        </Badge>
                        {template.isActive ? (
                          <Badge variant="default">Actif</Badge>
                        ) : (
                          <Badge variant="secondary">Inactif</Badge>
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        {template.subject && (
                          <p><strong>Sujet:</strong> {template.subject}</p>
                        )}
                        <p><strong>Contenu:</strong></p>
                        <p className="text-muted-foreground italic bg-gray-50 p-2 rounded">
                          {template.template}
                        </p>
                        <p><strong>Variables:</strong> {template.variables.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsTemplateDialogOpen(true);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          setTemplates(prev => prev.filter(t => t.id !== template.id));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}