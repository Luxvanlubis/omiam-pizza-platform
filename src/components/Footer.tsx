"use client";

import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-red-800 dark:bg-red-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">O'Miam</h3>
            <p className="text-red-100 dark:text-red-200">
              La véritable pizza italienne au cœur de Guingamp depuis 2015.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Horaires</h4>
            <ul className="text-red-100 dark:text-red-200 space-y-2">
              <li>Lundi: Fermé</li>
              <li>Mar-Ven: 11h30-14h, 18h30-22h</li>
              <li>Sam-Dim: 11h30-14h30, 18h30-22h30</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="text-red-100 dark:text-red-200 space-y-2">
              <li>📍 12 Rue des Ponts Saint-Michel, 22200 Guingamp</li>
              <li>📞 +33 2 96 14 61 53</li>
              <li>✉️ contact@omiam-guingamp.fr</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Suivez-nous</h4>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white text-white hover:bg-white hover:text-red-800"
              >
                Facebook
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-white text-white hover:bg-white hover:text-red-800"
              >
                Instagram
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-red-700 dark:border-red-800 mt-8 pt-8 text-center text-red-100 dark:text-red-200">
          <p>© 2024 O'Miam Guingamp. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}