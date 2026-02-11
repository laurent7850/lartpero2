import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { membersApi, Membership } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Abonnement() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMembership();
    }
  }, [user]);

  const loadMembership = async () => {
    try {
      const data = await membersApi.getMembership();
      setMembership(data);
    } catch (error) {
      console.error('Error loading membership:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'CANCELED':
        return 'Résilié';
      case 'PAST_DUE':
        return 'Impayé';
      default:
        return 'Aucun';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'CANCELED':
        return 'outline';
      case 'PAST_DUE':
        return 'destructive';
      default:
        return 'outline';
    }
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
      <h2 className="text-3xl font-light mb-6">Mon abonnement</h2>

      <Card className="border-black/10 shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-light">
                L'ArtPéro Concept
              </CardTitle>
              <CardDescription>
                {membership?.plan || 'Abonnement standard'}
              </CardDescription>
            </div>
            {membership && (
              <Badge
                variant={getStatusVariant(membership.status) as any}
                className={
                  membership.status === 'ACTIVE'
                    ? 'bg-black border-black'
                    : ''
                }
              >
                {getStatusLabel(membership.status)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!membership || membership.status === 'NONE' ? (
            <div className="py-8 text-center">
              <p className="text-black/60 mb-6">
                Vous n'avez pas encore d'abonnement actif.
              </p>
              <Button>Souscrire à un abonnement</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-black/10">
                  <span className="text-black/60">Statut</span>
                  <span className="font-medium">
                    {getStatusLabel(membership.status)}
                  </span>
                </div>
                {membership.currentPeriodEnd && (
                  <div className="flex justify-between py-3 border-b border-black/10">
                    <span className="text-black/60">
                      {membership.status === 'ACTIVE'
                        ? 'Renouvellement le'
                        : 'Fin le'}
                    </span>
                    <span className="font-medium">
                      {format(
                        new Date(membership.currentPeriodEnd),
                        'PP',
                        { locale: fr }
                      )}
                    </span>
                  </div>
                )}
              </div>

              {membership.status === 'ACTIVE' && (
                <div className="pt-6">
                  <Button variant="outline" className="w-full">
                    Gérer mon abonnement
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-none mt-6">
        <CardHeader>
          <CardTitle className="text-xl font-light">Informations</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-black/70 space-y-3">
          <p>
            Votre abonnement vous donne accès à tous les avantages de L'ArtPéro Concept,
            incluant les événements exclusifs, le coaching personnalisé
            et l'accompagnement dans votre recherche de rencontres authentiques.
          </p>
          <p>
            Pour toute question concernant votre abonnement, n'hésitez pas à{' '}
            <a href="/contact" className="underline hover:text-black">
              nous contacter
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
