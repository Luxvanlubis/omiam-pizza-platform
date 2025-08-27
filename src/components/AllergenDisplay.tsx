'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Liste des 14 allergènes majeurs selon le règlement UE 1169/2011
export const MAJOR_ALLERGENS = {
  gluten: {
    id: 'gluten',
    name: 'Gluten',
    icon: '🌾',
    description: 'Céréales contenant du gluten (blé, seigle, orge, avoine, épeautre, kamut)',
    color: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  crustaces: {
    id: 'crustaces',
    name: 'Crustacés',
    icon: '🦐',
    description: 'Crustacés et produits à base de crustacés',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
  oeufs: {
    id: 'oeufs',
    name: 'Œufs',
    icon: '🥚',
    description: 'Œufs et produits à base d\'œufs',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  poisson: {
    id: 'poisson',
    name: 'Poisson',
    icon: '🐟',
    description: 'Poisson et produits à base de poisson',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  arachides: {
    id: 'arachides',
    name: 'Arachides',
    icon: '🥜',
    description: 'Arachides et produits à base d\'arachides',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  soja: {
    id: 'soja',
    name: 'Soja',
    icon: '🫘',
    description: 'Soja et produits à base de soja',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  lait: {
    id: 'lait',
    name: 'Lait',
    icon: '🥛',
    description: 'Lait et produits à base de lait (y compris lactose)',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  fruits_coque: {
    id: 'fruits_coque',
    name: 'Fruits à coque',
    icon: '🌰',
    description: 'Fruits à coque (amandes, noisettes, noix, noix de cajou, etc.)',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  celeri: {
    id: 'celeri',
    name: 'Céleri',
    icon: '🥬',
    description: 'Céleri et produits à base de céleri',
    color: 'bg-lime-100 text-lime-800 border-lime-300'
  },
  moutarde: {
    id: 'moutarde',
    name: 'Moutarde',
    icon: '🌭',
    description: 'Moutarde et produits à base de moutarde',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  sesame: {
    id: 'sesame',
    name: 'Sésame',
    icon: '🫘',
    description: 'Graines de sésame et produits à base de graines de sésame',
    color: 'bg-stone-100 text-stone-800 border-stone-300'
  },
  sulfites: {
    id: 'sulfites',
    name: 'Sulfites',
    icon: '🧪',
    description: 'Anhydride sulfureux et sulfites (>10mg/kg ou 10mg/L)',
    color: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  lupin: {
    id: 'lupin',
    name: 'Lupin',
    icon: '🌸',
    description: 'Lupin et produits à base de lupin',
    color: 'bg-violet-100 text-violet-800 border-violet-300'
  },
  mollusques: {
    id: 'mollusques',
    name: 'Mollusques',
    icon: '🐚',
    description: 'Mollusques et produits à base de mollusques',
    color: 'bg-teal-100 text-teal-800 border-teal-300'
  }
} as const;

export type AllergenId = keyof typeof MAJOR_ALLERGENS;

interface AllergenDisplayProps {
  allergens: AllergenId[];
  traces?: AllergenId[];
  variant?: 'default' | 'compact' | 'detailed';
  showWarning?: boolean;
  className?: string;
}

export function AllergenDisplay({
  allergens,
  traces = [],
  variant = 'default',
  showWarning = true,
  className = ''
}: AllergenDisplayProps) {
  const hasAllergens = allergens.length > 0 || traces.length > 0;

  if (!hasAllergens) {
    return null;
  }

  const renderAllergenBadge = (allergenId: AllergenId, isTrace: boolean = false) => {
    const allergen = MAJOR_ALLERGENS[allergenId];
    if (!allergen) return null;

    const badgeContent = (
      <Badge
        variant="outline"
        className={`${allergen.color} ${isTrace ? 'opacity-70' : ''} text-xs`}
      >
        <span className="mr-1">{allergen.icon}</span>
        {variant === 'compact' ? allergen.icon : allergen.name}
        {isTrace && variant !== 'compact' && (
          <span className="ml-1 text-xs">(traces)</span>
        )}
      </Badge>
    );

    if (variant === 'detailed') {
      return (
        <TooltipProvider key={allergen.id}>
          <Tooltip>
            <TooltipTrigger asChild>
              {badgeContent}
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{allergen.name}</p>
              <p className="text-sm text-gray-600">{allergen.description}</p>
              {isTrace && (
                <p className="text-xs text-orange-600 mt-1">Traces possibles</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <span key={allergen.id}>{badgeContent}</span>;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showWarning && hasAllergens && (
        <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 p-2 rounded-md border border-amber-200">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span className="text-xs font-medium">
            Contient des allergènes - Informez-nous de vos allergies
          </span>
        </div>
      )}

      {allergens.length > 0 && (
        <div className="space-y-1">
          {variant !== 'compact' && (
            <p className="text-xs font-medium text-gray-700 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Contient :
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {allergens.map(allergenId => renderAllergenBadge(allergenId, false))}
          </div>
        </div>
      )}

      {traces.length > 0 && (
        <div className="space-y-1">
          {variant !== 'compact' && (
            <p className="text-xs font-medium text-gray-600 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Traces possibles :
            </p>
          )}
          <div className="flex flex-wrap gap-1">
            {traces.map(allergenId => renderAllergenBadge(allergenId, true))}
          </div>
        </div>
      )}
    </div>
  );
}

// Composant pour afficher la légende complète des allergènes
export function AllergenLegend({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-50 p-4 rounded-lg border ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
        Allergènes majeurs (Règlement UE 1169/2011)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.values(MAJOR_ALLERGENS).map(allergen => (
          <div key={allergen.id} className="flex items-start space-x-2 p-2 bg-white rounded border">
            <span className="text-lg flex-shrink-0">{allergen.icon}</span>
            <div>
              <p className="font-medium text-sm text-gray-800">{allergen.name}</p>
              <p className="text-xs text-gray-600">{allergen.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
        <p className="text-sm text-red-800">
          <strong>⚠️ Important :</strong> Si vous souffrez d'allergies ou d'intolérances
          alimentaires, veuillez impérativement nous en informer lors de votre commande.
          Nos équipes prendront toutes les précautions nécessaires, mais une contamination
          croisée reste possible.
        </p>
      </div>
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>ℹ️ Information :</strong> Les informations sur les allergènes sont mises
          à jour régulièrement. En cas de doute, n'hésitez pas à nous contacter directement.
        </p>
      </div>
    </div>
  );
}

// Hook pour gérer les allergènes d'un produit
export function useAllergenInfo(
  productAllergens: AllergenId[],
  productTraces: AllergenId[] = []
) {
  const hasAllergens = productAllergens.length > 0 || productTraces.length > 0;

  const getAllergenNames = (allergenIds: AllergenId[]) => {
    return allergenIds.map(id => MAJOR_ALLERGENS[id]?.name).filter(Boolean);
  };

  const getAllergenIcons = (allergenIds: AllergenId[]) => {
    return allergenIds.map(id => MAJOR_ALLERGENS[id]?.icon).filter(Boolean);
  };

  return {
    hasAllergens,
    allergenNames: getAllergenNames(productAllergens),
    traceNames: getAllergenNames(productTraces),
    allergenIcons: getAllergenIcons(productAllergens),
    traceIcons: getAllergenIcons(productTraces),
    allergenCount: productAllergens.length,
    traceCount: productTraces.length
  };
}

export default AllergenDisplay;