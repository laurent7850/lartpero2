export function Confidentialite() {
  return (
    <div className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light mb-12 text-center">
          La confidentialité
        </h1>

        <div className="space-y-8 text-lg leading-relaxed text-black/80">
          <p className="text-2xl font-light text-center text-black mb-12">
            Certaines histoires ne se partagent qu'à voix basse
          </p>

          <p>
            Nous veillons à ce que chaque échange, chaque rencontre et chaque donnée
            restent protégés. La discrétion et la confiance sont au cœur de notre engagement.
          </p>

          <div className="h-px bg-black/10 my-12" />

          <h2 className="text-3xl font-light mb-6">Notre engagement</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium mb-3">Protection des données</h3>
              <p className="text-black/70">
                Toutes vos informations personnelles sont stockées de manière sécurisée
                et ne sont jamais partagées avec des tiers.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">Discrétion absolue</h3>
              <p className="text-black/70">
                Vos démarches auprès de notre agence restent strictement confidentielles.
                Nous ne divulguons jamais l'identité de nos membres.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">Contrôle de vos informations</h3>
              <p className="text-black/70">
                Vous gardez le contrôle total sur vos données : modification, suppression,
                accès à tout moment sur simple demande.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium mb-3">Conformité RGPD</h3>
              <p className="text-black/70">
                Nous respectons scrupuleusement le Règlement Général sur la Protection
                des Données et toutes les réglementations en vigueur.
              </p>
            </div>
          </div>

          <div className="h-px bg-black/10 my-12" />

          <div className="bg-black text-white p-12 -mx-4 md:mx-0">
            <p className="text-white/90">
              La confiance est la base de toute relation sincère. C'est pourquoi nous
              mettons un point d'honneur à protéger votre vie privée avec le plus grand
              soin et la plus grande rigueur.
            </p>
          </div>

          <p className="text-center text-sm text-black/60 mt-12">
            Pour plus de détails sur notre politique de confidentialité, consultez nos{' '}
            <a href="/mentions-legales" className="underline hover:text-black">
              mentions légales
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
