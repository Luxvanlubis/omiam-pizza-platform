'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getRealTimeManager,
  AvailabilityUpdate,
  ReservationEvent,
  TableStatusUpdate,
  formatAvailabilityKey,
  isRecentUpdate
} from '@/utils/realTimeAvailability';

// Types pour le state du hook
export interface RealtimeReservationState {
  availabilities: Map<string, AvailabilityUpdate>;
  tableStatuses: Map<string, TableStatusUpdate>;
  recentEvents: ReservationEvent[];
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  lastUpdate: number;
  isLoading: boolean;
}

export interface UseRealTimeReservationsOptions {
  autoSubscribe?: boolean;
  maxRecentEvents?: number;
  updateThrottleMs?: number;
  enableLogging?: boolean;
}

export interface UseRealTimeReservationsReturn {
  // État
  state: RealtimeReservationState;
  
  // Méthodes de contrôle
  subscribeToDate: (date: string) => void;
  unsubscribeFromDate: (date: string) => void;
  subscribeToTable: (tableId: string) => void;
  requestUpdate: (date: string, timeSlot?: string) => void;
  clearOldData: (maxAgeMs?: number) => void;
  
  // Méthodes de requête
  getAvailabilityForSlot: (date: string, timeSlot: string) => AvailabilityUpdate | null;
  getTableStatus: (tableId: string) => TableStatusUpdate | null;
  getAvailabilitiesForDate: (date: string) => AvailabilityUpdate[];
  isSlotAvailable: (date: string, timeSlot: string, tableId?: string) => boolean;
  getRecentEventsForTable: (tableId: string) => ReservationEvent[];
  
  // Statistiques
  getStats: () => {
    totalAvailabilities: number;
    totalTables: number;
    recentEvents: number;
    lastUpdateAge: number;
  };
}

export function useRealTimeReservations(
  options: UseRealTimeReservationsOptions = {}
): UseRealTimeReservationsReturn {
  const {
    autoSubscribe = true,
    maxRecentEvents = 50,
    updateThrottleMs = 1000,
    enableLogging = false
  } = options;

  // État principal
  const [state, setState] = useState<RealtimeReservationState>({
    availabilities: new Map(),
    tableStatuses: new Map(),
    recentEvents: [],
    connectionStatus: 'disconnected',
    lastUpdate: 0,
    isLoading: true
  });

  // Références pour éviter les re-renders inutiles
  const managerRef = useRef(getRealTimeManager());
  const subscribedDatesRef = useRef(new Set<string>());
  const subscribedTablesRef = useRef(new Set<string>());
  const lastThrottleRef = useRef(0);

  // Fonction de logging conditionnelle
  const log = useCallback((message: string, data?: any) => {
    if (enableLogging) {
      console.log(`[useRealTimeReservations] ${message}`, data || '');
    }
  }, [enableLogging]);

  // Fonction de mise à jour throttlée
  const throttledUpdate = useCallback((updateFn: () => void) => {
    const now = Date.now();
    if (now - lastThrottleRef.current >= updateThrottleMs) {
      updateFn();
      lastThrottleRef.current = now;
    }
  }, [updateThrottleMs]);

  // Gestionnaires d'événements
  const handleAvailabilityUpdate = useCallback((data: AvailabilityUpdate) => {
    log('Mise à jour de disponibilité reçue', data);
    
    throttledUpdate(() => {
      setState(prevState => {
        const newAvailabilities = new Map(prevState.availabilities);
        const key = formatAvailabilityKey(data.date, data.timeSlot);
        newAvailabilities.set(key, data);
        
        return {
          ...prevState,
          availabilities: newAvailabilities,
          lastUpdate: Date.now()
        };
      });
    });
  }, [log, throttledUpdate]);

  const handleReservationEvent = useCallback((data: ReservationEvent) => {
    log('Événement de réservation reçu', data);
    
    setState(prevState => {
      const newEvents = [data, ...prevState.recentEvents].slice(0, maxRecentEvents);
      
      return {
        ...prevState,
        recentEvents: newEvents,
        lastUpdate: Date.now()
      };
    });
  }, [log, maxRecentEvents]);

  const handleTableStatusUpdate = useCallback((data: TableStatusUpdate) => {
    log('Mise à jour de statut de table reçue', data);
    
    throttledUpdate(() => {
      setState(prevState => {
        const newTableStatuses = new Map(prevState.tableStatuses);
        newTableStatuses.set(data.tableId, data);
        
        return {
          ...prevState,
          tableStatuses: newTableStatuses,
          lastUpdate: Date.now()
        };
      });
    });
  }, [log, throttledUpdate]);

  const handleConnectionChange = useCallback((data: { status: string; reason?: string; error?: any }) => {
    log('Changement de connexion', data);
    
    setState(prevState => ({
      ...prevState,
      connectionStatus: data.status as any,
      isLoading: data.status === 'connecting'
    }));
  }, [log]);

  // Configuration des écouteurs d'événements
  useEffect(() => {
    const manager = managerRef.current;
    
    // Enregistrer les écouteurs
    const unsubscribeAvailability = manager.onAvailabilityUpdate?.(handleAvailabilityUpdate);
    const unsubscribeReservation = manager.onReservationEvent?.(handleReservationEvent);
    const unsubscribeTableStatus = manager.onTableStatusUpdate?.(handleTableStatusUpdate);
    const unsubscribeConnection = manager.onConnectionChange?.(handleConnectionChange);
    
    // État initial de la connexion
    setState(prevState => ({
      ...prevState,
      connectionStatus: manager.getConnectionStatus(),
      isLoading: !manager.isConnected()
    }));

    return () => {
      // Nettoyer les écouteurs
      unsubscribeAvailability?.();
      unsubscribeReservation?.();
      unsubscribeTableStatus?.();
      unsubscribeConnection?.();
    };
  }, [handleAvailabilityUpdate, handleReservationEvent, handleTableStatusUpdate, handleConnectionChange]);

  // Méthodes publiques
  const subscribeToDate = useCallback((date: string) => {
    if (!subscribedDatesRef.current.has(date)) {
      subscribedDatesRef.current.add(date);
      managerRef.current.subscribeToDate(date);
      log(`Abonnement à la date: ${date}`);
    }
  }, [log]);

  const unsubscribeFromDate = useCallback((date: string) => {
    if (subscribedDatesRef.current.has(date)) {
      subscribedDatesRef.current.delete(date);
      managerRef.current.unsubscribeFromDate(date);
      log(`Désabonnement de la date: ${date}`);
    }
  }, [log]);

  const subscribeToTable = useCallback((tableId: string) => {
    if (!subscribedTablesRef.current.has(tableId)) {
      subscribedTablesRef.current.add(tableId);
      managerRef.current.subscribeToTable(tableId);
      log(`Abonnement à la table: ${tableId}`);
    }
  }, [log]);

  const requestUpdate = useCallback((date: string, timeSlot?: string) => {
    managerRef.current.requestAvailabilityUpdate(date, timeSlot);
    log(`Demande de mise à jour: ${date}${timeSlot ? ` - ${timeSlot}` : ''}`);
  }, [log]);

  const clearOldData = useCallback((maxAgeMs: number = 300000) => { // 5 minutes par défaut
    setState(prevState => {
      const now = Date.now();
      
      // Nettoyer les disponibilités anciennes
      const newAvailabilities = new Map();
      for (const [key, availability] of prevState.availabilities) {
        if (isRecentUpdate(availability.timestamp, maxAgeMs)) {
          newAvailabilities.set(key, availability);
        }
      }
      
      // Nettoyer les statuts de tables anciens
      const newTableStatuses = new Map();
      for (const [tableId, status] of prevState.tableStatuses) {
        if (isRecentUpdate(status.timestamp, maxAgeMs)) {
          newTableStatuses.set(tableId, status);
        }
      }
      
      // Nettoyer les événements anciens
      const newRecentEvents = prevState.recentEvents.filter(
        event => isRecentUpdate(event.timestamp, maxAgeMs)
      );
      
      return {
        ...prevState,
        availabilities: newAvailabilities,
        tableStatuses: newTableStatuses,
        recentEvents: newRecentEvents
      };
    });
    
    log(`Nettoyage des données anciennes (> ${maxAgeMs}ms)`);
  }, [log]);

  // Méthodes de requête
  const getAvailabilityForSlot = useCallback((date: string, timeSlot: string): AvailabilityUpdate | null => {
    const key = formatAvailabilityKey(date, timeSlot);
    return state.availabilities.get(key) || null;
  }, [state.availabilities]);

  const getTableStatus = useCallback((tableId: string): TableStatusUpdate | null => {
    return state.tableStatuses.get(tableId) || null;
  }, [state.tableStatuses]);

  const getAvailabilitiesForDate = useCallback((date: string): AvailabilityUpdate[] => {
    const results: AvailabilityUpdate[] = [];
    for (const [key, availability] of state.availabilities) {
      if (availability.date === date) {
        results.push(availability);
      }
    }
    return results.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }, [state.availabilities]);

  const isSlotAvailable = useCallback((date: string, timeSlot: string, tableId?: string): boolean => {
    if (tableId) {
      const tableStatus = getTableStatus(tableId);
      if (tableStatus && tableStatus.status !== 'available') {
        return false;
      }
    }
    
    const availability = getAvailabilityForSlot(date, timeSlot);
    return availability ? availability.status === 'available' : true; // Par défaut disponible si pas d'info
  }, [getAvailabilityForSlot, getTableStatus]);

  const getRecentEventsForTable = useCallback((tableId: string): ReservationEvent[] => {
    return state.recentEvents.filter(event => event.tableId === tableId);
  }, [state.recentEvents]);

  const getStats = useCallback(() => {
    return {
      totalAvailabilities: state.availabilities.size,
      totalTables: state.tableStatuses.size,
      recentEvents: state.recentEvents.length,
      lastUpdateAge: state.lastUpdate ? Date.now() - state.lastUpdate : -1
    };
  }, [state]);

  // Auto-nettoyage périodique
  useEffect(() => {
    const interval = setInterval(() => {
      clearOldData();
    }, 60000); // Nettoyer toutes les minutes
    
    return () => clearInterval(interval);
  }, [clearOldData]);

  return {
    state,
    subscribeToDate,
    unsubscribeFromDate,
    subscribeToTable,
    requestUpdate,
    clearOldData,
    getAvailabilityForSlot,
    getTableStatus,
    getAvailabilitiesForDate,
    isSlotAvailable,
    getRecentEventsForTable,
    getStats
  };
}