import { Metadata } from 'next';
import TermsOfSale from '@/components/legal/TermsOfSale';

export const metadata: Metadata = { title: 'Conditions Générales de Vente | OMIAM', description: 'Consultez nos conditions générales de vente. Informations sur les commandes, paiements, livraisons et garanties pour vos achats chez OMIAM.', words: 'conditions générales vente, CGV, commande, paiement, livraison, garantie, OMIAM', openGraph: { title: 'Conditions Générales de Vente | OMIAM', description: 'Conditions générales de vente et modalités de commande', type: 'website', },
};

export default function TermsOfSalePage() { return ( <div className="min-h-screen bg-background"> <div className="container mx-auto px-4 py-8"> <TermsOfSale /> </div> </div> );
}