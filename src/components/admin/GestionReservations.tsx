"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar as CalendarIcon, Clock, Users, Phone, Mail, MapPin, Plus, Edit, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Reservation {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  date: Date;
  time: string;
  guests: number;
  table: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  specialRequests: string;
  arrivalTime?: Date;
  notes: string;
}

interface TableInfo {
  id: string;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
}

const timeSlots = [
  "12:00", "12:30", "13:00", "13:30", "14:00",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00"
];

const tables: TableInfo[] = [
  { id: "1", name: "Table 1", capacity: 2, status: "available" },
  { id: "2", name: "Table 2", capacity: 4, status: "available" },
  { id: "3", name: "Table 3", capacity: 4, status: "available" },
  { id: "4", name: "Table 4", capacity: 6, status: "available" },
  { id: "5", name: "Table 5", capacity: 8, status: "available" },
  { id: "6", name: "Terrasse 1", capacity: 2, status: "available" },
  { id: "7", name: "Terrasse 2", capacity: 4, status: "available" },
];

export function GestionReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: "1",
      clientName: "Marie Dubois",
      phone: "06 12 34 56 78",
      email: "marie.dubois@email.fr",
      date: new Date(2024, 0, 15),
      time: "19:30",
      guests: 4,
      table: "Table 2",
      status: "confirmed",
      specialRequests: "Allergie aux noix",
      notes: "Client régulier, préfère table près de la fenêtre"
    },
    {
      id: "2",
      clientName: "Jean Martin",
      phone: "06 98 76 54 32",
      email: "jean.martin@email.fr",
      date: new Date(2024, 0, 15),
      time: "20:00",
      guests: 2,
      table: "Table 1",
      status: "pending",
      specialRequests: "Anniversaire",
      notes: "Amène un gâteau"
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState<Partial<Reservation>>({
    clientName: "",
    phone: "",
    email: "",
    date: new Date(),
    time: "19:30",
    guests: 2,
    table: "",
    specialRequests: "",
    notes: ""
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "text-green-600 bg-green-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      case "cancelled": return "text-red-600 bg-red-100";
      case "completed": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getAvailableTables = (date: Date, time: string, guests: number) => {
    const conflictingReservations = reservations.filter(r => 
      r.date.toDateString() === date.toDateString() && 
      r.time === time && 
      r.status !== "cancelled"
    );

    return tables.filter(table => {
      const isReserved = conflictingReservations.some(r => r.table === table.name);
      const hasCapacity = table.capacity >= guests;
      return !isReserved && hasCapacity;
    });
  };

  const handleSubmit = () => {
    if (editingReservation) {
      setReservations(reservations.map(res => 
        res.id === editingReservation.id ? { ...res, ...formData } as Reservation : res
      ));
    } else {
      const newReservation: Reservation = {
        id: Date.now().toString(),
        clientName: formData.clientName || "",
        phone: formData.phone || "",
        email: formData.email || "",
        date: formData.date || new Date(),
        time: formData.time || "19:30",
        guests: formData.guests || 2,
        table: formData.table || "",
        status: "pending",
        specialRequests: formData.specialRequests || "",
        notes: formData.notes || ""
      };
      setReservations([...reservations, newReservation]);
    }
    setIsDialogOpen(false);
    setEditingReservation(null);
    setFormData({
      clientName: "",
      phone: "",
      email: "",
      date: new Date(),
      time: "19:30",
      guests: 2,
      table: "",
      specialRequests: "",
      notes: ""
    });
  };

  const handleStatusChange = (reservationId: string, newStatus: Reservation["status"]) => {
    setReservations(reservations.map(res => 
      res.id === reservationId ? { ...res, status: newStatus } : res
    ));
  };

  const todayReservations = reservations.filter(r => 
    r.date.toDateString() === (selectedDate || new Date()).toDateString()
  );

  const confirmedReservations = reservations.filter(r => r.status === "confirmed").length;
  const pendingReservations = reservations.filter(r => r.status === "pending").length;
  const totalGuestsToday = todayReservations.reduce((sum, r) => sum + r.guests, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            Gestion des Réservations
          </h2>
          <p className="text-muted-foreground">Gérez les réservations de tables et les clients</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle réservation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Réservations confirmées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedReservations}</div>
            <div className="text-sm text-muted-foreground">Ce mois-ci</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReservations}</div>
            <div className="text-sm text-muted-foreground">À confirmer</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Couverts aujourd'hui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuestsToday}</div>
            <div className="text-sm text-muted-foreground">Personnes attendues</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Réservations du jour</CardTitle>
          <CardDescription>
            {format(selectedDate || new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Heure</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Personnes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayReservations
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {reservation.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reservation.clientName}</div>
                        <div className="text-sm text-muted-foreground">{reservation.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{reservation.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{reservation.table}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{reservation.guests} pers.</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Select
                          value={reservation.status}
                          onValueChange={(value) => handleStatusChange(reservation.id, value as Reservation["status"])}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">En attente</SelectItem>
                            <SelectItem value="confirmed">Confirmée</SelectItem>
                            <SelectItem value="cancelled">Annulée</SelectItem>
                            <SelectItem value="completed">Terminée</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingReservation(reservation);
                            setFormData(reservation);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReservations(reservations.filter(r => r.id !== reservation.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {todayReservations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucune réservation prévue pour cette date
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingReservation ? "Modifier la réservation" : "Nouvelle réservation"}
            </DialogTitle>
            <DialogDescription>
              {editingReservation 
                ? "Modifiez les informations de la réservation"
                : "Créez une nouvelle réservation de table"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nom du client</Label>
                <Input
                  id="clientName"
                  value={formData.clientName || ""}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  placeholder="Ex: Marie Dubois"
                />
              </div>

              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="marie.dubois@email.fr"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date: date || new Date() })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Heure</Label>
                <Select
                  value={formData.time || "19:30"}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="guests">Nombre de personnes</Label>
                <Input
                  id="guests"
                  type="number"
                  value={formData.guests || 2}
                  onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                  min="1"
                  max="12"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="table">Table</Label>
                <Select
                  value={formData.table || ""}
                  onValueChange={(value) => setFormData({ ...formData, table: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une table" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableTables(formData.date || new Date(), formData.time || "19:30", formData.guests || 2)
                      .map(table => (
                        <SelectItem key={table.id} value={table.name}>
                          {table.name} ({table.capacity} pers.)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="specialRequests">Demandes spéciales</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests || ""}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                placeholder="Allergies, préférences alimentaires, occasion spéciale..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes pour le personnel"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              {editingReservation ? "Mettre à jour" : "Créer la réservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}