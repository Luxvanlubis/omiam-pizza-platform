"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, MapPin, Clock, Edit, Trash2, Plus, Eye } from 'lucide-react';

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

interface TableManagementProps {
  selectedDate?: Date;
  selectedTime?: string;
  requiredCapacity?: number;
  onTableSelect?: (table: Table) => void;
}

const MOCK_TABLES: Table[] = [
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

const TableManagement: React.FC<TableManagementProps> = ({
  selectedDate,
  selectedTime,
  requiredCapacity = 2,
  onTableSelect
}) => {
  const [tables, setTables] = useState<Table[]>(MOCK_TABLES);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [viewMode, setViewMode] = useState<'plan' | 'list'>('plan');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 hover:bg-green-600';
      case 'occupied':
        return 'bg-red-500 hover:bg-red-600';
      case 'reserved':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'maintenance':
        return 'bg-gray-500 hover:bg-gray-600';
      default:
        return 'bg-gray-300';
    }
  };

  const getStatusBadgeVariant = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Occupée';
      case 'reserved':
        return 'Réservée';
      case 'maintenance':
        return 'Maintenance';
      default:
        return 'Inconnu';
    }
  };

  const getLocationText = (location: Table['location']) => {
    switch (location) {
      case 'main':
        return 'Salle principale';
      case 'terrace':
        return 'Terrasse';
      case 'private':
        return 'Salon privé';
      default:
        return location;
    }
  };

  const filteredTables = tables.filter(table => {
    const locationMatch = filterLocation === 'all' || table.location === filterLocation;
    const statusMatch = filterStatus === 'all' || table.status === filterStatus;
    const capacityMatch = table.capacity >= requiredCapacity;
    return locationMatch && statusMatch && capacityMatch;
  });

  const handleTableClick = (table: Table) => {
    if (table.status === 'available') {
      setSelectedTable(table);
      onTableSelect?.(table);
    }
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setIsEditDialogOpen(true);
  };

  const handleSaveTable = () => {
    if (editingTable) {
      setTables(prev => prev.map(t => t.id === editingTable.id ? editingTable : t));
      setIsEditDialogOpen(false);
      setEditingTable(null);
    }
  };

  const renderTablePlan = () => (
    <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[400px] overflow-auto">
      <svg width="500" height="400" className="border rounded">
        {/* Zones du restaurant */}
        <rect x="50" y="50" width="200" height="150" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" rx="8" />
        <text x="150" y="40" textAnchor="middle" className="text-sm font-medium fill-gray-600">Salle principale</text>
        
        <rect x="270" y="50" width="180" height="100" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" rx="8" />
        <text x="360" y="40" textAnchor="middle" className="text-sm font-medium fill-green-600">Terrasse</text>
        
        <rect x="270" y="170" width="180" height="100" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" rx="8" />
        <text x="360" y="160" textAnchor="middle" className="text-sm font-medium fill-yellow-600">Salon privé</text>

        {/* Tables */}
        {filteredTables.map((table) => {
          const isSelected = selectedTable?.id === table.id;
          return (
            <g key={table.id}>
              <circle
                cx={table.position.x}
                cy={table.position.y}
                r={table.capacity * 8 + 10}
                className={`${getStatusColor(table.status)} cursor-pointer transition-all duration-200 ${
                  isSelected ? 'ring-4 ring-blue-500' : ''
                } ${table.status === 'available' ? 'hover:scale-110' : 'cursor-not-allowed'}`}
                onClick={() => handleTableClick(table)}
              />
              <text
                x={table.position.x}
                y={table.position.y - 5}
                textAnchor="middle"
                className="text-white font-bold text-sm pointer-events-none"
              >
                {table.number}
              </text>
              <text
                x={table.position.x}
                y={table.position.y + 8}
                textAnchor="middle"
                className="text-white text-xs pointer-events-none"
              >
                {table.capacity}p
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Légende */}
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-sm">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm">Occupée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <span className="text-sm">Réservée</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
          <span className="text-sm">Maintenance</span>
        </div>
      </div>
    </div>
  );

  const renderTableList = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredTables.map((table) => {
        const isSelected = selectedTable?.id === table.id;
        return (
          <Card 
            key={table.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            } ${table.status !== 'available' ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'}`}
            onClick={() => handleTableClick(table)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Table {table.number}</CardTitle>
                <Badge variant={getStatusBadgeVariant(table.status)}>
                  {getStatusText(table.status)}
                </Badge>
              </div>
              <CardDescription>
                {getLocationText(table.location)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{table.capacity} personnes</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm capitalize">{table.shape}</span>
                </div>
                {table.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {table.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                )}
                {table.currentReservation && (
                  <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-sm font-medium">{table.currentReservation.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {table.currentReservation.time} - {table.currentReservation.guests} personnes
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête et contrôles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600">Gestion des Tables</h2>
          <p className="text-muted-foreground">
            {selectedDate && selectedTime ? 
              `Sélection pour le ${selectedDate.toLocaleDateString('fr-FR')} à ${selectedTime}` :
              'Sélectionnez une table disponible'
            }
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'plan' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('plan')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Plan
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <Users className="h-4 w-4 mr-2" />
            Liste
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="location-filter">Zone:</Label>
          <Select value={filterLocation} onValueChange={setFilterLocation}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="main">Salle principale</SelectItem>
              <SelectItem value="terrace">Terrasse</SelectItem>
              <SelectItem value="private">Salon privé</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="status-filter">Statut:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="available">Disponible</SelectItem>
              <SelectItem value="occupied">Occupée</SelectItem>
              <SelectItem value="reserved">Réservée</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Capacité min: {requiredCapacity} personnes
          </span>
        </div>
      </div>

      {/* Affichage des tables */}
      <Card>
        <CardContent className="p-6">
          {viewMode === 'plan' ? renderTablePlan() : renderTableList()}
        </CardContent>
      </Card>

      {/* Informations sur la table sélectionnée */}
      {selectedTable && (
        <Card className="border-blue-500">
          <CardHeader>
            <CardTitle className="text-blue-600">Table {selectedTable.number} sélectionnée</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>Capacité:</strong> {selectedTable.capacity} personnes</p>
                <p><strong>Zone:</strong> {getLocationText(selectedTable.location)}</p>
                <p><strong>Forme:</strong> {selectedTable.shape}</p>
              </div>
              <div>
                <p><strong>Caractéristiques:</strong></p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedTable.features.map((feature, index) => (
                    <Badge key={index} variant="outline">{feature}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tables.filter(t => t.status === 'available').length}
            </div>
            <div className="text-sm text-muted-foreground">Disponibles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {tables.filter(t => t.status === 'occupied').length}
            </div>
            <div className="text-sm text-muted-foreground">Occupées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {tables.filter(t => t.status === 'reserved').length}
            </div>
            <div className="text-sm text-muted-foreground">Réservées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">
              {tables.reduce((sum, t) => sum + t.capacity, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Capacité totale</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TableManagement;