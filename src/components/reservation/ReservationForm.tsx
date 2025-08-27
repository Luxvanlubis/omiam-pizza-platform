'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { 
  User, 
  Phone, 
  Mail, 
  Users, 
  Clock, 
  Calendar, 
  MapPin, 
  Utensils, 
  Heart,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { CustomerProfile } from '@/types/customer';
import TableManagement from './TableManagement';

interface ReservationFormData {
  // Informations personnelles
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Détails de la réservation
  date: string;
  time: string;
  guests: number;
  tableId?: string;
  
  // Préférences
  seatingPreference: 'indoor' | 'outdoor' | 'bar' | 'private' | 'no-preference';
  occasion: string;
  dietaryRestrictions: string[];
  
  // Demandes spéciales
  specialRequests: string;
  
  // Informations supplémentaires
  isFirstVisit: boolean;
  marketingConsent: boolean;
  reminderConsent: boolean;
}

interface ReservationFormProps {
  selectedDate?: Date;
  selectedTime?: string;
  selectedTable?: any;
  guestCount?: number;
  customerProfile?: CustomerProfile | null;
  onSubmit: (data: ReservationFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const DIETARY_RESTRICTIONS = [
  { id: 'vegetarian', label: 'Végétarien' },
  { id: 'vegan', label: 'Végétalien' },
  { id: 'gluten-free', label: 'Sans gluten' },
  { id: 'lactose-free', label: 'Sans lactose' },
  { id: 'nut-allergy', label: 'Allergie aux noix' },
  { id: 'seafood-allergy', label: 'Allergie aux fruits de mer' },
  { id: 'other', label: 'Autre' }
];

const OCCASIONS = [
  'Dîner romantique',
  'Anniversaire',
  'Repas d\'affaires',
  'Célébration familiale',
  'Rendez-vous amoureux',
  'Réunion entre amis',
  'Autre'
];

export default function ReservationForm({
  selectedDate,
  selectedTime,
  selectedTable,
  guestCount = 2,
  customerProfile,
  onSubmit,
  onCancel,
  isLoading = false
}: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    firstName: customerProfile?.firstName || '',
    lastName: customerProfile?.lastName || '',
    email: customerProfile?.email || '',
    phone: customerProfile?.phone || '',
    date: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
    time: selectedTime || '',
    guests: guestCount,
    tableId: selectedTable?.id,
    seatingPreference: 'no-preference',
    occasion: '',
    dietaryRestrictions: customerProfile?.dietaryRestrictions || [],
    specialRequests: customerProfile?.specialRequests?.join(', ') || '',
    isFirstVisit: false,
    marketingConsent: false,
    reminderConsent: true
  });

  // Mettre à jour le formulaire quand le profil client change
  useEffect(() => {
    if (customerProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: customerProfile.firstName,
        lastName: customerProfile.lastName,
        email: customerProfile.email,
        phone: customerProfile.phone || '',
        dietaryRestrictions: customerProfile.dietaryRestrictions || [],
        specialRequests: customerProfile.specialRequests?.join(', ') || ''
      }));
    }
  }, [customerProfile]);

  const [currentSelectedTable, setCurrentSelectedTable] = useState<any>(null);

  const [errors, setErrors] = useState<Partial<Record<keyof ReservationFormData, string>>>({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof ReservationFormData, string>> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
      if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
      if (!formData.email.trim()) {
        newErrors.email = 'L\'email est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Le téléphone est requis';
      } else if (!/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
        newErrors.phone = 'Format de téléphone invalide';
      }
    }

    if (step === 2) {
      if (!formData.date) newErrors.date = 'La date est requise';
      if (!formData.time) newErrors.time = 'L\'heure est requise';
      if (formData.guests < 1 || formData.guests > 20) {
        newErrors.guests = 'Le nombre de convives doit être entre 1 et 20';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      onSubmit(formData);
    }
  };

  const handleDietaryRestrictionChange = (restrictionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: checked
        ? [...prev.dietaryRestrictions, restrictionId]
        : prev.dietaryRestrictions.filter(id => id !== restrictionId)
    }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="w-5 h-5" />
              <span>Finaliser votre réservation</span>
            </CardTitle>
            <CardDescription>
              Étape {currentStep} sur {totalSteps} - Complétez vos informations
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full",
                  index + 1 <= currentStep ? "bg-red-500" : "bg-gray-200"
                )}
              />
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Étape 1: Informations personnelles */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold">Informations personnelles</h3>
              </div>

              {customerProfile && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Informations pré-remplies depuis votre profil
                    </span>
                  </div>
                  <div className="text-xs text-green-700">
                    {customerProfile.allergies && customerProfile.allergies.length > 0 && (
                      <p>Allergies connues : {customerProfile.allergies.join(', ')}</p>
                    )}
                    {customerProfile.dietaryRestrictions && customerProfile.dietaryRestrictions.length > 0 && (
                      <p>Restrictions alimentaires : {customerProfile.dietaryRestrictions.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={errors.firstName ? 'border-red-500' : ''}
                    disabled={!!customerProfile}
                    placeholder="Votre prénom"
                  />
                  {customerProfile && (
                    <p className="text-xs text-gray-500">Information depuis votre profil client</p>
                  )}
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={errors.lastName ? 'border-red-500' : ''}
                    disabled={!!customerProfile}
                    placeholder="Votre nom"
                  />
                  {customerProfile && (
                    <p className="text-xs text-gray-500">Information depuis votre profil client</p>
                  )}
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={cn('pl-10', errors.email ? 'border-red-500' : '')}
                    disabled={!!customerProfile}
                    placeholder="votre@email.com"
                  />
                </div>
                {customerProfile && (
                  <p className="text-xs text-gray-500">Information depuis votre profil client</p>
                )}
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={cn('pl-10', errors.phone ? 'border-red-500' : '')}
                    disabled={!!customerProfile}
                    placeholder="06 12 34 56 78"
                  />
                </div>
                {customerProfile && (
                  <p className="text-xs text-gray-500">Information depuis votre profil client</p>
                )}
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {!customerProfile && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Créer un compte pour une expérience personnalisée
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    Sauvegardez vos préférences, consultez votre historique et gagnez des points fidélité.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = '/profile'}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    Créer un compte
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Étape 2: Détails de la réservation */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold">Détails de la réservation</h3>
              </div>

              {selectedDate && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Réservation pour le <strong>{formatDate(selectedDate)}</strong>
                    {selectedTime && <span> à <strong>{selectedTime}</strong></span>}
                    {selectedTable && (
                      <span> - Table {selectedTable.number} ({selectedTable.location === 'indoor' ? 'Intérieur' : selectedTable.location === 'outdoor' ? 'Terrasse' : selectedTable.location === 'private' ? 'Salon privé' : 'Bar'}, {selectedTable.capacity} places)</span>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className={errors.date ? 'border-red-500' : ''}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Heure *</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, time: value }))}
                  >
                    <SelectTrigger className={errors.time ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Choisir l'heure" />
                    </SelectTrigger>
                    <SelectContent>
                      {['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.time && (
                    <p className="text-sm text-red-500">{errors.time}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Nombre de convives *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
                    className={cn('pl-10', errors.guests ? 'border-red-500' : '')}
                  />
                </div>
                {errors.guests && (
                  <p className="text-sm text-red-500">{errors.guests}</p>
                )}
              </div>

              <div className="space-y-4">
                <TableManagement 
                  selectedDate={selectedDate}
                  selectedTime={formData.time}
                  requiredCapacity={formData.guests}
                  onTableSelect={setCurrentSelectedTable}
                />
              </div>

              <div className="space-y-2">
                <Label>Préférence de placement</Label>
                <Select
                  value={formData.seatingPreference}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    seatingPreference: value as ReservationFormData['seatingPreference']
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-preference">Aucune préférence</SelectItem>
                    <SelectItem value="indoor">Intérieur</SelectItem>
                    <SelectItem value="outdoor">Terrasse</SelectItem>
                    <SelectItem value="bar">Comptoir/Bar</SelectItem>
                    <SelectItem value="private">Salon privé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Occasion spéciale</Label>
                <Select
                  value={formData.occasion}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une occasion" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCASIONS.map(occasion => (
                      <SelectItem key={occasion} value={occasion}>{occasion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Étape 3: Préférences et demandes spéciales */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold">Préférences et demandes spéciales</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Restrictions alimentaires</Label>
                  <p className="text-sm text-gray-600 mb-3">Sélectionnez toutes les restrictions qui s'appliquent</p>
                  <div className="grid grid-cols-2 gap-3">
                    {DIETARY_RESTRICTIONS.map(restriction => (
                      <div key={restriction.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={restriction.id}
                          checked={formData.dietaryRestrictions.includes(restriction.id)}
                          onCheckedChange={(checked) => 
                            handleDietaryRestrictionChange(restriction.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={restriction.id} className="text-sm">
                          {restriction.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="specialRequests">Demandes spéciales</Label>
                  <Textarea
                    id="specialRequests"
                    value={formData.specialRequests}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder={customerProfile 
                      ? "Demandes supplémentaires pour cette réservation..."
                      : "Décoration d'anniversaire, chaise haute, accès handicapé, etc."
                    }
                    rows={3}
                  />
                  {customerProfile && customerProfile.specialRequests && customerProfile.specialRequests.length > 0 && (
                    <p className="text-xs text-gray-500">
                      Demandes habituelles : {customerProfile.specialRequests.join(', ')}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isFirstVisit"
                      checked={formData.isFirstVisit}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, isFirstVisit: checked as boolean }))
                      }
                    />
                    <Label htmlFor="isFirstVisit">C'est ma première visite</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="reminderConsent"
                      checked={formData.reminderConsent}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, reminderConsent: checked as boolean }))
                      }
                    />
                    <Label htmlFor="reminderConsent">Recevoir un rappel par SMS/email</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="marketingConsent"
                      checked={formData.marketingConsent}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, marketingConsent: checked as boolean }))
                      }
                    />
                    <Label htmlFor="marketingConsent">
                      Recevoir nos offres spéciales et actualités
                    </Label>
                  </div>
                </div>
              </div>

              {/* Récapitulatif */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Récapitulatif de votre réservation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {formData.date ? new Date(formData.date).toLocaleDateString('fr-FR') : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Heure:</span>
                    <span className="font-medium">{formData.time || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Convives:</span>
                    <span className="font-medium">{formData.guests} personne{formData.guests > 1 ? 's' : ''}</span>
                  </div>
                  {currentSelectedTable && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Table:</span>
                      <span className="font-medium">Table {currentSelectedTable.number} ({currentSelectedTable.capacity} pers.)</span>
                    </div>
                  )}
                  {formData.occasion && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Occasion:</span>
                      <span className="font-medium">{formData.occasion}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isLoading}
                >
                  Précédent
                </Button>
              )}
              {onCancel && currentStep === 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
              )}
            </div>

            <div>
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Confirmation...
                    </>
                  ) : (
                    'Confirmer la réservation'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}