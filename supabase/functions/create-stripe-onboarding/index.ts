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

    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, stripe_connect_id, is_stripe_connected')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creatorError || !creator) {
      throw new Error('Creator profile not found');
    }

    let accountId = creator.stripe_connect_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email!,
        capabilities: {
          transfers: { requested: true },
        },
        metadata: {
          creatorId: creator.id,
        },
      });
      accountId = account.id;

      await supabase
        .from('creators')
        .update({ stripe_connect_id: accountId })
        .eq('id', creator.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/dashboard/monetization`,
      return_url: `${appUrl}/dashboard/monetization?connected=true`,
      type: 'account_onboarding',
    });

    if (req.url.includes('connected=true') && !creator.is_stripe_connected) {
      const account = await stripe.accounts.retrieve(accountId);
      if (account.details_submitted) {
        await supabase
          .from('creators')
          .update({ is_stripe_connected: true })
          .eq('id', creator.id);
      }
    }

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Error creating onboarding link:', err);
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
