"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Gift, 
  Share2, 
  Copy, 
  Mail, 
  MessageCircle, 
  Facebook, 
  Twitter, 
  CheckCircle, 
  Star, 
  Euro, 
  Trophy 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface ReferralData {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
  availableRewards: number;
  referralHistory: ReferralHistory[];
}

interface ReferralHistory {
  id: string;
  referredEmail: string;
  referredName: string;
  status: 'pending' | 'completed' | 'rewarded';
  dateReferred: string;
  dateCompleted?: string;
  rewardAmount: number;
}

interface ReferralReward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  value: number;
  type: 'discount' | 'free_item' | 'cash' | 'points';
  icon: string;
}

const REFERRAL_REWARDS: ReferralReward[] = [
  {
    id: 'discount_10',
    title: '10% de réduction',
    description: 'Réduction sur votre prochaine commande',
    pointsRequired: 1,
    value: 10,
    type: 'discount',
    icon: '🎫'
  },
  {
    id: 'free_pizza',
    title: 'Pizza gratuite',
    description: 'Une pizza Margherita offerte',
    pointsRequired: 3,
    value: 12,
    type: 'free_item',
    icon: '🍕'
  },
  {
    id: 'cash_20',
    title: '20€ en espèces',
    description: 'Crédit de 20€ sur votre compte',
    pointsRequired: 5,
    value: 20,
    type: 'cash',
    icon: '💰'
  },
  {
    id: 'vip_status',
    title: 'Statut VIP',
    description: 'Accès aux avantages VIP pendant 3 mois',
    pointsRequired: 10,
    value: 50,
    type: 'points',
    icon: '👑'
  }
];

export function ReferralProgram() {
  const { toast } = useToast();
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCode: 'OMIAM-USER123',
    totalReferrals: 7,
    pendingReferrals: 2,
    completedReferrals: 5,
    totalEarnings: 125,
    availableRewards: 5,
    referralHistory: [
      {
        id: '1',
        referredEmail: 'marie.dupont@email.com',
        referredName: 'Marie Dupont',
        status: 'completed',
        dateReferred: '2024-01-15',
        dateCompleted: '2024-01-16',
        rewardAmount: 25
      },
      {
        id: '2',
        referredEmail: 'jean.martin@email.com',
        referredName: 'Jean Martin',
        status: 'pending',
        dateReferred: '2024-01-20',
        rewardAmount: 25
      }
    ]
  });
  const [emailToRefer, setEmailToRefer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const referralUrl = `https://omiam-guingamp.com/register?ref=${referralData.referralCode}`;

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralData.referralCode);
    toast({
      title: "Code copié !",
      description: "Votre code de parrainage a été copié dans le presse-papiers.",
    });
  };

  const copyReferralUrl = () => {
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: "Lien copié !",
      description: "Votre lien de parrainage a été copié dans le presse-papiers.",
    });
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent("Découvre O'Miam Guingamp - Pizza authentique !");
    const body = encodeURIComponent(
      `Salut !\n\nJe voulais te faire découvrir O'Miam Guingamp, une pizzeria authentique avec des pizzas délicieuses !\n\nUtilise mon code de parrainage ${referralData.referralCode} ou clique sur ce lien : ${referralUrl}\n\nTu bénéficieras d'une réduction sur ta première commande et moi aussi !\n\nÀ bientôt chez O'Miam !`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaSMS = () => {
    const message = encodeURIComponent(
      `Découvre O'Miam Guingamp ! Utilise mon code ${referralData.referralCode} pour une réduction : ${referralUrl}`
    );
    window.open(`sms:?body=${message}`);
  };

  const shareViaFacebook = () => {
    const url = encodeURIComponent(referralUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
  };

  const shareViaTwitter = () => {
    const text = encodeURIComponent(
      `Découvrez O'Miam Guingamp, la meilleure pizzeria de Guingamp ! Utilisez mon code ${referralData.referralCode} pour une réduction`
    );
    const url = encodeURIComponent(referralUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
  };

  const sendReferralByEmail = async () => {
    if (!emailToRefer) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une adresse email.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulation d'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Invitation envoyée !",
        description: `Une invitation a été envoyée à ${emailToRefer}.`,
      });
      setEmailToRefer('');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation. Réessayez plus tard.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = (rewardId: string) => {
    const reward = REFERRAL_REWARDS.find(r => r.id === rewardId);
    if (!reward) return;

    if (referralData.availableRewards >= reward.pointsRequired) {
      toast({
        title: "Récompense réclamée !",
        description: `Vous avez réclamé : ${reward.title}`,
      });
      setReferralData(prev => ({
        ...prev,
        availableRewards: prev.availableRewards - reward.pointsRequired
      }));
    } else {
      toast({
        title: "Pas assez de parrainages",
        description: `Il vous faut ${reward.pointsRequired} parrainages pour cette récompense.`,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'rewarded':
        return <Badge className="bg-blue-100 text-blue-800">Récompensé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* En-tête du programme */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-red-800 dark:text-red-600 flex items-center justify-center gap-2">
            <Users className="h-8 w-8" />
            Programme de Parrainage O'Miam
          </CardTitle>
          <CardDescription className="text-lg">
            Partagez votre amour pour nos pizzas et gagnez des récompenses !
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{referralData.totalReferrals}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total parrainages</div>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <Euro className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{referralData.totalEarnings}€</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Gains totaux</div>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <Gift className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{referralData.availableRewards}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Récompenses disponibles</div>
            </div>
            <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
              <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{referralData.completedReferrals}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Parrainages réussis</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Section Partage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Partagez votre code
            </CardTitle>
            <CardDescription>
              Invitez vos amis et gagnez 25€ pour chaque parrainage réussi !
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Code de parrainage */}
            <div className="space-y-2">
              <Label>Votre code de parrainage</Label>
              <div className="flex gap-2">
                <Input
                  value={referralData.referralCode}
                  readOnly
                  className="font-mono text-lg font-bold text-center"
                />
                <Button onClick={copyReferralCode} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Lien de parrainage */}
            <div className="space-y-2">
              <Label>Votre lien de parrainage</Label>
              <div className="flex gap-2">
                <Input value={referralUrl} readOnly className="text-sm" />
                <Button onClick={copyReferralUrl} variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Partage par email direct */}
            <div className="space-y-2">
              <Label>Inviter par email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  value={emailToRefer}
                  onChange={(e) => setEmailToRefer(e.target.value)}
                />
                <Button
                  onClick={sendReferralByEmail}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? 'Envoi...' : 'Inviter'}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Boutons de partage social */}
            <div className="space-y-3">
              <Label>Partager sur les réseaux</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={shareViaEmail} variant="outline" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button onClick={shareViaSMS} variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  SMS
                </Button>
                <Button onClick={shareViaFacebook} variant="outline" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button onClick={shareViaTwitter} variant="outline" className="flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Récompenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Vos récompenses
            </CardTitle>
            <CardDescription>
              Échangez vos parrainages contre des récompenses exclusives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {REFERRAL_REWARDS.map((reward) => {
              const canClaim = referralData.availableRewards >= reward.pointsRequired;
              return (
                <div
                  key={reward.id}
                  className={`p-4 rounded-lg border transition-all ${
                    canClaim
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reward.icon}</span>
                      <div>
                        <h4 className="font-semibold">{reward.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{reward.description}</p>
                        <p className="text-xs text-gray-500">
                          {reward.pointsRequired} parrainage{reward.pointsRequired > 1 ? 's' : ''} requis
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => claimReward(reward.id)}
                      disabled={!canClaim}
                      size="sm"
                      className={canClaim ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                      {canClaim ? 'Réclamer' : 'Indisponible'}
                    </Button>
                  </div>
                  {!canClaim && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progression</span>
                        <span>{referralData.availableRewards}/{reward.pointsRequired}</span>
                      </div>
                      <Progress
                        value={(referralData.availableRewards / reward.pointsRequired) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Historique des parrainages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Historique des parrainages
          </CardTitle>
          <CardDescription>
            Suivez le statut de vos invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referralData.referralHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun parrainage pour le moment</p>
              <p className="text-sm">Commencez à inviter vos amis !</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referralData.referralHistory.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{referral.referredName}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{referral.referredEmail}</p>
                      <p className="text-xs text-gray-500">
                        Invité le {new Date(referral.dateReferred).toLocaleDateString('fr-FR')}
                        {referral.dateCompleted && (
                          <> • Complété le {new Date(referral.dateCompleted).toLocaleDateString('fr-FR')}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(referral.status)}
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      +{referral.rewardAmount}€
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment ça marche */}
      <Card>
        <CardHeader>
          <CardTitle>Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Partagez</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Envoyez votre code ou lien de parrainage à vos amis
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Ils s'inscrivent</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Vos amis créent un compte et passent leur première commande
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold mb-2">3. Vous gagnez</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Recevez 25€ de crédit et votre ami obtient 10% de réduction
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conditions */}
      <Alert>
        <Star className="h-4 w-4" />
        <AlertDescription>
          <strong>Conditions :</strong> Le parrainage est validé après la première commande de votre filleul (minimum 15€). 
          Les récompenses sont créditées sous 48h. Limite de 10 parrainages par mois.
        </AlertDescription>
      </Alert>
    </div>
  );
}