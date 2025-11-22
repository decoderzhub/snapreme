/**
 * Stripe Checkout Session Creation Edge Function
 *
 * This function creates Stripe Checkout sessions for fans to subscribe
 * to creators. It uses Stripe Connect's "destination charge" pattern with
 * application fees.
 *
 * Flow:
 * 1. Authenticate the fan (customer)
 * 2. Get or create their Stripe customer ID
 * 3. Retrieve the creator and their Stripe Connect account ID
 * 4. Create a checkout session for subscription
 * 5. Platform takes 10% application fee, rest goes to creator
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';

// CORS headers to allow frontend to call this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // ============================================
    // STEP 1: Get environment variables
    // ============================================
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173';

    // PLACEHOLDER: Ensure STRIPE_SECRET_KEY is configured in Supabase Dashboard
    // Navigate to: Project Settings > Edge Functions > Add Secret
    // Key: STRIPE_SECRET_KEY
    // Value: Your Stripe secret key (starts with sk_test_ or sk_live_)
    if (!stripeKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. Please add it in Supabase Dashboard under Project Settings > Edge Functions.'
      );
    }

    // ============================================
    // STEP 2: Initialize Stripe with latest API version
    // ============================================
    const stripe = new Stripe(stripeKey, {
      // Using the latest Stripe API version as requested
      apiVersion: '2025-11-17.clover' as any,
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Initialize Supabase client for database operations
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ============================================
    // STEP 3: Authenticate the user (fan/customer)
    // ============================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Verify the user's JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized - invalid or expired token');
    }

    // ============================================
    // STEP 4: Parse request body and get creator
    // ============================================
    const { creatorId } = await req.json();

    if (!creatorId) {
      throw new Error('Creator ID is required');
    }

    // Fetch the creator's profile including their Stripe Connect account
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, user_id, display_name, name, handle, stripe_connect_id, subscription_price')
      .eq('id', creatorId)
      .maybeSingle();

    if (creatorError || !creator) {
      throw new Error('Creator not found');
    }

    // Ensure the creator has connected their Stripe account
    if (!creator.stripe_connect_id) {
      throw new Error('Creator has not connected Stripe yet. They need to complete onboarding first.');
    }

    // ============================================
    // STEP 5: Get or create Stripe Customer
    // ============================================
    /**
     * Stripe Customers represent your users in Stripe.
     * We store the customer ID to reuse for future purchases.
     */
    let customerId: string | null = null;

    // Check if we already have a Stripe customer ID for this fan
    const { data: fanProfile } = await supabase
      .from('fan_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle();

    if (fanProfile?.stripe_customer_id) {
      // Reuse existing customer
      customerId = fanProfile.stripe_customer_id;
    } else {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          fanId: user.id,
          platform: 'snapreme'
        },
      });
      customerId = customer.id;

      // Save the customer ID for future use
      await supabase
        .from('fan_profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          stripe_customer_id: customerId,
        });
    }

    // ============================================
    // STEP 6: Create Checkout Session
    // ============================================
    /**
     * Checkout Sessions create a hosted payment page where customers
     * can complete their purchase. This handles all payment UI/UX.
     *
     * IMPORTANT: Using subscription_data with transfer_data to route
     * funds to the connected account
     */

    // Convert price from dollars to cents (Stripe uses smallest currency unit)
    const priceCents = Math.round((creator.subscription_price || 5) * 100);

    const session = await stripe.checkout.sessions.create({
      // Subscription mode for recurring monthly payments
      mode: 'subscription',

      // Link to the existing customer
      customer: customerId,

      // What the customer is buying
      line_items: [
        {
          // Create the price inline (you can also use pre-created Price IDs)
          price_data: {
            currency: 'usd',
            unit_amount: priceCents, // Price in cents
            recurring: { interval: 'month' }, // Monthly subscription
            product_data: {
              name: `${creator.display_name || creator.name}'s Premium Content`,
              description: `Monthly subscription to unlock ${creator.display_name || creator.name}'s Snapchat`,
            },
          },
          quantity: 1,
        },
      ],

      // Redirect URLs
      success_url: `${appUrl}/creator/${creator.handle}?unlocked=true`,
      cancel_url: `${appUrl}/creator/${creator.handle}`,

      /**
       * Subscription Data - configures how the subscription works
       *
       * application_fee_percent: Platform takes 10% of each payment
       * transfer_data: Remaining 90% goes to the connected account
       *
       * This creates a "destination charge" where:
       * - Payment is created on platform account
       * - Platform fee is automatically deducted
       * - Remaining balance is transferred to connected account
       */
      subscription_data: {
        // Platform takes 10% application fee
        application_fee_percent: 10,

        // Send remaining funds to the connected account
        transfer_data: {
          destination: creator.stripe_connect_id,
        },

        // Store metadata for tracking
        metadata: {
          creatorId: creator.id,
          fanId: user.id,
          platform: 'snapreme'
        },
      },

      // Session-level metadata
      metadata: {
        creatorId: creator.id,
        fanId: user.id,
        platform: 'snapreme'
      },
    });

    // ============================================
    // STEP 7: Return checkout URL
    // ============================================
    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id
      }),
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
      JSON.stringify({
        error: err.message || 'An unexpected error occurred',
        details: err.toString()
      }),
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
