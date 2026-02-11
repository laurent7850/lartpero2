import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { eventsApi, Event } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Grid, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EventCalendar } from '@/components/EventCalendar';

export function Evenements() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'members'>('upcoming');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    loadEvents();
  }, [filter]);

  const loadEvents = async () => {
    try {
      const data = await eventsApi.list();

      let filteredEvents = data || [];

      if (filter === 'upcoming') {
        filteredEvents = filteredEvents.filter(e => new Date(e.dateStart) >= new Date());
      }

      if (filter === 'members') {
        filteredEvents = filteredEvents.filter(e => e.isMembersOnly);
      }

      // Sort by date
      filteredEvents.sort((a, b) => new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime());

      setEvents(filteredEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light mb-8 text-center">
          Nos événements
        </h1>

        <p className="text-xl text-center text-black/70 mb-12">
          Des rencontres pensées comme des moments suspendus dans le temps
        </p>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2 border transition-colors ${
                filter === 'upcoming'
                  ? 'bg-black text-white border-black'
                  : 'border-black/20 hover:border-black'
              }`}
            >
              À venir
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 border transition-colors ${
                filter === 'all'
                  ? 'bg-black text-white border-black'
                  : 'border-black/20 hover:border-black'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setFilter('members')}
              className={`px-6 py-2 border transition-colors ${
                filter === 'members'
                  ? 'bg-black text-white border-black'
                  : 'border-black/20 hover:border-black'
              }`}
            >
              Membres uniquement
            </button>
          </div>

          <div className="flex gap-2 border border-black/20 rounded">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-black text-white'
                  : 'hover:bg-black/5'
              }`}
              title="Vue liste"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Liste</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 flex items-center gap-2 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-black text-white'
                  : 'hover:bg-black/5'
              }`}
              title="Vue calendrier"
            >
              <CalendarDays className="w-4 h-4" />
              <span className="hidden sm:inline">Calendrier</span>
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center text-black/60 py-12">
            <p>Aucun événement pour le moment. Revenez bientôt !</p>
          </div>
        ) : viewMode === 'calendar' ? (
          <EventCalendar events={events} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Link key={event.id} to={`/evenements/${event.slug}`}>
                <Card className="border-black/10 shadow-none hover:shadow-lg transition-shadow h-full">
                  {event.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl font-light">
                        {event.title}
                      </CardTitle>
                      {event.isMembersOnly && (
                        <Badge variant="outline" className="border-black/20 flex-shrink-0">
                          Membres
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-black/60">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(event.dateStart), 'PPP', { locale: fr })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-black/60">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.capacity && (
                      <div className="flex items-center gap-2 text-sm text-black/60">
                        <Users className="w-4 h-4" />
                        <span>{event.capacity} places</span>
                      </div>
                    )}
                    {event.priceCents > 0 && (
                      <div className="text-sm font-medium pt-2">
                        {(event.priceCents / 100).toFixed(2)} €
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
