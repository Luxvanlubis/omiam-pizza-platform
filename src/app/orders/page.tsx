import { Metadata } from "next";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from "next/navigation";
import OrderHistory from "@/components/order/OrderHistory";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";

export const metadata: Metadata = { title: "Mes Commandes - OMIAM", description: "Consultez l'historique de vos commandes et suivez leur statut en temps réel.",
};

// Composant de chargement
function OrderHistoryLoading() { return ( <div className="container mx-auto px-4 py-8"> <div className="max-w-6xl mx-auto"> <div className="mb-8"> <h1 className="text-3xl font-bold mb-2">Mes Commandes</h1> <p className="text-muted-foreground"> Consultez l'historique de vos commandes et suivez leur statut </p> </div> <Card> <CardContent className="p-6"> <div className="flex items-center justify-center"> <RefreshCw className="h-6 w-6 animate-spin mr-2" /> Chargement de vos commandes... </div> </CardContent> </Card> </div> </div> );
}

export default async function OrdersPage() { // Vérifier l'authentification avec Supabase const supabase = createServerComponentClient({ cookies }); const { data: { session }, error } = await supabase.auth.getSession(); if (error || !session?.user) { redirect("/auth/signin?callbackUrl=/orders"); } return ( <div className="container mx-auto px-4 py-8"> <div className="max-w-6xl mx-auto"> {/* En-tête de la page */} <div className="mb-8"> <h1 className="text-3xl font-bold mb-2">Mes Commandes</h1> <p className="text-muted-foreground"> Consultez l'historique de vos commandes et suivez leur statut en temps réel </p> </div> {/* Composant d'historique des commandes avec Suspense */} <Suspense fallback={<OrderHistoryLoading />}> <OrderHistory /> </Suspense> </div> </div> );
}