import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, CreditCard, MessageSquare, Star } from 'lucide-react';

export function AdminLayout() {
  const location = useLocation();

  const navigation = [
    { name: 'Tableau de bord', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Événements', href: '/admin/evenements', icon: Calendar },
    { name: 'Membres', href: '/admin/membres', icon: Users },
    { name: 'Paiements', href: '/admin/paiements', icon: CreditCard },
    { name: 'Témoignages', href: '/admin/temoignages', icon: Star },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-light mb-2">Administration</h1>
          <p className="text-black/60">Gestion de la plateforme L'Artpéro</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 border transition-colors ${
                      isActive(item.href)
                        ? 'bg-black text-white border-black'
                        : 'border-black/10 hover:border-black'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
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
