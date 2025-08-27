import { Metadata } from 'next';
import UserRightsManager from '@/components/gdpr/UserRightsManager';

export const metadata: Metadata = { title: 'Mes Droits RGPD - O\'Miam Guingamp', description: 'Exercez vos droits RGPD : accès, rectification, suppression, portabilité de vos données personnelles.',
};

export default function MesDroitsRGPD() { return ( <div className="min-h-screen bg-gray-50 py-8"> <UserRightsManager /> </div> );
}