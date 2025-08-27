"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  capacity: number;
  booked: number;
  price?: number;
  duration: number; // en minutes
  isPopular?: boolean;
  isPeakTime?: boolean;
}

interface TimeSlotSelectorProps {
  selectedDate?: Date;
  selectedTime?: string;
  guestCount?: number;
  onTimeSelect: (timeSlot: TimeSlot) => void;
  className?: string;
}

const generateTimeSlots = (date: Date, guestCount: number): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Horaires d'ouverture
  const openingHours = {
    lunch: { start: 12, end: 14.5 }, // 12h00 - 14h30
    dinner: { start: 19, end: 22.5 } // 19h00 - 22h30
  };
  
  // Générer les créneaux pour le déjeuner
  for (let hour = openingHours.lunch.start; hour <= openingHours.lunch.end; hour += 0.5) {
    const timeString = formatTime(hour);
    const capacity = Math.floor(Math.random() * 20) + 10;
    const booked = Math.floor(Math.random() * capacity * 0.8);
    const available = (capacity - booked) >= guestCount;
    const isPeakTime = hour >= 12.5 && hour <= 13.5; // 12h30 - 13h30
    
    slots.push({
      id: `lunch-${hour}`,
      time: timeString,
      available,
      capacity,
      booked,
      duration: 90, // 1h30 pour le déjeuner
      isPeakTime,
      isPopular: isPeakTime && Math.random() > 0.7,
      price: isPeakTime ? 25 : 22
    });
  }
  
  // Générer les créneaux pour le dîner
  for (let hour = openingHours.dinner.start; hour <= openingHours.dinner.end; hour += 0.5) {
    const timeString = formatTime(hour);
    const capacity = Math.floor(Math.random() * 25) + 15;
    const booked = Math.floor(Math.random() * capacity * 0.9);
    const available = (capacity - booked) >= guestCount;
    const isPeakTime = hour >= 20 && hour <= 21; // 20h00 - 21h00
    
    slots.push({
      id: `dinner-${hour}`,
      time: timeString,
      available,
      capacity,
      booked,
      duration: 120, // 2h pour le dîner
      isPeakTime,
      isPopular: isPeakTime && Math.random() > 0.6,
      price: isPeakTime ? 35 : 30
    });
  }
  
  return slots;
};

const formatTime = (hour: number): string => {
  const h = Math.floor(hour);
  const m = (hour % 1) * 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

const getAvailabilityColor = (slot: TimeSlot, guestCount: number) => {
  const availableSpots = slot.capacity - slot.booked;
  const ratio = availableSpots / slot.capacity;
  
  if (!slot.available || availableSpots < guestCount) return 'bg-red-100 text-red-800 border-red-200';
  if (ratio > 0.7) return 'bg-green-100 text-green-800 border-green-200';
  if (ratio > 0.3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-orange-100 text-orange-800 border-orange-200';
};

const getAvailabilityText = (slot: TimeSlot, guestCount: number) => {
  const availableSpots = slot.capacity - slot.booked;
  
  if (!slot.available || availableSpots < guestCount) return 'Complet';
  if (availableSpots <= 3) return `${availableSpots} places`;
  return 'Disponible';
};

export default function TimeSlotSelector({
  selectedDate = new Date(),
  selectedTime,
  guestCount = 2,
  onTimeSelect,
  className
}: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'lunch' | 'dinner'>('dinner');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setLoading(true);
    // Simuler un délai de chargement
    setTimeout(() => {
      const slots = generateTimeSlots(selectedDate, guestCount);
      setTimeSlots(slots);
      setLoading(false);
    }, 500);
  }, [selectedDate, guestCount]);
  
  const lunchSlots = timeSlots.filter(slot => slot.id.startsWith('lunch'));
  const dinnerSlots = timeSlots.filter(slot => slot.id.startsWith('dinner'));
  
  const renderTimeSlots = (slots: TimeSlot[]) => {
    if (loading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const availableSpots = slot.capacity - slot.booked;
          const canBook = slot.available && availableSpots >= guestCount;
          
          return (
            <Button
              key={slot.id}
              variant={isSelected ? 'default' : 'outline'}
              className={cn(
                'h-auto p-3 flex flex-col items-center space-y-1 relative',
                !canBook && 'opacity-50 cursor-not-allowed',
                isSelected && 'ring-2 ring-red-500',
                className
              )}
              disabled={!canBook}
              onClick={() => canBook && onTimeSelect(slot)}
            >
              {slot.isPopular && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0">
                  Populaire
                </Badge>
              )}
              
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span className="font-semibold text-lg">{slot.time}</span>
              </div>
              
              <Badge 
                variant="outline" 
                className={cn(
                  'text-xs border',
                  getAvailabilityColor(slot, guestCount)
                )}
              >
                {getAvailabilityText(slot, guestCount)}
              </Badge>
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{availableSpots}/{slot.capacity}</span>
                </div>
                {slot.isPeakTime && (
                  <Badge variant="secondary" className="text-xs">
                    Heure de pointe
                  </Badge>
                )}
              </div>
              
              {slot.price && (
                <div className="text-xs font-medium text-green-600">
                  À partir de {slot.price}€
                </div>
              )}
            </Button>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Choisir un créneau</span>
        </CardTitle>
        <CardDescription>
          Sélectionnez l'heure de votre réservation pour {guestCount} personne{guestCount > 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as 'lunch' | 'dinner')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="lunch" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Déjeuner</span>
              <Badge variant="outline" className="ml-2">
                {lunchSlots.filter(s => s.available).length} créneaux
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="dinner" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Dîner</span>
              <Badge variant="outline" className="ml-2">
                {dinnerSlots.filter(s => s.available).length} créneaux
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lunch" className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>Service de 12h00 à 14h30 • Durée: 1h30</span>
            </div>
            {renderTimeSlots(lunchSlots)}
          </TabsContent>
          
          <TabsContent value="dinner" className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
              <AlertCircle className="h-4 w-4" />
              <span>Service de 19h00 à 22h30 • Durée: 2h00</span>
            </div>
            {renderTimeSlots(dinnerSlots)}
          </TabsContent>
        </Tabs>
        
        {/* Légende */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3 text-sm">Légende des disponibilités</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Très disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
              <span>Peu de places</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Complet</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}