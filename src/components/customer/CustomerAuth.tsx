'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Heart,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { 
  CustomerProfile,
  CreateCustomerProfileRequest,
  SeatingPreference,
  DietaryRestriction,
  AmbiancePreference,
  ServiceStylePreference
} from '@/types/customer';
import { CustomerService } from '@/services/customerService';

interface CustomerAuthProps {
  onAuthSuccess: (profile: CustomerProfile) => void;
  onCancel?: () => void;
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

export default function CustomerAuth({ onAuthSuccess, onCancel }: CustomerAuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Formulaire de connexion
  const [loginForm, setLoginForm] = useState({
    email: ''
  });
  
  // Formulaire d'inscription
  const [registerForm, setRegisterForm] = useState<CreateCustomerProfileRequest>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: undefined,
    preferences: {
      preferredSeating: 'table',
      preferredTimeSlots: [],
      favoriteOccasions: [],
      communicationPreferences: {
        emailNotifications: true,
        smsNotifications: false,
        promotionalEmails: true,
        reminderNotifications: true,
        preferredLanguage: 'fr',
        contactMethod: 'email'
      },
      ambiance: 'casual',
      serviceStyle: 'standard'
    },
    specialRequests: [],
    allergies: [],
    dietaryRestrictions: []
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await CustomerService.getProfileByEmail(loginForm.email);
      if (profile) {
        setSuccess('Connexion réussie !');
        setTimeout(() => onAuthSuccess(profile), 1000);
      } else {
        setError('Aucun compte trouvé avec cet email. Veuillez vous inscrire.');
        setActiveTab('register');
        setRegisterForm(prev => ({ ...prev, email: loginForm.email }));
      }
    } catch (err) {
      setError('Erreur lors de la connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = await CustomerService.createProfile(registerForm);
      setSuccess('Compte créé avec succès ! Bienvenue chez OMIAM.');
      setTimeout(() => onAuthSuccess(profile), 1500);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du compte.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRegisterForm = (field: string, value: any) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  };

  const updatePreference = (key: string, value: any) => {
    setRegisterForm(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        [key]: value
      }
    }));
  };

  const updateCommunicationPreference = (key: string, value: any) => {
    setRegisterForm(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        communicationPreferences: {
          ...prev.preferences!.communicationPreferences!,
          [key]: value
        }
      }
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Espace Client OMIAM</CardTitle>
          <CardDescription>
            Connectez-vous ou créez un compte pour une expérience personnalisée
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4" variant="default">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            {/* Connexion */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ email: e.target.value })}
                    required
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                  {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </TabsContent>
            
            {/* Inscription */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Informations de base */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informations personnelles</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={registerForm.firstName}
                        onChange={(e) => updateRegisterForm('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={registerForm.lastName}
                        onChange={(e) => updateRegisterForm('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="register-email">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => updateRegisterForm('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={registerForm.phone || ''}
                        onChange={(e) => updateRegisterForm('phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date de naissance</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={registerForm.dateOfBirth ? new Date(registerForm.dateOfBirth).toISOString().split('T')[0] : ''}
                        onChange={(e) => updateRegisterForm('dateOfBirth', e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Préférences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Préférences (optionnel)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Préférence de siège</Label>
                      <Select
                        value={registerForm.preferences?.preferredSeating}
                        onValueChange={(value) => updatePreference('preferredSeating', value)}
                      >
                        <SelectTrigger className="mt-1">
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
                    </div>
                    
                    <div>
                      <Label>Ambiance préférée</Label>
                      <Select
                        value={registerForm.preferences?.ambiance}
                        onValueChange={(value) => updatePreference('ambiance', value)}
                      >
                        <SelectTrigger className="mt-1">
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
                    </div>
                  </div>
                  
                  <div>
                    <Label>Style de service</Label>
                    <Select
                      value={registerForm.preferences?.serviceStyle}
                      onValueChange={(value) => updatePreference('serviceStyle', value)}
                    >
                      <SelectTrigger className="mt-1">
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
                  </div>
                </div>
                
                {/* Restrictions alimentaires */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Restrictions alimentaires</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {DIETARY_RESTRICTIONS.map(restriction => (
                      <div key={restriction.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`diet-${restriction.value}`}
                          checked={(registerForm.dietaryRestrictions || []).includes(restriction.value)}
                          onCheckedChange={(checked) => {
                            const current = registerForm.dietaryRestrictions || [];
                            const updated = checked 
                              ? [...current, restriction.value]
                              : current.filter(r => r !== restriction.value);
                            updateRegisterForm('dietaryRestrictions', updated);
                          }}
                        />
                        <Label htmlFor={`diet-${restriction.value}`} className="text-sm">
                          {restriction.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      placeholder="Listez vos allergies séparées par des virgules"
                      value={(registerForm.allergies || []).join(', ')}
                      onChange={(e) => {
                        const allergies = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                        updateRegisterForm('allergies', allergies);
                      }}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="specialRequests">Demandes spéciales</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Demandes spéciales séparées par des virgules"
                      value={(registerForm.specialRequests || []).join(', ')}
                      onChange={(e) => {
                        const requests = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                        updateRegisterForm('specialRequests', requests);
                      }}
                    />
                  </div>
                </div>
                
                {/* Préférences de communication */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Préférences de communication</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="emailNotifications"
                        checked={registerForm.preferences?.communicationPreferences?.emailNotifications}
                        onCheckedChange={(checked) => updateCommunicationPreference('emailNotifications', checked)}
                      />
                      <Label htmlFor="emailNotifications">Recevoir les notifications par email</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="smsNotifications"
                        checked={registerForm.preferences?.communicationPreferences?.smsNotifications}
                        onCheckedChange={(checked) => updateCommunicationPreference('smsNotifications', checked)}
                      />
                      <Label htmlFor="smsNotifications">Recevoir les notifications par SMS</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="promotionalEmails"
                        checked={registerForm.preferences?.communicationPreferences?.promotionalEmails}
                        onCheckedChange={(checked) => updateCommunicationPreference('promotionalEmails', checked)}
                      />
                      <Label htmlFor="promotionalEmails">Recevoir les offres promotionnelles</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="reminderNotifications"
                        checked={registerForm.preferences?.communicationPreferences?.reminderNotifications}
                        onCheckedChange={(checked) => updateCommunicationPreference('reminderNotifications', checked)}
                      />
                      <Label htmlFor="reminderNotifications">Recevoir les rappels de réservation</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? 'Création...' : 'Créer mon compte'}
                  </Button>
                  {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Annuler
                    </Button>
                  )}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}