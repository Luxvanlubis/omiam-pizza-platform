'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  MapPin,
  Users,
  Star,
  CheckCircle,
  AlertCircle,
  Eye,
  Utensils,
  Heart,
  Briefcase,
  Home,
  Zap,
  Clock
} from 'lucide-react';
import {
  Table,
  ReservationRequest,
  TableAssignmentResult,
  findBestTable,
  findTableOptions
} from '@/utils/tableAssignment';
import { useRealTimeReservations } from '@/hooks/useRealTimeReservations';

// Données de tables simulées (à remplacer par des données réelles)
const MOCK_TABLES: Table[] = [
  {
    id: 'table-1',
    number: 1,
    capacity: 2,
    status: 'available',
    location: 'indoor',
    shape: 'round',
    features: ['window-view', 'intimate'],
    position: { x: 100, y: 100 }
  },
  {
    id: 'table-2',
    number: 2,
    capacity: 4,
    status: 'available',
    location: 'indoor',
    shape: 'square',
    features: ['quiet', 'accessible'],
    position: { x: 200, y: 100 }
  },
  {
    id: 'table-3',
    number: 3,
    capacity: 6,
    status: 'available',
    location: 'outdoor',
    shape: 'rectangular',
    features: ['garden-view', 'family-friendly'],
    position: { x: 300, y: 100 }
  },
  {
    id: 'table-4',
    number: 4,
    capacity: 2,
    status: 'available',
    location: 'private',
    shape: 'round',
    features: ['intimate', 'quiet', 'romantic'],
    position: { x: 150, y: 200 }
  },
  {
    id: 'table-5',
    number: 5,
    capacity: 8,
    status: 'available',
    location: 'indoor',
    shape: 'rectangular',
    features: ['large-group', 'business-friendly'],
    position: { x: 250, y: 200 }
  },
  {
    id: 'table-6',
    number: 6,
    capacity: 4,
    status: 'occupied',
    location: 'outdoor',
    shape: 'square',
    features: ['terrace', 'sunny'],
    position: { x: 350, y: 200 }
  }
];

interface SmartTableSelectorProps {
  selectedDate: Date;
  selectedTime: string;
  guestCount: number;
  seatingPreference?: 'indoor' | 'outdoor' | 'bar' | 'private' | 'no-preference';
  occasion?: string;
  onTableSelect: (table: Table) => void;
  selectedTable?: Table;
}

const LOCATION_ICONS = {
  indoor: Home,
  outdoor: Eye,
  bar: Utensils,
  private: Heart
};

const LOCATION_LABELS = {
  indoor: 'Intérieur',
  outdoor: 'Terrasse',
  bar: 'Bar',
  private: 'Salon privé'
};

const OCCASION_ICONS = {
  'Dîner romantique': Heart,
  'Rendez-vous amoureux': Heart,
  'Repas d\'affaires': Briefcase,
  'Anniversaire': Star,
  'Célébration familiale': Users,
  'Réunion entre amis': Users
};

export default function SmartTableSelector({
  selectedDate,
  selectedTime,
  guestCount,
  seatingPreference = 'no-preference',
  occasion,
  onTableSelect,
  selectedTable
}: SmartTableSelectorProps) {
  const [tableOptions, setTableOptions] = useState<TableAssignmentResult[]>([]);
  const [bestMatch, setBestMatch] = useState<TableAssignmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Hook pour les disponibilités en temps réel
  const {
    state: realtimeState,
    subscribeToDate,
    isSlotAvailable,
    getTableStatus,
    getStats
  } = useRealTimeReservations({
    autoSubscribe: true,
    enableLogging: true
  });

  // S'abonner aux mises à jour en temps réel pour la date sélectionnée
  useEffect(() => {
    if (selectedDate) {
      subscribeToDate(selectedDate);
      console.log('Abonnement aux mises à jour pour:', selectedDate);
    }
  }, [selectedDate, subscribeToDate]);

  // Filtrer les tables disponibles en temps réel
  const availableTables = useMemo(() => {
    return MOCK_TABLES.filter(table => {
      // Vérifier la disponibilité en temps réel
      if (selectedDate && selectedTime) {
        const isRealTimeAvailable = isSlotAvailable(selectedDate, selectedTime, table.id);
        const tableStatus = getTableStatus(table.id);
        
        // Si on a des données en temps réel, les utiliser
        if (tableStatus) {
          return tableStatus.status === 'available';
        }
        
        return isRealTimeAvailable;
      }
      
      // Fallback: utiliser le statut de la table
      return table.status === 'available';
    });
  }, [selectedTime, selectedDate, isSlotAvailable, getTableStatus]);

  useEffect(() => {
    const calculateTableOptions = () => {
      setLoading(true);
      
      const request: ReservationRequest = {
        guestCount,
        date: selectedDate,
        time: selectedTime,
        seatingPreference,
        occasion
      };

      // Simuler un délai de calcul pour l'effet de chargement
      setTimeout(() => {
        const options = findTableOptions(availableTables, request, 5);
        const best = findBestTable(availableTables, request);
        
        setTableOptions(options);
        setBestMatch(best);
        setLoading(false);
      }, 500);
    };

    calculateTableOptions();
  }, [selectedDate, selectedTime, guestCount, seatingPreference, occasion, availableTables]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Bon';
    return 'Acceptable';
  };

  const renderTableCard = (result: TableAssignmentResult, isBest: boolean = false) => {
    const { table, score, reasons } = result;
    const LocationIcon = LOCATION_ICONS[table.location];
    const isSelected = selectedTable?.id === table.id;

    return (
      <Card
        key={table.id}
        className={cn(
          'cursor-pointer transition-all duration-200 hover:shadow-md',
          isSelected && 'ring-2 ring-red-500 bg-red-50',
          isBest && !isSelected && 'ring-2 ring-green-500 bg-green-50',
          table.status !== 'available' && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => table.status === 'available' && onTableSelect(table)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <LocationIcon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">
                Table {table.number}
              </CardTitle>
              {isBest && (
                <Badge variant="default" className="bg-green-600">
                  <Star className="h-3 w-3 mr-1" />
                  Recommandée
                </Badge>
              )}
            </div>
            <Badge className={cn('text-xs', getScoreColor(score))}>
              {getScoreLabel(score)} ({score}%)
            </Badge>
          </div>
          <CardDescription>
            {LOCATION_LABELS[table.location]} • {table.capacity} personnes • {table.shape}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Caractéristiques de la table */}
          <div className="flex flex-wrap gap-1">
            {table.features.map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature.replace('-', ' ')}
              </Badge>
            ))}
          </div>

          {/* Raisons du score */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Pourquoi cette table :</p>
            <ul className="text-xs space-y-1">
              {reasons.slice(0, 3).map((reason, index) => (
                <li key={index} className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Statut de disponibilité */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-1">
              {table.status === 'available' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm capitalize">
                {table.status === 'available' ? 'Disponible' : 'Occupée'}
              </span>
            </div>
            
            {isSelected && (
              <Badge variant="default" className="bg-red-600">
                Sélectionnée
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recherche des meilleures tables...</CardTitle>
          <CardDescription>
            Analyse en cours basée sur vos préférences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec résumé de la recherche et statut temps réel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Sélection intelligente de table</span>
              </CardTitle>
              <CardDescription>
                {guestCount} personne{guestCount > 1 ? 's' : ''} • {selectedTime} • {LOCATION_LABELS[seatingPreference] || 'Aucune préférence'}
                {occasion && (
                  <>
                    {' • '}
                    <span className="inline-flex items-center space-x-1">
                      {OCCASION_ICONS[occasion] && React.createElement(OCCASION_ICONS[occasion], { className: 'h-3 w-3' })}
                      <span>{occasion}</span>
                    </span>
                  </>
                )}
              </CardDescription>
            </div>
            
            {/* Indicateur de statut temps réel */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                realtimeState.connectionStatus === 'connected' 
                  ? 'bg-green-100 text-green-700' 
                  : realtimeState.connectionStatus === 'connecting'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {realtimeState.connectionStatus === 'connected' ? (
                  <><Zap className="w-3 h-3" /> Temps réel</>
                ) : realtimeState.connectionStatus === 'connecting' ? (
                  <><Clock className="w-3 h-3" /> Connexion...</>
                ) : (
                  <><AlertCircle className="w-3 h-3" /> Hors ligne</>
                )}
              </div>
              {realtimeState.connectionStatus === 'connected' && (
                <span className="text-xs text-muted-foreground">
                  {getStats().totalTables} tables suivies
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Meilleure recommandation */}
      {bestMatch && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Notre recommandation</span>
          </h3>
          {renderTableCard(bestMatch, true)}
        </div>
      )}

      {/* Autres options */}
      {tableOptions.length > 1 && (
        <div>
          <Separator className="my-6" />
          <h3 className="text-lg font-semibold mb-3">Autres options disponibles</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {tableOptions.slice(1).map((result) => renderTableCard(result))}
          </div>
        </div>
      )}

      {/* Message si aucune table disponible */}
      {tableOptions.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Aucune table disponible pour ce créneau. Essayez un autre horaire ou contactez-nous pour plus d'options.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}