import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const COIN_PACKAGES = {
  small: { coins: 100, price: 999 },
  medium: { coins: 500, price: 3999 },
  large: { coins: 1000, price: 6999 },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!stripeKey) throw new Error('STRIPE_SECRET_KEY is not configured');

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-11-17.clover' as any,
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) throw new Error('Unauthorized');

    const { packageType } = await req.json();
    if (!packageType || !COIN_PACKAGES[packageType]) {
      throw new Error('Invalid package type');
    }

    const pkg = COIN_PACKAGES[packageType];
    let appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    appUrl = appUrl.replace(/\/$/, '');

    const customers = await stripe.customers.list({ email: user.email!, limit: 1 });
    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId: user.id, platform: 'snapreme' },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${pkg.coins} Coins`,
            description: 'Snapreme coins for messages, tips, and gifts',
          },
          unit_amount: pkg.price,
        },
        quantity: 1,
      }],
      success_url: `${appUrl}?coins=success`,
      cancel_url: `${appUrl}?coins=cancelled`,
      metadata: {
        userId: user.id,
        packageType,
        coins: pkg.coins.toString(),
        type: 'coin_purchase',
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'An unexpected error occurred' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});