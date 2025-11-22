# Stripe Connect Product Catalog Setup

## Overview

Your Stripe Connect integration now uses **products on connected accounts** instead of inline prices. This provides better tracking, reporting, and product management.

## How It Works

### 1. Product Creation Flow

When a creator sets their subscription price:

```
Creator sets price → create-creator-product function → Product created on THEIR Stripe account
```

**What happens:**
- A product is created on the **creator's connected account** (not platform)
- A price is created for that product
- Product and Price IDs are saved to database
- Product appears in creator's Stripe Dashboard

### 2. Checkout Flow

When a fan subscribes:

```
Fan clicks subscribe → create-stripe-checkout function → Uses price from creator's account
```

**What happens:**
- Checkout session references the price ID from creator's account
- `stripeAccount` header routes request to their account
- Platform takes 10% application fee
- Creator receives remaining 90%

## Database Schema

### `creators` table columns:
- `stripe_connect_id` - The connected account ID (acct_xxx)
- `stripe_product_id` - Product ID on connected account (prod_xxx)
- `stripe_price_id` - Current active price ID (price_xxx)
- `subscription_price` - Price in dollars for display

## Edge Functions

### `/functions/v1/create-creator-product`
Creates or updates a product on the creator's Stripe Connect account.

**Request:**
```json
{
  "price": 9.99
}
```

**Response:**
```json
{
  "success": true,
  "productId": "prod_xxx",
  "priceId": "price_xxx",
  "price": 9.99
}
```

**Key Points:**
- Uses `stripeAccount` parameter to create on connected account
- Products appear in creator's Stripe Dashboard
- Prices are immutable - new price created each update

### `/functions/v1/create-stripe-checkout`
Creates a checkout session using the creator's product.

**Request:**
```json
{
  "creatorId": "uuid"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_xxx"
}
```

**Key Points:**
- References `stripe_price_id` from creator's account
- Uses `stripeAccount` header to route to connected account
- Platform fee calculated as 10% of subscription price

### `/functions/v1/create-stripe-onboarding`
Creates or retrieves Stripe Connect account and generates onboarding link.

**Key Points:**
- Uses **controller pattern** (not legacy `type: 'express'`)
- Connected account pays own fees
- Full dashboard access for creators

## Configuration Required

### Environment Variables (Supabase Dashboard)
1. Navigate to: **Project Settings > Edge Functions**
2. Add secret: `STRIPE_SECRET_KEY`
3. Value: Your Stripe secret key (sk_test_xxx or sk_live_xxx)

## Benefits of This Approach

### ✅ For Creators
- See products in their own Stripe Dashboard
- Full transparency into sales and revenue
- Can manage products directly through Stripe
- Better tax reporting and records

### ✅ For Platform
- Cleaner product catalog management
- Better analytics and reporting
- Easier to track which products are active
- Can reference products in webhooks

### ✅ For Developers
- Products are reusable across sessions
- Consistent price IDs for subscriptions
- Easier debugging (can see products in Dashboard)
- Better audit trail

## Testing Checklist

1. **Creator Onboarding**
   - [ ] Creator connects Stripe account
   - [ ] Onboarding completes successfully
   - [ ] Account shows as connected in UI

2. **Price Setup**
   - [ ] Creator sets subscription price
   - [ ] Product appears in their Stripe Dashboard
   - [ ] Price ID saved to database

3. **Fan Purchase**
   - [ ] Fan clicks subscribe
   - [ ] Redirected to Stripe Checkout
   - [ ] Checkout shows correct price
   - [ ] Subscription created successfully
   - [ ] Platform fee (10%) applied correctly

4. **Stripe Dashboard Verification**
   - [ ] Product visible in creator's dashboard
   - [ ] Price shows correct amount
   - [ ] Subscription appears after purchase
   - [ ] Application fee shows in platform account

## Migration from Inline Prices

If you have existing creators using inline prices:

1. They need to save their price again in monetization settings
2. This will create the product on their connected account
3. New subscriptions will use the catalog price
4. Existing subscriptions continue with inline prices (unaffected)

## Troubleshooting

### "Creator has not set up their subscription price yet"
- Creator needs to save their price in Monetization settings
- This triggers product creation

### Product not showing in Stripe Dashboard
- Verify `stripeAccount` parameter is being passed
- Check creator's `stripe_connect_id` is valid
- Ensure creator completed onboarding

### Checkout fails with "No such price"
- Price exists on connected account, not platform
- Verify `stripeAccount` header in checkout session
- Check `stripe_price_id` is not null

## API Version

All functions use: **2025-11-17.clover**

This is the latest Stripe API version and includes all modern Connect features.
