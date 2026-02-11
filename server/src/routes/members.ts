import { Router } from 'express';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/members/membership - Get current user's membership
router.get('/membership', authenticate, async (req, res) => {
  try {
    const membership = await prisma.membership.findUnique({
      where: { userId: req.user!.id },
    });

    res.json(membership);
  } catch (error) {
    console.error('Get membership error:', error);
    res.status(500).json({ error: 'Failed to get membership' });
  }
});

// GET /api/members/tickets - Get user's tickets
router.get('/tickets', authenticate, async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { userId: req.user!.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            dateStart: true,
            location: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tickets);
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({ error: 'Failed to get tickets' });
  }
});

// GET /api/members/registrations - Get user's event registrations
router.get('/registrations', authenticate, async (req, res) => {
  try {
    const registrations = await prisma.eventRegistration.findMany({
      where: { userId: req.user!.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            dateStart: true,
            location: true,
            imageUrl: true,
            priceCents: true,
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

// GET /api/members/payments - Get user's payment history
router.get('/payments', authenticate, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to get payments' });
  }
});

// POST /api/members/redeem-gift - Redeem a gift code
router.post('/redeem-gift', authenticate, async (req, res) => {
  try {
    const { giftCode } = req.body;

    if (!giftCode) {
      return res.status(400).json({ error: 'Gift code required' });
    }

    // Find the gift card order
    const giftOrder = await prisma.productOrder.findFirst({
      where: {
        giftCode: giftCode.toUpperCase(),
        paymentStatus: 'PAID',
        giftCodeUsed: false,
      },
      include: { product: true },
    });

    if (!giftOrder) {
      return res.status(404).json({ error: 'Invalid or already used gift code' });
    }

    // Check expiry
    if (giftOrder.expiresAt && new Date() > giftOrder.expiresAt) {
      return res.status(400).json({ error: 'Gift code has expired' });
    }

    // Mark as used
    await prisma.productOrder.update({
      where: { id: giftOrder.id },
      data: { giftCodeUsed: true },
    });

    // Grant the benefit (e.g., event entries)
    // This could be more sophisticated based on product type
    const eventsIncluded = giftOrder.product?.eventsIncluded || 1;

    res.json({
      success: true,
      message: `Gift code redeemed! You now have ${eventsIncluded} event credit(s).`,
      eventsIncluded,
    });
  } catch (error) {
    console.error('Redeem gift error:', error);
    res.status(500).json({ error: 'Failed to redeem gift code' });
  }
});

export default router;
