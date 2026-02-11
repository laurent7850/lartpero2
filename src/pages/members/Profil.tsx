import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().min(10, 'Téléphone invalide'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function Profil() {
  const { user, refreshProfile } = useAuth();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    if (!user?.id) {
      setError('Utilisateur non connecté');
      return;
    }

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await authApi.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      });

      await refreshProfile();
      setSuccess(true);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-black/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-light">Mon profil</CardTitle>
          <CardDescription>
            Gérez vos informations personnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {success && (
              <Alert className="bg-black text-white border-0">
                <AlertDescription>
                  Votre profil a été mis à jour avec succès.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className="border-black/20 bg-black/5"
              />
              <p className="text-sm text-black/60">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  className="border-black/20"
                />
                {errors.firstName && (
                  <p className="text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  className="border-black/20"
                />
                {errors.lastName && (
                  <p className="text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className="border-black/20"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-black/10 shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-light">Informations du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-black/60">Rôle</span>
              <span className="font-medium">
                {user?.role === 'ADMIN' ? 'Administrateur' : 'Membre'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-black/10">
              <span className="text-black/60">Membre depuis</span>
              <span className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('fr-FR')
                  : '-'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
