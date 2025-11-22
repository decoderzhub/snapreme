/*
  # Add Stripe Product and Price IDs to Creators Table

  1. Changes
    - Add `stripe_product_id` column to store the Stripe product ID on connected account
    - Add `stripe_price_id` column to store the current active price ID on connected account
  
  2. Notes
    - These IDs reference products/prices on the CONNECTED ACCOUNT, not platform account
    - Products are created using the Stripe-Account header
    - This enables better product management and reporting in creator's Stripe Dashboard
*/

-- Add columns to store Stripe product and price IDs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE creators ADD COLUMN stripe_product_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'creators' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE creators ADD COLUMN stripe_price_id text;
  END IF;
END $$;

-- Add helpful comment
COMMENT ON COLUMN creators.stripe_product_id IS 'Stripe product ID on the connected account (not platform account)';
COMMENT ON COLUMN creators.stripe_price_id IS 'Current active Stripe price ID on the connected account';
