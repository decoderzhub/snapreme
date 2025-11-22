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
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return new Response(
          JSON.stringify({ error: 'Webhook signature verification failed' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      event = JSON.parse(body);
    }

    console.log('Webhook event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { creatorId, fanId } = session.metadata || {};

        if (creatorId && fanId) {
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              fan_id: fanId,
              creator_id: creatorId,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              is_active: true,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'fan_id,creator_id',
            });

          if (error) {
            console.error('Error creating subscription:', error);
          } else {
            await supabase
              .from('creators')
              .update({
                subscribers: supabase.sql`subscribers + 1`,
              })
              .eq('id', creatorId);
          }
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const { creatorId, fanId } = subscription.metadata || {};

        if (creatorId && fanId) {
          const isActive = subscription.status === 'active';

          const { error } = await supabase
            .from('subscriptions')
            .update({
              is_active: isActive,
              updated_at: new Date().toISOString(),
            })
            .eq('fan_id', fanId)
            .eq('creator_id', creatorId);

          if (error) {
            console.error('Error updating subscription:', error);
          } else if (!isActive) {
            await supabase
              .from('creators')
              .update({
                subscribers: supabase.sql`GREATEST(subscribers - 1, 0)`,
              })
              .eq('id', creatorId);
          }
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
