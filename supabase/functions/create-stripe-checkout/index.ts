/**
 * Stripe Checkout Session Creation Edge Function
 *
 * This function creates Stripe Checkout sessions for fans to subscribe
 * to creators. It uses Stripe Connect's "destination charge" pattern with
 * application fees.
 *
 * Flow:
 * 1. Authenticate the fan (customer)
 * 2. Get or create their Stripe customer ID on the connected account
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

    // Get APP_URL from env or infer from request origin
    let appUrl = Deno.env.get('APP_URL');
    if (!appUrl) {
      const origin = req.headers.get('origin') || req.headers.get('referer');
      if (origin) {
        try {
          const url = new URL(origin);
          appUrl = `${url.protocol}//${url.host}`;
          console.log('Inferred APP_URL from request:', appUrl);
        } catch {
          appUrl = 'http://localhost:5173';
        }
      } else {
        appUrl = 'http://localhost:5173';
      }
    }
    console.log('Using APP_URL:', appUrl);

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
      .select('id, user_id, display_name, name, handle, stripe_connect_id, subscription_price, stripe_price_id')
      .eq('id', creatorId)
      .maybeSingle();

    if (creatorError || !creator) {
      throw new Error('Creator not found');
    }

    // Ensure the creator has connected their Stripe account
    if (!creator.stripe_connect_id) {
      throw new Error('Creator has not connected Stripe yet. They need to complete onboarding first.');
    }

    // Ensure the creator has set up their product/price
    if (!creator.stripe_price_id) {
      throw new Error('Creator has not set up their subscription price yet.');
    }

    // Clean the handle for URL redirect (remove @ if present)
    const cleanHandle = creator.handle?.replace('@', '') || '';
    if (!cleanHandle) {
      throw new Error('Creator does not have a valid handle configured.');
    }

    console.log('Creator handle:', creator.handle);
    console.log('Clean handle:', cleanHandle);
    console.log('Success URL will be:', `${appUrl}/creator/${cleanHandle}?unlocked=true`);

    // ============================================
    // STEP 5: Get or create Stripe Customer on CONNECTED ACCOUNT
    // ============================================
    /**
     * CRITICAL: The customer must exist on the CONNECTED ACCOUNT, not the platform.
     * When using direct charges with Stripe Connect, the customer object must
     * exist on the same account as the price/product.
     *
     * We'll check if a customer exists on the connected account and create one if not.
     */
    let customerId: string | null = null;

    // Try to find existing customer on the connected account by email
    const existingCustomers = await stripe.customers.list({
      email: user.email!,
      limit: 1
    }, {
      stripeAccount: creator.stripe_connect_id,
    });

    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
      console.log('Found existing customer on connected account:', customerId);
    } else {
      // Create new customer on the CONNECTED ACCOUNT
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          fanId: user.id,
          platform: 'snapreme',
          creatorId: creator.id
        },
      }, {
        stripeAccount: creator.stripe_connect_id,
      });
      customerId = customer.id;
      console.log('Created new customer on connected account:', customerId);

      // Store the customer ID for this specific creator (many-to-many relationship)
      await supabase
        .from('stripe_customers')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          email: user.email!,
          metadata: {
            connected_account_id: creator.stripe_connect_id,
            creator_id: creator.id
          },
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'stripe_customer_id',
        });
    }

    // ============================================
    // STEP 6: Create Checkout Session
    // ============================================
    /**
     * Checkout Sessions create a hosted payment page where customers
     * can complete their purchase. This handles all payment UI/UX.
     *
     * IMPORTANT: Using the price ID from the connected account's product
     * This references a product that exists in the creator's Stripe Dashboard
     */

    const session = await stripe.checkout.sessions.create({
      // Subscription mode for recurring monthly payments
      mode: 'subscription',

      // Link to the existing customer
      customer: customerId,

      /**
       * What the customer is buying
       *
       * Using pre-created price ID instead of inline price_data
       * This price exists on the CONNECTED ACCOUNT, so we need to:
       * 1. Reference it by ID
       * 2. Pass stripeAccount header below
       */
      line_items: [
        {
          // Reference the price created on the connected account
          price: creator.stripe_price_id,
          quantity: 1,
        },
      ],

      // Redirect URLs (use cleaned handle without @)
      success_url: `${appUrl}/creator/${cleanHandle}?unlocked=true`,
      cancel_url: `${appUrl}/creator/${cleanHandle}`,

      /**
       * Subscription Data - configures how the subscription works
       *
       * For recurring subscriptions with application fees:
       * - Use application_fee_percent (NOT payment_intent_data)
       * - Metadata for tracking
       */
      subscription_data: {
        // Platform fee: 10% of each subscription payment
        application_fee_percent: 10,

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
    }, {
      /**
       * CRITICAL: stripeAccount header
       *
       * This routes the checkout session to the connected account
       * The price ID we're referencing exists on THEIR account,
       * so we need to tell Stripe which account to use
       */
      stripeAccount: creator.stripe_connect_id,
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
