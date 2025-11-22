/**
 * Stripe Connect Onboarding Edge Function
 *
 * This function handles creating Stripe Connect accounts for creators and
 * generating onboarding links so they can complete their account setup.
 *
 * Flow:
 * 1. Authenticate the user making the request
 * 2. Check if they already have a Stripe Connect account
 * 3. If not, create a new Connect account using the controller pattern
 * 4. Generate an account link for onboarding
 * 5. Return the onboarding URL to redirect the user to Stripe
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
    // STEP 3: Authenticate the user
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
    // STEP 4: Get the creator's profile
    // ============================================
    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, stripe_connect_id, is_stripe_connected')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creatorError || !creator) {
      throw new Error('Creator profile not found. Please complete your profile setup first.');
    }

    let accountId = creator.stripe_connect_id;

    // ============================================
    // STEP 5: Create Stripe Connect Account (if needed)
    // ============================================
    if (!accountId) {
      /**
       * Creating a Connect account using the CONTROLLER pattern
       *
       * IMPORTANT: Using controller properties instead of top-level type
       *
       * Benefits of this approach:
       * - Connected account pays their own Stripe fees
       * - Stripe handles payment disputes and losses (not the platform)
       * - Connected account gets full dashboard access
       * - More control and transparency for creators
       */
      const account = await stripe.accounts.create({
        // Email of the account owner
        email: user.email!,

        // Controller configuration - defines who controls what
        controller: {
          // Connected account pays their own Stripe processing fees
          fees: {
            payer: 'account' as const
          },
          // Stripe handles disputes and payment losses, not the platform
          losses: {
            payments: 'stripe' as const
          },
          // Connected account gets full access to Stripe Dashboard
          // They can view all data, manage payouts, etc.
          stripe_dashboard: {
            type: 'full' as const
          }
        },

        // Request card payment capabilities
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },

        // Store creator ID for reference
        metadata: {
          creatorId: creator.id,
          platform: 'snapreme',
        },
      });

      accountId = account.id;

      // Save the Stripe account ID to our database
      await supabase
        .from('creators')
        .update({ stripe_connect_id: accountId })
        .eq('id', creator.id);
    }

    // ============================================
    // STEP 6: Create Account Link for Onboarding
    // ============================================
    /**
     * Account Links are temporary URLs (expires in ~5 minutes) that
     * guide the user through Stripe's onboarding flow
     */
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      // Where to send user if they need to restart onboarding
      refresh_url: `${appUrl}/dashboard/monetization`,
      // Where to send user after successful onboarding
      return_url: `${appUrl}/dashboard/monetization?connected=true`,
      // Type of onboarding flow
      type: 'account_onboarding',
    });

    // ============================================
    // STEP 7: Check if onboarding is complete (optional)
    // ============================================
    // If the URL has connected=true, verify the account is fully onboarded
    if (req.url.includes('connected=true') && !creator.is_stripe_connected) {
      // Retrieve the full account details to check onboarding status
      const account = await stripe.accounts.retrieve(accountId);

      // details_submitted means they completed onboarding
      if (account.details_submitted) {
        await supabase
          .from('creators')
          .update({ is_stripe_connected: true })
          .eq('id', creator.id);
      }
    }

    // ============================================
    // STEP 8: Return the onboarding URL
    // ============================================
    return new Response(
      JSON.stringify({
        url: accountLink.url,
        accountId: accountId
      }),
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
