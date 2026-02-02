import { useState, useEffect } from 'react';
import { Event, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EventFormProps {
  event?: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EventForm({ event, open, onOpenChange, onSuccess }: EventFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    location: '',
    date_start: '',
    date_end: '',
    capacity: '',
    is_members_only: false,
    price_cents: '',
    status: 'draft' as 'draft' | 'published',
    image_url: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        slug: event.slug,
        description: event.description || '',
        location: event.location || '',
        date_start: event.date_start.slice(0, 16),
        date_end: event.date_end ? event.date_end.slice(0, 16) : '',
        capacity: event.capacity?.toString() || '',
        is_members_only: event.is_members_only,
        price_cents: (event.price_cents / 100).toString(),
        status: event.status,
        image_url: event.image_url || '',
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        location: '',
        date_start: '',
        date_end: '',
        capacity: '',
        is_members_only: false,
        price_cents: '0',
        status: 'draft',
        image_url: '',
      });
    }
  }, [event, open]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !event ? generateSlug(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const eventData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description || null,
        location: formData.location || null,
        date_start: new Date(formData.date_start).toISOString(),
        date_end: formData.date_end ? new Date(formData.date_end).toISOString() : null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        is_members_only: formData.is_members_only,
        price_cents: Math.round(parseFloat(formData.price_cents) * 100),
        status: formData.status,
        image_url: formData.image_url || null,
      };

      if (event) {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);

        if (error) throw error;

        toast({
          title: 'Événement modifié',
          description: 'Les modifications ont été enregistrées avec succès.',
        });
      } else {
        const { error } = await supabase.from('events').insert([eventData]);

        if (error) throw error;

        toast({
          title: 'Événement créé',
          description: "L'événement a été créé avec succès.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: 'Erreur',
        description: error.message || "Une erreur s'est produite lors de l'enregistrement.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Modifier l\'événement' : 'Nouvel événement'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_start">Date de début *</Label>
              <Input
                id="date_start"
                type="datetime-local"
                value={formData.date_start}
                onChange={(e) => setFormData({ ...formData, date_start: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_end">Date de fin</Label>
              <Input
                id="date_end"
                type="datetime-local"
                value={formData.date_end}
                onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacité</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_cents">Prix (€) *</Label>
              <Input
                id="price_cents"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_cents}
                onChange={(e) => setFormData({ ...formData, price_cents: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de l'image</Label>
            <Input
              id="image_url"
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'draft' | 'published') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="published">Publié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_members_only"
              checked={formData.is_members_only}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_members_only: checked })
              }
            />
            <Label htmlFor="is_members_only" className="cursor-pointer">
              Réservé aux membres uniquement
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : event ? 'Modifier' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
