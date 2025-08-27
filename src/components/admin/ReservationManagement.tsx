"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  Users,
  Mail,
  Phone,
  Search,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit
} from "lucide-react";

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  guests: number;
  tableNumber?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReservationStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  completed: number;
  todayReservations: number;
  weekReservations: number;
}

export default function ReservationManagement() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<ReservationStats>({
    total: 0,
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    completed: 0,
    todayReservations: 0,
    weekReservations: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  // Données mockées pour les réservations
  const mockReservations: Reservation[] = [
    {
      id: "1",
      customerName: "Marie Dubois",
      customerEmail: "marie.dubois@email.com",
      customerPhone: "+33 6 12 34 56 78",
      date: "2025-01-24",
      time: "19:30",
      guests: 4,
      tableNumber: 5,
      status: "confirmed",
      specialRequests: "Anniversaire - gâteau",
      createdAt: "2025-01-20T10:30:00Z",
      updatedAt: "2025-01-20T10:30:00Z"
    },
    {
      id: "2",
      customerName: "Jean Martin",
      customerEmail: "jean.martin@email.com",
      customerPhone: "+33 6 98 76 54 32",
      date: "2025-01-24",
      time: "20:00",
      guests: 2,
      tableNumber: 3,
      status: "confirmed",
      createdAt: "2025-01-21T14:15:00Z",
      updatedAt: "2025-01-21T14:15:00Z"
    },
    {
      id: "3",
      customerName: "Sophie Laurent",
      customerEmail: "sophie.laurent@email.com",
      customerPhone: "+33 6 11 22 33 44",
      date: "2025-01-25",
      time: "12:30",
      guests: 6,
      status: "pending",
      specialRequests: "Allergie aux fruits de mer",
      createdAt: "2025-01-22T09:45:00Z",
      updatedAt: "2025-01-22T09:45:00Z"
    },
    {
      id: "4",
      customerName: "Pierre Durand",
      customerEmail: "pierre.durand@email.com",
      customerPhone: "+33 6 55 44 33 22",
      date: "2025-01-23",
      time: "19:00",
      guests: 8,
      tableNumber: 7,
      status: "completed",
      createdAt: "2025-01-18T16:20:00Z",
      updatedAt: "2025-01-23T21:30:00Z"
    },
    {
      id: "5",
      customerName: "Emma Rousseau",
      customerEmail: "emma.rousseau@email.com",
      customerPhone: "+33 6 77 88 99 00",
      date: "2025-01-26",
      time: "13:00",
      guests: 3,
      status: "cancelled",
      specialRequests: "Menu végétarien",
      createdAt: "2025-01-19T11:10:00Z",
      updatedAt: "2025-01-22T15:45:00Z"
    }
  ];

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setReservations(mockReservations);
      setFilteredReservations(mockReservations);
      
      // Calculer les statistiques
      const newStats = {
        total: mockReservations.length,
        confirmed: mockReservations.filter(r => r.status === 'confirmed').length,
        pending: mockReservations.filter(r => r.status === 'pending').length,
        cancelled: mockReservations.filter(r => r.status === 'cancelled').length,
        completed: mockReservations.filter(r => r.status === 'completed').length,
        todayReservations: mockReservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length,
        weekReservations: mockReservations.filter(r => {
          const reservationDate = new Date(r.date);
          const today = new Date();
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          return reservationDate >= today && reservationDate <= weekFromNow;
        }).length
      };
      
      setStats(newStats);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtrage des réservations
  useEffect(() => {
    let filtered = reservations;
    
    // Filtre par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(reservation =>
        reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customerPhone.includes(searchTerm)
      );
    }
    
    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter(reservation => reservation.status === statusFilter);
    }
    
    // Filtre par date
    if (dateFilter !== "all") {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(r => r.date === todayStr);
          break;
        case "tomorrow":
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          filtered = filtered.filter(r => r.date === tomorrowStr);
          break;
        case "week":
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(r => {
            const reservationDate = new Date(r.date);
            return reservationDate >= today && reservationDate <= weekFromNow;
          });
          break;
      }
    }
    
    setFilteredReservations(filtered);
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  const getStatusBadge = (status: Reservation['status']) => {
    const statusConfig = {
      confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Confirmée" },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle, label: "En attente" },
      cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Annulée" },
      completed: { color: "bg-blue-100 text-blue-800", icon: CheckCircle, label: "Terminée" }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={cn("flex items-center space-x-1", config.color)}>
        <Icon className="w-3 h-3" />
        <span>{config.label}</span>
      </Badge>
    );
  };

  const updateReservationStatus = (id: string, newStatus: Reservation['status']) => {
    setReservations(prev => prev.map(reservation =>
      reservation.id === id
        ? { ...reservation, status: newStatus, updatedAt: new Date().toISOString() }
        : reservation
    ));
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmées</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cette semaine</p>
                <p className="text-2xl font-bold text-purple-600">{stats.weekReservations}</p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Gestion des réservations</CardTitle>
          <CardDescription>
            Gérez toutes les réservations de votre restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="confirmed">Confirmées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="tomorrow">Demain</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="w-full md:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </div>

          {/* Liste des réservations */}
          <div className="space-y-4">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune réservation trouvée</p>
              </div>
            ) : (
              filteredReservations.map((reservation) => (
                <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold">{reservation.customerName}</h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(reservation.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{reservation.time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{reservation.guests} personnes</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{reservation.customerEmail}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{reservation.customerPhone}</span>
                          </div>
                          {reservation.tableNumber && (
                            <div className="flex items-center space-x-2">
                              <span className="w-4 h-4 bg-gray-200 rounded text-xs flex items-center justify-center font-bold">
                                T
                              </span>
                              <span>Table {reservation.tableNumber}</span>
                            </div>
                          )}
                        </div>
                        
                        {reservation.specialRequests && (
                          <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                            <strong>Demandes spéciales:</strong> {reservation.specialRequests}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        {reservation.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Confirmer
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Annuler
                            </Button>
                          </>
                        )}
                        
                        {reservation.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateReservationStatus(reservation.id, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marquer terminée
                          </Button>
                        )}
                        
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}