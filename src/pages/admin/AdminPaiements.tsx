import { useEffect, useState } from 'react';
import { adminApi, AdminPayment } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreditCard, TrendingUp, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AdminPaiements() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'subscription' | 'event'>('all');
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      const data = await adminApi.getPayments(filter);
      setPayments(data || []);

      const total = (data || []).reduce((sum, payment) => sum + payment.amountCents, 0);
      setTotalRevenue(total);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'succeeded' || status === 'paid' || status === 'PAID') {
      return <Badge className="bg-green-600">Payé</Badge>;
    }
    if (status === 'pending' || status === 'PENDING') {
      return <Badge variant="outline" className="border-orange-600 text-orange-600">En attente</Badge>;
    }
    if (status === 'failed' || status === 'canceled' || status === 'FAILED') {
      return <Badge variant="outline" className="border-red-600 text-red-600">Échoué</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getKindBadge = (kind: string) => {
    if (kind === 'subscription' || kind === 'SUBSCRIPTION') {
      return <Badge variant="outline">Abonnement</Badge>;
    }
    if (kind === 'event' || kind === 'EVENT') {
      return <Badge variant="outline">Événement</Badge>;
    }
    return <Badge variant="outline">{kind}</Badge>;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Client', 'Email', 'Type', 'Montant', 'Devise', 'Statut'];
    const csvData = payments.map(payment => [
      format(new Date(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
      payment.user.firstName && payment.user.lastName
        ? `${payment.user.firstName} ${payment.user.lastName}`
        : 'N/A',
      payment.user.email,
      payment.kind === 'subscription' || payment.kind === 'SUBSCRIPTION' ? 'Abonnement' : payment.kind === 'event' || payment.kind === 'EVENT' ? 'Événement' : payment.kind,
      (payment.amountCents / 100).toFixed(2),
      payment.currency.toUpperCase(),
      payment.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `paiements-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light mb-2">Gestion des paiements</h2>
          <p className="text-black/60">{payments.length} paiement{payments.length > 1 ? 's' : ''}</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter en CSV
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card className="border-black/10 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/60 mb-1">Revenus totaux</p>
              <p className="text-3xl font-light">{(totalRevenue / 100).toFixed(2)} €</p>
            </div>
            <CreditCard className="w-10 h-10 text-black/20" />
          </div>
        </Card>

        <Card className="border-black/10 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-black/60 mb-1">Nombre de transactions</p>
              <p className="text-3xl font-light">{payments.length}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-black/20" />
          </div>
        </Card>
      </div>

      <Card className="border-black/10 shadow-sm mb-6 p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Filtrer par type :</span>
          <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="subscription">Abonnements</SelectItem>
              <SelectItem value="event">Événements</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="border-black/10 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-black/60 py-12">
                  Aucun paiement trouvé
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-sm text-black/60">
                    {format(new Date(payment.createdAt), 'PP à HH:mm', { locale: fr })}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {payment.user.firstName && payment.user.lastName
                          ? `${payment.user.firstName} ${payment.user.lastName}`
                          : payment.user.email}
                      </div>
                      {payment.user.firstName && payment.user.lastName && (
                        <div className="text-sm text-black/60">{payment.user.email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getKindBadge(payment.kind)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {(payment.amountCents / 100).toFixed(2)} {payment.currency.toUpperCase()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(payment.status)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
