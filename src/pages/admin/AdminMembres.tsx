import { useEffect, useState } from 'react';
import { adminApi, AdminMember } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search, Mail, Phone, Calendar } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AdminMembres() {
  const [members, setMembers] = useState<AdminMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const data = await adminApi.getMembers();
      setMembers(data || []);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      member.email.toLowerCase().includes(searchLower) ||
      member.firstName?.toLowerCase().includes(searchLower) ||
      member.lastName?.toLowerCase().includes(searchLower)
    );
  });

  const getMembershipStatusBadge = (status: string | undefined) => {
    if (!status || status === 'NONE') {
      return <Badge variant="outline">Aucun</Badge>;
    }
    if (status === 'ACTIVE') {
      return <Badge className="bg-green-600">Actif</Badge>;
    }
    if (status === 'CANCELED') {
      return <Badge variant="outline" className="border-orange-600 text-orange-600">Annulé</Badge>;
    }
    if (status === 'PAST_DUE') {
      return <Badge variant="outline" className="border-red-600 text-red-600">Impayé</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
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
      <div className="mb-6">
        <h2 className="text-3xl font-light mb-2">Gestion des membres</h2>
        <p className="text-black/60">{members.length} membre{members.length > 1 ? 's' : ''} enregistré{members.length > 1 ? 's' : ''}</p>
      </div>

      <Card className="border-black/10 shadow-sm mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/40 w-4 h-4" />
          <Input
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card className="border-black/10 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Abonnement</TableHead>
              <TableHead>Date d'inscription</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-black/60 py-12">
                  Aucun membre trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {member.firstName && member.lastName
                          ? `${member.firstName} ${member.lastName}`
                          : 'Nom non renseigné'}
                      </div>
                      {member.role === 'ADMIN' && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-black/40" />
                        <span>{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-black/60">
                          <Phone className="w-4 h-4 text-black/40" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getMembershipStatusBadge(member.membership?.status)}
                      {member.membership?.plan && (
                        <div className="text-xs text-black/60 mt-1">
                          {member.membership.plan}
                        </div>
                      )}
                      {member.membership?.currentPeriodEnd && member.membership.status === 'ACTIVE' && (
                        <div className="text-xs text-black/60">
                          Expire le {format(new Date(member.membership.currentPeriodEnd), 'PP', { locale: fr })}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-black/60">
                      <Calendar className="w-4 h-4 text-black/40" />
                      {format(new Date(member.createdAt), 'PP', { locale: fr })}
                    </div>
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
