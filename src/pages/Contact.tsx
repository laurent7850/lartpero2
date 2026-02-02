import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter la politique de confidentialité',
  }),
});

type ContactForm = z.infer<typeof contactSchema>;

export function Contact() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  });

  const consent = watch('consent');

  const onSubmit = async (data: ContactForm) => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error: insertError } = await supabase.from('messages').insert([
        {
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          subject: data.subject || null,
          body: data.body,
          consent: data.consent,
        },
      ]);

      if (insertError) throw insertError;

      setSuccess(true);
      reset();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-light mb-8 text-center">
          Nous contacter
        </h1>

        <p className="text-xl text-center text-black/70 mb-12">
          Une idée, une question, une envie de collaborer ou simplement de nous dire bonjour ? 💌
          <br />
          A l'ArtPéro, on adore les échanges vrais, alors n'hésite pas à nous écrire.
          <br />
          Que ce soit pour en savoir plus sur nos soirées, proposer un lieu, un partenariat ou juste partager ton amour de l'art et des apéros.
          <br />
          Laisse-nous un message, on te répondra avec plaisir 😊
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {success && (
            <Alert className="bg-black text-white border-0">
              <AlertDescription>
                Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                {...register('name')}
                className="border-black/20"
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="border-black/20"
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                className="border-black/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                {...register('subject')}
                className="border-black/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              rows={8}
              {...register('body')}
              className="border-black/20 resize-none"
            />
            {errors.body && (
              <p className="text-sm text-red-600">{errors.body.message}</p>
            )}
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setValue('consent', checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
              J'accepte que mes données personnelles soient collectées et traitées
              conformément à la{' '}
              <a href="/confidentialite" className="underline hover:text-black/60">
                politique de confidentialité
              </a>{' '}
              *
            </Label>
          </div>
          {errors.consent && (
            <p className="text-sm text-red-600">{errors.consent.message}</p>
          )}

          <Button type="submit" size="lg" className="w-full md:w-auto" disabled={loading}>
            {loading ? 'Envoi en cours...' : 'Envoyer le message'}
          </Button>
        </form>
      </div>
    </div>
  );
}
