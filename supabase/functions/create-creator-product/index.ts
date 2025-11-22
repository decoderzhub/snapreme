/**
 * Create/Update Stripe Product on Connected Account
 *
 * This function creates or updates a product and price on the creator's
 * Stripe Connect account. This is better than inline prices because:
 * - Products show in the creator's Stripe Dashboard
 * - Better reporting and analytics
 * - Reusable price IDs for consistency
 *
 * Flow:
 * 1. Authenticate the creator
 * 2. Get their Stripe Connect account ID
 * 3. Create/update product on their connected account using Stripe-Account header
 * 4. Create a new price for the product
 * 5. Save the price ID to our database
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

    // PLACEHOLDER: Ensure STRIPE_SECRET_KEY is configured in Supabase Dashboard
    if (!stripeKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not configured. Please add it in Supabase Dashboard under Project Settings > Edge Functions.'
      );
    }

    // ============================================
    // STEP 2: Initialize Stripe and Supabase
    // ============================================
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-11-17.clover' as any,
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ============================================
    // STEP 3: Authenticate the creator
    // ============================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized - invalid or expired token');
    }

    // ============================================
    // STEP 4: Get creator profile and parse request
    // ============================================
    const { price } = await req.json();

    if (!price || price <= 0) {
      throw new Error('Valid price is required');
    }

    const { data: creator, error: creatorError } = await supabase
      .from('creators')
      .select('id, stripe_connect_id, display_name, name, stripe_product_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creatorError || !creator) {
      throw new Error('Creator profile not found');
    }

    if (!creator.stripe_connect_id) {
      throw new Error('Please connect your Stripe account first');
    }

    // ============================================
    // STEP 5: Create or retrieve product on connected account
    // ============================================
    /**
     * IMPORTANT: Using stripeAccount parameter to create the product
     * on the CONNECTED ACCOUNT, not the platform account.
     *
     * This means the product shows up in the creator's Stripe Dashboard,
     * and they can manage it directly.
     */
    let productId = creator.stripe_product_id;

    if (!productId) {
      // Create a new product on the connected account
      const product = await stripe.products.create({
        name: `${creator.display_name || creator.name}'s Premium Content`,
        description: `Monthly subscription to access ${creator.display_name || creator.name}'s exclusive Snapchat content`,
        metadata: {
          creatorId: creator.id,
          platform: 'snapreme'
        }
      }, {
        // CRITICAL: This header routes the request to the connected account
        stripeAccount: creator.stripe_connect_id,
      });

      productId = product.id;

      // Save the product ID to our database
      await supabase
        .from('creators')
        .update({ stripe_product_id: productId })
        .eq('id', creator.id);
    }

    // ============================================
    // STEP 6: Create a new price for the product
    // ============================================
    /**
     * Prices are immutable in Stripe, so we create a new one each time
     * the creator updates their subscription price.
     *
     * We also deactivate old prices to keep things clean.
     */
    const priceCents = Math.round(price * 100);

    // Create new price on the connected account
    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: priceCents,
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        creatorId: creator.id,
      }
    }, {
      // CRITICAL: Create price on the connected account
      stripeAccount: creator.stripe_connect_id,
    });

    // ============================================
    // STEP 7: Update database with new price
    // ============================================
    await supabase
      .from('creators')
      .update({
        subscription_price: price,
        stripe_price_id: newPrice.id,
      })
      .eq('id', creator.id);

    // ============================================
    // STEP 8: Return success
    // ============================================
    return new Response(
      JSON.stringify({
        success: true,
        productId: productId,
        priceId: newPrice.id,
        price: price
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Error creating product:', err);
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
