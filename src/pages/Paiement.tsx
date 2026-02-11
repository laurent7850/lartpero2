import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Order, Event, ordersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, CreditCard } from 'lucide-react';

export default function Paiement() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<(Order & { event: Event }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/connexion');
      return;
    }

    if (!orderId) {
      navigate('/evenements');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('canceled') === 'true') {
      setError('Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.');
      loadOrder();
    } else if (params.get('success') === 'true') {
      verifyPayment();
    } else {
      loadOrder();
    }
  }, [orderId, user, authLoading, navigate]);

  const verifyPayment = async () => {
    if (!orderId) return;

    try {
      setLoading(true);

      const result = await ordersApi.verifyPayment(orderId);

      if (result.success && result.paymentStatus === 'paid') {
        await loadOrder();
      } else {
        await loadOrder();
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setError(error.message || 'Erreur lors de la vérification du paiement.');
      setLoading(false);
    }
  };

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);

      const orderData = await ordersApi.get(orderId);

      if (!orderData) {
        setError('Commande introuvable.');
        return;
      }

      setOrder(orderData);

      if (orderData.paymentStatus === 'PAID') {
        setTimeout(() => {
          navigate('/membres/mes-billets');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error loading order:', error);
      setError(error.message || 'Impossible de charger la commande.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!order || !user) return;

    setProcessing(true);
    setError(null);

    try {
      const result = await ordersApi.createCheckoutSession(order.id);

      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
      } else {
        throw new Error('URL de paiement non reçue.');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      setError(error.message || 'Une erreur est survenue lors du paiement.');
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/evenements')} className="mt-4">
          Retour aux événements
        </Button>
      </div>
    );
  }

  if (!order) return null;

  if (order.paymentStatus === 'PAID') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Paiement confirmé</h1>
          <p className="text-muted-foreground mb-6">
            Vos billets sont en cours de génération. Vous allez être redirigé...
          </p>
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Finaliser le paiement</h1>
          <p className="text-muted-foreground">
            Complétez votre paiement pour confirmer votre réservation
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
              <CardDescription>Commande #{order.id.slice(0, 8)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Événement</p>
                <p className="font-medium">{order.event.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Nombre de billets</p>
                <p className="font-medium">{order.quantity}</p>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total à payer</span>
                  <span>{(order.totalAmount / 100).toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informations de paiement</CardTitle>
              <CardDescription>Paiement sécurisé par Stripe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CreditCard className="h-4 w-4" />
                <AlertDescription>
                  Le paiement sécurisé via Stripe nécessite une configuration préalable.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {order.paymentStatus === 'FAILED' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Le paiement a échoué. Veuillez réessayer.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement du paiement...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payer {(order.totalAmount / 100).toFixed(2)} €
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Vos informations de paiement sont sécurisées et cryptées
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
