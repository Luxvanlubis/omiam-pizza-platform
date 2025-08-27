import { Metadata } from 'next';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import StripeConfig from '@/components//StripeConfig;

export const metadata: Metadata = { title: 'Configuration Stripe - istration | OMIAM Pizza', description:  et configuration de l\'intégration Stripe pour les paiements',
};

export default async function StripeConfigPage() { const supabase = createServerComponentClient({ cookies }); const { data: { session }, error } = await supabase.auth.getSession(); // Vérifier l'authentification et les permissions if (error || !session?.user) { redirect('/login?callbackUrl=//stripe-config'); } // Vérifier les permissions  (à adapter selon votre système de rôles) // if (session.user.role !== ) { // redirect('/unauthorized'); // } return ( <div className="container mx-auto py-8 px-4"> <div className="max-w-4xl mx-auto"> <div className="mb-8"> <h1 className="text-3xl font-bold tracking-tight">Configuration Stripe</h1> <p className="text-muted-foreground mt-2"> Vérifiez et ez l'intégration Stripe pour les paiements sécurisés </p> </div> <StripeConfig /> </div> </div> );
}