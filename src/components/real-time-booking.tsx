"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, MapPin, Phone } from "lucide-react";

interface TimeSlot {
  time: string;
  available: boolean;
  capacity: number;
  booked: number;
}

interface TableData {
  id: string;
  number: number;
  capacity: number;
  location: string;
  status: "available" | "booked" | "reserved";
}

interface RealTimeBookingProps {
  selectedDate?: Date;
}

export default function RealTimeBooking({ selectedDate = new Date() }: RealTimeBookingProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [bookingProgress, setBookingProgress] = useState(0);

  useEffect(() => {
    // Simuler le chargement des données en temps réel
    const mockTimeSlots: TimeSlot[] = [
      { time: "11:30", available: true, capacity: 20, booked: 8 },
      { time: "12:00", available: true, capacity: 20, booked: 15 },
      { time: "12:30", available: false, capacity: 20, booked: 20 },
      { time: "13:00", available: false, capacity: 20, booked: 20 },
      { time: "18:30", available: true, capacity: 20, booked: 5 },
      { time: "19:00", available: true, capacity: 20, booked: 12 },
      { time: "19:30", available: true, capacity: 20, booked: 8 },
      { time: "20:00", available: true, capacity: 20, booked: 10 },
      { time: "20:30", available: true, capacity: 20, booked: 6 },
      { time: "21:00", available: true, capacity: 20, booked: 3 }
    ];

    const mockTables: TableData[] = [
      { id: "1", number: 1, capacity: 2, location: "Terrasse", status: "available" },
      { id: "2", number: 2, capacity: 2, location: "Terrasse", status: "available" },
      { id: "3", number: 3, capacity: 4, location: "Salle principale", status: "booked" },
      { id: "4", number: 4, capacity: 4, location: "Salle principale", status: "available" },
      { id: "5", number: 5, capacity: 6, location: "Salle principale", status: "available" },
      { id: "6", number: 6, capacity: 6, location: "Coin tranquille", status: "reserved" },
      { id: "7", number: 7, capacity: 8, location: "Salle principale", status: "available" },
      { id: "8", number: 8, capacity: 2, location: "Bar", status: "available" }
    ];

    setTimeout(() => {
      setTimeSlots(mockTimeSlots);
      setTables(mockTables);
      setLoading(false);
    }, 1000);

    // Simuler les mises à jour en temps réel
    const interval = setInterval(() => {
      setTimeSlots(prev => prev.map(slot => ({
        ...slot,
        booked: Math.min(slot.capacity, Math.max(0, slot.booked + Math.floor(Math.random() * 3) - 1)),
        available: slot.booked < slot.capacity
      })));
    }, 30000); // Mise à jour toutes les 30 secondes

    return () => clearInterval(interval);
  }, [selectedDate]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingProgress(33);
  };

  const handleTableSelect = (tableId: string) => {
    setSelectedTable(tableId);
    setBookingProgress(66);
  };

  const handleBooking = () => {
    if (selectedTime && selectedTable) {
      setBookingProgress(100);
      // Simuler la réservation
      setTimeout(() => {
        alert(`Réservation confirmée pour ${selectedTime} à la table ${selectedTable}`);
        setBookingProgress(0);
        setSelectedTime("");
        setSelectedTable("");
      }, 1500);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card className="w-full">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progression de réservation */}
      {bookingProgress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression de la réservation</span>
                <span>{bookingProgress}%</span>
              </div>
              <Progress value={bookingProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sélection de la date et heure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Réservation en temps réel</span>
          </CardTitle>
          <CardDescription>
            {formatDate(selectedDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Créneaux disponibles</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    className="relative"
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                  >
                    <span className="text-sm">{slot.time}</span>
                    <div className="absolute -top-1 -right-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          slot.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {slot.capacity - slot.booked}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sélection des tables */}
      {selectedTime && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Choisissez votre table</span>
            </CardTitle>
            <CardDescription>
              Tables disponibles pour {selectedTime}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tables.map((table) => (
                <Card
                  key={table.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedTable === table.id ? 'ring-2 ring-red-600' : ''
                  } ${table.status === 'booked' || table.status === 'reserved' ? 'opacity-50' : ''}`}
                  onClick={() => table.status === 'available' && handleTableSelect(table.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Table {table.number}</span>
                      <Badge
                        variant={table.status === 'available' ? 'default' : 'secondary'}
                        className={table.status === 'available' ? 'bg-green-600' : 'bg-gray-400'}
                      >
                        {table.status === 'available' ? 'Disponible' : 
                         table.status === 'booked' ? 'Occupée' : 'Réservée'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{table.capacity} personnes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{table.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Récapitulatif et confirmation */}
      {selectedTime && selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif de votre réservation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Heure</p>
                    <p className="font-semibold">{selectedTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Users className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Table</p>
                    <p className="font-semibold">Table {selectedTable}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 flex-1"
                  onClick={handleBooking}
                >
                  Confirmer la réservation
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedTime("");
                    setSelectedTable("");
                    setBookingProgress(0);
                  }}
                >
                  Modifier
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informations de contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Besoin d'aide ?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-gray-600">Pour une réservation immédiate ou pour des demandes spéciales</p>
            <Button variant="outline" className="w-full sm:w-auto">
              <Phone className="w-4 h-4 mr-2" />
              +33 2 96 14 61 53
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}