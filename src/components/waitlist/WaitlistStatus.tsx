'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info,
  Bell,
  Heart,
  MapPin,
  Star,
  Trash2,
  Edit
} from 'lucide-react';
import { WaitlistService } from '@/services/waitlistService';
import {
  WaitlistEntry,
  WaitlistStatus as WaitlistStatusType
} from '@/types/waitlist';
import { toast } from 'sonner';

interface WaitlistStatusProps {
  customerId?: string;
  onUpdate?: (entry: WaitlistEntry) => void;
  onCancel?: (entryId: string) => void;
}

export default function WaitlistStatus({ customerId, onUpdate, onCancel }: WaitlistStatusProps) {
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone' | 'id'>('email');

  // Auto-charger les entrées si customerId est fourni
  useEffect(() => {
    if (customerId) {
      loadCustomerEntries();
    }
  }, [customerId]);

  const loadCustomerEntries = async () => {
    if (!customerId) return;
    
    try {
      setLoading(true);
      const customerEntries = await WaitlistService.getWaitlistEntries({
        customerId,
        status: ['pending', 'notified']
      });
      setEntries(customerEntries);
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Veuillez saisir un critère de recherche');
      return;
    }

    try {
      setSearchLoading(true);
      
      const searchFilters: any = {
        status: ['pending', 'notified']
      };

      if (searchType === 'email') {
        searchFilters.customerEmail = searchQuery.trim();
      } else if (searchType === 'phone') {
        searchFilters.customerPhone = searchQuery.trim();
      } else if (searchType === 'id') {
        // Recherche par ID d'entrée
        const entry = await WaitlistService.getWaitlistEntry(searchQuery.trim());
        setEntries(entry ? [entry] : []);
        return;
      }

      const results = await WaitlistService.getWaitlistEntries(searchFilters);
      setEntries(results);
      
      if (results.length === 0) {
        toast.info('Aucune entrée trouvée pour ces critères');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la recherche');
      setEntries([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRefresh = async (entryId: string) => {
    try {
      const updatedEntry = await WaitlistService.getWaitlistEntry(entryId);
      if (updatedEntry) {
        setEntries(prev => prev.map(entry => 
          entry.id === entryId ? updatedEntry : entry
        ));
        toast.success('Statut mis à jour');
        
        if (onUpdate) {
          onUpdate(updatedEntry);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleCancel = async (entryId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      return;
    }

    try {
      await WaitlistService.updateWaitlistEntry(entryId, {
        status: 'cancelled'
      });
      
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Demande annulée');
      
      if (onCancel) {
        onCancel(entryId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'annulation');
    }
  };

  const getStatusColor = (status: WaitlistStatusType) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'notified': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: WaitlistStatusType) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'notified': return <Bell className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: WaitlistStatusType) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'notified': return 'Notifié';
      case 'confirmed': return 'Confirmé';
      case 'expired': return 'Expiré';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const calculateProgress = (position: number, totalEntries: number = 50) => {
    return Math.max(0, Math.min(100, ((totalEntries - position) / totalEntries) * 100));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Recherche */}
      {!customerId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>Vérifier le statut de votre demande</span>
            </CardTitle>
            <CardDescription>
              Recherchez votre demande par email, téléphone ou numéro de demande
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Critère de recherche</Label>
                <div className="flex mt-2">
                  <select 
                    className="px-3 py-2 border border-r-0 rounded-l-md bg-muted text-sm"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                  >
                    <option value="email">Email</option>
                    <option value="phone">Téléphone</option>
                    <option value="id">N° demande</option>
                  </select>
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      searchType === 'email' ? 'votre@email.com' :
                      searchType === 'phone' ? '+33 1 23 45 67 89' :
                      'ABC12345'
                    }
                    className="rounded-l-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="w-full md:w-auto"
                >
                  {searchLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Recherche...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {loading ? (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Chargement...</span>
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucune demande trouvée</h3>
            <p className="text-muted-foreground">
              {customerId ? 
                'Vous n\'avez aucune demande en cours dans notre liste d\'attente.' :
                'Aucune demande ne correspond à vos critères de recherche.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      Demande #{entry.id.slice(-8).toUpperCase()}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{entry.guestCount} personne{entry.guestCount > 1 ? 's' : ''}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(entry.preferredDate).toLocaleDateString('fr-FR')}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{entry.preferredTimeSlots.join(', ')}</span>
                      </span>
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(entry.status)}>
                      {getStatusIcon(entry.status)}
                      <span className="ml-1">{getStatusText(entry.status)}</span>
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRefresh(entry.id)}
                      title="Actualiser"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Statut et progression */}
                {entry.status === 'pending' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Position dans la file</span>
                      <Badge variant="secondary">#{entry.position}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progression</span>
                        <span>{Math.round(calculateProgress(entry.position))}%</span>
                      </div>
                      <Progress value={calculateProgress(entry.position)} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Temps d'attente estimé</span>
                      <span className="font-medium text-primary">
                        ~{entry.estimatedWaitTime} minutes
                      </span>
                    </div>
                  </div>
                )}
                
                {entry.status === 'notified' && (
                  <Alert>
                    <Bell className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Une table est disponible !</strong><br />
                      Nous vous avons envoyé une notification. Vous avez jusqu'à{' '}
                      <strong>{new Date(entry.notificationExpiry!).toLocaleString('fr-FR')}</strong>{' '}
                      pour confirmer votre réservation.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Separator />
                
                {/* Détails de la demande */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{entry.customerEmail}</span>
                    </div>
                    
                    {entry.customerPhone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{entry.customerPhone}</span>
                      </div>
                    )}
                    
                    {entry.seatingPreference && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{entry.seatingPreference}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Créé le {new Date(entry.createdAt).toLocaleString('fr-FR')}
                    </div>
                    
                    {entry.occasion && (
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>{entry.occasion}</span>
                      </div>
                    )}
                    
                    <div className="text-xs">
                      <span className="font-medium">Priorité:</span>{' '}
                      <Badge variant="outline" className="text-xs">
                        {entry.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Demandes spéciales */}
                {(entry.specialRequests || entry.dietaryRestrictions || entry.allergies) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Demandes spéciales</h4>
                      
                      {entry.specialRequests && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Demandes:</strong> {entry.specialRequests}
                        </p>
                      )}
                      
                      {entry.dietaryRestrictions && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Restrictions:</strong> {entry.dietaryRestrictions}
                        </p>
                      )}
                      
                      {entry.allergies && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Allergies:</strong> {entry.allergies}
                        </p>
                      )}
                    </div>
                  </>
                )}
                
                {/* Actions */}
                {(entry.status === 'pending' || entry.status === 'notified') && (
                  <>
                    <Separator />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Annuler la demande
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Informations générales */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Rappel:</strong> Lorsqu'une table correspondant à vos critères sera disponible, 
          vous recevrez une notification par email et SMS. Vous aurez alors 30 minutes pour 
          confirmer votre réservation avant que nous passions au client suivant.
        </AlertDescription>
      </Alert>
    </div>
  );
}