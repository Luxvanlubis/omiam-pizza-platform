"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, MapPin, Clock, Edit, Trash2, Plus, Eye, Settings, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TableManagement from '@/components/reservation/TableManagement';

interface Table {
  id: string;
  number: number;
  capacity: number;
  position: { x: number; y: number };
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location: 'main' | 'terrace' | 'private';
  shape: 'round' | 'square' | 'rectangular';
  features: string[];
  currentReservation?: {
    customerName: string;
    time: string;
    duration: number;
    guests: number;
  };
}

const INITIAL_TABLES: Table[] = [
  {
    id: '1',
    number: 1,
    capacity: 2,
    position: { x: 100, y: 100 },
    status: 'available',
    location: 'main',
    shape: 'round',
    features: ['Vue fenêtre']
  },
  {
    id: '2',
    number: 2,
    capacity: 4,
    position: { x: 200, y: 100 },
    status: 'occupied',
    location: 'main',
    shape: 'square',
    features: ['Banquette'],
    currentReservation: {
      customerName: 'Martin Dubois',
      time: '19:30',
      duration: 120,
      guests: 4
    }
  },
  {
    id: '3',
    number: 3,
    capacity: 6,
    position: { x: 300, y: 150 },
    status: 'reserved',
    location: 'main',
    shape: 'rectangular',
    features: ['Grande table', 'Près du bar']
  },
  {
    id: '4',
    number: 4,
    capacity: 2,
    position: { x: 150, y: 200 },
    status: 'available',
    location: 'terrace',
    shape: 'round',
    features: ['Terrasse', 'Vue jardin']
  },
  {
    id: '5',
    number: 5,
    capacity: 8,
    position: { x: 250, y: 250 },
    status: 'maintenance',
    location: 'private',
    shape: 'rectangular',
    features: ['Salon privé', 'Climatisation']
  },
  {
    id: '6',
    number: 6,
    capacity: 4,
    position: { x: 350, y: 100 },
    status: 'available',
    location: 'main',
    shape: 'square',
    features: ['Coin calme']
  }
];

const AVAILABLE_FEATURES = [
  'Vue fenêtre',
  'Banquette',
  'Grande table',
  'Près du bar',
  'Terrasse',
  'Vue jardin',
  'Salon privé',
  'Climatisation',
  'Coin calme',
  'Accès handicapé',
  'Table haute',
  'Près de la cuisine'
];

export default function AdminTablesPage() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [newTable, setNewTable] = useState<Partial<Table>>({
    number: 0,
    capacity: 2,
    position: { x: 100, y: 100 },
    status: 'available',
    location: 'main',
    shape: 'round',
    features: []
  });

  const handleEditTable = (table: Table) => {
    setEditingTable({ ...table });
    setIsEditDialogOpen(true);
  };

  const handleSaveTable = () => {
    if (editingTable) {
      setTables(prev => prev.map(t => t.id === editingTable.id ? editingTable : t));
      setIsEditDialogOpen(false);
      setEditingTable(null);
    }
  };

  const handleAddTable = () => {
    if (newTable.number && newTable.capacity) {
      const id = Math.max(...tables.map(t => parseInt(t.id))) + 1;
      const table: Table = {
        id: id.toString(),
        number: newTable.number,
        capacity: newTable.capacity,
        position: newTable.position || { x: 100, y: 100 },
        status: newTable.status || 'available',
        location: newTable.location || 'main',
        shape: newTable.shape || 'round',
        features: newTable.features || []
      };
      setTables(prev => [...prev, table]);
      setIsAddDialogOpen(false);
      setNewTable({
        number: 0,
        capacity: 2,
        position: { x: 100, y: 100 },
        status: 'available',
        location: 'main',
        shape: 'round',
        features: []
      });
    }
  };

  const handleDeleteTable = (tableId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette table ?')) {
      setTables(prev => prev.filter(t => t.id !== tableId));
    }
  };

  const handleStatusChange = (tableId: string, newStatus: Table['status']) => {
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, status: newStatus } : t
    ));
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'occupied': return 'text-red-600';
      case 'reserved': return 'text-yellow-600';
      case 'maintenance': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getLocationText = (location: Table['location']) => {
    switch (location) {
      case 'main': return 'Salle principale';
      case 'terrace': return 'Terrasse';
      case 'private': return 'Salon privé';
      default: return location;
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'occupied': return 'Occupée';
      case 'reserved': return 'Réservée';
      case 'maintenance': return 'Maintenance';
      default: return 'Inconnu';
    }
  };

  const handleFeatureToggle = (table: Table | Partial<Table>, feature: string, isEditing: boolean = false) => {
    const currentFeatures = table.features || [];
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    if (isEditing && editingTable) {
      setEditingTable({ ...editingTable, features: newFeatures });
    } else if (!isEditing) {
      setNewTable({ ...newTable, features: newFeatures });
    }
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length,
    totalCapacity: tables.reduce((sum, t) => sum + t.capacity, 0),
    averageCapacity: Math.round(tables.reduce((sum, t) => sum + t.capacity, 0) / tables.length * 10) / 10
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-800 dark:text-red-600 mb-4">
            Gestion des Tables
          </h1>
          <p className="text-lg text-muted-foreground">
            Gérez la configuration, le statut et les caractéristiques de vos tables
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="management">Gestion</TabsTrigger>
            <TabsTrigger value="layout">Plan de salle</TabsTrigger>
            <TabsTrigger value="statistics">Statistiques</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.available}</div>
                  <div className="text-sm text-muted-foreground">Disponibles</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
                  <div className="text-sm text-muted-foreground">Occupées</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.reserved}</div>
                  <div className="text-sm text-muted-foreground">Réservées</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.maintenance}</div>
                  <div className="text-sm text-muted-foreground">Maintenance</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{stats.totalCapacity}</div>
                  <div className="text-sm text-muted-foreground">Capacité totale</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold">{stats.averageCapacity}</div>
                  <div className="text-sm text-muted-foreground">Capacité moy.</div>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides */}
            <div className="grid md:grid-cols-3 gap-4">
              {tables.filter(t => t.status === 'occupied').map(table => (
                <Card key={table.id} className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      Table {table.number}
                      <Badge variant="destructive">Occupée</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {table.currentReservation && (
                      <div className="space-y-2">
                        <p><strong>Client:</strong> {table.currentReservation.customerName}</p>
                        <p><strong>Heure:</strong> {table.currentReservation.time}</p>
                        <p><strong>Personnes:</strong> {table.currentReservation.guests}</p>
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(table.id, 'available')}
                          >
                            Libérer
                          </Button>
                          <Button size="sm" variant="outline">
                            Détails
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Liste des Tables</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une table
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Ajouter une nouvelle table</DialogTitle>
                    <DialogDescription>
                      Configurez les caractéristiques de la nouvelle table
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="number">Numéro de table</Label>
                        <Input
                          id="number"
                          type="number"
                          value={newTable.number || ''}
                          onChange={(e) => setNewTable({...newTable, number: parseInt(e.target.value)})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="capacity">Capacité</Label>
                        <Input
                          id="capacity"
                          type="number"
                          value={newTable.capacity || ''}
                          onChange={(e) => setNewTable({...newTable, capacity: parseInt(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="location">Zone</Label>
                        <Select value={newTable.location} onValueChange={(value: Table['location']) => setNewTable({...newTable, location: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">Salle principale</SelectItem>
                            <SelectItem value="terrace">Terrasse</SelectItem>
                            <SelectItem value="private">Salon privé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="shape">Forme</Label>
                        <Select value={newTable.shape} onValueChange={(value: Table['shape']) => setNewTable({...newTable, shape: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="round">Ronde</SelectItem>
                            <SelectItem value="square">Carrée</SelectItem>
                            <SelectItem value="rectangular">Rectangulaire</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label>Caractéristiques</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {AVAILABLE_FEATURES.map(feature => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={`feature-${feature}`}
                              checked={newTable.features?.includes(feature) || false}
                              onCheckedChange={() => handleFeatureToggle(newTable, feature)}
                            />
                            <Label htmlFor={`feature-${feature}`} className="text-sm">{feature}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Annuler</Button>
                    <Button onClick={handleAddTable}>Ajouter</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {tables.map((table) => (
                <Card key={table.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-xl font-semibold">Table {table.number}</h3>
                          <Badge variant={table.status === 'available' ? 'default' : 
                                        table.status === 'occupied' ? 'destructive' :
                                        table.status === 'reserved' ? 'secondary' : 'outline'}>
                            {getStatusText(table.status)}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p><strong>Capacité:</strong> {table.capacity} personnes</p>
                            <p><strong>Zone:</strong> {getLocationText(table.location)}</p>
                            <p><strong>Forme:</strong> {table.shape}</p>
                          </div>
                          <div>
                            <p><strong>Position:</strong> ({table.position.x}, {table.position.y})</p>
                            <p><strong>Caractéristiques:</strong></p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {table.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{feature}</Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`status-${table.id}`}>Changer le statut:</Label>
                            <Select value={table.status} onValueChange={(value: Table['status']) => handleStatusChange(table.id, value)}>
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="available">Disponible</SelectItem>
                                <SelectItem value="occupied">Occupée</SelectItem>
                                <SelectItem value="reserved">Réservée</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditTable(table)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteTable(table.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <TableManagement />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['main', 'terrace', 'private'].map(location => {
                      const count = tables.filter(t => t.location === location).length;
                      const percentage = Math.round((count / tables.length) * 100);
                      return (
                        <div key={location} className="flex justify-between items-center">
                          <span>{getLocationText(location as Table['location'])}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{count} ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition par capacité</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[2, 4, 6, 8].map(capacity => {
                      const count = tables.filter(t => t.capacity === capacity).length;
                      const percentage = count > 0 ? Math.round((count / tables.length) * 100) : 0;
                      return (
                        <div key={capacity} className="flex justify-between items-center">
                          <span>{capacity} personnes</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{count} ({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog d'édition */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la table {editingTable?.number}</DialogTitle>
              <DialogDescription>
                Modifiez les caractéristiques de la table
              </DialogDescription>
            </DialogHeader>
            {editingTable && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-number">Numéro de table</Label>
                    <Input
                      id="edit-number"
                      type="number"
                      value={editingTable.number}
                      onChange={(e) => setEditingTable({...editingTable, number: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-capacity">Capacité</Label>
                    <Input
                      id="edit-capacity"
                      type="number"
                      value={editingTable.capacity}
                      onChange={(e) => setEditingTable({...editingTable, capacity: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-location">Zone</Label>
                    <Select value={editingTable.location} onValueChange={(value: Table['location']) => setEditingTable({...editingTable, location: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Salle principale</SelectItem>
                        <SelectItem value="terrace">Terrasse</SelectItem>
                        <SelectItem value="private">Salon privé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-shape">Forme</Label>
                    <Select value={editingTable.shape} onValueChange={(value: Table['shape']) => setEditingTable({...editingTable, shape: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="round">Ronde</SelectItem>
                        <SelectItem value="square">Carrée</SelectItem>
                        <SelectItem value="rectangular">Rectangulaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-x">Position X</Label>
                    <Input
                      id="edit-x"
                      type="number"
                      value={editingTable.position.x}
                      onChange={(e) => setEditingTable({...editingTable, position: {...editingTable.position, x: parseInt(e.target.value)}})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-y">Position Y</Label>
                    <Input
                      id="edit-y"
                      type="number"
                      value={editingTable.position.y}
                      onChange={(e) => setEditingTable({...editingTable, position: {...editingTable.position, y: parseInt(e.target.value)}})}
                    />
                  </div>
                </div>
                <div>
                  <Label>Caractéristiques</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {AVAILABLE_FEATURES.map(feature => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-feature-${feature}`}
                          checked={editingTable.features.includes(feature)}
                          onCheckedChange={() => handleFeatureToggle(editingTable, feature, true)}
                        />
                        <Label htmlFor={`edit-feature-${feature}`} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSaveTable}>Sauvegarder</Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}