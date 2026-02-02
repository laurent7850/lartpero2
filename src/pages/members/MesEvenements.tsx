import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, EventRegistration, Event } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type EventWithDetails = EventRegistration & {
  event: Event;
};

export function MesEvenements() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRegistrations();
    }
  }, [user]);

  const loadRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, event:events(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations((data as any) || []);
    } catch (error) {
      console.error('Error loading registrations:', error);
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
    <div>
      <h2 className="text-3xl font-light mb-6">Mes événements</h2>

      {registrations.length === 0 ? (
        <Card className="border-black/10 shadow-none">
          <CardContent className="py-12 text-center">
            <p className="text-black/60 mb-4">
              Vous n'êtes inscrit à aucun événement pour le moment.
            </p>
            <Link
              to="/evenements"
              className="text-sm underline hover:text-black/60"
            >
              Découvrir les événements
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrations.map((registration) => (
            <Card key={registration.id} className="border-black/10 shadow-none">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-xl font-light">
                    {registration.event.title}
                  </CardTitle>
                  <Badge
                    variant={
                      registration.status === 'paid'
                        ? 'default'
                        : registration.status === 'pending'
                        ? 'outline'
                        : 'destructive'
                    }
                    className={
                      registration.status === 'paid'
                        ? 'bg-black border-black'
                        : ''
                    }
                  >
                    {registration.status === 'paid'
                      ? 'Confirmé'
                      : registration.status === 'pending'
                      ? 'En attente'
                      : 'Annulé'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-black/60">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {format(
                      new Date(registration.event.date_start),
                      'PPP',
                      { locale: fr }
                    )}
                  </span>
                </div>
                {registration.event.location && (
                  <div className="flex items-center gap-2 text-sm text-black/60">
                    <MapPin className="w-4 h-4" />
                    <span>{registration.event.location}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-black/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Quantité</span>
                    <span className="font-medium">{registration.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-black/60">Total payé</span>
                    <span className="font-medium">
                      {(registration.total_cents / 100).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
