import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// GET /api/orders/:orderId - Get order details
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.eventRegistration.findUnique({
      where: { id: orderId },
      include: {
        event: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Map to expected format
    res.json({
      id: order.id,
      eventId: order.eventId,
      userId: order.userId,
      quantity: order.quantity,
      totalAmount: order.totalCents,
      paymentStatus: order.status,
      stripeSessionId: order.stripeSessionId,
      createdAt: order.createdAt.toISOString(),
      event: {
        id: order.event.id,
        title: order.event.title,
        slug: order.event.slug,
        description: order.event.description,
        location: order.event.location,
        dateStart: order.event.dateStart.toISOString(),
        dateEnd: order.event.dateEnd?.toISOString(),
        capacity: order.event.capacity,
        isMembersOnly: order.event.isMembersOnly,
        priceCents: order.event.priceCents,
        status: order.event.status,
        imageUrl: order.event.imageUrl,
      },
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to get order' });
  }
});

// POST /api/orders/:orderId/checkout - Create Stripe checkout session
router.post('/:orderId/checkout', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.eventRegistration.findUnique({
      where: { id: orderId },
      include: { event: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (order.status === 'PAID') {
      return res.status(400).json({ error: 'Order already paid' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: order.event.title,
              description: `${order.quantity} billet(s)`,
            },
            unit_amount: order.event.priceCents,
          },
          quantity: order.quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/paiement/${orderId}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/paiement/${orderId}?canceled=true`,
      metadata: {
        orderId: order.id,
        eventId: order.eventId,
        userId: req.user!.id,
      },
    });

    // Update order with session ID
    await prisma.eventRegistration.update({
      where: { id: orderId },
      data: { stripeSessionId: session.id },
    });

    res.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/orders/:orderId/verify - Verify payment status
router.post('/:orderId/verify', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.eventRegistration.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // If already paid, return success
    if (order.status === 'PAID') {
      return res.json({ success: true, paymentStatus: 'paid' });
    }

    // Check with Stripe if we have a session ID
    if (order.stripeSessionId) {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

      if (session.payment_status === 'paid') {
        // Update order status
        await prisma.eventRegistration.update({
          where: { id: orderId },
          data: { status: 'PAID' },
        });

        // Create tickets
        const ticketsToCreate = [];
        for (let i = 0; i < order.quantity; i++) {
          ticketsToCreate.push({
            eventId: order.eventId,
            userId: order.userId,
            eventRegistrationId: order.id,
            ticketCode: generateTicketCode(),
          });
        }

        await prisma.ticket.createMany({
          data: ticketsToCreate,
        });

        // Record payment
        await prisma.payment.create({
          data: {
            userId: order.userId,
            kind: 'EVENT',
            amountCents: order.totalCents,
            currency: 'EUR',
            status: 'PAID',
            stripePaymentIntentId: session.payment_intent as string,
          },
        });

        return res.json({ success: true, paymentStatus: 'paid' });
      }
    }

    res.json({ success: false, paymentStatus: order.status.toLowerCase() });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

function generateTicketCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default router;
