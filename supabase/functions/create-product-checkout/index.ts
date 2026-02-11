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

    const { productId, quantity = 1, recipientEmail, recipientName } = await req.json();

    if (!productId) {
      return new Response(
        JSON.stringify({ error: 'productId is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .maybeSingle();

    if (productError || !product) {
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const totalAmount = product.price_cents * quantity;

    // Generate gift code for gift cards
    let giftCode = null;
    let expiresAt = null;
    if (product.category === 'gift_card') {
      giftCode = `GIFT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const validityMonths = product.metadata?.validity_months || 6;
      expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + validityMonths);
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('product_orders')
      .insert({
        product_id: productId,
        user_id: user.id,
        quantity,
        total_amount: totalAmount,
        payment_status: 'pending',
        recipient_email: recipientEmail || null,
        recipient_name: recipientName || null,
        gift_code: giftCode,
        expires_at: expiresAt,
        metadata: {
          product_name: product.name,
          product_category: product.category,
        },
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const origin = req.headers.get('origin') || 'https://lartpero.com';
    const successUrl = `${origin}/paiement-produit/${order.id}?success=true`;
    const cancelUrl = `${origin}/paiement-produit/${order.id}?canceled=true`;

    // Determine if subscription or one-time payment
    const isSubscription = product.category === 'subscription' && product.stripe_price_id;

    let session;
    if (isSubscription && product.stripe_price_id) {
      // Recurring subscription via Stripe Price
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: product.stripe_price_id,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          order_id: order.id,
          user_id: user.id,
          product_id: product.id,
          product_category: product.category,
        },
      });
    } else {
      // One-time payment
      let productDescription = product.description || product.name;
      if (product.category === 'gift_card' && recipientName) {
        productDescription = `Carte cadeau pour ${recipientName}`;
      }

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: product.name,
                description: productDescription,
              },
              unit_amount: product.price_cents,
            },
            quantity: quantity,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          order_id: order.id,
          user_id: user.id,
          product_id: product.id,
          product_category: product.category,
          gift_code: giftCode || '',
        },
      });
    }

    // Update order with Stripe session ID
    await supabase
      .from('product_orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({
        sessionUrl: session.url,
        orderId: order.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error creating product checkout session:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
