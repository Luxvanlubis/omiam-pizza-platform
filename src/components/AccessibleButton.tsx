'use client';

import { Button, ButtonProps } from '@/components/ui/button';
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface AccessibleButtonProps extends Omit<ButtonProps, 'children'> {
  /** Contenu du bouton */
  children?: React.ReactNode;
  /** Description accessible du bouton */
  ariaLabel?: string;
  /** Description détaillée du bouton */
  ariaDescription?: string;
  /** Indique si le bouton est en cours de chargement */
  loading?: boolean;
  /** Texte affiché pendant le chargement */
  loadingText?: string;
  /** Indique si le bouton contrôle un élément (ex: menu déroulant) */
  ariaControls?: string;
  /** Indique si l'élément contrôlé est étendu */
  ariaExpanded?: boolean;
  /** Indique si le bouton est pressé (pour les boutons toggle) */
  ariaPressed?: boolean;
  /** ID de l'élément décrit par ce bouton */
  ariaDescribedBy?: string;
}

const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    children,
    ariaLabel,
    ariaDescription,
    loading = false,
    loadingText = 'Chargement...',
    ariaControls,
    ariaExpanded,
    ariaPressed,
    ariaDescribedBy,
    disabled,
    className = '',
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;
    
    // Génère un ID unique pour la description si nécessaire
    const descriptionId = ariaDescription 
      ? `btn-desc-${Math.random().toString(36).substr(2, 9)}` 
      : undefined;

    return (
      <div className="inline-block">
        <Button
          ref={ref}
          disabled={isDisabled}
          aria-label={ariaLabel}
          aria-controls={ariaControls}
          aria-expanded={ariaExpanded}
          aria-pressed={ariaPressed}
          aria-describedby={ariaDescribedBy || descriptionId}
          aria-busy={loading}
          className={`
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${className}
          `}
          {...props}
        >
          {loading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {loading ? loadingText : children}
        </Button>
        
        {/* Description cachée pour les lecteurs d'écran */}
        {ariaDescription && (
          <span id={descriptionId} className="sr-only">
            {ariaDescription}
          </span>
        )}
      </div>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;

// Composant spécialisé pour les boutons de navigation
export const NavigationButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps & {
    direction: 'previous' | 'next' | 'up' | 'down';
  }
>(({ direction, children, ariaLabel, ...props }, ref) => {
  const directionLabels = {
    previous: 'Précédent',
    next: 'Suivant',
    up: 'Haut',
    down: 'Bas'
  };

  return (
    <AccessibleButton
      ref={ref}
      ariaLabel={ariaLabel || directionLabels[direction]}
      {...props}
    >
      {children}
    </AccessibleButton>
  );
});

NavigationButton.displayName = 'NavigationButton';

// Composant pour les boutons de fermeture
export const CloseButton = forwardRef<
  HTMLButtonElement,
  Omit<AccessibleButtonProps, 'ariaLabel'> & {
    itemName?: string;
  }
>(({ itemName = 'élément', children, ...props }, ref) => {
  return (
    <AccessibleButton
      ref={ref}
      variant="ghost"
      size="sm"
      ariaLabel={`Fermer ${itemName}`}
      {...props}
    >
      {children}
    </AccessibleButton>
  );
});

CloseButton.displayName = 'CloseButton';

// Composant pour les boutons de menu
export const MenuButton = forwardRef<
  HTMLButtonElement,
  AccessibleButtonProps & {
    menuOpen?: boolean;
    menuId?: string;
  }
>(({ menuOpen = false, menuId, children, ariaLabel, ...props }, ref) => {
  return (
    <AccessibleButton
      ref={ref}
      ariaLabel={ariaLabel || (menuOpen ? 'Fermer le menu' : 'Ouvrir le menu')}
      ariaExpanded={menuOpen}
      ariaControls={menuId}
      {...props}
    >
      {children}
    </AccessibleButton>
  );
});

MenuButton.displayName = 'MenuButton';