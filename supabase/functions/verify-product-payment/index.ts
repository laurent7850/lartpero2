import { createClient } from 'npm:@supabase/supabase-js@2.58.0';
import Stripe from 'npm:stripe@14.10.0';

// CORS configurable via variable d'environnement (mettre votre domaine en production)
const allowedOrigin = Deno.env.get('ALLOWED_ORIGIN') || '*';

const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
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

    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'orderId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('product_orders')
      .select('*, products(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (order.payment_status === 'paid') {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment already confirmed',
          order: order,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!order.stripe_session_id) {
      return new Response(
        JSON.stringify({ error: 'No Stripe session found for this order' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);

    if (session.payment_status === 'paid') {
      // Update order status
      const { error: updateError } = await supabase
        .from('product_orders')
        .update({
          payment_status: 'paid',
          stripe_payment_intent: session.payment_intent as string,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order:', updateError);
        throw new Error('Failed to update order status');
      }

      const product = order.products;

      // Handle subscription activation
      if (product?.category === 'subscription') {
        const periodEnd = new Date();
        periodEnd.setMonth(periodEnd.getMonth() + (product.duration_months || 1));

        // Check if membership exists
        const { data: existingMembership } = await supabase
          .from('memberships')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingMembership) {
          // Update existing membership
          await supabase
            .from('memberships')
            .update({
              status: 'active',
              plan: product.slug,
              current_period_end: periodEnd.toISOString(),
            })
            .eq('user_id', user.id);
        } else {
          // Create new membership
          await supabase
            .from('memberships')
            .insert({
              user_id: user.id,
              status: 'active',
              plan: product.slug,
              current_period_end: periodEnd.toISOString(),
            });
        }
      }

      // Record in payments table
      await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          kind: product?.category === 'subscription' ? 'subscription' : 'event',
          amount_cents: order.total_amount,
          currency: 'eur',
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'paid',
          metadata: {
            product_id: product?.id,
            product_name: product?.name,
            product_category: product?.category,
            order_id: orderId,
            gift_code: order.gift_code,
          },
        });

      // Get updated order
      const { data: updatedOrder } = await supabase
        .from('product_orders')
        .select('*, products(*)')
        .eq('id', orderId)
        .single();

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment confirmed',
          order: updatedOrder,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Payment not completed',
          paymentStatus: session.payment_status,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error: any) {
    console.error('Error verifying product payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
