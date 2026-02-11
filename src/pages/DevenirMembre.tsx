import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const signupSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Téléphone invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export function DevenirMembre() {
  const navigate = useNavigate();
  const { signUp, user } = useAuth();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/membres');
    }
  }, [user, navigate]);

  const onSubmit = async (data: SignupForm) => {
    setError('');
    setLoading(true);

    try {
      const { error } = await signUp(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.phone
      );

      if (error) {
        setError(error.message || 'Une erreur est survenue');
        return;
      }

      navigate('/membres');
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return null;
  }

  const benefits = [
    {
      title: 'Accès illimité aux 2 soirées du mois incluses',
      details: [
        '1 soirée exclusive membres et 1 soirée membres + guests',
        'Plus besoin de payer chaque entrée séparément : 85€/mois = 2 soirées complètes, un verre d\'accueil inclus et participation à l\'animation prévue',
      ],
    },
    {
      title: 'Verre d\'accueil offert à chaque soirée',
      details: [
        'Commencez vos soirées dans la convivialité et la détente',
        'Les non-membres doivent payer leur première boisson eux-mêmes',
      ],
    },
    {
      title: 'Participation à l\'animation',
      details: [
        'Devenez acteur des soirées, créez et vivez une expérience unique',
        'Pour les non-membres, l\'accès à l\'animation coûte 10€ par personne en plus de leur entrée',
      ],
    },
    {
      title: 'Le meilleur rapport qualité/prix',
      details: [
        '85€/mois pour toutes ces expériences → soit 42,50€/soirée avec tous les avantages inclus',
        'Les non-membres payent 20-25€/soirée + boissons + atelier pour beaucoup moins d\'expérience',
      ],
    },
    {
      title: 'Co-création des événements',
      details: [
        'Proposez vos thèmes et influencez directement le contenu des prochaines soirées',
        'Les non-membres restent spectateurs',
      ],
    },
    {
      title: 'Networking et rencontres privilégiées',
      details: [],
    },
  ];

  return (
    <div>
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-6">
            Pourquoi devenir membre de L'ArtPéro Concept ?
          </h1>
          <p className="text-xl text-white/80">
            2 soirées par mois, expériences uniques et networking privilégié
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-light mb-8">Les avantages membres</h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex gap-3">
                    <span className="text-lg font-semibold text-black">{index + 1}.</span>
                    <h3 className="text-lg font-semibold text-black">{benefit.title}</h3>
                  </div>
                  {benefit.details.length > 0 && (
                    <ul className="ml-8 space-y-1">
                      {benefit.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="text-base text-black/70 list-disc ml-4">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-black/5 rounded-lg">
              <p className="text-sm font-semibold text-black mb-2">→ 25€ l'entrée pour la soirée de lancement</p>
              <p className="text-sm font-semibold text-black">→ 85€ de membership</p>
            </div>

            <div className="mt-12 space-y-8">
              <div>
                <h3 className="text-2xl font-light mb-6 text-gray-900 tracking-wide">Formules Abonnements</h3>
                <table className="w-full border-collapse border border-gray-300 shadow-sm text-sm">
                  <thead>
                    <tr className="bg-gradient-to-br from-gray-100 to-gray-200">
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900 w-[15%]">Formule</th>
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900 w-[10%]">Durée</th>
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900 w-[12%]">Prix</th>
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900">Avantages</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <td className="border border-gray-300 p-2 font-semibold text-gray-900">Standard</td>
                      <td className="border border-gray-300 p-2 text-gray-700">1 mois</td>
                      <td className="border border-gray-300 p-2 text-gray-700 font-medium">85€/mois</td>
                      <td className="border border-gray-300 p-2 text-gray-700">2 events/mois, 1 verre offert, accès animations</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-300 p-2 font-semibold text-gray-900">Premium</td>
                      <td className="border border-gray-300 p-2 text-gray-700">3 mois</td>
                      <td className="border border-gray-300 p-2 text-gray-700 font-medium">240€</td>
                      <td className="border border-gray-300 p-2 text-gray-700">2 events/mois, 1 verre offert, 1 guest/trimestre, animations</td>
                    </tr>
                    <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <td className="border border-gray-300 p-2 font-semibold text-gray-900">Elite</td>
                      <td className="border border-gray-300 p-2 text-gray-700">6 mois</td>
                      <td className="border border-gray-300 p-2 text-gray-700 font-medium">456€</td>
                      <td className="border border-gray-300 p-2 text-gray-700">2 events/mois, 1 verre offert, 1 guest/trimestre, animations</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-300 p-2 font-semibold text-gray-900">Prestige</td>
                      <td className="border border-gray-300 p-2 text-gray-700">1 an</td>
                      <td className="border border-gray-300 p-2 text-gray-700 font-medium">888€</td>
                      <td className="border border-gray-300 p-2 text-gray-700">2 events/mois, 1 verre offert, 1 guest/trimestre, animations</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-2xl font-light mb-6 text-gray-900 tracking-wide">Formules Sans Abonnement</h3>
                <table className="w-full border-collapse border border-gray-300 shadow-sm text-sm">
                  <thead>
                    <tr className="bg-gradient-to-br from-gray-100 to-gray-200">
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900 w-[25%]">Formule</th>
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900 w-[12%]">Prix</th>
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900">Avantages</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <td className="border border-gray-300 p-2 font-semibold text-gray-900">Entrée Découverte</td>
                      <td className="border border-gray-300 p-2 text-gray-700 font-medium">49€</td>
                      <td className="border border-gray-300 p-2 text-gray-700">1 event, 1 verre offert, accès animation</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-300 p-2 font-semibold text-gray-900">Entrée Guest</td>
                      <td className="border border-gray-300 p-2 text-gray-700 font-medium">39€</td>
                      <td className="border border-gray-300 p-2 text-gray-700">Invité d'un membre, 1 verre offert, accès animation</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-2xl font-light mb-6 text-gray-900 tracking-wide">Bon Cadeau</h3>
                <table className="w-full border-collapse border border-gray-300 shadow-sm text-sm">
                  <thead>
                    <tr className="bg-gradient-to-br from-gray-100 to-gray-200">
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900 w-[25%]">Formule</th>
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900 w-[12%]">Prix</th>
                      <th className="border border-gray-300 p-2 text-left font-medium text-xs uppercase text-gray-900">Avantages</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <td className="border border-gray-300 p-2 font-semibold text-gray-900">Art'Péro Gift</td>
                      <td className="border border-gray-300 p-2 text-gray-700 font-medium">55€</td>
                      <td className="border border-gray-300 p-2 text-gray-700">1 event, valable 6 mois, 1 verre offert, animation</td>
                    </tr>
                    <tr className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-300 p-2 font-semibold text-gray-900">Art'Péro Expérience</td>
                      <td className="border border-gray-300 p-2 text-gray-700 font-medium">95€</td>
                      <td className="border border-gray-300 p-2 text-gray-700">2 events, valable 6 mois, 1 verre offert, animation</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <Card className="border-black/10 shadow-none">
              <CardHeader>
                <CardTitle className="text-3xl font-light">
                  Créer mon compte
                </CardTitle>
                <CardDescription>
                  Commencez votre parcours vers des rencontres authentiques
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        {...register('firstName')}
                        className="border-black/20"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        {...register('lastName')}
                        className="border-black/20"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      className="border-black/20"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      {...register('phone')}
                      className="border-black/20"
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register('password')}
                      className="border-black/20"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register('confirmPassword')}
                      className="border-black/20"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Création du compte...' : 'Créer mon compte'}
                  </Button>

                  <p className="text-xs text-center text-black/60">
                    En créant un compte, vous acceptez nos{' '}
                    <a href="/conditions-generales" className="underline">
                      conditions générales
                    </a>{' '}
                    et notre{' '}
                    <a href="/confidentialite" className="underline">
                      politique de confidentialité
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
