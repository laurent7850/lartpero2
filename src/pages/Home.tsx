import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Home() {
  return (
    <div>
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
          <p className="text-xl md:text-2xl font-light mb-12 text-white/90">
            Et si votre histoire commençait ici ?
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
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-center text-gray-900">
            Une approche différente
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed text-center mb-16">
            Dans un monde où tout va vite, nous prenons le temps. Le temps de comprendre,
            d'écouter, de créer des liens authentiques. Chaque rencontre est unique,
            chaque histoire mérite attention et délicatesse.
          </p>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 hover:shadow-2xl hover:border-gray-400 transition-all">
              <h3 className="text-xl font-medium mb-4 text-gray-900">Rencontres</h3>
              <p className="text-gray-700">
                Ici on se découvre, on rit, on échange, on créer des liens, rencontrer, vibrer, partager, s'amuser TOUT SIMPLEMENT… Un lieu où les rencontres prennent vie loin des écrans et des algorithmes.
              </p>
            </div>
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 hover:shadow-2xl hover:border-gray-400 transition-all">
              <h3 className="text-xl font-medium mb-4 text-gray-900">Évènements</h3>
              <p className="text-gray-700">
                Chaque ArtPéro est une nouvelle découverte dans un lieu différent, une ambiance, un thème, une émotion à partager.
              </p>
            </div>
            <div className="text-center p-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 hover:shadow-2xl hover:border-gray-400 transition-all">
              <h3 className="text-xl font-medium mb-4 text-gray-900">Art</h3>
              <p className="text-gray-700">
                Parce que l'art se vit, se goûte, se danse et se partage.
              </p>
            </div>
          </div>
        </div>
      </section>


      <section className="py-24 px-4 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8 text-gray-900">
            Nos événements
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-12">
            Des rencontres pensées comme des moments suspendus dans le temps.
            Découvrez nos événements exclusifs et rejoignez une communauté qui partage
            vos valeurs.
          </p>
          <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl transition-all" asChild>
            <Link to="/evenements">
              Voir les événements
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
