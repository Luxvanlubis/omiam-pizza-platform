'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings, 
  Heart, 
  Bell, 
  Star, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  Gift,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { 
  CustomerProfile as CustomerProfileType, 
  CustomerStats,
  PersonalizedRecommendation,
  UpdateCustomerProfileRequest,
  SeatingPreference,
  DietaryRestriction,
  AmbiancePreference,
  ServiceStylePreference
} from '@/types/customer';
import { CustomerService } from '@/services/customerService';

interface CustomerProfileProps {
  customerId: string;
  onProfileUpdate?: (profile: CustomerProfileType) => void;
}

const SEATING_PREFERENCES: { value: SeatingPreference; label: string }[] = [
  { value: 'window', label: 'Près de la fenêtre' },
  { value: 'quiet', label: 'Zone calme' },
  { value: 'social', label: 'Zone sociale' },
  { value: 'private', label: 'Espace privé' },
  { value: 'bar', label: 'Au bar' },
  { value: 'outdoor', label: 'Terrasse' },
  { value: 'booth', label: 'Box' },
  { value: 'table', label: 'Table standard' }
];

const DIETARY_RESTRICTIONS: { value: DietaryRestriction; label: string }[] = [
  { value: 'vegetarian', label: 'Végétarien' },
  { value: 'vegan', label: 'Végétalien' },
  { value: 'gluten-free', label: 'Sans gluten' },
  { value: 'dairy-free', label: 'Sans lactose' },
  { value: 'nut-free', label: 'Sans noix' },
  { value: 'kosher', label: 'Casher' },
  { value: 'halal', label: 'Halal' },
  { value: 'low-sodium', label: 'Faible en sodium' },
  { value: 'diabetic', label: 'Diabétique' }
];

const AMBIANCE_PREFERENCES: { value: AmbiancePreference; label: string }[] = [
  { value: 'quiet', label: 'Calme' },
  { value: 'lively', label: 'Animé' },
  { value: 'romantic', label: 'Romantique' },
  { value: 'family-friendly', label: 'Familial' },
  { value: 'business', label: 'Professionnel' },
  { value: 'casual', label: 'Décontracté' }
];

const SERVICE_STYLE_PREFERENCES: { value: ServiceStylePreference; label: string }[] = [
  { value: 'attentive', label: 'Attentionné' },
  { value: 'minimal', label: 'Discret' },
  { value: 'standard', label: 'Standard' },
  { value: 'personalized', label: 'Personnalisé' }
];

const MEMBERSHIP_TIER_COLORS = {
  bronze: 'bg-amber-100 text-amber-800',
  silver: 'bg-gray-100 text-gray-800',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-purple-100 text-purple-800',
  vip: 'bg-red-100 text-red-800'
};

export default function CustomerProfile({ customerId, onProfileUpdate }: CustomerProfileProps) {
  const [profile, setProfile] = useState<CustomerProfileType | null>(null);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<UpdateCustomerProfileRequest>({});

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      setIsLoading(true);
      const [profileData, statsData, recommendationsData] = await Promise.all([
        CustomerService.getProfile(customerId),
        CustomerService.getCustomerStats(customerId),
        CustomerService.getPersonalizedRecommendations(customerId)
      ]);

      if (profileData) {
        setProfile(profileData);
        setEditForm({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          dateOfBirth: profileData.dateOfBirth,
          preferences: profileData.preferences,
          specialRequests: profileData.specialRequests,
          allergies: profileData.allergies,
          dietaryRestrictions: profileData.dietaryRestrictions
        });
      }
      setStats(statsData);
      setRecommendations(recommendationsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      const updatedProfile = await CustomerService.updateProfile(customerId, editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
      onProfileUpdate?.(updatedProfile);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        preferences: profile.preferences,
        specialRequests: profile.specialRequests,
        allergies: profile.allergies,
        dietaryRestrictions: profile.dietaryRestrictions
      });
    }
    setIsEditing(false);
  };

  const updatePreference = (key: string, value: any) => {
    setEditForm(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Profil client non trouvé</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* En-tête du profil */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">
                {profile.firstName} {profile.lastName}
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 mt-2">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {profile.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {profile.phone}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={MEMBERSHIP_TIER_COLORS[profile.membershipTier]}>
              <Star className="w-3 h-3 mr-1" />
              {profile.membershipTier.toUpperCase()}
            </Badge>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
            {isEditing && (
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="recommendations">Recommandations</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats && (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total réservations</p>
                        <p className="text-2xl font-bold">{stats.totalReservations}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Points fidélité</p>
                        <p className="text-2xl font-bold">{profile.loyaltyPoints}</p>
                      </div>
                      <Gift className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Dépense moyenne</p>
                        <p className="text-2xl font-bold">{profile.averageSpending.toFixed(0)}€</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Dernière visite</p>
                        <p className="text-sm font-medium">
                          {profile.lastVisit ? new Date(profile.lastVisit).toLocaleDateString('fr-FR') : 'Jamais'}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={editForm.firstName || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={editForm.lastName || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input
                      id="phone"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date de naissance</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString().split('T')[0] : ''}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        dateOfBirth: e.target.value ? new Date(e.target.value) : undefined 
                      }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom</Label>
                    <p className="text-sm text-gray-600">{profile.firstName}</p>
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <p className="text-sm text-gray-600">{profile.lastName}</p>
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <p className="text-sm text-gray-600">{profile.phone || 'Non renseigné'}</p>
                  </div>
                  <div>
                    <Label>Date de naissance</Label>
                    <p className="text-sm text-gray-600">
                      {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('fr-FR') : 'Non renseignée'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Préférences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de réservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Préférence de siège */}
              <div>
                <Label>Préférence de siège</Label>
                {isEditing ? (
                  <Select
                    value={editForm.preferences?.preferredSeating || profile.preferences.preferredSeating}
                    onValueChange={(value) => updatePreference('preferredSeating', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEATING_PREFERENCES.map(pref => (
                        <SelectItem key={pref.value} value={pref.value}>
                          {pref.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {SEATING_PREFERENCES.find(p => p.value === profile.preferences.preferredSeating)?.label}
                  </p>
                )}
              </div>

              {/* Ambiance préférée */}
              <div>
                <Label>Ambiance préférée</Label>
                {isEditing ? (
                  <Select
                    value={editForm.preferences?.ambiance || profile.preferences.ambiance}
                    onValueChange={(value) => updatePreference('ambiance', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AMBIANCE_PREFERENCES.map(pref => (
                        <SelectItem key={pref.value} value={pref.value}>
                          {pref.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {AMBIANCE_PREFERENCES.find(p => p.value === profile.preferences.ambiance)?.label}
                  </p>
                )}
              </div>

              {/* Style de service */}
              <div>
                <Label>Style de service</Label>
                {isEditing ? (
                  <Select
                    value={editForm.preferences?.serviceStyle || profile.preferences.serviceStyle}
                    onValueChange={(value) => updatePreference('serviceStyle', value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICE_STYLE_PREFERENCES.map(pref => (
                        <SelectItem key={pref.value} value={pref.value}>
                          {pref.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    {SERVICE_STYLE_PREFERENCES.find(p => p.value === profile.preferences.serviceStyle)?.label}
                  </p>
                )}
              </div>

              <Separator />

              {/* Restrictions alimentaires */}
              <div>
                <Label>Restrictions alimentaires</Label>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    {DIETARY_RESTRICTIONS.map(restriction => (
                      <div key={restriction.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={restriction.value}
                          checked={(editForm.dietaryRestrictions || profile.dietaryRestrictions || []).includes(restriction.value)}
                          onCheckedChange={(checked) => {
                            const current = editForm.dietaryRestrictions || profile.dietaryRestrictions || [];
                            const updated = checked 
                              ? [...current, restriction.value]
                              : current.filter(r => r !== restriction.value);
                            setEditForm(prev => ({ ...prev, dietaryRestrictions: updated }));
                          }}
                        />
                        <Label htmlFor={restriction.value} className="text-sm">
                          {restriction.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.dietaryRestrictions && profile.dietaryRestrictions.length > 0 ? (
                      profile.dietaryRestrictions.map(restriction => (
                        <Badge key={restriction} variant="secondary">
                          {DIETARY_RESTRICTIONS.find(r => r.value === restriction)?.label}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Aucune restriction</p>
                    )}
                  </div>
                )}
              </div>

              {/* Allergies */}
              <div>
                <Label>Allergies</Label>
                {isEditing ? (
                  <Textarea
                    className="mt-2"
                    placeholder="Listez vos allergies séparées par des virgules"
                    value={(editForm.allergies || profile.allergies || []).join(', ')}
                    onChange={(e) => {
                      const allergies = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                      setEditForm(prev => ({ ...prev, allergies }));
                    }}
                  />
                ) : (
                  <div className="mt-2">
                    {profile.allergies && profile.allergies.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucune allergie</p>
                    )}
                  </div>
                )}
              </div>

              {/* Demandes spéciales */}
              <div>
                <Label>Demandes spéciales</Label>
                {isEditing ? (
                  <Textarea
                    className="mt-2"
                    placeholder="Demandes spéciales séparées par des virgules"
                    value={(editForm.specialRequests || profile.specialRequests || []).join(', ')}
                    onChange={(e) => {
                      const requests = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                      setEditForm(prev => ({ ...prev, specialRequests: requests }));
                    }}
                  />
                ) : (
                  <div className="mt-2">
                    {profile.specialRequests && profile.specialRequests.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.specialRequests.map((request, index) => (
                          <Badge key={index} variant="outline">
                            {request}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Aucune demande spéciale</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des réservations</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.reservationHistory.length > 0 ? (
                <div className="space-y-4">
                  {profile.reservationHistory.slice(0, 10).map((reservation, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}
                          </p>
                          <p className="text-sm text-gray-600">
                            {reservation.partySize} {reservation.partySize > 1 ? 'personnes' : 'personne'}
                            {reservation.occasion && ` • ${reservation.occasion}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={reservation.status === 'completed' ? 'default' : 
                                  reservation.status === 'cancelled' ? 'destructive' : 'secondary'}
                        >
                          {reservation.status === 'completed' ? 'Terminée' :
                           reservation.status === 'cancelled' ? 'Annulée' :
                           reservation.status === 'no-show' ? 'Absent' : reservation.status}
                        </Badge>
                        {reservation.totalAmount && (
                          <p className="text-sm text-gray-600 mt-1">
                            {reservation.totalAmount}€
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Aucune réservation dans l'historique
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommandations */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recommandations personnalisées</CardTitle>
              <CardDescription>
                Basées sur vos préférences et votre historique de réservation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{recommendation.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {recommendation.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {recommendation.reason}
                          </p>
                        </div>
                        <div className="ml-4">
                          <Badge variant="outline">
                            {Math.round(recommendation.confidence * 100)}% de confiance
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  Aucune recommandation disponible pour le moment
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}