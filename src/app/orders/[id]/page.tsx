import { Metadata } from "next";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect, notFound } from "next/navigation";
import OrderTracking from "@/components/order/OrderTracking";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

interface OrderPageProps { params: { id: string; };
}

// Fonction pour récupérer les données de la commande côté serveur
async function getOrderData(orderId: string, access: string) { try { // Dans un environnement de production, vous utiliseriez l'URL complète // Pour le développement, nous utilisons une approche différente const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; const response = await fetch(`${baseUrl}/api/orders/${orderId}`, { headers: { 'Authorization': `Bearer ${access}`, 'Content-Type': 'application/json' }, cache: 'no-store' // Toujours récupérer les données fraîches }); if (!response.ok) { if (response.status === 404) { return null; } throw new Error('Erreur lors du chargement de la commande'); } return await response.json(); } catch (error) { console.error('Erreur lors du chargement de la commande:', error); return null; }
}

// Générer les métadonnées dynamiquement
export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> { const orderId = params.id; return { title: `Commande #${orderId.slice(-8).toUpperCase()} - OMIAM`, description: `Suivez le statut de votre commande #${orderId.slice(-8).toUpperCase()} en temps réel.`, };
}

// Composant de chargement
function OrderTrackingLoading() { return ( <div className="container mx-auto px-4 py-8"> <div className="max-w-4xl mx-auto"> {/* Navigation */} <div className="mb-6"> <Link href="/orders"> <Button variant="ghost" className="mb-4"> <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux commandes </Button> </Link> </div> <Card> <CardContent className="p-6"> <div className="flex items-center justify-center"> <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Chargement du suivi de commande... </div> </CardContent> </Card> </div> </div> );
}

export default async function OrderPage({ params }: OrderPageProps) { const orderId = params.id; // Vérifier l'authentification avec Supabase const supabase = createServerComponentClient({ cookies }); const { data: { session }, error } = await supabase.auth.getSession(); if (error || !session?.user) { redirect(`/auth/signin?callbackUrl=/orders/${orderId}`); } // Valider le format de l'ID de commande (UUID) const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; if (!uuidRegex.(orderId)) { notFound(); } // Récupérer les données de la commande (optionnel pour l'optimisation) // const orderData = await getOrderData(orderId, session.user.id); // Si la commande n'existe pas, afficher une page 404 // if (orderData === null) { // notFound(); // } return ( <div className="container mx-auto px-4 py-8"> <div className="max-w-4xl mx-auto"> {/* Navigation */} <div className="mb-6"> <Link href="/orders"> <Button variant="ghost" className="mb-4"> <ArrowLeft className="h-4 w-4 mr-2" /> Retour aux commandes </Button> </Link> <div className="mb-4"> <h1 className="text-3xl font-bold mb-2"> Suivi de commande </h1> <p className="text-muted-foreground"> Suivez le statut de votre commande en temps réel </p> </div> </div> {/* Composant de suivi avec Suspense */} <Suspense fallback={<OrderTrackingLoading />}> <OrderTracking orderId={orderId} // initialData={orderData} // Optionnel: données pré-chargées /> </Suspense> </div> </div> );
}

// Générer les pages statiques pour les commandes populaires (optionnel)
// export async function generaaticParams() {
// // Vous pouvez retourner une liste d'IDs de commandes populaires
// // pour la génération statique
// return [];
// }