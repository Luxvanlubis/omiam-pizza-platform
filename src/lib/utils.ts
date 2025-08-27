import { type ClassValue } from "clsx"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(...inputs))
}

/**
 * Formate un nombre avec des espaces comme séparateurs de milliers
 * pour éviter les erreurs d'hydratation SSR
 */
export function formatNumber(value: number): string { return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Formate un montant en euros avec des espaces comme séparateurs
 */
export function formatCurrency(value: number): string { return `${formatNumber(value)}€`
}
