import { useEffect, useState } from 'react';
import { supabase, Event } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { EventForm } from '@/components/admin/EventForm';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EventWithRegistrations extends Event {
  registrations_count: number;
}

export function AdminEvenements() {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventWithRegistrations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('date_start', { ascending: false });

      if (eventsError) throw eventsError;

      const eventsWithCounts = await Promise.all(
        (eventsData || []).map(async (event) => {
          const { count } = await supabase
            .from('event_registrations')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'paid');

          return {
            ...event,
            registrations_count: count || 0,
          };
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventToDelete.id);

      if (error) throw error;

      toast({
        title: 'Événement supprimé',
        description: "L'événement a été supprimé avec succès.",
      });

      loadEvents();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur s'est produite lors de la suppression.",
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const confirmDelete = (event: Event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-light">Gestion des événements</h2>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="border-black/10 shadow-none p-12 text-center">
          <p className="text-black/60">Aucun événement pour le moment</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id} className="border-black/10 shadow-none p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-light">{event.title}</h3>
                    <Badge
                      variant={event.status === 'published' ? 'default' : 'outline'}
                      className={event.status === 'published' ? 'bg-black border-black' : ''}
                    >
                      {event.status === 'published' ? 'Publié' : 'Brouillon'}
                    </Badge>
                    {event.is_members_only && (
                      <Badge variant="outline">Membres uniquement</Badge>
                    )}
                  </div>
                  <p className="text-sm text-black/60 mb-2">
                    {format(new Date(event.date_start), 'PPP', { locale: fr })}
                  </p>
                  {event.location && (
                    <p className="text-sm text-black/60 mb-2">{event.location}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Users className="w-4 h-4 text-black/60" />
                    <span className="text-sm font-medium">
                      {event.registrations_count} inscription{event.registrations_count > 1 ? 's' : ''}
                    </span>
                    {event.capacity && (
                      <span className="text-sm text-black/60">
                        / {event.capacity} places
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(event)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmDelete(event)}
                    className="text-red-600 hover:text-red-700 hover:border-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <EventForm
        event={selectedEvent}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={loadEvents}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
