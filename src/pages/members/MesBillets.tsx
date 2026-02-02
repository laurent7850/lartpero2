import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ticket, Event, Order, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Calendar, MapPin, Ticket as TicketIcon, CheckCircle2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type TicketWithDetails = Ticket & {
  event: Event;
  order: Order;
};

export default function MesBillets() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingTickets, setGeneratingTickets] = useState(false);

  useEffect(() => {
    loadTickets();
  }, [user]);

  useEffect(() => {
    if (orderId) {
      checkAndGenerateTickets(orderId);
    }
  }, [orderId]);

  const checkAndGenerateTickets = async (orderId: string) => {
    setGeneratingTickets(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ orderId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate tickets');
      }

      await loadTickets();
    } catch (error) {
      console.error('Error generating tickets:', error);
    } finally {
      setGeneratingTickets(false);
    }
  };

  const loadTickets = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          event:events(*),
          order:orders(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data as any);
    } catch (error: any) {
      console.error('Error loading tickets:', error);
      setError('Impossible de charger vos billets.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-500">Valide</Badge>;
      case 'used':
        return <Badge variant="secondary">Utilisé</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const generateQRCodeUrl = (token: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `${window.location.origin}/checkin?token=${token}`
    )}`;
  };

  const downloadTicket = async (ticket: TicketWithDetails) => {
    try {
      const qrCodeUrl = generateQRCodeUrl(ticket.token);

      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText("L'Art'Péro", canvas.width / 2, 60);

      ctx.font = 'bold 24px Arial';
      ctx.fillText(ticket.event.title, canvas.width / 2, 120);

      ctx.font = '18px Arial';
      ctx.fillStyle = '#666666';
      const eventDate = format(new Date(ticket.event.date_start), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr });
      ctx.fillText(eventDate, canvas.width / 2, 160);

      if (ticket.event.location) {
        ctx.fillText(ticket.event.location, canvas.width / 2, 190);
      }

      const qrImage = new Image();
      qrImage.crossOrigin = 'anonymous';
      qrImage.src = qrCodeUrl;

      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      const qrSize = 300;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 240;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = '#000000';
      ctx.font = '14px Arial';
      ctx.fillText(`Billet #${ticket.id.slice(0, 8)}`, canvas.width / 2, qrY + qrSize + 40);
      ctx.fillText(`Token: ${ticket.token.slice(0, 16)}...`, canvas.width / 2, qrY + qrSize + 65);

      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 220, canvas.width - 100, qrSize + 100);

      ctx.font = '12px Arial';
      ctx.fillStyle = '#999999';
      ctx.fillText('Présentez ce QR code à l\'entrée de l\'événement', canvas.width / 2, qrY + qrSize + 100);

      const link = document.createElement('a');
      link.download = `billet-${ticket.event.title.replace(/\s+/g, '-')}-${ticket.id.slice(0, 8)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Erreur lors du téléchargement du billet. Veuillez réessayer.');
    }
  };

  if (loading || generatingTickets) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {generatingTickets ? 'Génération de vos billets...' : 'Chargement de vos billets...'}
          </p>
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

      {orderId && (
        <Alert className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            Votre réservation a été confirmée avec succès. Vos billets sont disponibles ci-dessous.
          </AlertDescription>
        </Alert>
      )}

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
                      Billet #{ticket.id.slice(0, 8)} • Commande #{ticket.order_id.slice(0, 8)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(ticket.status)}
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
                            new Date(ticket.event.date_start),
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

                    {ticket.status === 'used' && ticket.used_at && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">Utilisé le</p>
                        <p className="font-medium">
                          {format(new Date(ticket.used_at), "d MMMM yyyy 'à' HH:mm", {
                            locale: fr,
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center bg-muted rounded-lg p-6">
                    {ticket.status === 'valid' ? (
                      <>
                        <img
                          src={generateQRCodeUrl(ticket.token)}
                          alt="QR Code"
                          className="w-48 h-48 mb-4"
                        />
                        <p className="text-xs text-center text-muted-foreground">
                          Présentez ce QR code à l'entrée de l'événement
                        </p>
                        <p className="text-xs text-center text-muted-foreground mt-2 font-mono">
                          Token: {ticket.token.slice(0, 16)}...
                        </p>
                        <Button
                          onClick={() => downloadTicket(ticket)}
                          variant="outline"
                          className="mt-4 w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger le billet
                        </Button>
                      </>
                    ) : (
                      <div className="text-center">
                        <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                          {ticket.status === 'used'
                            ? 'Ce billet a déjà été utilisé'
                            : 'Ce billet a été annulé'}
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
