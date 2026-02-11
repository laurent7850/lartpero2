import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, Product } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Gift, Crown, Ticket } from 'lucide-react';

export function Boutique() {
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [giftDialogOpen, setGiftDialogOpen] = useState(false);
  const [selectedGiftProduct, setSelectedGiftProduct] = useState<Product | null>(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('price_cents');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les produits',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (product: Product) => {
    if (!user || !session) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour effectuer un achat',
        variant: 'destructive',
      });
      navigate('/connexion');
      return;
    }

    if (product.category === 'gift_card') {
      setSelectedGiftProduct(product);
      setGiftDialogOpen(true);
      return;
    }

    await processPurchase(product);
  };

  const processPurchase = async (product: Product, giftRecipient?: { name: string; email: string }) => {
    setPurchasing(product.id);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-product-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
            recipientName: giftRecipient?.name,
            recipientEmail: giftRecipient?.email,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la création du paiement');
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer le paiement',
        variant: 'destructive',
      });
    } finally {
      setPurchasing(null);
    }
  };

  const handleGiftPurchase = async () => {
    if (!selectedGiftProduct) return;

    if (!recipientName.trim()) {
      toast({
        title: 'Nom requis',
        description: 'Veuillez entrer le nom du destinataire',
        variant: 'destructive',
      });
      return;
    }

    setGiftDialogOpen(false);
    await processPurchase(selectedGiftProduct, {
      name: recipientName,
      email: recipientEmail,
    });
    setRecipientName('');
    setRecipientEmail('');
    setSelectedGiftProduct(null);
  };

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  };

  const subscriptions = products.filter((p) => p.category === 'subscription');
  const entries = products.filter((p) => p.category === 'entry');
  const giftCards = products.filter((p) => p.category === 'gift_card');

  if (loading) {
    return (
      <div className="py-24 px-4 text-center">
        <p className="text-black/60">Chargement des produits...</p>
      </div>
    );
  }

  return (
    <div>
      <section className="py-16 px-4 bg-black text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-6">Boutique</h1>
          <p className="text-xl text-white/80">
            Abonnements, entrées et cartes cadeaux
          </p>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Abonnements */}
          {subscriptions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Crown className="w-8 h-8 text-amber-600" />
                <h2 className="text-3xl font-light">Abonnements Membres</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {subscriptions.map((product) => (
                  <Card key={product.id} className="border-black/10 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription>
                        {product.duration_months} mois • {product.events_included} events
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <div className="text-2xl font-bold text-black">
                        {formatPrice(product.price_cents)}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(product)}
                        disabled={purchasing === product.id}
                      >
                        {purchasing === product.id ? 'Chargement...' : 'Souscrire'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Entrées */}
          {entries.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Ticket className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-light">Entrées Sans Abonnement</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                {entries.map((product) => (
                  <Card key={product.id} className="border-black/10 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription>
                        {product.events_included} event{product.events_included && product.events_included > 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <div className="text-2xl font-bold text-black">
                        {formatPrice(product.price_cents)}
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handlePurchase(product)}
                        disabled={purchasing === product.id}
                      >
                        {purchasing === product.id ? 'Chargement...' : 'Acheter'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cartes Cadeaux */}
          {giftCards.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Gift className="w-8 h-8 text-pink-600" />
                <h2 className="text-3xl font-light">Cartes Cadeaux</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
                {giftCards.map((product) => (
                  <Card key={product.id} className="border-black/10 hover:shadow-lg transition-shadow bg-gradient-to-br from-pink-50 to-white">
                    <CardHeader>
                      <CardTitle className="text-xl">{product.name}</CardTitle>
                      <CardDescription>
                        {product.events_included} event{product.events_included && product.events_included > 1 ? 's' : ''} • Valable 6 mois
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{product.description}</p>
                      <div className="text-2xl font-bold text-black">
                        {formatPrice(product.price_cents)}
                      </div>
                      <Button
                        className="w-full bg-pink-600 hover:bg-pink-700"
                        onClick={() => handlePurchase(product)}
                        disabled={purchasing === product.id}
                      >
                        {purchasing === product.id ? 'Chargement...' : 'Offrir'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gift Card Dialog */}
      <Dialog open={giftDialogOpen} onOpenChange={setGiftDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offrir une carte cadeau</DialogTitle>
            <DialogDescription>
              {selectedGiftProduct?.name} - {selectedGiftProduct && formatPrice(selectedGiftProduct.price_cents)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Nom du destinataire *</Label>
              <Input
                id="recipientName"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Prénom et nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Email du destinataire (optionnel)</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="email@exemple.com"
              />
              <p className="text-xs text-gray-500">
                Si renseigné, le code cadeau sera envoyé par email
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setGiftDialogOpen(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={handleGiftPurchase} className="flex-1 bg-pink-600 hover:bg-pink-700">
                Continuer vers le paiement
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
