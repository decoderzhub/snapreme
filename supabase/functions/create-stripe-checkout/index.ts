import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { creatorId } = await req.json();

    if (!creatorId) {
      throw new Error('Creator ID is required');
    }

    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, user_id, display_name, name, handle, stripe_connect_id, subscription_price')
      .eq('id', creatorId)
      .maybeSingle();

    if (creatorError || !creator) {
      throw new Error('Creator not found');
    }

    if (!creator.stripe_connect_id) {
      throw new Error('Creator has not connected Stripe');
    }

    let customerId: string | null = null;

    const { data: fanProfile } = await supabase
      .from('fan_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (fanProfile?.stripe_customer_id) {
      customerId = fanProfile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { fanId: user.id },
      });
      customerId = customer.id;

      await supabase
        .from('fan_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          stripe_customer_id: customerId,
        });
    }

    const priceCents = Math.round((creator.subscription_price || 5) * 100);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: priceCents,
            recurring: { interval: 'month' },
            product_data: {
              name: `${creator.display_name || creator.name}'s Premium Content`,
              description: `Monthly subscription to unlock ${creator.display_name || creator.name}'s Snapchat`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/creator/${creator.handle}?unlocked=true`,
      cancel_url: `${appUrl}/creator/${creator.handle}`,
      subscription_data: {
        application_fee_percent: 10,
        transfer_data: {
          destination: creator.stripe_connect_id,
        },
        metadata: {
          creatorId: creator.id,
          fanId: user.id,
        },
      },
      metadata: {
        creatorId: creator.id,
        fanId: user.id,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
