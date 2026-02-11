import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const publicLinks = [
    { to: '/notre-histoire', label: 'Notre Histoire' },
    { to: '/evenements', label: 'Événements' },
    { to: '/boutique', label: 'Boutique' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <header className="border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <img
              src="/artperologo.png"
              alt="L'ArtPéro Concept"
              className="h-16 w-auto object-contain"
            />
          </Link>

          <nav className="hidden lg:flex items-center space-x-8">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm hover:opacity-60 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/admin')}
                  >
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/membres')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Mon espace
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/connexion')}
                >
                  Connexion
                </Button>
                <Button size="sm" onClick={() => navigate('/devenir-membre')}>
                  Devenir membre
                </Button>
              </>
            )}
          </div>

          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10">
          <div className="px-4 py-6 space-y-4">
            {publicLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block text-sm hover:opacity-60 transition-opacity"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t border-black/10 space-y-4">
              {user ? (
                <>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        navigate('/admin');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate('/membres');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Mon espace
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate('/connexion');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Connexion
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      navigate('/devenir-membre');
                      setMobileMenuOpen(false);
                    }}
                  >
                    Devenir membre
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
