import { useState, useEffect } from 'react';
import { Event, adminApi } from '@/lib/api';
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
    dateStart: '',
    dateEnd: '',
    capacity: '',
    isMembersOnly: false,
    priceCents: '',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    imageUrl: '',
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        slug: event.slug,
        description: event.description || '',
        location: event.location || '',
        dateStart: event.dateStart.slice(0, 16),
        dateEnd: event.dateEnd ? event.dateEnd.slice(0, 16) : '',
        capacity: event.capacity?.toString() || '',
        isMembersOnly: event.isMembersOnly,
        priceCents: (event.priceCents / 100).toString(),
        status: event.status,
        imageUrl: event.imageUrl || '',
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        description: '',
        location: '',
        dateStart: '',
        dateEnd: '',
        capacity: '',
        isMembersOnly: false,
        priceCents: '0',
        status: 'DRAFT',
        imageUrl: '',
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
        description: formData.description || undefined,
        location: formData.location || undefined,
        dateStart: new Date(formData.dateStart).toISOString(),
        dateEnd: formData.dateEnd ? new Date(formData.dateEnd).toISOString() : undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        isMembersOnly: formData.isMembersOnly,
        priceCents: Math.round(parseFloat(formData.priceCents) * 100),
        status: formData.status,
        imageUrl: formData.imageUrl || undefined,
      };

      if (event) {
        await adminApi.updateEvent(event.id, eventData);

        toast({
          title: 'Événement modifié',
          description: 'Les modifications ont été enregistrées avec succès.',
        });
      } else {
        await adminApi.createEvent(eventData);

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
              <Label htmlFor="dateStart">Date de début *</Label>
              <Input
                id="dateStart"
                type="datetime-local"
                value={formData.dateStart}
                onChange={(e) => setFormData({ ...formData, dateStart: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateEnd">Date de fin</Label>
              <Input
                id="dateEnd"
                type="datetime-local"
                value={formData.dateEnd}
                onChange={(e) => setFormData({ ...formData, dateEnd: e.target.value })}
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
              <Label htmlFor="priceCents">Prix (€) *</Label>
              <Input
                id="priceCents"
                type="number"
                step="0.01"
                min="0"
                value={formData.priceCents}
                onChange={(e) => setFormData({ ...formData, priceCents: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL de l'image</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'DRAFT' | 'PUBLISHED') =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Brouillon</SelectItem>
                <SelectItem value="PUBLISHED">Publié</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isMembersOnly"
              checked={formData.isMembersOnly}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, isMembersOnly: checked })
              }
            />
            <Label htmlFor="isMembersOnly" className="cursor-pointer">
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
