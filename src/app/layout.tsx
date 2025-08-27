
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { OptimizationProvider } from "@/components/OptimizationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "O'MIAM - Pizzeria Artisanale",
  description: "Découvrez les meilleures pizzas artisanales chez O'MIAM. Plus de 20 variétés, ingrédients frais et réservation en ligne facile.",
  keywords: "pizzeria, pizza, O'MIAM, restaurant, réservation, italien, artisanale, livraison",
  authors: [{ name: "Pizzeria O'MIAM" }],
  robots: "index, follow",
  openGraph: {
    title: "O'MIAM - Pizzeria Artisanale",
    description: "Les meilleures pizzas artisanales, préparées avec passion.",
    type: "website",
    locale: "fr_FR",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        <OptimizationProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </OptimizationProvider>
      </body>
    </html>
  );
}
