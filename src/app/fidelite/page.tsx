"use client";

import { Header } from "@/components/Header";
import { LoyaltyProgram } from "@/components/loyalty/LoyaltyProgram";

export default function FidelitePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-red-800 dark:text-red-600 mb-4">
            Programme de Fidélité
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez notre programme de fidélité et profitez d'avantages exclusifs à chaque visite !
          </p>
        </div>
        <LoyaltyProgram />
      </main>
    </div>
  );
}