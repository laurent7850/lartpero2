import { createClient } from 'npm:@supabase/supabase-js@2.58.0';
import Stripe from 'npm:stripe@14.10.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
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

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
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
          paymentStatus: 'paid',
          message: 'Payment already processed'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!order.stripe_session_id) {
      return new Response(
        JSON.stringify({
          success: false,
          paymentStatus: 'pending',
          message: 'No Stripe session found'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);

    if (session.payment_status === 'paid') {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          stripe_payment_intent: session.payment_intent as string,
        })
        .eq('id', orderId);

      if (updateError) {
        throw updateError;
      }

      const { data: existingTickets } = await supabase
        .from('tickets')
        .select('id')
        .eq('order_id', orderId);

      if (!existingTickets || existingTickets.length === 0) {
        const tickets = [];
        for (let i = 0; i < order.quantity; i++) {
          tickets.push({
            event_id: order.event_id,
            order_id: orderId,
            user_id: user.id,
            status: 'valid',
          });
        }

        const { error: ticketsError } = await supabase
          .from('tickets')
          .insert(tickets);

        if (ticketsError) {
          throw ticketsError;
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          paymentStatus: 'paid',
          message: 'Payment verified and tickets created'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        paymentStatus: session.payment_status,
        message: 'Payment not completed'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});