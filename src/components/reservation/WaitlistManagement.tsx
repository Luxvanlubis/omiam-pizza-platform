"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Clock, Users, Phone, Mail, Calendar, AlertCircle, CheckCircle, 
  X, Plus, Bell, Send, Eye, Filter, Search, Timer, Zap
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { formatCurrency } from '@/lib/utils';

interface WaitlistEntry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  requestedDate: string;
  requestedTime: string;
  guests: number;
  priority: 'low' | 'medium' | 'high' | 'vip';
  status: 'waiting' | 'notified' | 'confirmed' | 'expired' | 'cancelled';
  specialRequests?: string;
  maxWaitTime: number; // en minutes
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: string;
  updatedAt: string;
  estimatedWaitTime?: number;
  position?: number;
}

interface AvailableSlot {
  id: string;
  date: string;
  time: string;
  tableId: string;
  tableNumber: number;
  capacity: number;
  reason: 'cancellation' | 'no-show' | 'early-departure' | 'new-availability';
  availableUntil: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'availability' | 'position_update' | 'expiring_soon' | 'cancelled';
  subject: string;
  content: string;
  variables: string[];
}

const WaitlistManagement: React.FC = () => {
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [autoNotifications, setAutoNotifications] = useState(true);
  const [notificationTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Disponibilité trouvée',
      type: 'availability',
      subject: 'Une table est disponible pour votre réservation !',
      content: 'Bonjour {customerName}, une table pour {guests} personnes est maintenant disponible le {date} à {time}. Vous avez 15 minutes pour confirmer.',
      variables: ['customerName', 'guests', 'date', 'time']
    },
    {
      id: '2',
      name: 'Mise à jour position',
      type: 'position_update',
      subject: 'Mise à jour de votre position en liste d\'attente',
      content: 'Bonjour {customerName}, vous êtes maintenant en position {position} sur {total} dans notre liste d\'attente.',
      variables: ['customerName', 'position', 'total']
    }
  ]);

  // Données mockées pour la démonstration
  const [mockWaitlist] = useState<WaitlistEntry[]>([
    {
      id: 'WL-001',
      customerName: 'Marie Dubois',
      customerEmail: 'marie@email.com',
      customerPhone: '+33 1 23 45 67 89',
      requestedDate: '2024-01-15',
      requestedTime: '20:00',
      guests: 4,
      priority: 'high',
      status: 'waiting',
      specialRequests: 'Table près de la fenêtre si possible',
      maxWaitTime: 120,
      notificationPreferences: { email: true, sms: true, push: false },
      createdAt: '2024-01-15T18:30:00Z',
      updatedAt: '2024-01-15T18:30:00Z',
      estimatedWaitTime: 45,
      position: 1
    },
    {
      id: 'WL-002',
      customerName: 'Jean Martin',
      customerEmail: 'jean@email.com',
      customerPhone: '+33 1 98 76 54 32',
      requestedDate: '2024-01-15',
      requestedTime: '19:30',
      guests: 2,
      priority: 'medium',
      status: 'notified',
      maxWaitTime: 90,
      notificationPreferences: { email: true, sms: false, push: true },
      createdAt: '2024-01-15T17:45:00Z',
      updatedAt: '2024-01-15T19:15:00Z',
      estimatedWaitTime: 15,
      position: 2
    },
    {
      id: 'WL-003',
      customerName: 'Sophie Laurent',
      customerEmail: 'sophie@email.com',
      customerPhone: '+33 1 11 22 33 44',
      requestedDate: '2024-01-15',
      requestedTime: '21:00',
      guests: 6,
      priority: 'vip',
      status: 'waiting',
      specialRequests: 'Anniversaire - décoration spéciale',
      maxWaitTime: 180,
      notificationPreferences: { email: true, sms: true, push: true },
      createdAt: '2024-01-15T16:20:00Z',
      updatedAt: '2024-01-15T16:20:00Z',
      estimatedWaitTime: 90,
      position: 3
    }
  ]);

  const [mockSlots] = useState<AvailableSlot[]>([
    {
      id: 'SLOT-001',
      date: '2024-01-15',
      time: '19:45',
      tableId: 'T008',
      tableNumber: 8,
      capacity: 4,
      reason: 'cancellation',
      availableUntil: '2024-01-15T19:30:00Z'
    },
    {
      id: 'SLOT-002',
      date: '2024-01-15',
      time: '20:15',
      tableId: 'T012',
      tableNumber: 12,
      capacity: 2,
      reason: 'early-departure',
      availableUntil: '2024-01-15T20:00:00Z'
    }
  ]);

  useEffect(() => {
    setWaitlistEntries(mockWaitlist);
    setAvailableSlots(mockSlots);
  }, [mockWaitlist, mockSlots]);

  // Simulation de la mise à jour automatique des positions
  useEffect(() => {
    if (autoNotifications) {
      const interval = setInterval(() => {
        // Simulation de nouvelles disponibilités
        if (Math.random() > 0.8) {
          const newSlot: AvailableSlot = {
            id: `SLOT-${Date.now()}`,
            date: '2024-01-15',
            time: ['19:30', '20:00', '20:30', '21:00'][Math.floor(Math.random() * 4)],
            tableId: `T${String(Math.floor(Math.random() * 20) + 1).padStart(3, '0')}`,
            tableNumber: Math.floor(Math.random() * 20) + 1,
            capacity: [2, 4, 6][Math.floor(Math.random() * 3)],
            reason: ['cancellation', 'no-show', 'early-departure'][Math.floor(Math.random() * 3)] as any,
            availableUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString()
          };
          
          setAvailableSlots(prev => [newSlot, ...prev]);
          processNewAvailability(newSlot);
        }
      }, 30000); // Vérifier toutes les 30 secondes

      return () => clearInterval(interval);
    }
  }, [autoNotifications]);

  const processNewAvailability = (slot: AvailableSlot) => {
    // Trouver les entrées compatibles dans la liste d'attente
    const compatibleEntries = waitlistEntries
      .filter(entry => 
        entry.status === 'waiting' &&
        entry.requestedDate === slot.date &&
        entry.guests <= slot.capacity
      )
      .sort((a, b) => {
        // Trier par priorité puis par heure de création
        const priorityOrder = { vip: 4, high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

    if (compatibleEntries.length > 0) {
      const selectedEntry = compatibleEntries[0];
      notifyCustomer(selectedEntry, slot);
    }
  };

  const notifyCustomer = async (entry: WaitlistEntry, slot: AvailableSlot) => {
    try {
      // Simulation de l'envoi de notification
      const notifications = [];
      
      if (entry.notificationPreferences.email) {
        notifications.push('email');
      }
      if (entry.notificationPreferences.sms) {
        notifications.push('sms');
      }
      if (entry.notificationPreferences.push) {
        notifications.push('push');
      }

      // Mettre à jour le statut
      setWaitlistEntries(prev => 
        prev.map(e => 
          e.id === entry.id 
            ? { ...e, status: 'notified', updatedAt: new Date().toISOString() }
            : e
        )
      );

      toast({
        title: "Client notifié",
        description: `${entry.customerName} a été notifié de la disponibilité via ${notifications.join(', ')}.`,
      });

      // Programmer l'expiration automatique
      setTimeout(() => {
        setWaitlistEntries(prev => 
          prev.map(e => 
            e.id === entry.id && e.status === 'notified'
              ? { ...e, status: 'expired', updatedAt: new Date().toISOString() }
              : e
          )
        );
      }, 15 * 60 * 1000); // 15 minutes

    } catch (error) {
      console.error('Erreur lors de la notification:', error);
      toast({
        title: "Erreur de notification",
        description: "Impossible de notifier le client.",
        variant: "destructive"
      });
    }
  };

  const addToWaitlist = (entryData: Partial<WaitlistEntry>) => {
    const newEntry: WaitlistEntry = {
      id: `WL-${String(waitlistEntries.length + 1).padStart(3, '0')}`,
      customerName: entryData.customerName || '',
      customerEmail: entryData.customerEmail || '',
      customerPhone: entryData.customerPhone || '',
      requestedDate: entryData.requestedDate || '',
      requestedTime: entryData.requestedTime || '',
      guests: entryData.guests || 1,
      priority: entryData.priority || 'medium',
      status: 'waiting',
      specialRequests: entryData.specialRequests,
      maxWaitTime: entryData.maxWaitTime || 120,
      notificationPreferences: entryData.notificationPreferences || {
        email: true,
        sms: false,
        push: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      position: waitlistEntries.filter(e => e.status === 'waiting').length + 1
    };

    setWaitlistEntries(prev => [...prev, newEntry]);
    setIsAddingEntry(false);
    
    toast({
      title: "Ajouté à la liste d'attente",
      description: `${newEntry.customerName} a été ajouté en position ${newEntry.position}.`,
    });
  };

  const updateEntryStatus = (entryId: string, newStatus: WaitlistEntry['status']) => {
    setWaitlistEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, status: newStatus, updatedAt: new Date().toISOString() }
          : entry
      )
    );

    toast({
      title: "Statut mis à jour",
      description: `Le statut a été changé vers: ${getStatusText(newStatus)}.`,
    });
  };

  const removeFromWaitlist = (entryId: string) => {
    setWaitlistEntries(prev => prev.filter(entry => entry.id !== entryId));
    toast({
      title: "Retiré de la liste d'attente",
      description: "L'entrée a été supprimée avec succès.",
    });
  };

  const getStatusColor = (status: WaitlistEntry['status']) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'notified': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: WaitlistEntry['status']) => {
    switch (status) {
      case 'waiting': return 'En attente';
      case 'notified': return 'Notifié';
      case 'confirmed': return 'Confirmé';
      case 'expired': return 'Expiré';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getPriorityColor = (priority: WaitlistEntry['priority']) => {
    switch (priority) {
      case 'vip': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: WaitlistEntry['priority']) => {
    switch (priority) {
      case 'vip': return 'VIP';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const getReasonText = (reason: AvailableSlot['reason']) => {
    switch (reason) {
      case 'cancellation': return 'Annulation';
      case 'no-show': return 'Absence';
      case 'early-departure': return 'Départ anticipé';
      case 'new-availability': return 'Nouvelle disponibilité';
      default: return reason;
    }
  };

  const filteredEntries = waitlistEntries.filter(entry => {
    const matchesSearch = entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || entry.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || entry.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const waitingCount = waitlistEntries.filter(e => e.status === 'waiting').length;
  const notifiedCount = waitlistEntries.filter(e => e.status === 'notified').length;
  const averageWaitTime = waitlistEntries.reduce((acc, e) => acc + (e.estimatedWaitTime || 0), 0) / waitlistEntries.length || 0;

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600 flex items-center gap-2">
            <Timer className="h-6 w-6" />
            Gestion de la Liste d'Attente
          </h2>
          <p className="text-muted-foreground">
            Gérez les créneaux complets et les notifications de désistement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-notifications"
              checked={autoNotifications}
              onCheckedChange={setAutoNotifications}
            />
            <Label htmlFor="auto-notifications" className="text-sm">Notifications auto</Label>
          </div>
          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter à la liste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter à la liste d'attente</DialogTitle>
                <DialogDescription>
                  Enregistrer un client en attente d'une table
                </DialogDescription>
              </DialogHeader>
              <AddWaitlistForm onSubmit={addToWaitlist} onCancel={() => setIsAddingEntry(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold text-blue-600">{waitingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notifiés</p>
                <p className="text-2xl font-bold text-yellow-600">{notifiedCount}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Temps d'attente moyen</p>
                <p className="text-2xl font-bold text-green-600">{Math.round(averageWaitTime)}min</p>
              </div>
              <Timer className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Créneaux disponibles</p>
                <p className="text-2xl font-bold text-purple-600">{availableSlots.length}</p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="waiting">En attente</SelectItem>
                <SelectItem value="notified">Notifié</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="expired">Expiré</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste d'attente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Liste d'attente ({filteredEntries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEntries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune entrée trouvée
                </p>
              ) : (
                filteredEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{entry.customerName}</h4>
                          <Badge className={getStatusColor(entry.status)}>
                            {getStatusText(entry.status)}
                          </Badge>
                          <Badge className={getPriorityColor(entry.priority)}>
                            {getPriorityText(entry.priority)}
                          </Badge>
                          {entry.position && (
                            <Badge variant="outline">
                              Position {entry.position}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📧 {entry.customerEmail}</p>
                          <p>📞 {entry.customerPhone}</p>
                          <p>📅 {new Date(entry.requestedDate).toLocaleDateString()} à {entry.requestedTime}</p>
                          <p>👥 {entry.guests} personnes</p>
                          {entry.estimatedWaitTime && (
                            <p>⏱️ Attente estimée: {entry.estimatedWaitTime}min</p>
                          )}
                          {entry.specialRequests && (
                            <p className="text-blue-600">💬 {entry.specialRequests}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {entry.status === 'waiting' && (
                          <Button
                            size="sm"
                            onClick={() => updateEntryStatus(entry.id, 'notified')}
                          >
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromWaitlist(entry.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Créneaux disponibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Créneaux disponibles ({availableSlots.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableSlots.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun créneau disponible
                </p>
              ) : (
                availableSlots.map((slot) => (
                  <div key={slot.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">Table {slot.tableNumber}</h4>
                          <Badge variant="outline">
                            {slot.capacity} places
                          </Badge>
                          <Badge className="bg-orange-100 text-orange-800">
                            {getReasonText(slot.reason)}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>📅 {new Date(slot.date).toLocaleDateString()} à {slot.time}</p>
                          <p>⏰ Disponible jusqu'à {new Date(slot.availableUntil).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4 mr-2" />
                        Notifier
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails de l'entrée sélectionnée */}
      {selectedEntry && (
        <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'entrée - {selectedEntry.customerName}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Informations client</Label>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Nom:</strong> {selectedEntry.customerName}</p>
                    <p><strong>Email:</strong> {selectedEntry.customerEmail}</p>
                    <p><strong>Téléphone:</strong> {selectedEntry.customerPhone}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Détails de la demande</Label>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><strong>Date:</strong> {new Date(selectedEntry.requestedDate).toLocaleDateString()}</p>
                    <p><strong>Heure:</strong> {selectedEntry.requestedTime}</p>
                    <p><strong>Personnes:</strong> {selectedEntry.guests}</p>
                    <p><strong>Priorité:</strong> {getPriorityText(selectedEntry.priority)}</p>
                  </div>
                </div>
              </div>
              
              {selectedEntry.specialRequests && (
                <div>
                  <Label className="text-sm font-medium">Demandes spéciales</Label>
                  <p className="mt-2 text-sm bg-muted p-3 rounded">{selectedEntry.specialRequests}</p>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Préférences de notification</Label>
                <div className="mt-2 flex gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${selectedEntry.notificationPreferences.email ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${selectedEntry.notificationPreferences.sms ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">SMS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`h-4 w-4 ${selectedEntry.notificationPreferences.push ? 'text-green-600' : 'text-gray-400'}`} />
                    <span className="text-sm">Push</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => updateEntryStatus(selectedEntry.id, 'confirmed')}
                  disabled={selectedEntry.status !== 'notified'}
                >
                  Confirmer
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => updateEntryStatus(selectedEntry.id, 'cancelled')}
                >
                  Annuler
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    removeFromWaitlist(selectedEntry.id);
                    setSelectedEntry(null);
                  }}
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Composant pour ajouter une entrée à la liste d'attente
const AddWaitlistForm: React.FC<{
  onSubmit: (data: Partial<WaitlistEntry>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<WaitlistEntry>>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    requestedDate: new Date().toISOString().split('T')[0],
    requestedTime: '19:00',
    guests: 2,
    priority: 'medium',
    maxWaitTime: 120,
    notificationPreferences: {
      email: true,
      sms: false,
      push: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerName">Nom du client *</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="guests">Nombre de personnes *</Label>
          <Select 
            value={String(formData.guests)} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, guests: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8].map(num => (
                <SelectItem key={num} value={String(num)}>{num} personne{num > 1 ? 's' : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="customerEmail">Email *</Label>
        <Input
          id="customerEmail"
          type="email"
          value={formData.customerEmail}
          onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="customerPhone">Téléphone</Label>
        <Input
          id="customerPhone"
          value={formData.customerPhone}
          onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="requestedDate">Date souhaitée *</Label>
          <Input
            id="requestedDate"
            type="date"
            value={formData.requestedDate}
            onChange={(e) => setFormData(prev => ({ ...prev, requestedDate: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="requestedTime">Heure souhaitée *</Label>
          <Select 
            value={formData.requestedTime} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, requestedTime: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map(time => (
                <SelectItem key={time} value={time}>{time}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="priority">Priorité</Label>
        <Select 
          value={formData.priority} 
          onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Basse</SelectItem>
            <SelectItem value="medium">Moyenne</SelectItem>
            <SelectItem value="high">Haute</SelectItem>
            <SelectItem value="vip">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="specialRequests">Demandes spéciales</Label>
        <Textarea
          id="specialRequests"
          value={formData.specialRequests || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
          placeholder="Allergies, préférences de table, occasion spéciale..."
        />
      </div>
      
      <div>
        <Label>Préférences de notification</Label>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="email-notif"
              checked={formData.notificationPreferences?.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences!,
                  email: e.target.checked
                }
              }))}
            />
            <Label htmlFor="email-notif" className="text-sm">Email</Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sms-notif"
              checked={formData.notificationPreferences?.sms}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                notificationPreferences: {
                  ...prev.notificationPreferences!,
                  sms: e.target.checked
                }
              }))}
            />
            <Label htmlFor="sms-notif" className="text-sm">SMS</Label>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit">Ajouter à la liste</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
};

export default WaitlistManagement;