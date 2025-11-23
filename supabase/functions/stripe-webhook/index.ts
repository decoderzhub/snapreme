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
      throw new Error('STRIPE_SECRET_KEY not configured. Please add it to Supabase Edge Function secrets.');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-11-17.clover',
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
      console.warn('No webhook secret configured - events are not verified. Add STRIPE_WEBHOOK_SECRET for production.');
      event = JSON.parse(body);
    }

    console.log('Processing webhook event:', event.type, 'ID:', event.id);

    const { data: existingEvent } = await supabase
      .from('stripe_events')
      .select('id, processed')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (existingEvent?.processed) {
      console.log('Event already processed:', event.id);
      return new Response(
        JSON.stringify({ received: true, message: 'Event already processed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const eventRecord = {
      stripe_event_id: event.id,
      event_type: event.type,
      data: event as any,
      processed: false,
      attempts: existingEvent ? (existingEvent as any).attempts + 1 : 1,
    };

    if (!existingEvent) {
      await supabase.from('stripe_events').insert(eventRecord);
    } else {
      await supabase
        .from('stripe_events')
        .update({ attempts: eventRecord.attempts })
        .eq('stripe_event_id', event.id);
    }

    try {
      await processWebhookEvent(event, supabase, stripe);

      await supabase
        .from('stripe_events')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
          error_message: null
        })
        .eq('stripe_event_id', event.id);

      console.log('Successfully processed event:', event.id);
    } catch (processingError) {
      console.error('Error processing event:', processingError);

      await supabase
        .from('stripe_events')
        .update({
          error_message: processingError.message
        })
        .eq('stripe_event_id', event.id);

      throw processingError;
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

async function processWebhookEvent(
  event: Stripe.Event,
  supabase: any,
  stripe: Stripe
) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event, supabase);
      break;

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionEvent(event, supabase);
      break;

    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled':
      await handlePaymentIntentEvent(event, supabase);
      break;

    case 'charge.succeeded':
    case 'charge.failed':
    case 'charge.refunded':
      await handleChargeEvent(event, supabase);
      break;

    case 'payout.created':
    case 'payout.updated':
    case 'payout.paid':
    case 'payout.failed':
      await handlePayoutEvent(event, supabase);
      break;

    case 'charge.dispute.created':
    case 'charge.dispute.updated':
    case 'charge.dispute.closed':
      await handleDisputeEvent(event, supabase);
      break;

    case 'account.updated':
      await handleAccountUpdated(event, supabase);
      break;

    case 'customer.created':
    case 'customer.updated':
      await handleCustomerEvent(event, supabase);
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }
}

async function handleCheckoutSessionCompleted(event: Stripe.Event, supabase: any) {
  const session = event.data.object as Stripe.Checkout.Session;
  const { creatorId, fanId } = session.metadata || {};

  if (!creatorId || !fanId) {
    console.warn('Missing metadata in checkout session:', session.id);
    return;
  }

  const { error: subError } = await supabase
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

  if (subError) {
    console.error('Error creating subscription:', subError);
    throw subError;
  }

  await supabase
    .from('creators')
    .update({
      subscribers: supabase.sql`subscribers + 1`,
    })
    .eq('id', creatorId);

  console.log('Checkout completed for fan:', fanId, 'creator:', creatorId);
}

async function handleSubscriptionEvent(event: Stripe.Event, supabase: any) {
  const subscription = event.data.object as Stripe.Subscription;
  const { creatorId, fanId } = subscription.metadata || {};

  const { data: creatorData } = await supabase
    .from('creators')
    .select('user_id')
    .eq('id', creatorId)
    .maybeSingle();

  const creatorUserId = creatorData?.user_id;

  await supabase
    .from('stripe_subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      user_id: fanId || null,
      creator_id: creatorUserId || null,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
      ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      amount: subscription.items.data[0]?.price?.unit_amount || 0,
      currency: subscription.currency,
      data: subscription as any,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    });

  if (creatorId && fanId) {
    const isActive = subscription.status === 'active';

    await supabase
      .from('subscriptions')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('fan_id', fanId)
      .eq('creator_id', creatorId);

    if (event.type === 'customer.subscription.deleted' || !isActive) {
      await supabase
        .from('creators')
        .update({
          subscribers: supabase.sql`GREATEST(subscribers - 1, 0)`,
        })
        .eq('id', creatorId);
    }
  }

  console.log('Subscription event processed:', subscription.id, subscription.status);
}

async function handlePaymentIntentEvent(event: Stripe.Event, supabase: any) {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const { creatorId, fanId } = paymentIntent.metadata || {};

  const { data: creatorData } = await supabase
    .from('creators')
    .select('user_id')
    .eq('id', creatorId)
    .maybeSingle();

  const creatorUserId = creatorData?.user_id;

  await supabase
    .from('stripe_payments')
    .upsert({
      stripe_payment_intent_id: paymentIntent.id,
      stripe_charge_id: paymentIntent.latest_charge as string || null,
      stripe_customer_id: paymentIntent.customer as string || null,
      user_id: fanId || null,
      creator_id: creatorUserId || null,
      amount: paymentIntent.amount,
      amount_received: paymentIntent.amount_received,
      application_fee_amount: paymentIntent.application_fee_amount || null,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      description: paymentIntent.description || null,
      receipt_email: paymentIntent.receipt_email || null,
      metadata: paymentIntent.metadata as any,
      data: paymentIntent as any,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_payment_intent_id',
    });

  console.log('Payment intent processed:', paymentIntent.id, paymentIntent.status);
}

async function handleChargeEvent(event: Stripe.Event, supabase: any) {
  const charge = event.data.object as Stripe.Charge;

  await supabase
    .from('stripe_payments')
    .update({
      stripe_charge_id: charge.id,
      status: charge.status,
      amount_received: charge.amount_captured,
      receipt_email: charge.receipt_email || null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', charge.payment_intent as string);

  console.log('Charge event processed:', charge.id, charge.status);
}

async function handlePayoutEvent(event: Stripe.Event, supabase: any) {
  const payout = event.data.object as Stripe.Payout;

  const { data: accountData } = await supabase
    .from('stripe_connect_accounts')
    .select('user_id')
    .eq('stripe_account_id', payout.destination || 'unknown')
    .maybeSingle();

  await supabase
    .from('stripe_payouts')
    .upsert({
      stripe_payout_id: payout.id,
      stripe_account_id: payout.destination as string || 'unknown',
      user_id: accountData?.user_id || null,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      arrival_date: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
      automatic: payout.automatic,
      description: payout.description || null,
      failure_code: payout.failure_code || null,
      failure_message: payout.failure_message || null,
      method: payout.method,
      type: payout.type,
      data: payout as any,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_payout_id',
    });

  console.log('Payout processed:', payout.id, payout.status);
}

async function handleDisputeEvent(event: Stripe.Event, supabase: any) {
  const dispute = event.data.object as Stripe.Dispute;

  const { data: paymentData } = await supabase
    .from('stripe_payments')
    .select('user_id, creator_id')
    .eq('stripe_charge_id', dispute.charge as string)
    .maybeSingle();

  await supabase
    .from('stripe_disputes')
    .upsert({
      stripe_dispute_id: dispute.id,
      stripe_charge_id: dispute.charge as string,
      stripe_payment_intent_id: dispute.payment_intent as string || null,
      user_id: paymentData?.user_id || null,
      creator_id: paymentData?.creator_id || null,
      amount: dispute.amount,
      currency: dispute.currency,
      reason: dispute.reason,
      status: dispute.status,
      evidence: dispute.evidence as any,
      evidence_details: dispute.evidence_details as any,
      is_charge_refundable: dispute.is_charge_refundable,
      metadata: dispute.metadata as any,
      data: dispute as any,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_dispute_id',
    });

  console.log('Dispute processed:', dispute.id, dispute.status);
}

async function handleAccountUpdated(event: Stripe.Event, supabase: any) {
  const account = event.data.object as Stripe.Account;

  await supabase
    .from('stripe_connect_accounts')
    .update({
      details_submitted: account.details_submitted || false,
      payouts_enabled: account.payouts_enabled || false,
      charges_enabled: account.charges_enabled || false,
      requirements: account.requirements as any,
      capabilities: account.capabilities as any,
      country: account.country || null,
      default_currency: account.default_currency || 'usd',
      metadata: account.metadata as any,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_account_id', account.id);

  console.log('Account updated:', account.id);
}

async function handleCustomerEvent(event: Stripe.Event, supabase: any) {
  const customer = event.data.object as Stripe.Customer;

  const { data: existingCustomer } = await supabase
    .from('stripe_customers')
    .select('id, user_id')
    .eq('stripe_customer_id', customer.id)
    .maybeSingle();

  if (existingCustomer) {
    await supabase
      .from('stripe_customers')
      .update({
        email: customer.email || null,
        metadata: customer.metadata as any,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', customer.id);
  }

  console.log('Customer processed:', customer.id);
}
