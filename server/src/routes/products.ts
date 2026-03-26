import { Router } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

// GET /api/products - List active products
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { priceCents: 'asc' },
      ],
    });

    res.json(products);
  } catch (error) {
    console.error('List products error:', error);
    res.status(500).json({ error: 'Failed to list products' });
  }
});

// GET /api/products/:slug - Get product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// POST /api/products/checkout - Create checkout session
router.post('/checkout', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1, recipientName, recipientEmail } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create product order
    const order = await prisma.productOrder.create({
      data: {
        productId: product.id,
        userId: req.user!.id,
        quantity,
        totalAmount: product.priceCents * quantity,
        recipientName: product.category === 'GIFT_CARD' ? recipientName : null,
        recipientEmail: product.category === 'GIFT_CARD' ? recipientEmail : null,
        paymentStatus: 'PENDING',
      },
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.name,
              description: product.description || undefined,
            },
            unit_amount: product.priceCents,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/paiement-produit/${order.id}?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/paiement-produit/${order.id}?canceled=true`,
      metadata: {
        orderId: order.id,
        productId: product.id,
        userId: req.user!.id,
        type: 'product',
      },
    });

    // Update order with session ID
    await prisma.productOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    res.json({
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout' });
  }
});

// POST /api/products/verify-payment - Verify payment
router.post('/verify-payment', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await prisma.productOrder.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Already paid
    if (order.paymentStatus === 'PAID') {
      return res.json({ success: true, order });
    }

    // Check Stripe session
    if (!order.stripeSessionId) {
      return res.status(400).json({ error: 'No payment session' });
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);

    if (session.payment_status === 'paid') {
      // Generate gift code if gift card
      let giftCode: string | null = null;
      let expiresAt: Date | null = null;

      if (order.product?.category === 'GIFT_CARD') {
        giftCode = generateGiftCode();
        const validityMonths = (order.product.metadata as any)?.validity_months || 6;
        expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + validityMonths);
      }

      // Update order
      const updatedOrder = await prisma.productOrder.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          stripePaymentIntent: session.payment_intent as string,
          giftCode,
          expiresAt,
        },
        include: { product: true },
      });

      // Create payment record
      await prisma.payment.create({
        data: {
          userId: order.userId,
          kind: 'product',
          amountCents: order.totalAmount,
          stripePaymentIntentId: session.payment_intent as string,
          status: 'succeeded',
          metadata: {
            productId: order.productId,
            orderId: order.id,
          },
        },
      });

      // If subscription, activate membership
      if (order.product?.category === 'SUBSCRIPTION') {
        await prisma.membership.upsert({
          where: { userId: order.userId },
          create: {
            userId: order.userId,
            status: 'ACTIVE',
            plan: order.product.slug,
            currentPeriodEnd: calculatePeriodEnd(order.product.durationMonths || 1),
          },
          update: {
            status: 'ACTIVE',
            plan: order.product.slug,
            currentPeriodEnd: calculatePeriodEnd(order.product.durationMonths || 1),
          },
        });
      }

      return res.json({ success: true, order: updatedOrder });
    }

    res.json({ success: false, status: session.payment_status });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// GET /api/products/orders - Get user's orders
router.get('/orders', authenticate, async (req, res) => {
  try {
    const orders = await prisma.productOrder.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

function generateGiftCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ART-';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function calculatePeriodEnd(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

export default router;
