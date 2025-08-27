'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calendar, 
  Clock,
  User, 
  Settings, 
  Menu, 
  X, 
  ChevronRight,
  Search,
  Bell,
  Heart,
  Star,
  MapPin,
  Phone,
  BarChart3,
  Pizza,
  UtensilsCrossed
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/',
    label: 'Accueil',
    icon: Home,
    description: "Page d'accueil"
  },
  {
    href: '/menu',
    label: 'Nos Pizzas',
    icon: Pizza,
    description: 'Découvrir notre carte'
  },
  {
    href: '/reservation',
    label: 'Réservation',
    icon: Calendar,
    description: 'Réserver une table'
  },
  {
    href: '/contact',
    label: 'Contact',
    icon: Phone,
    description: 'Nous contacter'
  }
];

interface NavigationProps {
  variant?: 'header' | 'sidebar' | 'mobile';
  className?: string;
}

export default function Navigation({ variant = 'header', className }: NavigationProps) {
  const pathname = usePathname();

  if (variant === 'header') {
    return (
      <nav className={cn('flex items-center space-x-1', className)}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'flex items-center space-x-2',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    );
  }

  if (variant === 'sidebar') {
    return (
      <nav className={cn('flex flex-col space-y-2', className)}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start space-x-3 h-12',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{item.label}</span>
                  {item.description && (
                    <span className="text-xs opacity-70">{item.description}</span>
                  )}
                </div>
              </Button>
            </Link>
          );
        })}
      </nav>
    );
  }

  if (variant === 'mobile') {
    return (
      <nav className={cn('grid grid-cols-2 gap-3', className)}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'default' : 'outline'}
                className={cn(
                  'w-full h-20 flex flex-col space-y-2',
                  isActive && 'bg-primary text-primary-foreground'
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>
    );
  }

  return null;
}

// Composant de navigation rapide pour les actions courantes
export function QuickActions({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Link href="/menu">
        <Button size="sm" className="flex items-center space-x-2 bg-red-600 hover:bg-red-700">
          <Pizza className="w-4 h-4" />
          <span>Nos Pizzas</span>
        </Button>
      </Link>
      
      <Link href="/reservation">
        <Button variant="outline" size="sm" className="flex items-center space-x-2 border-red-600 text-red-600 hover:bg-red-50">
          <Calendar className="w-4 h-4" />
          <span>Réserver</span>
        </Button>
      </Link>
      
      <Link href="/profile">
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Profil</span>
        </Button>
      </Link>
    </div>
  );
}

// Composant de breadcrumb pour la navigation contextuelle
export function Breadcrumb({ items, className }: { 
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav className={cn('flex items-center space-x-2 text-sm text-muted-foreground', className)}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}