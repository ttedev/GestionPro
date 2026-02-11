import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Check, CreditCard, Sparkles, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '../api/apiClient';

interface SubscriptionPageProps {
  onBack: () => void;
}

export function SubscriptionPage({ onBack }: SubscriptionPageProps) {
  const [isSubscribingMonthly, setIsSubscribingMonthly] = useState(false);
  const [isSubscribingYearly, setIsSubscribingYearly] = useState(false);

  const handleSubscribe = async (planType: 'monthly' | 'yearly') => {
    // Price IDs Stripe
    const priceId = planType === 'monthly'
      ? 'price_1SziNbAh24kSM5FuFuslFFVy' // 10€/mois - abonnement
      : 'price_1SziNpAh24kSM5FuJ1ok6nrt'; // 100€ one-shot - paiement unique

    if (planType === 'monthly') {
      setIsSubscribingMonthly(true);
    } else {
      setIsSubscribingYearly(true);
    }

    try {
      const { url } = await authAPI.subscribe(priceId);
      window.location.href = url; // Redirection vers Stripe Checkout
    } catch (error) {
      console.error('Erreur lors de la souscription:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la souscription');
      setIsSubscribingMonthly(false);
      setIsSubscribingYearly(false);
    }
  };

  const features = [
    'Gestion illimitée de clients',
    'Gestion des projets et chantiers',
    'Planification avec calendrier',
    'Suivi des interventions',
    'Notes et remarques avec photos',
    'Accès sur tous vos appareils',
    'Support prioritaire',
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au profil
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choisissez votre abonnement</h1>
          <p className="text-gray-500">
            Activez votre compte et accédez à toutes les fonctionnalités
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Plan */}
        <Card className="relative border-2 hover:border-green-300 transition-colors">
          <CardHeader className="text-center pb-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Mensuel</CardTitle>
            <CardDescription>Flexibilité maximale</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">10€</span>
              <span className="text-gray-500">/mois</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Sans engagement, résiliable à tout moment
            </p>
            <Button
              onClick={() => handleSubscribe('monthly')}
              disabled={isSubscribingMonthly || isSubscribingYearly}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isSubscribingMonthly ? 'Redirection...' : 'Choisir ce plan'}
            </Button>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className="relative border-2 border-green-500 shadow-lg">
          {/* Best Value Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Meilleur rapport qualité/prix
            </span>
          </div>
          <CardHeader className="text-center pb-2 pt-8">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl">Annuel</CardTitle>
            <CardDescription>Économisez 17%</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-2">
              <span className="text-4xl font-bold text-gray-900">100€</span>
              <span className="text-gray-500">/an</span>
            </div>
            <p className="text-sm text-green-600 font-medium mb-4">
              Soit 8,33€/mois au lieu de 10€
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Économisez 20€ par an
            </p>
            <Button
              onClick={() => handleSubscribe('yearly')}
              disabled={isSubscribingMonthly || isSubscribingYearly}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isSubscribingYearly ? 'Redirection...' : 'Choisir ce plan'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Tout est inclus dans chaque plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ / Additional Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Questions fréquentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Comment fonctionne le paiement ?</h4>
            <p className="text-sm text-gray-600">
              Le paiement est sécurisé via Stripe. Vous pouvez payer par carte bancaire.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Puis-je changer de plan ?</h4>
            <p className="text-sm text-gray-600">
              Oui, vous pouvez passer du plan mensuel au plan annuel à tout moment. La différence sera calculée au prorata.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Comment résilier mon abonnement ?</h4>
            <p className="text-sm text-gray-600">
              Vous pouvez résilier votre abonnement à tout moment depuis votre espace client. Votre accès reste actif jusqu'à la fin de la période payée.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

