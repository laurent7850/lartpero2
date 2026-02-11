import { useEffect, useState } from 'react';
import { adminApi, AdminDashboardStats } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CreditCard, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalRevenue: 0,
    monthRevenue: 0,
    totalRegistrations: 0,
    topEvents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await adminApi.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-light mb-2">Tableau de bord</h2>
        <p className="text-black/60">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-black/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black/60">
              Membres totaux
            </CardTitle>
            <Users className="h-4 w-4 text-black/40" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">{stats.totalMembers}</div>
            <p className="text-xs text-black/60 mt-1">
              {stats.activeMembers} actifs
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black/60">
              Événements
            </CardTitle>
            <Calendar className="h-4 w-4 text-black/40" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">{stats.totalEvents}</div>
            <p className="text-xs text-black/60 mt-1">
              {stats.upcomingEvents} à venir
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black/60">
              Revenus totaux
            </CardTitle>
            <CreditCard className="h-4 w-4 text-black/40" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">
              {(stats.totalRevenue / 100).toFixed(2)} €
            </div>
            <p className="text-xs text-black/60 mt-1">
              {(stats.monthRevenue / 100).toFixed(2)} € ce mois
            </p>
          </CardContent>
        </Card>

        <Card className="border-black/10 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-black/60">
              Inscriptions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-black/40" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-light">{stats.totalRegistrations}</div>
            <p className="text-xs text-black/60 mt-1">
              Total confirmées
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.topEvents.length > 0 && (
        <Card className="border-black/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-light">
              Événements les plus populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="font-medium">{event.title}</span>
                  </div>
                  <div className="text-sm text-black/60">
                    {event.registrations} inscription{event.registrations > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
