import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, optionalAuth, requireAdmin } from '../middleware/auth.js';

const eventSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  location: z.string().max(300).optional(),
  dateStart: z.string().datetime(),
  dateEnd: z.string().datetime().optional().nullable(),
  capacity: z.number().int().min(0).optional(),
  isMembersOnly: z.boolean().optional(),
  priceCents: z.number().int().min(0).optional(),
  imageUrl: z.string().url().max(500).optional().nullable(),
});

const router = Router();

// GET /api/events - List published events
router.get('/', optionalAuth, async (req, res) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';

    const events = await prisma.event.findMany({
      where: isAdmin ? {} : { status: 'PUBLISHED' },
      orderBy: { dateStart: 'asc' },
      include: {
        _count: {
          select: { registrations: { where: { status: 'PAID' } } },
        },
      },
    });

    res.json(events.map(event => ({
      ...event,
      registeredCount: event._count.registrations,
      _count: undefined,
    })));
  } catch (error) {
    console.error('List events error:', error);
    res.status(500).json({ error: 'Failed to list events' });
  }
});

// GET /api/events/:slug - Get event by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: req.params.slug },
      include: {
        _count: {
          select: { registrations: { where: { status: 'PAID' } } },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Non-admin can only see published events
    if (event.status !== 'PUBLISHED' && req.user?.role !== 'ADMIN') {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      ...event,
      registeredCount: event._count.registrations,
      _count: undefined,
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// POST /api/events - Create event (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const data = eventSchema.parse(req.body);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        location: data.location,
        dateStart: new Date(data.dateStart),
        dateEnd: data.dateEnd ? new Date(data.dateEnd) : null,
        capacity: data.capacity,
        isMembersOnly: data.isMembersOnly || false,
        priceCents: data.priceCents || 0,
        imageUrl: data.imageUrl,
        status: 'DRAFT',
      },
    });

    res.status(201).json(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id - Update event (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, slug, description, location, dateStart, dateEnd, capacity, isMembersOnly, priceCents, status, imageUrl } = req.body;

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title,
        slug,
        description,
        location,
        dateStart: dateStart ? new Date(dateStart) : undefined,
        dateEnd: dateEnd ? new Date(dateEnd) : undefined,
        capacity,
        isMembersOnly,
        priceCents,
        status,
        imageUrl,
      },
    });

    res.json(event);
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - Delete event (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.event.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// POST /api/events/:id/register - Register for event
router.post('/:id/register', authenticate, async (req, res) => {
  try {
    const { quantity = 1 } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: { registrations: { where: { status: 'PAID' } } },
        },
      },
    });

    if (!event || event.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check capacity
    if (event.capacity && event._count.registrations + quantity > event.capacity) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Check if already registered
    const existing = await prisma.eventRegistration.findFirst({
      where: {
        eventId: event.id,
        userId: req.user!.id,
        status: { not: 'CANCELED' },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: req.user!.id,
        quantity,
        totalCents: event.priceCents * quantity,
        status: event.priceCents === 0 ? 'PAID' : 'PENDING',
      },
    });

    res.status(201).json(registration);
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// GET /api/events/:id/registrations - Get registrations (admin only)
router.get('/:id/registrations', authenticate, requireAdmin, async (req, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(registrations);
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Failed to get registrations' });
  }
});

export default router;
