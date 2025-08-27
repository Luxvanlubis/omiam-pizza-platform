'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Bell,
  Filter,
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Send,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { WaitlistService } from '@/services/waitlistService';
import {
  WaitlistEntry,
  WaitlistCreateRequest,
  WaitlistSearchFilters,
  WaitlistStats,
  WaitlistAvailability,
  WaitlistMatchResult
} from '@/types/waitlist';
import { toast } from 'sonner';

interface WaitlistManagerProps {
  isAdmin?: boolean;
  customerId?: string;
}

export default function WaitlistManager({ isAdmin = false, customerId }: WaitlistManagerProps) {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [matches, setMatches] = useState<WaitlistMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState<WaitlistSearchFilters>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [activeTab, setActiveTab] = useState('entries');

  // Formulaire de création
  const [createForm, setCreateForm] = useState<Partial<WaitlistCreateRequest>>({
    guestCount: 2,
    preferredTimeSlots: [],
    priority: 'medium'
  });

  useEffect(() => {
    loadData();
  }, [customerId, searchFilters]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les entrées selon le contexte
      let entriesData: WaitlistEntry[];
      if (isAdmin) {
        entriesData = await WaitlistService.searchWaitlistEntries(searchFilters);
      } else if (customerId) {
        entriesData = await WaitlistService.searchWaitlistEntries({ 
          ...searchFilters, 
          customerId 
        });
      } else {
        entriesData = [];
      }
      
      setEntries(entriesData);

      // Charger les statistiques pour les admins
      if (isAdmin) {
        const statsData = await WaitlistService.getWaitlistStats();
        setStats(statsData);
        
        // Simuler des disponibilités pour les correspondances
        const mockAvailability: WaitlistAvailability[] = [
          {
            date: new Date().toISOString().split('T')[0],
            timeSlot: '19:00',
            availableTables: 2,
            seatingTypes: ['indoor', 'outdoor']
          },
          {
            date: new Date().toISOString().split('T')[0],
            timeSlot: '20:00',
            availableTables: 1,
            seatingTypes: ['indoor']
          }
        ];
        
        const matchesData = await WaitlistService.findMatches(mockAvailability);
        setMatches(matchesData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    try {
      if (!createForm.customerName || !createForm.customerEmail || !createForm.preferredDate) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const request: WaitlistCreateRequest = {
        customerId,
        customerName: createForm.customerName,
        customerEmail: createForm.customerEmail,
        customerPhone: createForm.customerPhone || '',
        guestCount: createForm.guestCount || 2,
        preferredDate: createForm.preferredDate,
        preferredTimeSlots: createForm.preferredTimeSlots || [],
        seatingPreference: createForm.seatingPreference,
        occasion: createForm.occasion,
        specialRequests: createForm.specialRequests
      };

      await WaitlistService.createWaitlistEntry(request);
      toast.success('Demande ajoutée à la liste d\'attente');
      setShowCreateDialog(false);
      setCreateForm({ guestCount: 2, preferredTimeSlots: [], priority: 'medium' });
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la création');
    }
  };

  const handleUpdateStatus = async (entryId: string, status: WaitlistEntry['status']) => {
    try {
      await WaitlistService.updateWaitlistEntry(entryId, { status });
      toast.success('Statut mis à jour');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await WaitlistService.deleteWaitlistEntry(entryId);
      toast.success('Entrée supprimée');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSendNotification = async (entryId: string, type: 'availability' | 'reminder') => {
    try {
      await WaitlistService.sendNotification(entryId, type);
      toast.success('Notification envoyée');
      loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi');
    }
  };

  const getStatusBadge = (status: WaitlistEntry['status']) => {
    const variants = {
      waiting: { variant: 'secondary' as const, icon: Clock, text: 'En attente' },
      notified: { variant: 'default' as const, icon: Bell, text: 'Notifié' },
      confirmed: { variant: 'default' as const, icon: CheckCircle, text: 'Confirmé' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, text: 'Annulé' },
      expired: { variant: 'outline' as const, icon: AlertCircle, text: 'Expiré' }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: WaitlistEntry['priority']) => {
    const variants = {
      low: { variant: 'outline' as const, text: 'Faible' },
      medium: { variant: 'secondary' as const, text: 'Moyenne' },
      high: { variant: 'default' as const, text: 'Élevée' },
      urgent: { variant: 'destructive' as const, text: 'Urgente' }
    };
    
    return (
      <Badge variant={variants[priority].variant}>
        {variants[priority].text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques pour les admins */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{stats.totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">En attente</p>
                  <p className="text-2xl font-bold">{stats.activeEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Confirmés aujourd'hui</p>
                  <p className="text-2xl font-bold">{stats.confirmedToday}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Taux de conversion</p>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="entries">Liste d'attente</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="matches">Correspondances</TabsTrigger>
                <TabsTrigger value="analytics">Analytiques</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle demande
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouvelle demande de liste d'attente</DialogTitle>
                <DialogDescription>
                  Créer une nouvelle entrée dans la liste d'attente
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nom complet *</Label>
                  <Input
                    id="customerName"
                    value={createForm.customerName || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Nom du client"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={createForm.customerEmail || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                    placeholder="email@exemple.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Téléphone</Label>
                  <Input
                    id="customerPhone"
                    value={createForm.customerPhone || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="guestCount">Nombre de convives</Label>
                  <Select
                    value={createForm.guestCount?.toString()}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, guestCount: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} personne{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preferredDate">Date souhaitée *</Label>
                  <Input
                    id="preferredDate"
                    type="date"
                    value={createForm.preferredDate || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, preferredDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="seatingPreference">Préférence de siège</Label>
                  <Select
                    value={createForm.seatingPreference}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, seatingPreference: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune préférence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indoor">Intérieur</SelectItem>
                      <SelectItem value="outdoor">Terrasse</SelectItem>
                      <SelectItem value="private">Salon privé</SelectItem>
                      <SelectItem value="bar">Comptoir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="occasion">Occasion</Label>
                  <Input
                    id="occasion"
                    value={createForm.occasion || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, occasion: e.target.value }))}
                    placeholder="Anniversaire, business, etc."
                  />
                </div>
                
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="specialRequests">Demandes spéciales</Label>
                  <Textarea
                    id="specialRequests"
                    value={createForm.specialRequests || ''}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="Allergies, régimes spéciaux, etc."
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateEntry}>
                  Créer la demande
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Contenu des onglets */}
        <TabsContent value="entries" className="space-y-4">
          {/* Filtres de recherche */}
          {isAdmin && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Rechercher par nom, email ou téléphone..."
                      value={searchFilters.searchTerm || ''}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    />
                  </div>
                  <Select
                    value={searchFilters.status?.[0] || 'all'}
                    onValueChange={(value) => setSearchFilters(prev => ({ 
                      ...prev, 
                      status: value === 'all' ? undefined : [value as any]
                    }))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="waiting">En attente</SelectItem>
                      <SelectItem value="notified">Notifié</SelectItem>
                      <SelectItem value="confirmed">Confirmé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Liste des entrées */}
          <div className="space-y-4">
            {entries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucune entrée trouvée</h3>
                  <p className="text-muted-foreground">
                    {customerId ? 'Vous n\'avez aucune demande en cours.' : 'Aucune entrée dans la liste d\'attente.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-lg">{entry.customerName}</h3>
                          {getStatusBadge(entry.status)}
                          {getPriorityBadge(entry.priority)}
                          {entry.position && (
                            <Badge variant="outline">
                              Position #{entry.position}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{entry.guestCount} personne{entry.guestCount > 1 ? 's' : ''}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{new Date(entry.preferredDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{entry.preferredTimeSlots.join(', ')}</span>
                          </div>
                          
                          {entry.estimatedWaitTime && (
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                              <span>~{entry.estimatedWaitTime}min</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{entry.customerEmail}</span>
                          </div>
                          {entry.customerPhone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{entry.customerPhone}</span>
                            </div>
                          )}
                        </div>
                        
                        {entry.occasion && (
                          <div className="text-sm">
                            <span className="font-medium">Occasion:</span> {entry.occasion}
                          </div>
                        )}
                        
                        {entry.specialRequests && (
                          <div className="text-sm">
                            <span className="font-medium">Demandes spéciales:</span> {entry.specialRequests}
                          </div>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <div className="flex items-center space-x-2">
                          {entry.status === 'waiting' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendNotification(entry.id, 'availability')}
                              >
                                <Send className="h-4 w-4 mr-1" />
                                Notifier
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(entry.id, 'confirmed')}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmer
                              </Button>
                            </>
                          )}
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Onglet Correspondances (Admin uniquement) */}
        {isAdmin && (
          <TabsContent value="matches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Correspondances automatiques</CardTitle>
                <CardDescription>
                  Clients en liste d'attente correspondant aux créneaux disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Aucune correspondance trouvée</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match, index) => (
                      <Card key={match.waitlistEntry.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-semibold">{match.waitlistEntry.customerName}</h4>
                                <Badge variant="secondary">
                                  Score: {match.matchScore}%
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {match.reasons.join(' • ')}
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <span>{match.waitlistEntry.guestCount} personnes</span>
                                <span>{new Date(match.waitlistEntry.preferredDate).toLocaleDateString('fr-FR')}</span>
                                <span>{match.availableSlots.map(s => s.timeSlot).join(', ')}</span>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleSendNotification(match.waitlistEntry.id, 'availability')}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Notifier
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Onglet Analytiques (Admin uniquement) */}
        {isAdmin && stats && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Créneaux les plus demandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byTimeSlot)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([timeSlot, count]) => (
                        <div key={timeSlot} className="flex items-center justify-between">
                          <span className="font-medium">{timeSlot}</span>
                          <Badge variant="secondary">{count} demandes</Badge>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Préférences de siège</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.bySeatingPreference)
                      .sort(([,a], [,b]) => b - a)
                      .map(([preference, count]) => (
                        <div key={preference} className="flex items-center justify-between">
                          <span className="font-medium capitalize">{preference}</span>
                          <Badge variant="secondary">{count} demandes</Badge>
                        </div>
                      ))
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}