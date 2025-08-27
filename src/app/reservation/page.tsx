"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Phone, Mail, MapPin, User } from "lucide-react";
import { CONTACT_INFO } from "@/config/contact";
import InteractiveCalendar from "@/components/reservation/InteractiveCalendar";
import ReservationForm from "@/components/reservation/ReservationForm";
import TimeSlotSelector from "@/components/reservation/TimeSlotSelector";
import SmartTableSelector from "@/components/reservation/SmartTableSelector";
import RealtimeNotifications from "@/components/reservation/RealtimeNotifications";
import { CustomerProfile } from "@/types/customer";
import { CustomerService } from "@/services/customerService";
import Layout from "@/components/layout/Layout";

export default function ReservationPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [seatingPreference, setSeatingPreference] = useState<'indoor' | 'outdoor' | 'bar' | 'private' | 'no-preference'>('no-preference');
  const [occasion, setOccasion] = useState<string>('');
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    requests: ""
  });

  // Vérifier si un client est connecté
  useEffect(() => {
    const checkCustomerSession = async () => {
      try {
        const savedProfileId = localStorage.getItem('omiam_customer_id');
        if (savedProfileId) {
          const profile = await CustomerService.getProfile(savedProfileId);
          if (profile) {
            setCustomerProfile(profile);
            // Appliquer les préférences du client
            if (profile.preferences?.preferredSeating) {
              setSeatingPreference(profile.preferences.preferredSeating as any);
            }
            // Pré-remplir le formulaire avec les données du profil
            setFormData(prev => ({
              ...prev,
              name: `${profile.firstName} ${profile.lastName}`,
              email: profile.email,
              phone: profile.phone || ""
            }));
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil client:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    checkCustomerSession();
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      date: date.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Réservation confirmée pour ${formData.guests} personne(s) le ${formData.date} à ${formData.time}!`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const timeSlots = [
    "11:30", "12:00", "12:30", "13:00", "13:30",
    "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* En-tête de page */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Réservation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Réservez votre table en quelques clics et vivez une expérience italienne authentique
          </p>
          <div className="flex justify-center mt-4">
            <RealtimeNotifications />
          </div>
        </div>

        {/* Message de bienvenue pour les clients connectés */}
        {customerProfile && (
          <div className="mb-6">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-primary-foreground bg-primary p-2 rounded-md">
                      Bon retour, {customerProfile.firstName} ! 👋
                    </h3>
                    <p className="text-sm text-primary/80">
                      Vos préférences ont été appliquées automatiquement.
                      {customerProfile.preferences?.preferredSeating && (
                        <span className="ml-1">
                          Préférence de siège : {customerProfile.preferences.preferredSeating}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary">
                      {customerProfile.loyaltyPoints} points fidélité
                    </p>
                    <p className="text-xs text-primary/90">
                      Statut {customerProfile.membershipLevel}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!selectedDate ? (
          /* Étape 1: Sélection de date */
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-primary text-center">
                  Étape 1: Choisissez votre date
                </CardTitle>
                <CardDescription className="text-center">
                  Sélectionnez une date pour voir les créneaux disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InteractiveCalendar
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  minDate={new Date()}
                />
              </CardContent>
            </Card>
          </div>
        ) : !selectedTimeSlot ? (
          /* Étape 2: Sélection du créneau horaire */
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDate(undefined);
                  setSelectedTimeSlot(null);
                }}
                className="mb-4"
              >
                ← Changer de date
              </Button>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <TimeSlotSelector
                  selectedDate={selectedDate}
                  selectedTime={selectedTimeSlot?.time}
                  guestCount={guestCount}
                  onTimeSelect={(timeSlot) => {
                    setSelectedTimeSlot(timeSlot);
                  }}
                />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Préférences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Emplacement préféré</label>
                      <select
                        value={seatingPreference}
                        onChange={(e) => setSeatingPreference(e.target.value as any)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="no-preference">Aucune préférence</option>
                        <option value="indoor">Intérieur</option>
                        <option value="outdoor">Terrasse</option>
                        <option value="bar">Bar</option>
                        <option value="private">Salon privé</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Occasion (optionnel)</label>
                      <select
                        value={occasion}
                        onChange={(e) => setOccasion(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Sélectionner une occasion</option>
                        <option value="Dîner romantique">Dîner romantique</option>
                        <option value="Rendez-vous amoureux">Rendez-vous amoureux</option>
                        <option value="Repas d'affaires">Repas d'affaires</option>
                        <option value="Anniversaire">Anniversaire</option>
                        <option value="Célébration familiale">Célébration familiale</option>
                        <option value="Réunion entre amis">Réunion entre amis</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-800">Informations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>• Réservation gratuite et sans engagement</p>
                    <p>• Confirmation immédiate par email</p>
                    <p>• Modification possible jusqu'à 2h avant</p>
                    <p>• Tables gardées 15 minutes maximum</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : !selectedTable ? (
          /* Étape 3: Sélection de table intelligente */
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTimeSlot(null);
                }}
                className="mb-4"
              >
                ← Changer l'heure
              </Button>
            </div>
            
            <SmartTableSelector
              selectedDate={selectedDate}
              selectedTime={selectedTimeSlot.time}
              guestCount={guestCount}
              seatingPreference={seatingPreference}
              occasion={occasion}
              onTableSelect={setSelectedTable}
              selectedTable={selectedTable}
            />
          </div>
        ) : (
          /* Étape 4: Formulaire de réservation */
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedTable(null);
                }}
                className="mb-4"
              >
                ← Changer la table
              </Button>
            </div>
            
            <ReservationForm 
              selectedDate={selectedDate}
              selectedTime={selectedTimeSlot.time}
              guestCount={guestCount}
              selectedTable={selectedTable}
              customerProfile={customerProfile}
              onSubmit={(data) => {
                console.log('Réservation soumise:', {
                  ...data,
                  table: selectedTable,
                  seatingPreference,
                  occasion
                });
                // Si un client est connecté, mettre à jour son historique
                if (customerProfile) {
                  // Ajouter la réservation à l'historique du client
                  console.log('Mise à jour de l\'historique client:', customerProfile.id);
                }
                // Ici on traiterait la réservation
              }}
            />
          </div>
        )}

        {/* Informations pratiques - toujours visibles */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Horaires d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(CONTACT_INFO.hours.detailed).map(([day, schedule]) => {
                  const dayNames = {
                    monday: 'Lundi',
                    tuesday: 'Mardi',
                    wednesday: 'Mercredi',
                    thursday: 'Jeudi',
                    friday: 'Vendredi',
                    saturday: 'Samedi',
                    sunday: 'Dimanche'
                  };
                  return (
                    <div key={day} className="flex justify-between items-center">
                      <span>{dayNames[day as keyof typeof dayNames]}:</span>
                      {!schedule.open ? (
                        <Badge variant="secondary">Fermé</Badge>
                      ) : (
                        <div className="text-right">
                          <span className="text-sm">{schedule.lunch}, {schedule.dinner}</span>
                          {schedule.special && (
                            <div className="text-xs text-green-600">({schedule.special})</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Capacité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Nous pouvons accueillir jusqu'à 40 personnes dans notre restaurant.</p>
                <p className="mt-2">Pour les groupes de plus de 8 personnes, merci de nous contacter directement.</p>
              </CardContent>
            </Card>

            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{CONTACT_INFO.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{CONTACT_INFO.contact.email}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}