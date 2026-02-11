import { Router, raw } from 'express';
import Stripe from 'stripe';
import { prisma } from '../index.js';

const router = Router();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// POST /api/webhook/stripe
router.post('/stripe', raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Development mode - no signature verification
      event = JSON.parse(req.body.toString()) as Stripe.Event;
      console.warn('⚠️ Webhook signature verification skipped (dev mode)');
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const metadata = session.metadata || {};
  const { orderId, type } = metadata;

  if (type === 'product' && orderId) {
    const order = await prisma.productOrder.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (order && order.paymentStatus !== 'PAID') {
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
      await prisma.productOrder.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          stripePaymentIntent: session.payment_intent as string,
          giftCode,
          expiresAt,
        },
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

      console.log(`✅ Product order ${orderId} marked as paid`);
    }
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const membership = await prisma.membership.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!membership) {
    console.warn(`No membership found for customer ${customerId}`);
    return;
  }

  const status = subscription.status === 'active' ? 'ACTIVE' :
                 subscription.status === 'past_due' ? 'PAST_DUE' :
                 subscription.status === 'canceled' ? 'CANCELED' : 'NONE';

  await prisma.membership.update({
    where: { id: membership.id },
    data: {
      status,
      stripeSubscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  console.log(`✅ Membership ${membership.id} updated to ${status}`);
}

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
