import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { productsApi, ProductOrder } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Gift, Crown, Ticket, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PaiementProduit() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [order, setOrder] = useState<ProductOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed' | 'canceled'>('pending');

  const isSuccess = searchParams.get('success') === 'true';
  const isCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  useEffect(() => {
    if (isSuccess && order && order.paymentStatus === 'PENDING') {
      verifyPayment();
    } else if (isCanceled) {
      setPaymentStatus('canceled');
    }
  }, [isSuccess, isCanceled, order]);

  const loadOrder = async () => {
    try {
      const orders = await productsApi.getOrders();
      const data = orders.find(o => o.id === orderId);

      if (!data) {
        toast({
          title: 'Commande non trouvée',
          description: 'Cette commande n\'existe pas',
          variant: 'destructive',
        });
        navigate('/boutique');
        return;
      }

      setOrder(data);
      if (data.paymentStatus === 'PAID') {
        setPaymentStatus('success');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la commande',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!user || !orderId) return;

    setVerifying(true);
    try {
      const result = await productsApi.verifyPayment(orderId);

      if (result.success && result.order) {
        setPaymentStatus('success');
        setOrder(result.order);
        toast({
          title: 'Paiement confirmé',
          description: 'Votre achat a été validé avec succès',
        });
      } else {
        setPaymentStatus('failed');
        toast({
          title: 'Paiement en attente',
          description: 'Le paiement n\'a pas encore été confirmé',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      setPaymentStatus('failed');
    } finally {
      setVerifying(false);
    }
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const copyGiftCode = () => {
    if (order?.giftCode) {
      navigator.clipboard.writeText(order.giftCode);
      toast({
        title: 'Code copié',
        description: 'Le code cadeau a été copié dans le presse-papiers',
      });
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'SUBSCRIPTION':
        return <Crown className="w-8 h-8 text-amber-600" />;
      case 'ENTRY':
        return <Ticket className="w-8 h-8 text-blue-600" />;
      case 'GIFT_CARD':
        return <Gift className="w-8 h-8 text-pink-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="py-24 px-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-black/60">Chargement de la commande...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 px-4 text-center">
        <p className="text-black/60">Commande non trouvée</p>
        <Button onClick={() => navigate('/boutique')} className="mt-4">
          Retour à la boutique
        </Button>
      </div>
    );
  }

  const product = order.product;

  return (
    <div className="py-16 px-4">
      <div className="max-w-lg mx-auto">
        <Card className="border-black/10">
          <CardHeader className="text-center">
            {verifying ? (
              <>
                <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-black/40" />
                <CardTitle>Vérification du paiement...</CardTitle>
                <CardDescription>Veuillez patienter</CardDescription>
              </>
            ) : paymentStatus === 'success' ? (
              <>
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <CardTitle className="text-green-600">Paiement confirmé !</CardTitle>
                <CardDescription>Merci pour votre achat</CardDescription>
              </>
            ) : paymentStatus === 'canceled' ? (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                <CardTitle className="text-orange-500">Paiement annulé</CardTitle>
                <CardDescription>Vous avez annulé le paiement</CardDescription>
              </>
            ) : paymentStatus === 'failed' ? (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
                <CardTitle className="text-red-600">Paiement échoué</CardTitle>
                <CardDescription>Le paiement n'a pas pu être traité</CardDescription>
              </>
            ) : (
              <>
                {getCategoryIcon(product?.category)}
                <CardTitle className="mt-4">Résumé de la commande</CardTitle>
                <CardDescription>En attente de paiement</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Product Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                {getCategoryIcon(product?.category)}
                <div>
                  <p className="font-semibold">{product?.name}</p>
                  <p className="text-sm text-gray-600">{product?.description}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-gray-600">Total</span>
                <span className="text-xl font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>

            {/* Gift Card Code */}
            {paymentStatus === 'success' && order.giftCode && (
              <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                <p className="text-sm font-medium text-pink-800 mb-2">Code cadeau</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border text-lg font-mono">
                    {order.giftCode}
                  </code>
                  <Button variant="outline" size="icon" onClick={copyGiftCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {order.recipientName && (
                  <p className="text-sm text-pink-700 mt-2">
                    Pour : {order.recipientName}
                  </p>
                )}
                {order.expiresAt && (
                  <p className="text-xs text-pink-600 mt-1">
                    Valable jusqu'au {new Date(order.expiresAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            )}

            {/* Subscription Info */}
            {paymentStatus === 'success' && product?.category === 'SUBSCRIPTION' && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm font-medium text-amber-800 mb-2">Votre abonnement est actif !</p>
                <p className="text-sm text-amber-700">
                  Vous avez maintenant accès à {product.eventsIncluded} events sur {product.durationMonths} mois.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {paymentStatus === 'success' ? (
                <>
                  <Button onClick={() => navigate('/membres')} className="w-full">
                    Accéder à mon espace membre
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/boutique')} className="w-full">
                    Retour à la boutique
                  </Button>
                </>
              ) : paymentStatus === 'canceled' || paymentStatus === 'failed' ? (
                <>
                  <Button onClick={() => navigate('/boutique')} className="w-full">
                    Retour à la boutique
                  </Button>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
