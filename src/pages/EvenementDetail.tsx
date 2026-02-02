import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, Event } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function EvenementDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadEvent();
    }
  }, [slug]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    if (!user) {
      navigate('/connexion?redirect=/evenements/' + slug + '/reserver');
      return;
    }
    navigate(`/evenements/${slug}/reserver`);
  };

  if (loading) {
    return (
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-light mb-4">Événement non trouvé</h1>
          <Button onClick={() => navigate('/evenements')}>
            Retour aux événements
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/evenements')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux événements
        </Button>

        {event.image_url && (
          <div className="aspect-video mb-8 overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover grayscale"
            />
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-4xl md:text-5xl font-light">{event.title}</h1>
          {event.is_members_only && (
            <Badge variant="outline" className="border-black/20 flex-shrink-0">
              Membres uniquement
            </Badge>
          )}
        </div>

        <div className="space-y-4 mb-8 pb-8 border-b border-black/10">
          <div className="flex items-center gap-3 text-black/70">
            <Calendar className="w-5 h-5" />
            <span className="text-lg">
              {format(new Date(event.date_start), 'PPPp', { locale: fr })}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center gap-3 text-black/70">
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{event.location}</span>
            </div>
          )}
          {event.capacity && (
            <div className="flex items-center gap-3 text-black/70">
              <Users className="w-5 h-5" />
              <span className="text-lg">{event.capacity} places disponibles</span>
            </div>
          )}
        </div>

        {event.description && (
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-lg leading-relaxed text-black/80 whitespace-pre-wrap">
              {event.description}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between p-8 bg-black text-white">
          <div>
            {event.price_cents > 0 ? (
              <div className="text-3xl font-light">
                {(event.price_cents / 100).toFixed(2)} €
              </div>
            ) : (
              <div className="text-xl">Gratuit</div>
            )}
          </div>
          <Button
            size="lg"
            variant="outline"
            className="bg-white text-black hover:bg-white/90 border-0"
            onClick={handleRegister}
          >
            {user ? 'Réserver ma place' : 'Se connecter pour réserver'}
          </Button>
        </div>

        {event.is_members_only && !user && (
          <div className="mt-8 p-6 border border-black/10 text-center">
            <p className="text-black/70 mb-4">
              Cet événement est réservé aux membres du Club des Gentlemen
            </p>
            <Button onClick={() => navigate('/devenir-membre')}>
              Devenir membre
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
