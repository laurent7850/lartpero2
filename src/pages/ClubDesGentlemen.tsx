import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function ClubDesGentlemen() {
  return (
    <div>
      <section className="py-24 px-4 bg-black text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-light mb-8">
            Le Club des Gentlemen
          </h1>
          <p className="text-xl text-white/80">
            Un espace exclusif pour les hommes qui souhaitent vivre l'amour
            avec élégance, sincérité et engagement.
          </p>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-8 text-lg leading-relaxed text-black/80">
            <p>
              Le Club des Gentlemen est un espace exclusif pour les hommes qui souhaitent
              vivre l'amour avec élégance, sincérité et engagement.
            </p>

            <p>
              Ce cercle n'est pas un simple réseau, mais une philosophie : être gentleman,
              c'est savoir écouter, comprendre et incarner des valeurs de respect et de
              bienveillance.
            </p>

            <p>
              Rejoindre ce club, c'est choisir de séduire avec authenticité et raffinement.
            </p>

            <div className="h-px bg-black/10 my-12" />

            <h2 className="text-3xl font-light mb-6">Ce que signifie être Gentleman</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium mb-3">Savoir-vivre</h3>
                <p className="text-black/70">
                  Maîtriser les codes de l'élégance moderne, allier tradition et contemporanéité.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Intelligence relationnelle</h3>
                <p className="text-black/70">
                  Comprendre l'autre, créer du lien, communiquer avec justesse et empathie.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Authenticité</h3>
                <p className="text-black/70">
                  Être vrai, assumer ses forces et ses fragilités avec confiance.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-3">Engagement</h3>
                <p className="text-black/70">
                  S'investir pleinement dans sa quête de l'amour, avec sérieux et sincérité.
                </p>
              </div>
            </div>

            <div className="h-px bg-black/10 my-12" />

            <h2 className="text-3xl font-light mb-6">Les avantages du Club</h2>

            <ul className="space-y-4 text-black/70">
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>Accès à des événements exclusifs dans le monde de l'art</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>Accompagnement personnalisé par nos experts</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>Sessions de coaching individuel et collectif</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>Possibilité d'obtenir la certification Gentleman</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0">•</span>
                <span>Réseau de membres partageant les mêmes valeurs</span>
              </li>
            </ul>
          </div>

          <div className="mt-16 text-center">
            <Button size="lg" asChild>
              <Link to="/devenir-membre">
                Rejoindre le Club
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
