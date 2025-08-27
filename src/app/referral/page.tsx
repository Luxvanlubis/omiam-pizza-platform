import { Metadata } from "next";
import { ReferralProgram } from "@/components/referral/ReferralProgram";

export const metadata: Metadata = { title: "Programme de Parrainage | O'Miam Guingamp", description: "Parrainez vos amis et gagnez des récompenses exclusives chez O'Miam Guingamp. 25€ offerts pour chaque parrainage réussi !", words: "parrainage, récompenses, pizza, Guingamp, O'Miam, fidélité", openGraph: { title: "Programme de Parrainage O'Miam", description: "Partagez votre amour pour nos pizzas et gagnez des récompenses !", type: "website", },
};

export default function ReferralPage() { return ( <div className="min-h-screen bg-gray-50 dark:bg-gray-900"> <div className="container mx-auto py-8"> <ReferralProgram /> </div> </div> );
}