"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, Grid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isAvailable: boolean;
  availableSlots: number;
  totalSlots: number;
  lunchSlots: number;
  dinnerSlots: number;
  peakHours: number;
}

interface InteractiveCalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

type ViewMode = 'month' | 'week';

export default function InteractiveCalendar({
  selectedDate,
  onDateSelect,
  minDate = new Date(),
  maxDate
}: InteractiveCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [weekDays, setWeekDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('month'); // Générer les données de disponibilité (simulées)
  const generateAvailabilityData = (date: Date) => {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPastDate = date < new Date(new Date().setHours(0, 0, 0, 0));

    if (isPastDate) {
      return { 
        availableSlots: 0, 
        totalSlots: 0, 
        isAvailable: false,
        lunchSlots: 0,
        dinnerSlots: 0,
        peakHours: 0
      };
    }

    // Plus de créneaux le weekend
    const lunchSlots = isWeekend ? 8 : 6; // 12h-14h30
    const dinnerSlots = isWeekend ? 16 : 12; // 19h-22h30
    const totalSlots = lunchSlots + dinnerSlots;
    
    // Simulation plus réaliste basée sur le jour de la semaine
    let occupancyRate = 0.6;
    if (isWeekend) occupancyRate = 0.8;
    if (dayOfWeek === 5) occupancyRate = 0.75; // Vendredi
    
    const bookedSlots = Math.floor(totalSlots * occupancyRate * (0.7 + Math.random() * 0.3));
    const availableSlots = Math.max(0, totalSlots - bookedSlots);
    const peakHours = Math.floor(totalSlots * 0.3); // 30% des créneaux sont en heure de pointe

    return {
      availableSlots,
      totalSlots,
      isAvailable: availableSlots > 0,
      lunchSlots: Math.max(0, lunchSlots - Math.floor(bookedSlots * 0.4)),
      dinnerSlots: Math.max(0, dinnerSlots - Math.floor(bookedSlots * 0.6)),
      peakHours
    };
  }; // Générer les jours du calendrier
  const generateCalendarDays = (month: Date) => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    // Premier jour du mois
    const firstDay = new Date(year, monthIndex, 1);
    // Dernier jour du mois
    const lastDay = new Date(year, monthIndex + 1, 0);

    // Premier jour de la semaine (lundi = 1, dimanche = 0)
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    // Générer 42 jours (6 semaines)
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const isCurrentMonth = date.getMonth() === monthIndex;
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
      const availability = generateAvailabilityData(date);

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected: !!isSelected,
        isAvailable: availability.isAvailable,
        availableSlots: availability.availableSlots,
        totalSlots: availability.totalSlots,
        lunchSlots: availability.lunchSlots,
        dinnerSlots: availability.dinnerSlots,
        peakHours: availability.peakHours
      });
    }

    return days;
  };

  // Générer les jours de la semaine
  const generateWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(date.getDate() - daysToSubtract);

    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + i);
      const isToday = currentDate.getTime() === today.getTime();
      const isSelected = selectedDate && currentDate.getTime() === selectedDate.getTime();
      const availability = generateAvailabilityData(currentDate);

      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday,
        isSelected: !!isSelected,
        isAvailable: availability.isAvailable,
        availableSlots: availability.availableSlots,
        totalSlots: availability.totalSlots,
        lunchSlots: availability.lunchSlots,
        dinnerSlots: availability.dinnerSlots,
        peakHours: availability.peakHours
      });
    }

    return days;
  }; useEffect(() => {
    setLoading(true);
    // Simuler un délai de chargement
    setTimeout(() => {
      const days = generateCalendarDays(currentMonth);
      setCalendarDays(days);
      
      const weekDaysData = generateWeekDays(selectedDate || new Date());
      setWeekDays(weekDaysData);
      
      setLoading(false);
    }, 300);
  }, [currentMonth, selectedDate]); const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(currentMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(currentMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentDate = selectedDate || new Date();
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setDate(currentDate.getDate() + 7);
    }
    onDateSelect(newDate);
  }; const handleDateClick = (day: CalendarDay) => {
    if (day.isAvailable && day.isCurrentMonth) {
      onDateSelect(day.date);
    }
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const formatWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(date.getDate() - daysToSubtract);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return `${startOfWeek.getDate()} - ${endOfWeek.getDate()} ${endOfWeek.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  };



  const getAvailabilityColor = (availableSlots: number, totalSlots: number) => {
    if (totalSlots === 0) return 'bg-gray-100 text-gray-400';
    const ratio = availableSlots / totalSlots;
    if (ratio > 0.7) return 'bg-green-100 text-green-800';
    if (ratio > 0.3) return 'bg-orange-100 text-orange-800';
    if (ratio > 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-400';
  };

  const weekDayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const renderDayCard = (day: CalendarDay, isWeekView = false) => (
    <div
      key={day.date.getTime()}
      className={cn(
        "relative p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md",
        isWeekView ? "h-24" : "h-16",
        {
          "bg-white border-gray-200": day.isCurrentMonth && day.isAvailable,
          "bg-gray-50 border-gray-100 text-gray-400": !day.isCurrentMonth && !isWeekView,
          "bg-red-50 border-red-200 ring-2 ring-red-500": day.isSelected,
          "bg-blue-50 border-blue-200": day.isToday && !day.isSelected,
          "bg-gray-100 border-gray-200 cursor-not-allowed": !day.isAvailable && day.isCurrentMonth,
          "opacity-50": !day.isAvailable
        }
      )}
      onClick={() => handleDateClick(day)}
    >
      <div className="flex flex-col h-full justify-between">
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-medium",
              {
                "text-gray-900": day.isCurrentMonth && day.isAvailable,
                "text-gray-400": !day.isCurrentMonth || !day.isAvailable,
                "text-red-600": day.isSelected,
                "text-blue-600": day.isToday && !day.isSelected
              }
            )}>
              {day.date.getDate()}
            </span>
            {isWeekView && (
              <span className="text-xs text-gray-500">
                {day.date.toLocaleDateString('fr-FR', { weekday: 'short' })}
              </span>
            )}
          </div>
          {day.isToday && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              Aujourd'hui
            </Badge>
          )}
        </div>
        {day.isCurrentMonth && day.totalSlots > 0 && (
          <div className="flex items-center justify-center">
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-1 py-0",
                getAvailabilityColor(day.availableSlots, day.totalSlots)
              )}
            >
              {day.availableSlots > 0 ? (
                <span className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{day.availableSlots}</span>
                </span>
              ) : (
                "Complet"
              )}
            </Badge>
          </div>
        )}
        {isWeekView && day.availableSlots > 0 && (
          <div className="text-xs text-gray-600 mt-1">
            {day.availableSlots} créneaux
          </div>
        )}
      </div>
    </div>
  ); if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 42 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>Choisissez votre date</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)} className="w-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="month" className="flex items-center space-x-1">
                  <Grid className="w-4 h-4" />
                  <span>Mois</span>
                </TabsTrigger>
                <TabsTrigger value="week" className="flex items-center space-x-1">
                  <List className="w-4 h-4" />
                  <span>Semaine</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        <CardDescription>
          Sélectionnez une date pour voir les créneaux disponibles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsContent value="month" className="space-y-4">
            {/* Navigation mensuelle */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold">
                {formatMonth(currentMonth)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* En-têtes des jours */}
            <div className="grid grid-cols-7 gap-2">
              {weekDayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Grille du calendrier mensuel */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day) => renderDayCard(day, false))}
            </div>
          </TabsContent>
          
          <TabsContent value="week" className="space-y-4">
            {/* Navigation hebdomadaire */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold">
                {formatWeek(selectedDate || new Date())}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Vue hebdomadaire */}
            <div className="grid grid-cols-7 gap-3">
              {weekDays.map((day) => renderDayCard(day, true))}
            </div>
            
            {/* Statistiques de la semaine */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Résumé de la semaine</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total créneaux disponibles:</span>
                  <span className="ml-2 font-medium">
                    {weekDays.reduce((sum, day) => sum + day.availableSlots, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Jours avec disponibilité:</span>
                  <span className="ml-2 font-medium">
                    {weekDays.filter(day => day.availableSlots > 0).length}/7
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Légende commune */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Très disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-100 border border-orange-200 rounded"></div>
              <span>Moyennement disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Peu disponible</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
              <span>Complet</span>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}