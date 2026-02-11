import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ordersApi, membersApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestPaiement() {
  const { user } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testVerifyPayment = async () => {
    if (!orderId) return;

    setLoading(true);
    setResult(null);

    try {
      const data = await ordersApi.verifyPayment(orderId);
      setResult({ success: true, data });
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkSession = () => {
    const authToken = localStorage.getItem('auth_token');
    setResult({
      user: user?.id,
      token: authToken ? 'Present' : 'Missing',
    });
  };

  const checkRegistrations = async () => {
    setLoading(true);
    try {
      const data = await membersApi.getRegistrations();
      setResult({ registrations: data });
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkTickets = async () => {
    setLoading(true);
    try {
      const data = await membersApi.getTickets();
      setResult({ tickets: data });
    } catch (error: any) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Test de paiement</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de session</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">User ID</p>
                <p className="text-sm text-muted-foreground">{user?.id || 'Non connecté'}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">
                  {user?.email || 'Non connecté'}
                </p>
              </div>
              <Button onClick={checkSession} variant="outline">
                Vérifier la session
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tester verify-payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Entrez l'ID de la commande"
                />
              </div>
              <Button onClick={testVerifyPayment} disabled={loading || !orderId}>
                Tester verify-payment
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vérifier les données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={checkRegistrations} disabled={loading} variant="outline">
                  Voir les inscriptions
                </Button>
                <Button onClick={checkTickets} disabled={loading} variant="outline">
                  Voir les billets
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardHeader>
                <CardTitle>Résultat</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
