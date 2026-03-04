export function MentionsLegales() {
  return (
    <div className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light mb-12 text-center">
          Mentions légales
        </h1>

        <div className="space-y-8 text-black/80">
          <section>
            <h2 className="text-2xl font-light mb-4">Éditeur du site</h2>
            <p>
              L'ArtPéro<br />
              Avenue Louise 54<br />
              B-1050 Ixelles<br />
              BCE / TVA : BE0744 809 451<br />
              Email : <a href="mailto:info@the-event.be" className="underline">info@the-event.be</a><br />
              Tél : +32(0)2 378 28 63
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light mb-4">Hébergement</h2>
            <p>
              Ce site est hébergé par Hostinger International Ltd.<br />
              Švitrigailos str. 34, Vilnius 03230, Lituanie
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light mb-4">Protection des données</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD),
              vous disposez d'un droit d'accès, de rectification et de suppression de vos
              données personnelles. Pour exercer ce droit, contactez-nous à l'adresse :{' '}
              <a href="mailto:info@the-event.be" className="underline">info@the-event.be</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light mb-4">Cookies</h2>
            <p>
              Ce site utilise des cookies essentiels au fonctionnement du service.
              Aucun cookie de tracking publicitaire n'est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-light mb-4">Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu de ce site (textes, images, graphismes) est la
              propriété exclusive de L'ArtPéro, sauf mention contraire. Toute reproduction
              est interdite sans autorisation préalable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
