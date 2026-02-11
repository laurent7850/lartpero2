import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalMembers,
      activeMembers,
      totalEvents,
      upcomingEvents,
      payments,
      monthPayments,
      totalRegistrations,
      topEventsData,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.membership.count({ where: { status: 'ACTIVE' } }),
      prisma.event.count(),
      prisma.event.count({
        where: {
          dateStart: { gte: now },
          status: 'PUBLISHED',
        },
      }),
      prisma.payment.aggregate({ _sum: { amountCents: true } }),
      prisma.payment.aggregate({
        where: { createdAt: { gte: firstOfMonth } },
        _sum: { amountCents: true },
      }),
      prisma.eventRegistration.count({ where: { status: 'PAID' } }),
      prisma.eventRegistration.groupBy({
        by: ['eventId'],
        where: { status: 'PAID' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Get event titles for top events
    const eventIds = topEventsData.map(e => e.eventId);
    const events = await prisma.event.findMany({
      where: { id: { in: eventIds } },
      select: { id: true, title: true },
    });

    const eventMap = new Map(events.map(e => [e.id, e.title]));
    const topEvents = topEventsData.map(e => ({
      title: eventMap.get(e.eventId) || 'Unknown',
      registrations: e._count.id,
    }));

    res.json({
      totalMembers,
      activeMembers,
      totalEvents,
      upcomingEvents,
      totalRevenue: payments._sum.amountCents || 0,
      monthRevenue: monthPayments._sum.amountCents || 0,
      totalRegistrations,
      topEvents,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Members list
router.get('/members', async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        membership: {
          select: {
            status: true,
            plan: true,
            currentPeriodEnd: true,
          },
        },
      },
    });

    res.json(members.map(m => ({
      id: m.id,
      email: m.email,
      firstName: m.firstName,
      lastName: m.lastName,
      phone: m.phone,
      role: m.role,
      createdAt: m.createdAt.toISOString(),
      membership: m.membership ? {
        status: m.membership.status,
        plan: m.membership.plan,
        currentPeriodEnd: m.membership.currentPeriodEnd?.toISOString(),
      } : null,
    })));
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Events list
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.event.findMany({
      orderBy: { dateStart: 'desc' },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: 'PAID' },
            },
          },
        },
      },
    });

    res.json(events.map(e => ({
      id: e.id,
      title: e.title,
      slug: e.slug,
      description: e.description,
      location: e.location,
      dateStart: e.dateStart.toISOString(),
      dateEnd: e.dateEnd?.toISOString(),
      capacity: e.capacity,
      isMembersOnly: e.isMembersOnly,
      priceCents: e.priceCents,
      status: e.status,
      imageUrl: e.imageUrl,
      registrationsCount: e._count.registrations,
    })));
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Create event
router.post('/events', async (req, res) => {
  try {
    const { title, slug, description, location, dateStart, dateEnd, capacity, isMembersOnly, priceCents, status, imageUrl } = req.body;

    const event = await prisma.event.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        location,
        dateStart: new Date(dateStart),
        dateEnd: dateEnd ? new Date(dateEnd) : null,
        capacity,
        isMembersOnly: isMembersOnly || false,
        priceCents: priceCents || 0,
        status: status || 'DRAFT',
        imageUrl,
      },
    });

    res.json({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      location: event.location,
      dateStart: event.dateStart.toISOString(),
      dateEnd: event.dateEnd?.toISOString(),
      capacity: event.capacity,
      isMembersOnly: event.isMembersOnly,
      priceCents: event.priceCents,
      status: event.status,
      imageUrl: event.imageUrl,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, description, location, dateStart, dateEnd, capacity, isMembersOnly, priceCents, status, imageUrl } = req.body;

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        location,
        dateStart: dateStart ? new Date(dateStart) : undefined,
        dateEnd: dateEnd ? new Date(dateEnd) : null,
        capacity,
        isMembersOnly,
        priceCents,
        status,
        imageUrl,
      },
    });

    res.json({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      location: event.location,
      dateStart: event.dateStart.toISOString(),
      dateEnd: event.dateEnd?.toISOString(),
      capacity: event.capacity,
      isMembersOnly: event.isMembersOnly,
      priceCents: event.priceCents,
      status: event.status,
      imageUrl: event.imageUrl,
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.event.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Payments list
router.get('/payments', async (req, res) => {
  try {
    const { kind } = req.query;

    const where: any = {};
    if (kind && kind !== 'all') {
      where.kind = kind;
    }

    const payments = await prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(payments.map(p => ({
      id: p.id,
      userId: p.userId,
      kind: p.kind,
      amountCents: p.amountCents,
      currency: p.currency,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      user: {
        email: p.user.email,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
      },
    })));
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Products list
router.get('/products', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(products.map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      category: p.category,
      priceCents: p.priceCents,
      durationMonths: p.durationMonths,
      eventsIncluded: p.eventsIncluded,
      isActive: p.isActive,
      metadata: p.metadata,
    })));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const { name, slug, description, category, priceCents, durationMonths, eventsIncluded, isActive, metadata } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        category,
        priceCents,
        durationMonths,
        eventsIncluded,
        isActive: isActive ?? true,
        metadata,
      },
    });

    res.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      priceCents: product.priceCents,
      durationMonths: product.durationMonths,
      eventsIncluded: product.eventsIncluded,
      isActive: product.isActive,
      metadata: product.metadata,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, category, priceCents, durationMonths, eventsIncluded, isActive, metadata } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        category,
        priceCents,
        durationMonths,
        eventsIncluded,
        isActive,
        metadata,
      },
    });

    res.json({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      category: product.category,
      priceCents: product.priceCents,
      durationMonths: product.durationMonths,
      eventsIncluded: product.eventsIncluded,
      isActive: product.isActive,
      metadata: product.metadata,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Messages list
router.get('/messages', async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages.map((m: { id: string; name: string; email: string; phone: string | null; subject: string | null; body: string; createdAt: Date }) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      subject: m.subject,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })));
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

export default router;
