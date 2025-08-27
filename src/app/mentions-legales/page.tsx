import { Metadata } from 'next';
import LegalNotice from '@/components/legal/LegalNotice';

export const metadata: Metadata = { title: 'Mentions Légales | OMIAM', description: 'Mentions légales obligatoires d\'OMIAM. Informations sur l\'entreprise, l\'hébergement, la propriété intellectuelle et les conditions d\'utilisation.', words: 'mentions légales, informations légales, entreprise, hébergement, propriété intellectuelle, OMIAM', openGraph: { title: 'Mentions Légales | OMIAM', description: 'Informations légales et mentions obligatoires', type: 'website', },
};

export default function LegalNoticePage() { return ( <div className="min-h-screen bg-background"> <div className="container mx-auto px-4 py-8"> <LegalNotice /> </div> </div> );
}