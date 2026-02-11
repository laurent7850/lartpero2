import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = Router();

const messageSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().min(1),
  consent: z.boolean().default(false),
});

// POST /api/messages - Send a message (public)
router.post('/', async (req, res) => {
  try {
    const data = messageSchema.parse(req.body);

    const message = await prisma.message.create({
      data,
    });

    res.status(201).json({ success: true, id: message.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid data', details: error.errors });
    }
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// GET /api/messages - List messages (admin only)
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { unreadOnly } = req.query;

    const messages = await prisma.message.findMany({
      where: unreadOnly === 'true' ? { read: false } : {},
      orderBy: { createdAt: 'desc' },
    });

    res.json(messages);
  } catch (error) {
    console.error('List messages error:', error);
    res.status(500).json({ error: 'Failed to list messages' });
  }
});

// PUT /api/messages/:id/read - Mark message as read (admin only)
router.put('/:id/read', authenticate, requireAdmin, async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: req.params.id },
      data: { read: true },
    });

    res.json(message);
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// GET /api/messages/testimonials - List published testimonials (public)
router.get('/testimonials', async (_req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(testimonials);
  } catch (error) {
    console.error('List testimonials error:', error);
    res.status(500).json({ error: 'Failed to list testimonials' });
  }
});

// GET /api/messages/team - List visible team members (public)
router.get('/team', async (_req, res) => {
  try {
    const team = await prisma.teamMember.findMany({
      where: { visible: true },
      orderBy: { orderIndex: 'asc' },
    });

    res.json(team);
  } catch (error) {
    console.error('List team error:', error);
    res.status(500).json({ error: 'Failed to list team' });
  }
});

export default router;
