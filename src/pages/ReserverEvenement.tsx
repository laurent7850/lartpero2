import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Event, supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Calendar, MapPin, Users, Euro, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function ReserverEvenement() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/connexion?redirect=/evenements/' + slug + '/reserver');
      return;
    }

    loadEvent();
  }, [slug, user, navigate]);

  const loadEvent = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError("Cet événement n'existe pas ou n'est pas disponible.");
        return;
      }

      setEvent(data);
    } catch (error: any) {
      console.error('Error loading event:', error);
      setError("Impossible de charger l'événement.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1) {
      if (event?.capacity && num > event.capacity) {
        setQuantity(event.capacity);
      } else {
        setQuantity(num);
      }
    }
  };

  const getTotalAmount = () => {
    if (!event) return 0;
    return (event.price_cents * quantity) / 100;
  };

  const handleReservation = async () => {
    if (!user || !event) return;

    setProcessing(true);
    setError(null);

    try {
      const totalAmount = event.price_cents * quantity;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            event_id: event.id,
            user_id: user.id,
            quantity: quantity,
            total_amount: totalAmount,
            payment_status: 'pending',
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      if (totalAmount === 0) {
        const { error: updateError } = await supabase
          .from('orders')
          .update({ payment_status: 'paid' })
          .eq('id', order.id);

        if (updateError) throw updateError;

        navigate(`/membres/mes-billets?order=${order.id}`);
      } else {
        navigate(`/paiement/${order.id}`);
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      setError(error.message || 'Une erreur est survenue lors de la réservation.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            ← Retour
          </Button>
          <h1 className="text-4xl font-bold mb-2">Réserver votre place</h1>
          <p className="text-muted-foreground">
            Complétez votre réservation pour {event.title}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {event.image_url && (
              <img
                src={event.image_url}
                alt={event.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>Détails de l'événement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date et heure</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.date_start), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                      {event.date_end && (
                        <>
                          {' - '}
                          {format(new Date(event.date_end), "HH:mm", { locale: fr })}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Lieu</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Capacité</p>
                      <p className="text-sm text-muted-foreground">{event.capacity} places</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Euro className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Prix par billet</p>
                    <p className="text-sm text-muted-foreground">
                      {event.price_cents === 0
                        ? 'Gratuit'
                        : `${(event.price_cents / 100).toFixed(2)} €`}
                    </p>
                  </div>
                </div>

                {event.description && (
                  <div className="pt-4 border-t">
                    <p className="font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Votre réservation</CardTitle>
                <CardDescription>Sélectionnez le nombre de billets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Nombre de billets</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={event.capacity || undefined}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                  />
                  {event.capacity && (
                    <p className="text-xs text-muted-foreground">
                      Maximum {event.capacity} billets disponibles
                    </p>
                  )}
                </div>

                <div className="border-t pt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Prix unitaire</span>
                    <span>
                      {event.price_cents === 0
                        ? 'Gratuit'
                        : `${(event.price_cents / 100).toFixed(2)} €`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantité</span>
                    <span>{quantity}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-3">
                    <span>Total</span>
                    <span>{getTotalAmount().toFixed(2)} €</span>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleReservation}
                  disabled={processing || quantity < 1}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>Réserver et payer</>
                  )}
                </Button>
              </CardFooter>
            </Card>

            {event.is_members_only && (
              <Alert className="mt-4">
                <AlertDescription>
                  Cet événement est réservé aux membres du Club des Gentlemen.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
