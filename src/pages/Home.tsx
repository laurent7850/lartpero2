import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, X, PartyPopper } from 'lucide-react';

export function Home() {
  const [showLaunchPopup, setShowLaunchPopup] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('launch_popup_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setShowLaunchPopup(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismissPopup = () => {
    setShowLaunchPopup(false);
    sessionStorage.setItem('launch_popup_dismissed', 'true');
  };

  return (
    <div>
      {/* Pop-up Soirée de lancement */}
      {showLaunchPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in duration-300">
            <button
              onClick={dismissPopup}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <PartyPopper className="w-10 h-10 mx-auto mb-4 text-amber-500" />
              <h3 className="text-2xl font-light mb-2">
                Soirée de lancement ArtPéro
              </h3>
              <p className="text-sm text-gray-500 mb-6">Ne manquez pas notre toute première soirée !</p>
            </div>
            <div className="space-y-3 text-sm text-gray-700 mb-6">
              <p>
                Découvrez L'ArtPéro et sa créatrice, Nia, et plongez dans un concept inédit
                où l'art devient prétexte à se rencontrer.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-lg font-semibold text-amber-800">
                  Entrée spéciale 25€
                </p>
                <p className="text-xs text-amber-600">-50% sur le prix initial</p>
              </div>
              <ul className="space-y-2 ml-1">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">&#10003;</span>
                  Rencontre avec Nia et présentation du concept et des abonnements
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">&#10003;</span>
                  Cadre atypique : bar, snacks, musique, ambiance conviviale
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">&#10003;</span>
                  Rencontres authentiques et échanges privilégiés
                </li>
              </ul>
              <p className="text-center font-medium text-gray-900">
                Vivez une soirée unique, découvrez le concept et créez des connexions dès le premier verre !
              </p>
              <p className="text-center text-xs text-gray-500 italic">
                Places limitées : soyez parmi les premiers à vivre l'expérience et accéder aux avantages membres
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={dismissPopup}
              >
                Plus tard
              </Button>
              <Button className="flex-1 bg-black hover:bg-black/90" asChild>
                <Link to="/evenements" onClick={dismissPopup}>
                  Réserver ma place
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-black text-white overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/3171815/pexels-photo-3171815.jpeg?auto=compress&cs=tinysrgb&w=1920)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70 z-10" />
        <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            La rencontre est un art
          </h1>
          <p className="text-xl md:text-2xl font-light mb-4 text-white/90">
            Et si votre histoire commençait ici ?
          </p>
          <p className="text-base md:text-lg font-light mb-12 text-white/70">
            Rejoignez un cercle exclusif de personnes qui, comme vous, préfèrent le réel au virtuel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-black hover:bg-white/90 border-0"
              asChild
            >
              <Link to="/notre-histoire">
                Découvrir notre histoire
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              asChild
            >
              <Link to="/devenir-membre">Devenir membre</Link>
            </Button>
            <Button
              size="lg"
              className="bg-black text-white border border-white hover:bg-white/10"
              asChild
            >
              <Link to="/evenements">
                Voir nos événements
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pourquoi devenir membre */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-gray-900">
            Pourquoi devenir membre
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-16">
            Deux soirées par mois, au cœur de l'art et de la convivialité.
            Musique, gastronomie, … tout devient prétexte à se rencontrer et profiter du moment.
          </p>

          <div className="text-left space-y-6 max-w-3xl mx-auto mb-16">
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">1. Accès illimité aux soirées incluses</h3>
              <p className="text-sm text-gray-700">
                Toutes les soirées de votre abonnement sont réservées aux membres (et à vos guests selon le type d'abonnement).
                Plus besoin de payer chaque entrée : 85€/mois = 2 soirées + un verre d'accueil offert + participation aux animations.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">2. Verre d'accueil à chaque soirée</h3>
              <p className="text-sm text-gray-700">
                Commencez chaque soirée dans la convivialité et la détente. Les non-membres n'ont pas ce privilège.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">3. Participation aux animations</h3>
              <p className="text-sm text-gray-700">
                Devenez acteur des soirées et créez une expérience unique. Les non-membres restent spectateurs.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">4. Le meilleur rapport qualité/prix</h3>
              <p className="text-sm text-gray-700">
                85€/mois → 42,50€/soirée avec tous les avantages inclus.<br />
                Non-membres : 49€/soirée, sans verre d'accueil ni accès privilégié.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">5. Co-création des événements</h3>
              <p className="text-sm text-gray-700">
                Proposez vos thèmes et influencez directement le contenu des prochaines soirées depuis votre compte membre.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-gray-50 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">6. Networking et rencontres privilégiées</h3>
              <p className="text-sm text-gray-700">
                Des événements pensés pour connecter, partager et créer du lien.
              </p>
            </div>
          </div>

          {/* Tableau comparatif Membres vs Non-membres */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-light mb-8 text-gray-900">Membres vs Non-membres</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 shadow-sm text-sm">
                <thead>
                  <tr className="bg-gradient-to-br from-gray-100 to-gray-200">
                    <th className="border border-gray-300 p-3 text-left font-medium text-xs uppercase text-gray-900">Avantages</th>
                    <th className="border border-gray-300 p-3 text-left font-medium text-xs uppercase text-gray-900">Membres (85€/mois)</th>
                    <th className="border border-gray-300 p-3 text-left font-medium text-xs uppercase text-gray-900">Non-membres (~25€/entrée)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold text-gray-900">Accès aux soirées</td>
                    <td className="border border-gray-300 p-3 text-gray-700">2 soirées/mois incluses : 1 exclusive membres et 1 membres + guests. Participation à l'animation incluse.</td>
                    <td className="border border-gray-300 p-3 text-gray-700">Pas d'accès aux soirées exclusives membres + paiement de l'entrée à chaque soirée. Pas d'animation incluse.</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 p-3 font-semibold text-gray-900">Verre d'accueil</td>
                    <td className="border border-gray-300 p-3 text-gray-700">Offert à chaque soirée</td>
                    <td className="border border-gray-300 p-3 text-gray-700">Non inclus</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold text-gray-900">Participation à l'animation</td>
                    <td className="border border-gray-300 p-3 text-gray-700">Incluse : devenez acteur des soirées et vivez une expérience unique.</td>
                    <td className="border border-gray-300 p-3 text-gray-700">~10€/animation en plus de l'entrée.</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 p-3 font-semibold text-gray-900">Co-création des événements</td>
                    <td className="border border-gray-300 p-3 text-gray-700">Proposez vos thèmes et influencez directement le contenu des prochaines soirées.</td>
                    <td className="border border-gray-300 p-3 text-gray-700">Non accessible.</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 p-3 font-semibold text-gray-900">Networking</td>
                    <td className="border border-gray-300 p-3 text-gray-700">Accès à tous les membres et non-membres.</td>
                    <td className="border border-gray-300 p-3 text-gray-700">Accès à tous les membres et non-membres.</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="border border-gray-300 p-3 font-semibold text-gray-900">Rapport qualité/prix</td>
                    <td className="border border-gray-300 p-3 text-gray-700">85€/mois pour tout inclus.</td>
                    <td className="border border-gray-300 p-3 text-gray-700">25€/soirée → verre d'accueil, accès aux soirées membres et animation, non inclus.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Une approche différente */}
      <section className="py-24 px-4 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-center text-gray-900">
            Une approche différente
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center mb-6">
            Dans un monde où tout va vite, nous choisissons de ralentir.
            Prendre le temps de se regarder, de se parler, de ressentir.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed text-center mb-16">
            Nous créons des expériences où chaque rencontre est authentique, naturelle, spontanée.
            Parce qu'une vraie connexion ne se swipe pas, elle se vit.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 hover:shadow-2xl hover:border-gray-400 transition-all">
              <h3 className="text-xl font-medium mb-4 text-gray-900">Vos rencontres</h3>
              <p className="text-gray-700">
                Ici, on se découvre autour d'un verre. On rit sans filtre, on échange des regards,
                on vibre, on s'amuse, on crée du lien simplement.
              </p>
              <p className="text-gray-700 mt-4">
                Un espace vivant, élégant et chaleureux, loin des écrans et des algorithmes.
                Un lieu où les histoires commencent pour de vrai.
              </p>
            </div>
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 hover:shadow-2xl hover:border-gray-400 transition-all">
              <h3 className="text-xl font-medium mb-4 text-gray-900">Nos événements</h3>
              <p className="text-gray-700">
                Chaque ArtPéro est une nouvelle découverte dans un lieu différent,
                une ambiance, un thème, une émotion à partager.
              </p>
              <p className="text-gray-700 mt-4">
                Parce que l'art se vit, se goûte, se danse et se partage.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
