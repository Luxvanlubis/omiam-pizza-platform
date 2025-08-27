"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShoppingBag, Menu, X, Phone, Package } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatters } from "@/config/contact";
import ScrollIndicator from "@/components/ScrollIndicator";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const { setIsOpen, getTotalItems } = useCartStore();
  const totalItems = getTotalItems();

  const navItems = [
    { href: "/", label: "accueil" },
    { href: "/menu", label: "menu" },
    { href: "/restaurant", label: "restaurant" },
    { href: "/reservation", label: "réservation" },
    { href: "/galerie", label: "galerie" },
    { href: "/contact", label: "contact" },
    { href: "/fidelite", label: "fidélité" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href) || false;
  };

  return (
    <>
      {/* Scroll indicator */}
      <ScrollIndicator />
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-orange-100">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo amélioré */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">O</span>
              </div>
              <h1 className="text-2xl font-bold text-gradient-primary">O'Miam</h1>
            </Link>

            {/* Desktop Navigation améliorée */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link text-sm font-medium transition-all duration-300 hover:text-red-600 ${
                    pathname === item.href
                      ? 'text-red-600 active'
                      : 'text-gray-700 hover:text-red-500'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Action Buttons améliorés */}
            <div className="flex items-center space-x-4">
              {/* Phone Number */}
              <a
                href={formatters.phoneLink()}
                className="hidden lg:flex items-center space-x-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span className="text-sm font-medium">+33 2 96 14 61 53</span>
              </a>

              {/* Orders History - Only for authenticated users */}
              {user && (
                <Link href="/orders">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="button-ripple hover:bg-red-50 transition-all duration-300 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Package className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Cart avec effet ripple */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="relative button-ripple hover:bg-red-50 transition-all duration-300 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="badge-premium absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>

              {/* Theme Toggle avec animation */}
              <div className="button-ripple hover:bg-gray-100 transition-all duration-300 rounded-md">
                <ThemeToggle />
              </div>

              {/* Order Button premium */}
              <Link href="/menu">
                <Button className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 button-ripple hidden sm:flex">
                  Commander en ligne
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <div className="flex flex-col space-y-2 mt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`capitalize px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? "bg-red-600 text-white"
                        : "text-gray-700 hover:bg-red-100 dark:text-gray-300 dark:hover:bg-red-900/20"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/menu" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white mt-2">
                    Commander en ligne
                  </Button>
                </Link>

                {/* Orders History for Mobile - Only for authenticated users */}
                {user && (
                  <Link href="/orders" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50">
                      <Package className="h-4 w-4 mr-2" />
                      Mes commandes
                    </Button>
                  </Link>
                )}

                {/* Phone Number for Mobile */}
                <a
                  href={formatters.phoneLink()}
                  className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors py-2 mt-2 border-t"
                >
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">+33 2 96 14 61 53</span>
                </a>
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}