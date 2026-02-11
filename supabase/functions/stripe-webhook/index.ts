import { createClient } from 'npm:@supabase/supabase-js@2.58.0';
import Stripe from 'npm:stripe@14.10.0';

// CORS configurable via variable d'environnement (mettre votre domaine en production)
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Stripe-Signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const isProduction = Deno.env.get('ENVIRONMENT') === 'production';

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    // En production, exiger la vérification du webhook
    if (isProduction && !stripeWebhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is required in production');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    // En production, toujours vérifier la signature
    if (stripeWebhookSecret) {
      if (!signature) {
        console.error('Missing stripe-signature header');
        return new Response(
          JSON.stringify({ error: 'Missing stripe-signature header' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      try {
        event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(
          JSON.stringify({ error: 'Webhook signature verification failed' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // Mode développement uniquement - sans vérification de signature
      console.warn('WARNING: Running without webhook signature verification (dev mode only)');
      event = JSON.parse(body);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      const userId = session.metadata?.user_id;
      const eventId = session.metadata?.event_id;

      if (!orderId || !userId || !eventId) {
        console.error('Missing metadata in session');
        return new Response(
          JSON.stringify({ error: 'Missing metadata' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          stripe_payment_intent: session.payment_intent as string,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        throw updateError;
      }

      const { data: order } = await supabase
        .from('orders')
        .select('quantity')
        .eq('id', orderId)
        .maybeSingle();

      if (!order) {
        throw new Error('Order not found');
      }

      const { data: existingTickets } = await supabase
        .from('tickets')
        .select('id')
        .eq('order_id', orderId);

      if (!existingTickets || existingTickets.length === 0) {
        const tickets = [];
        for (let i = 0; i < order.quantity; i++) {
          tickets.push({
            event_id: eventId,
            order_id: orderId,
            user_id: userId,
            status: 'valid',
          });
        }

        const { error: ticketsError } = await supabase
          .from('tickets')
          .insert(tickets);

        if (ticketsError) {
          console.error('Error creating tickets:', ticketsError);
          throw ticketsError;
        }

        console.log(`Generated ${tickets.length} tickets for order ${orderId}`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});