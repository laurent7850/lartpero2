import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, CreditCard, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRevenue: number;
  monthRevenue: number;
  totalRegistrations: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    totalEvents: 0,
    upcomingEvents: 0,
    totalRevenue: 0,
    monthRevenue: 0,
    totalRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [topEvents, setTopEvents] = useState<Array<{ title: string; registrations: number }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [
        membersResult,
        activeMembersResult,
        eventsResult,
        upcomingEventsResult,
        paymentsResult,
        monthPaymentsResult,
        registrationsResult,
        topEventsResult,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('memberships')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .gte('date_start', new Date().toISOString())
          .eq('status', 'published'),
        supabase.from('payments').select('amount_cents'),
        supabase
          .from('payments')
          .select('amount_cents')
          .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase
          .from('event_registrations')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'paid'),
        supabase
          .from('event_registrations')
          .select('event_id, events(title)')
          .eq('status', 'paid'),
      ]);

      const totalRevenue = (paymentsResult.data || []).reduce(
        (sum, payment) => sum + payment.amount_cents,
        0
      );

      const monthRevenue = (monthPaymentsResult.data || []).reduce(
        (sum, payment) => sum + payment.amount_cents,
        0
      );

      const eventRegistrationCounts = new Map<string, { title: string; count: number }>();
      (topEventsResult.data || []).forEach((reg: any) => {
        if (reg.events && reg.events.title) {
          const existing = eventRegistrationCounts.get(reg.event_id);
          if (existing) {
            existing.count++;
          } else {
            eventRegistrationCounts.set(reg.event_id, {
              title: reg.events.title,
              count: 1,
            });
          }
        }
      });

      const topEventsArray = Array.from(eventRegistrationCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(e => ({ title: e.title, registrations: e.count }));

      setStats({
        totalMembers: membersResult.count || 0,
        activeMembers: activeMembersResult.count || 0,
        totalEvents: eventsResult.count || 0,
        upcomingEvents: upcomingEventsResult.count || 0,
        totalRevenue,
        monthRevenue,
        totalRegistrations: registrationsResult.count || 0,
      });

      setTopEvents(topEventsArray);
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

      {topEvents.length > 0 && (
        <Card className="border-black/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-light">
              Événements les plus populaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEvents.map((event, index) => (
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
