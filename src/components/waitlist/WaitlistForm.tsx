'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Info,
  Bell,
  Heart,
  Utensils
} from 'lucide-react';
import { WaitlistService } from '@/services/waitlistService';
import {
  WaitlistEntry,
  WaitlistCreateRequest
} from '@/types/waitlist';
import { toast } from 'sonner';
import { CustomerProfile } from '@/types/customer';

interface WaitlistFormProps {
  customerProfile?: CustomerProfile;
  onSuccess?: (entry: WaitlistEntry) => void;
}

export default function WaitlistForm({ customerProfile, onSuccess }: WaitlistFormProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [createdEntry, setCreatedEntry] = useState<WaitlistEntry | null>(null);
  
  // Formulaire de création
  const [formData, setFormData] = useState<Partial<WaitlistCreateRequest>>({
    guestCount: 2,
    preferredTimeSlots: [],
    seatingPreference: 'no-preference'
  });

  // Pré-remplir avec le profil client si disponible
  useEffect(() => {
    if (customerProfile) {
      setFormData(prev => ({
        ...prev,
        customerId: customerProfile.id,
        customerName: customerProfile.name,
        customerEmail: customerProfile.email,
        customerPhone: customerProfile.phone,
        dietaryRestrictions: customerProfile.dietaryRestrictions,
        allergies: customerProfile.allergies
      }));
    }
  }, [customerProfile]);

  const handleTimeSlotToggle = (timeSlot: string) => {
    setFormData(prev => {
      const currentSlots = prev.preferredTimeSlots || [];
      const newSlots = currentSlots.includes(timeSlot)
        ? currentSlots.filter(slot => slot !== timeSlot)
        : [...currentSlots, timeSlot];
      return { ...prev, preferredTimeSlots: newSlots };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail || !formData.preferredDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!formData.preferredTimeSlots || formData.preferredTimeSlots.length === 0) {
      toast.error('Veuillez sélectionner au moins un créneau horaire');
      return;
    }

    try {
      setLoading(true);
      
      const request: WaitlistCreateRequest = {
        customerId: formData.customerId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || '',
        guestCount: formData.guestCount || 2,
        preferredDate: formData.preferredDate,
        preferredTimeSlots: formData.preferredTimeSlots,
        seatingPreference: formData.seatingPreference === 'no-preference' ? undefined : formData.seatingPreference,
        occasion: formData.occasion,
        specialRequests: formData.specialRequests,
        dietaryRestrictions: formData.dietaryRestrictions,
        allergies: formData.allergies
      };

      const entry = await WaitlistService.createWaitlistEntry(request);
      setCreatedEntry(entry);
      setSubmitted(true);
      toast.success('Votre demande a été ajoutée à la liste d\'attente !');
      
      if (onSuccess) {
        onSuccess(entry);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  if (submitted && createdEntry) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Demande enregistrée !</CardTitle>
          <CardDescription>
            Votre demande a été ajoutée à notre liste d'attente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">Numéro de demande</span>
              <Badge variant="secondary">{createdEntry.id.slice(-8).toUpperCase()}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Position dans la file</span>
              <Badge variant="default">#{createdEntry.position}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-medium">Temps d'attente estimé</span>
              <span className="text-sm text-muted-foreground">
                ~{createdEntry.estimatedWaitTime} minutes
              </span>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{createdEntry.guestCount} personne{createdEntry.guestCount > 1 ? 's' : ''}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{new Date(createdEntry.preferredDate).toLocaleDateString('fr-FR')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{createdEntry.preferredTimeSlots.join(', ')}</span>
              </div>
            </div>
          </div>
          
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              Nous vous notifierons par email et SMS dès qu'une table correspondant à vos critères sera disponible.
              Vous aurez alors 30 minutes pour confirmer votre réservation.
            </AlertDescription>
          </Alert>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Un email de confirmation a été envoyé à <strong>{createdEntry.customerEmail}</strong>
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSubmitted(false);
                setCreatedEntry(null);
                setFormData({
                  guestCount: 2,
                  preferredTimeSlots: [],
                  seatingPreference: 'no-preference'
                });
              }}
            >
              Faire une nouvelle demande
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="h-5 w-5 text-red-500" />
          <span>Liste d'attente</span>
        </CardTitle>
        <CardDescription>
          Aucune table disponible pour vos critères ? Rejoignez notre liste d'attente et nous vous notifierons dès qu'une place se libère.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Informations personnelles</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Nom complet *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Votre nom complet"
                  disabled={!!customerProfile}
                  required
                />
                {customerProfile && (
                  <p className="text-xs text-muted-foreground">Information provenant de votre profil</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="votre@email.com"
                  disabled={!!customerProfile}
                  required
                />
                {customerProfile && (
                  <p className="text-xs text-muted-foreground">Information provenant de votre profil</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Téléphone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+33 1 23 45 67 89"
                  disabled={!!customerProfile}
                />
                {customerProfile && (
                  <p className="text-xs text-muted-foreground">Information provenant de votre profil</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="guestCount">Nombre de convives *</Label>
                <Select
                  value={formData.guestCount?.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, guestCount: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10,12,15,20].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} personne{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Préférences de réservation */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Préférences de réservation</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Date souhaitée *</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={formData.preferredDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seatingPreference">Préférence de siège</Label>
                <Select
                  value={formData.seatingPreference || 'no-preference'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, seatingPreference: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-preference">Aucune préférence</SelectItem>
                    <SelectItem value="indoor">Intérieur</SelectItem>
                    <SelectItem value="outdoor">Terrasse</SelectItem>
                    <SelectItem value="private">Salon privé</SelectItem>
                    <SelectItem value="bar">Comptoir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Créneaux horaires souhaités *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Sélectionnez un ou plusieurs créneaux. Plus vous en sélectionnez, plus vos chances d'obtenir une table rapidement sont élevées.
              </p>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    type="button"
                    variant={formData.preferredTimeSlots?.includes(slot) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleTimeSlotToggle(slot)}
                    className="text-sm"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion spéciale</Label>
              <Input
                id="occasion"
                value={formData.occasion || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, occasion: e.target.value }))}
                placeholder="Anniversaire, demande en mariage, business..."
              />
              <p className="text-xs text-muted-foreground">
                Les occasions spéciales peuvent bénéficier d'une priorité plus élevée
              </p>
            </div>
          </div>
          
          <Separator />
          
          {/* Demandes spéciales */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center space-x-2">
              <Utensils className="h-4 w-4" />
              <span>Demandes spéciales</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Demandes particulières</Label>
                <Textarea
                  id="specialRequests"
                  value={formData.specialRequests || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                  placeholder="Table près de la fenêtre, chaise haute pour enfant, etc."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dietaryRestrictions">Restrictions alimentaires</Label>
                  <Input
                    id="dietaryRestrictions"
                    value={formData.dietaryRestrictions || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                    placeholder="Végétarien, végan, sans gluten..."
                    disabled={!!customerProfile}
                  />
                  {customerProfile && (
                    <p className="text-xs text-muted-foreground">Information provenant de votre profil</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                    placeholder="Fruits à coque, fruits de mer..."
                    disabled={!!customerProfile}
                  />
                  {customerProfile && (
                    <p className="text-xs text-muted-foreground">Information provenant de votre profil</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Comment ça marche ?</strong><br />
              1. Nous vous ajoutons à notre liste d'attente<br />
              2. Dès qu'une table correspondant à vos critères se libère, nous vous notifions<br />
              3. Vous avez 30 minutes pour confirmer votre réservation<br />
              4. Si vous ne répondez pas, nous passons au suivant
            </AlertDescription>
          </Alert>
          
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Ajout en cours...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                Rejoindre la liste d'attente
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}