import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { Event } from '@/lib/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventCalendarProps {
  events: Event[];
}

export function EventCalendar({ events }: EventCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const eventDates = events.map(event => new Date(event.dateStart));

  const eventsOnSelectedDate = selectedDate
    ? events.filter(event => {
        const eventDate = new Date(event.dateStart);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const modifiers = {
    hasEvent: eventDates,
  };

  return (
    <div className="space-y-8">
      <style>{`
        .rdp {
          --rdp-cell-size: 50px;
          --rdp-accent-color: #000;
          --rdp-background-color: rgba(0, 0, 0, 0.05);
          margin: 0 auto;
        }
        .rdp-months {
          justify-content: center;
        }
        .rdp-month {
          width: 100%;
        }
        .rdp-caption {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0 0 1.5rem 0;
          position: relative;
        }
        .rdp-caption_label {
          font-size: 1.125rem;
          font-weight: 300;
          color: #1f2937;
        }
        .rdp-nav {
          position: absolute;
          right: 0;
          left: 0;
          display: flex;
          justify-content: space-between;
        }
        .rdp-nav_button {
          width: 2rem;
          height: 2rem;
          border-radius: 0.25rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rdp-nav_button:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .rdp-head_cell {
          font-weight: 500;
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: uppercase;
          padding: 0.5rem 0;
        }
        .rdp-cell {
          padding: 0.25rem;
        }
        .rdp-day {
          width: var(--rdp-cell-size);
          height: var(--rdp-cell-size);
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.2s;
        }
        .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .rdp-day_selected {
          background-color: #000 !important;
          color: white !important;
        }
        .rdp-day_today {
          font-weight: 600;
        }
        .rdp-day_outside {
          opacity: 0.5;
        }
        .has-event {
          position: relative;
          font-weight: 600 !important;
        }
        .has-event::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: #000;
        }
        .rdp-day_selected.has-event::after {
          background-color: white;
        }
      `}</style>

      <div className="bg-white p-8 rounded-lg border border-black/10 shadow-sm max-w-md mx-auto">
        <DayPicker
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          locale={fr}
          modifiers={modifiers}
          modifiersClassNames={{
            hasEvent: 'has-event',
          }}
        />
        <div className="mt-6 pt-6 border-t border-black/10">
          <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-black"></span>
            Jours avec événements
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {selectedDate ? (
          <div>
            <h3 className="text-3xl font-light mb-6 text-center">
              {format(selectedDate, 'PPPP', { locale: fr })}
            </h3>
            {eventsOnSelectedDate.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {eventsOnSelectedDate.map(event => (
                  <Link key={event.id} to={`/evenements/${event.slug}`}>
                    <Card className="border-black/10 shadow-sm hover:shadow-lg transition-shadow h-full">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-2 mb-4">
                          <h4 className="text-xl font-light text-gray-900">
                            {event.title}
                          </h4>
                          {event.isMembersOnly && (
                            <Badge variant="outline" className="border-black/20 flex-shrink-0">
                              Membres
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-black/60">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {format(new Date(event.dateStart), 'HH:mm', { locale: fr })}
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
                            <div className="text-base font-medium pt-2 border-t border-black/10">
                              {(event.priceCents / 100).toFixed(2)} €
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-black/10 shadow-sm">
                <CardContent className="p-12 text-center text-black/60">
                  Aucun événement prévu ce jour
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="border-black/10 shadow-sm">
            <CardContent className="p-12 text-center text-black/60">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Sélectionnez une date dans le calendrier pour voir les événements</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
