'use client';

import React from 'react';
import Header from './Header';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full'
};

export default function Layout({ 
  children, 
  className, 
  showHeader = true, 
  maxWidth = 'xl' 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      
      <main className={cn(
        'container mx-auto px-4 py-6',
        maxWidthClasses[maxWidth],
        className
      )}>
        {children}
      </main>
      
      {/* Footer optionnel */}
      <footer className="border-t bg-muted/50 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                © 2024 OMIAM Restaurant. Tous droits réservés.
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Conditions d'utilisation
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Composant pour les pages avec sidebar
export function LayoutWithSidebar({ 
  children, 
  sidebar, 
  className 
}: { 
  children: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
}) {
  return (
    <Layout className={cn('grid grid-cols-1 lg:grid-cols-4 gap-6', className)}>
      <aside className="lg:col-span-1">
        <div className="sticky top-20">
          {sidebar}
        </div>
      </aside>
      
      <main className="lg:col-span-3">
        {children}
      </main>
    </Layout>
  );
}

// Composant pour les pages centrées (comme les formulaires)
export function CenteredLayout({ 
  children, 
  className,
  title,
  description 
}: { 
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Layout maxWidth="md" className={cn('py-12', className)}>
      <div className="text-center mb-8">
        {title && (
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {title}
          </h1>
        )}
        {description && (
          <p className="text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      
      <div className="mx-auto max-w-md">
        {children}
      </div>
    </Layout>
  );
}

// Composant pour les pages de dashboard
export function DashboardLayout({ 
  children, 
  title, 
  actions,
  className 
}: { 
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <Layout className={className}>
      {(title || actions) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          {title && (
            <h1 className="text-2xl font-bold tracking-tight">
              {title}
            </h1>
          )}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {children}
    </Layout>
  );
}