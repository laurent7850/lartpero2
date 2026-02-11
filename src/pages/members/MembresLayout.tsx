import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function MembresLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Profil', href: '/membres/profil' },
    { name: 'Mes événements', href: '/membres/mes-evenements' },
    { name: 'Mes billets', href: '/membres/mes-billets' },
    { name: 'Abonnement', href: '/membres/abonnement' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-2">
            Bonjour, {user?.firstName || 'Membre'}
          </h1>
          <p className="text-black/60">Bienvenue dans votre espace personnel</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`block px-4 py-3 border transition-colors ${
                    isActive(item.href)
                      ? 'bg-black text-white border-black'
                      : 'border-black/10 hover:border-black'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
