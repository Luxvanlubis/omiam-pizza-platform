/**
 * Système d'attribution intelligente des tables
 * Optimise l'attribution basée sur la taille du groupe, les préférences et la disponibilité
 */

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  location: 'indoor' | 'outdoor' | 'bar' | 'private';
  shape: 'round' | 'square' | 'rectangular';
  features: string[];
  position?: {
    x: number;
    y: number;
  };
}

export interface ReservationRequest {
  guestCount: number;
  date: Date;
  time: string;
  seatingPreference?: 'indoor' | 'outdoor' | 'bar' | 'private' | 'no-preference';
  occasion?: string;
  specialRequests?: string;
  dietaryRestrictions?: string[];
}

export interface TableAssignmentResult {
  table: Table;
  score: number;
  reasons: string[];
  alternatives?: Table[];
}

/**
 * Calcule le score d'adéquation d'une table pour une réservation
 */
function calculateTableScore(
  table: Table,
  request: ReservationRequest
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Score de capacité (facteur le plus important)
  const capacityRatio = request.guestCount / table.capacity;
  if (capacityRatio <= 0.75) {
    // Table parfaitement adaptée ou légèrement surdimensionnée
    score += 100;
    reasons.push(`Capacité optimale (${request.guestCount}/${table.capacity})`);
  } else if (capacityRatio <= 1.0) {
    // Table juste à la bonne taille
    score += 80;
    reasons.push(`Capacité exacte (${request.guestCount}/${table.capacity})`);
  } else {
    // Table trop petite - pénalité importante
    score -= 50;
    reasons.push(`Table trop petite (${request.guestCount}/${table.capacity})`);
  }

  // Score de préférence d'emplacement
  if (request.seatingPreference && request.seatingPreference !== 'no-preference') {
    if (table.location === request.seatingPreference) {
      score += 30;
      reasons.push(`Emplacement préféré (${table.location})`);
    } else {
      score -= 10;
      reasons.push(`Emplacement différent de la préférence`);
    }
  }

  // Bonus pour les occasions spéciales
  if (request.occasion) {
    const romanticOccasions = ['Dîner romantique', 'Rendez-vous amoureux', 'Anniversaire'];
    const businessOccasions = ['Repas d\'affaires'];
    const familyOccasions = ['Célébration familiale', 'Réunion entre amis'];

    if (romanticOccasions.includes(request.occasion)) {
      if (table.location === 'private' || table.features.includes('intimate')) {
        score += 25;
        reasons.push('Table romantique pour l\'occasion');
      }
      if (table.shape === 'round' && table.capacity <= 4) {
        score += 15;
        reasons.push('Table ronde intime');
      }
    }

    if (businessOccasions.includes(request.occasion)) {
      if (table.features.includes('quiet') || table.location === 'private') {
        score += 20;
        reasons.push('Environnement calme pour affaires');
      }
      if (table.shape === 'rectangular') {
        score += 10;
        reasons.push('Table rectangulaire pour réunion');
      }
    }

    if (familyOccasions.includes(request.occasion)) {
      if (table.capacity >= 6) {
        score += 15;
        reasons.push('Grande table pour groupe familial');
      }
      if (table.location === 'indoor') {
        score += 10;
        reasons.push('Intérieur adapté aux familles');
      }
    }
  }

  // Bonus pour les caractéristiques spéciales
  if (table.features.includes('window-view')) {
    score += 10;
    reasons.push('Vue sur fenêtre');
  }
  if (table.features.includes('accessible')) {
    score += 5;
    reasons.push('Table accessible');
  }
  if (table.features.includes('quiet')) {
    score += 8;
    reasons.push('Zone calme');
  }

  // Pénalité pour les tables en maintenance
  if (table.status === 'maintenance') {
    score -= 1000;
    reasons.push('Table en maintenance');
  }

  return { score, reasons };
}

/**
 * Trouve la meilleure table disponible pour une réservation
 */
export function findBestTable(
  availableTables: Table[],
  request: ReservationRequest
): TableAssignmentResult | null {
  if (availableTables.length === 0) {
    return null;
  }

  // Filtrer les tables disponibles
  const validTables = availableTables.filter(
    table => table.status === 'available'
  );

  if (validTables.length === 0) {
    return null;
  }

  // Calculer les scores pour chaque table
  const scoredTables = validTables.map(table => {
    const { score, reasons } = calculateTableScore(table, request);
    return { table, score, reasons };
  });

  // Trier par score décroissant
  scoredTables.sort((a, b) => b.score - a.score);

  const bestMatch = scoredTables[0];
  const alternatives = scoredTables.slice(1, 4).map(item => item.table);

  return {
    table: bestMatch.table,
    score: bestMatch.score,
    reasons: bestMatch.reasons,
    alternatives
  };
}

/**
 * Trouve plusieurs options de tables avec leurs scores
 */
export function findTableOptions(
  availableTables: Table[],
  request: ReservationRequest,
  maxOptions: number = 5
): TableAssignmentResult[] {
  const validTables = availableTables.filter(
    table => table.status === 'available'
  );

  if (validTables.length === 0) {
    return [];
  }

  // Calculer les scores pour chaque table
  const scoredTables = validTables.map(table => {
    const { score, reasons } = calculateTableScore(table, request);
    return {
      table,
      score,
      reasons,
      alternatives: [] as Table[]
    };
  });

  // Trier par score décroissant et limiter le nombre d'options
  return scoredTables
    .sort((a, b) => b.score - a.score)
    .slice(0, maxOptions);
}

/**
 * Optimise l'attribution de plusieurs réservations simultanées
 */
export function optimizeMultipleAssignments(
  availableTables: Table[],
  requests: ReservationRequest[]
): Map<ReservationRequest, TableAssignmentResult | null> {
  const assignments = new Map<ReservationRequest, TableAssignmentResult | null>();
  const usedTables = new Set<string>();

  // Trier les demandes par priorité (groupes plus grands d'abord)
  const sortedRequests = [...requests].sort((a, b) => b.guestCount - a.guestCount);

  for (const request of sortedRequests) {
    // Filtrer les tables non utilisées
    const availableForThisRequest = availableTables.filter(
      table => !usedTables.has(table.id) && table.status === 'available'
    );

    const assignment = findBestTable(availableForThisRequest, request);
    
    if (assignment) {
      usedTables.add(assignment.table.id);
    }
    
    assignments.set(request, assignment);
  }

  return assignments;
}

/**
 * Suggère des créneaux alternatifs si aucune table n'est disponible
 */
export function suggestAlternativeTimeSlots(
  allTables: Table[],
  request: ReservationRequest,
  timeSlots: string[]
): Array<{ time: string; availableTables: number; bestScore: number }> {
  return timeSlots.map(time => {
    const modifiedRequest = { ...request, time };
    const availableTables = allTables.filter(table => table.status === 'available');
    
    if (availableTables.length === 0) {
      return { time, availableTables: 0, bestScore: 0 };
    }

    const bestMatch = findBestTable(availableTables, modifiedRequest);
    
    return {
      time,
      availableTables: availableTables.length,
      bestScore: bestMatch?.score || 0
    };
  }).sort((a, b) => b.bestScore - a.bestScore);
}