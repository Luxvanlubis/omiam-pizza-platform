'use client';

import Link from 'next/link';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipToContentProps {
  links?: SkipLink[];
}

const defaultLinks: SkipLink[] = [
  { href: '#main-content', label: 'Aller au contenu principal' },
  { href: '#main-navigation', label: 'Aller à la navigation principale' },
  { href: '#footer', label: 'Aller au pied de page' },
];

export default function SkipToContent({ links = defaultLinks }: SkipToContentProps) {
  return (
    <div className="skip-to-content" role="navigation" aria-label="Liens d'évitement">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="skip-link"
          onClick={(e) => {
            // Assure que l'élément cible reçoit le focus
            const target = document.querySelector(link.href);
            if (target) {
              // Ajoute temporairement tabindex si nécessaire
              const originalTabIndex = target.getAttribute('tabindex');
              if (!originalTabIndex) {
                target.setAttribute('tabindex', '-1');
              }
              
              // Focus sur l'élément cible
              setTimeout(() => {
                (target as HTMLElement).focus();
                
                // Restaure le tabindex original après un délai
                if (!originalTabIndex) {
                  setTimeout(() => {
                    target.removeAttribute('tabindex');
                  }, 100);
                }
              }, 100);
            }
          }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

// Composant pour marquer les sections principales
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className = '' }: MainContentProps) {
  return (
    <main id="main-content" className={className} role="main">
      {children}
    </main>
  );
}

// Composant pour la navigation principale
interface MainNavigationProps {
  children: React.ReactNode;
  className?: string;
}

export function MainNavigation({ children, className = '' }: MainNavigationProps) {
  return (
    <nav id="main-navigation" className={className} role="navigation" aria-label="Navigation principale">
      {children}
    </nav>
  );
}

// Composant pour le pied de page
interface MainFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function MainFooter({ children, className = '' }: MainFooterProps) {
  return (
    <footer id="footer" className={className} role="contentinfo">
      {children}
    </footer>
  );
}