import { Metadata } from 'next';
import PrivacyPolicy from '@/components/gdpr/PrivacyPolicy';

export const metadata: Metadata = { title: 'Politique de Confidentialité | OMIAM', description: 'Découvrez comment OMIAM protège vos données personnelles selon le RGPD. Transparence totale sur la collecte, le traitement et vos droits.', words: 'politique confidentialité, RGPD, données personnelles, protection, droits, OMIAM', openGraph: { title: 'Politique de Confidentialité | OMIAM', description: 'Protection de vos données personnelles selon le RGPD', type: 'website', },
};

export default function PrivacyPolicyPage() { return ( <div className="min-h-screen bg-background"> <div className="container mx-auto px-4 py-8"> <PrivacyPolicy /> </div> </div> );
}