import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-light mb-4">L'ArtPéro</h3>
            <p className="text-sm text-black/60">
              <Link to="/" className="hover:text-black transition-colors">
                Et si votre histoire commençait ici ?
              </Link>
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">À propos</h4>
            <ul className="space-y-2 text-sm text-black/60">
              <li>
                <Link to="/notre-histoire" className="hover:text-black transition-colors">
                  Notre Histoire
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Services</h4>
            <ul className="space-y-2 text-sm text-black/60">
              <li>
                <Link to="/coaching" className="hover:text-black transition-colors">
                  Coaching
                </Link>
              </li>
              <li>
                <Link to="/evenements" className="hover:text-black transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/devenir-membre" className="hover:text-black transition-colors">
                  Devenir membre
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-black/60">
              <li>
                <Link to="/mentions-legales" className="hover:text-black transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link to="/confidentialite" className="hover:text-black transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link to="/conditions-generales" className="hover:text-black transition-colors">
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-black transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-black/10 text-center text-sm text-black/60">
          <p>&copy; {currentYear} L'ArtPéro. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
