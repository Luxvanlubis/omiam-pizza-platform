"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingBag, Menu, X, Phone, Clock, MapPin, Pizza, Star, Heart, AlertTriangle, History, Settings, UserCheck, LogOut } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { OrderNotification } from "@/components/order/OrderNotification";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/components/auth-provider";
import { UnifiedLoginModal } from "@/components/UnifiedLoginModal";

export function EnhancedHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { setIsOpen, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/", label: "Accueil", icon: <Pizza className="h-4 w-4" /> },
    { href: "/menu", label: "Menu", icon: <Pizza className="h-4 w-4" /> },
    { href: "/reservation", label: "Réservation", icon: <Clock className="h-4 w-4" /> },
    { href: "/galerie", label: "Galerie", icon: <Star className="h-4 w-4" /> },
    { href: "/allergenes", label: "Allergènes", icon: <AlertTriangle className="h-4 w-4" /> },
    { href: "/contact", label: "Contact", icon: <MapPin className="h-4 w-4" /> },
    { href: "/fidelite", label: "Fidélité", icon: <Heart className="h-4 w-4" /> },
    { href: "/referral", label: "Parrainage", icon: <Heart className="h-4 w-4" /> },
    { href: "/suivi-commande", label: "Suivi", icon: <Clock className="h-4 w-4" /> },
  ];

  // Éléments de navigation pour utilisateurs authentifiés
  const authenticatedNavItems = [
    { href: "/orders", label: "Mes Commandes", icon: <History className="h-4 w-4" /> },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) ?? false;
  };

  const headerClasses = `
    fixed top-0 left-0 right-0 z-50 transition-all duration-300
    ${isScrolled
      ? 'bg-background/95 backdrop-blur-md shadow-lg border-b border-border'
      : 'bg-transparent backdrop-blur-sm'
    }
  `;

  return (
    <>
      <header id="main-navigation" className={headerClasses} role="banner">
        <nav className="container mx-auto px-4 py-4" role="navigation" aria-label="Navigation principale">
          <div className="flex justify-between items-center">
            {/* Enhanced Logo */}
            <Link
              href="/"
              className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded-lg"
              aria-label="O'Miam - Retour à la page d'accueil"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white font-bold text-xl" aria-hidden="true">O</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Star className="h-2 w-2 text-white fill-current" aria-hidden="true" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-red-800 group-hover:text-red-600 transition-colors">
                  O'Miam
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Pizzeria Authentique</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1" role="menubar">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`
                    relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    ${isActive(item.href)
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20'
                    }
                  `}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {isActive(item.href) && (
                    <div className="absolute inset-x-2 -bottom-px h-0.5 bg-white/50" aria-hidden="true"></div>
                  )}
                </Link>
              ))}
              
              {/* Navigation pour utilisateurs authentifiés */}
              {user && !loading && authenticatedNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`
                    relative px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    ${isActive(item.href)
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20'
                    }
                  `}
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                  {isActive(item.href) && (
                    <div className="absolute inset-x-2 -bottom-px h-0.5 bg-white/50" aria-hidden="true"></div>
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Contact Info */}
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>+33 2 96 14 61 53</span>
                </div>
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>11h30-22h</span>
                </div>
              </div>

              {/* Cart Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="relative text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 group"
              >
                <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0 min-w-5">
                    {totalItems}
                  </Badge>
                )}
              </Button>

              {/* Connexion / Profil utilisateur */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Admin Access - Only for authenticated users */}
                  <Link
                    href="/admin/dashboard"
                    className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
                    title="Accès Administration"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                  
                  {/* Profil utilisateur */}
                  <div className="flex items-center space-x-2">
                    <span className="hidden md:inline text-sm text-muted-foreground">
                      {user.email}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => signOut()}>
                       <LogOut className="h-4 w-4" />
                     </Button>
                  </div>
                </div>
              ) : (
                <UnifiedLoginModal>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <UserCheck className="h-4 w-4" />
                    <span className="hidden md:inline">Connexion</span>
                  </Button>
                </UnifiedLoginModal>
              )}

              {/* Push Notifications Bell */}
              {user && (
                <NotificationBell
                  userId={user.id}
                  className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                />
              )}

              {/* Order Notifications */}
              <OrderNotification />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Order Button */}
              <Link href="/menu">
                <Button className="btn-primary hidden md:flex">
                  <Pizza className="h-4 w-4 mr-2" />
                  Commander
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label={isMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div
              className="lg:hidden mt-4 pb-4 border-t border-orange-100"
              id="mobile-menu"
              role="menu"
              aria-label="Menu de navigation mobile"
            >
              <div className="space-y-2 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                      ${isActive(item.href)
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20'
                      }
                    `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                {/* Mobile Navigation pour utilisateurs authentifiés */}
                {user && !loading && authenticatedNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300
                      focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                      ${isActive(item.href)
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/20'
                      }
                    `}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}

                {/* Mobile Cart and Login Section */}
                <div className="px-4 py-3 space-y-3 border-t border-orange-100 mt-4">
                  {/* Mobile Cart Button */}
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2 relative"
                    onClick={() => {
                      setIsOpen(true);
                      setIsMenuOpen(false);
                    }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Panier</span>
                    {totalItems > 0 && (
                      <Badge className="bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0 min-w-5">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>

                  {/* Mobile Login/Profile */}
                  {user ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground text-center">
                        {user.email}
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center space-x-2"
                        onClick={() => {
                          signOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Déconnexion</span>
                      </Button>
                    </div>
                  ) : (
                    <UnifiedLoginModal>
                      <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                        <UserCheck className="h-4 w-4" />
                        <span>Connexion</span>
                      </Button>
                    </UnifiedLoginModal>
                  )}
                </div>

                {/* Mobile Admin Access - Only for authenticated users */}
                {user && (
                  <Link
                    href="/admin/dashboard"
                    role="menuitem"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-t border-orange-100 mt-4"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="font-medium">Administration</span>
                  </Link>
                )}

                {/* Mobile Contact Info */}
                <div className="px-4 py-3 space-y-3 border-t border-orange-100 mt-4">
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>+33 2 96 14 61 53</span>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>11h30-22h (fermé lundi)</span>
                  </div>
                  <div className="flex items-center space-x-3 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>12 Rue des Ponts Saint-Michel, 22200 Guingamp</span>
                  </div>
                </div>

                <Link href="/menu" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full btn-primary mt-4">
                    <Pizza className="h-4 w-4 mr-2" />
                    Commander en ligne
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-20"></div>
    </>
  );
}