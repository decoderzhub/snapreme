import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
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

    const { packageId } = await req.json();
    if (!packageId) throw new Error('Package ID is required');

    const { data: pkg, error: pkgError } = await supabase
      .from('content_packages')
      .select('*, creator:creators!inner(id, stripe_connect_id, display_name, handle)')
      .eq('id', packageId)
      .single();

    if (pkgError || !pkg) throw new Error('Package not found');

    const creator = (pkg as any).creator;
    if (!creator.stripe_connect_id) {
      throw new Error('Creator has not connected Stripe yet');
    }

    let appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';
    appUrl = appUrl.replace(/\/$/, '');
    const cleanHandle = creator.handle?.replace('@', '') || '';

    let customerId: string | null = null;
    const existingCustomers = await stripe.customers.list(
      { email: user.email!, limit: 1 },
      { stripeAccount: creator.stripe_connect_id }
    );

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create(
        { email: user.email!, metadata: { fanId: user.id, platform: 'snapreme' } },
        { stripeAccount: creator.stripe_connect_id }
      );
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer: customerId,
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: pkg.title,
            description: pkg.description || pkg.includes_summary || 'Content package',
          },
          unit_amount: pkg.price_cents,
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: Math.floor(pkg.price_cents * 0.1),
        metadata: { packageId, fanId: user.id, creatorId: creator.id, type: 'package_purchase' },
      },
      success_url: `${appUrl}/creator/${cleanHandle}?unlocked=true&packageId=${packageId}`,
      cancel_url: `${appUrl}/creator/${cleanHandle}`,
      metadata: { packageId, fanId: user.id, creatorId: creator.id, type: 'package_purchase' },
    }, { stripeAccount: creator.stripe_connect_id });

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