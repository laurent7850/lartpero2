import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { membersApi, Ticket } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Calendar, MapPin, Ticket as TicketIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MesBillets() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, [user]);

  const loadTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await membersApi.getTickets();
      setTickets(data || []);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      setError('Impossible de charger vos billets.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (isUsed: boolean) => {
    if (isUsed) {
      return <Badge variant="secondary">Utilisé</Badge>;
    }
    return <Badge className="bg-green-500">Valide</Badge>;
  };

  const generateQRCodeUrl = (ticketCode: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `${window.location.origin}/checkin?code=${ticketCode}`
    )}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement de vos billets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mes billets</h1>
        <p className="text-muted-foreground">
          Consultez et gérez tous vos billets d'événements
        </p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <TicketIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Aucun billet</h2>
            <p className="text-muted-foreground mb-6">
              Vous n'avez pas encore de billets pour des événements.
            </p>
            <Button onClick={() => (window.location.href = '/evenements')}>
              Découvrir les événements
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{ticket.event.title}</CardTitle>
                    <CardDescription>
                      Billet #{ticket.ticketCode}
                    </CardDescription>
                  </div>
                  {getStatusBadge(ticket.isUsed)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Date et heure</p>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(ticket.event.dateStart),
                            "EEEE d MMMM yyyy 'à' HH:mm",
                            { locale: fr }
                          )}
                        </p>
                      </div>
                    </div>

                    {ticket.event.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Lieu</p>
                          <p className="text-sm text-muted-foreground">{ticket.event.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-6">
                    {!ticket.isUsed ? (
                      <>
                        <img
                          src={generateQRCodeUrl(ticket.ticketCode)}
                          alt="QR Code"
                          className="w-48 h-48 mb-4"
                        />
                        <p className="text-xs text-center text-muted-foreground">
                          Présentez ce QR code à l'entrée de l'événement
                        </p>
                      </>
                    ) : (
                      <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          Ce billet a déjà été utilisé
                        </p>
                      </div>
                    )}
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
