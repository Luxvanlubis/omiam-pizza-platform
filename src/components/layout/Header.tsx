'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  User,
  LogOut,
  Settings,
  Calendar,
  Crown,
  Star,
  Menu,
  X,
  Pizza
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Navigation, { QuickActions } from './Navigation';
import { CustomerProfile } from '@/types/customer';
import { customerService } from '@/services/customerService';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const loadCustomerProfile = async () => {
      try {
        // Simuler la vérification de session
        const sessionCustomerId = localStorage.getItem('customerId');
        if (sessionCustomerId) {
          const profile = await customerService.getCustomerProfile(sessionCustomerId);
          setCustomerProfile(profile);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomerProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('customerId');
    setCustomerProfile(null);
    window.location.href = '/';
  };

  const getMembershipBadgeColor = (level: string) => {
    switch (level) {
      case 'gold':
        return 'bg-yellow-500 text-white';
      case 'silver':
        return 'bg-gray-400 text-white';
      case 'bronze':
        return 'bg-orange-600 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getMembershipIcon = (level: string) => {
    switch (level) {
      case 'gold':
        return <Crown className="w-3 h-3" />;
      case 'silver':
      case 'bronze':
        return <Star className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo et nom */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.svg" alt="O'MIAM Logo" className="w-8 h-8" />
              <span className="font-bold text-xl hidden sm:inline text-red-800">O'MIAM</span>
            </Link>
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Navigation variant="header" />
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-2">
            {/* Actions rapides sur mobile */}
            <div className="md:hidden">
              <QuickActions />
            </div>

            {/* Profil utilisateur ou connexion */}
            {isLoading ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            ) : customerProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-auto px-3">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={customerProfile.avatar} 
                          alt={`${customerProfile.firstName} ${customerProfile.lastName}`} 
                        />
                        <AvatarFallback>
                          {customerProfile.firstName[0]}{customerProfile.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start">
                        <span className="text-sm font-medium">
                          {customerProfile.firstName}
                        </span>
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {customerProfile.firstName} {customerProfile.lastName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {customerProfile.email}
                      </p>
                      <div className="flex items-center space-x-2 pt-1">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            'text-xs',
                            getMembershipBadgeColor(customerProfile.membershipLevel)
                          )}
                        >
                          {getMembershipIcon(customerProfile.membershipLevel)}
                          <span className="ml-1 capitalize">{customerProfile.membershipLevel}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {customerProfile.loyaltyPoints} points
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Mon profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex items-center">
                      <Pizza className="mr-2 h-4 w-4" />
                      <span>Mes commandes</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/reservation" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Mes réservations</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile?tab=preferences" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Préférences</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/profile">
                <Button size="sm" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Connexion</span>
                </Button>
              </Link>
            )}

            {/* Menu mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4">
            <Navigation variant="mobile" className="mb-4" />
            
            {customerProfile && (
              <div className="pt-4 border-t">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={customerProfile.avatar} 
                      alt={`${customerProfile.firstName} ${customerProfile.lastName}`} 
                    />
                    <AvatarFallback>
                      {customerProfile.firstName[0]}{customerProfile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {customerProfile.firstName} {customerProfile.lastName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          'text-xs',
                          getMembershipBadgeColor(customerProfile.membershipLevel)
                        )}
                      >
                        {getMembershipIcon(customerProfile.membershipLevel)}
                        <span className="ml-1 capitalize">{customerProfile.membershipLevel}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {customerProfile.loyaltyPoints} pts
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Mon profil
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}