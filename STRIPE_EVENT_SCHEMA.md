# Stripe Event Schema Documentation

## Overview

peak.boo now has a comprehensive Stripe event tracking system that stores all webhook events, payments, subscriptions, payouts, disputes, and Connect account data. This provides full audit trails, idempotent webhook processing, and detailed financial reporting.

---

## Database Tables

### 1. `stripe_events` - Master Event Log

**Purpose:** Stores every webhook event from Stripe for idempotency and replay capability.

**Key Features:**
- Prevents duplicate event processing
- Enables event replay if processing fails
- Tracks processing attempts and errors
- Full audit trail of all Stripe communications

**Columns:**
- `stripe_event_id` - Stripe event ID (e.g., `evt_1234...`)
- `event_type` - Event type (e.g., `checkout.session.completed`)
- `data` - Full JSON payload from Stripe
- `processed` - Whether event was successfully processed
- `attempts` - Number of processing attempts (for retry logic)
- `error_message` - Error if processing failed
- `processed_at` - Timestamp when successfully processed

**Usage:**
```typescript
// Webhook handler automatically logs all events
// Query unprocessed events for debugging
const { data } = await supabase
  .from('stripe_events')
  .select('*')
  .eq('processed', false)
  .order('created_at', { ascending: false });
```

---

### 2. `stripe_customers` - Customer Mapping

**Purpose:** Maps auth.users to Stripe customer IDs.

**Columns:**
- `user_id` - References auth.users
- `stripe_customer_id` - Stripe customer ID (e.g., `cus_1234...`)
- `email` - Customer email
- `metadata` - Additional Stripe metadata

**Usage:**
```typescript
// Get customer ID for a user
const { data } = await supabase
  .from('stripe_customers')
  .select('stripe_customer_id')
  .eq('user_id', userId)
  .maybeSingle();
```

---

### 3. `stripe_connect_accounts` - Creator Connect Accounts

**Purpose:** Detailed tracking of Stripe Connect accounts for creators.

**Columns:**
- `user_id` - References auth.users (creator)
- `stripe_account_id` - Stripe Connect account ID (e.g., `acct_1234...`)
- `details_submitted` - Whether onboarding is complete
- `payouts_enabled` - Whether payouts are enabled
- `charges_enabled` - Whether charges are enabled
- `requirements` - Outstanding requirements (JSONB)
- `capabilities` - Account capabilities (JSONB)
- `country` - Account country
- `default_currency` - Default currency

**Usage:**
```typescript
// Check if creator can receive payouts
const { data } = await supabase
  .from('stripe_connect_accounts')
  .select('payouts_enabled, charges_enabled')
  .eq('user_id', creatorUserId)
  .maybeSingle();

if (data?.payouts_enabled && data?.charges_enabled) {
  // Creator is ready to receive payments
}
```

---

### 4. `stripe_subscriptions` - Enhanced Subscription Tracking

**Purpose:** Full subscription tracking with all Stripe data.

**Columns:**
- `stripe_subscription_id` - Stripe subscription ID
- `stripe_customer_id` - Customer ID
- `user_id` - Fan's user ID
- `creator_id` - Creator's user ID
- `status` - Subscription status (active, canceled, past_due, etc.)
- `current_period_start` - Billing period start
- `current_period_end` - Billing period end
- `cancel_at` - Scheduled cancellation date
- `canceled_at` - When subscription was canceled
- `ended_at` - When subscription ended
- `amount` - Subscription amount in cents
- `currency` - Subscription currency
- `data` - Full Stripe subscription object (JSONB)

**Usage:**
```typescript
// Get active subscriptions for a creator
const { data } = await supabase
  .from('stripe_subscriptions')
  .select('*')
  .eq('creator_id', creatorUserId)
  .eq('status', 'active');

// Check when subscription renews
const renewalDate = data[0]?.current_period_end;
```

---

### 5. `stripe_payments` - Payment Tracking

**Purpose:** Tracks all payment intents and charges for audit trail.

**Columns:**
- `stripe_payment_intent_id` - Payment intent ID
- `stripe_charge_id` - Charge ID
- `stripe_customer_id` - Customer ID
- `user_id` - Fan's user ID
- `creator_id` - Creator's user ID
- `amount` - Payment amount in cents
- `amount_received` - Amount actually received
- `application_fee_amount` - Platform fee (10% for peak.boo)
- `currency` - Payment currency
- `status` - Payment status (succeeded, failed, etc.)
- `description` - Payment description
- `receipt_email` - Email for receipt
- `data` - Full Stripe payment intent object (JSONB)

**Usage:**
```typescript
// Get payment history for a user
const { data } = await supabase
  .from('stripe_payments')
  .select('*')
  .eq('user_id', fanUserId)
  .order('created_at', { ascending: false });

// Calculate total platform fees
const totalFees = data.reduce((sum, p) =>
  sum + (p.application_fee_amount || 0), 0
);
```

---

### 6. `stripe_payouts` - Creator Payouts

**Purpose:** Tracks all payouts to creator bank accounts.

**Columns:**
- `stripe_payout_id` - Payout ID
- `stripe_account_id` - Connect account ID
- `user_id` - Creator's user ID
- `amount` - Payout amount in cents
- `currency` - Payout currency
- `status` - Payout status (paid, failed, in_transit, etc.)
- `arrival_date` - When payout arrives in bank
- `automatic` - Whether payout was automatic
- `failure_code` - Error code if failed
- `failure_message` - Error message if failed
- `method` - Payout method (standard, instant)
- `type` - Payout type (bank_account, card)
- `data` - Full Stripe payout object (JSONB)

**Usage:**
```typescript
// Get payout history for a creator
const { data } = await supabase
  .from('stripe_payouts')
  .select('*')
  .eq('user_id', creatorUserId)
  .order('created_at', { ascending: false });

// Check pending payouts
const { data: pending } = await supabase
  .from('stripe_payouts')
  .select('*')
  .in('status', ['in_transit', 'pending']);
```

---

### 7. `stripe_disputes` - Chargeback Management

**Purpose:** Tracks chargebacks and disputes from customers.

**Columns:**
- `stripe_dispute_id` - Dispute ID
- `stripe_charge_id` - Related charge ID
- `stripe_payment_intent_id` - Related payment intent ID
- `user_id` - Fan's user ID
- `creator_id` - Creator's user ID
- `amount` - Disputed amount in cents
- `currency` - Dispute currency
- `reason` - Dispute reason (fraudulent, duplicate, etc.)
- `status` - Dispute status (needs_response, under_review, won, lost)
- `evidence` - Evidence submitted (JSONB)
- `evidence_details` - Evidence submission details (JSONB)
- `is_charge_refundable` - Whether charge can be refunded
- `data` - Full Stripe dispute object (JSONB)

**Usage:**
```typescript
// Get open disputes
const { data } = await supabase
  .from('stripe_disputes')
  .select('*')
  .in('status', ['needs_response', 'under_review']);

// Get disputes for a creator
const { data: creatorDisputes } = await supabase
  .from('stripe_disputes')
  .select('*')
  .eq('creator_id', creatorUserId);
```

---

## Webhook Handler

The updated webhook handler (`stripe-webhook/index.ts`) now:

### ✅ **Features:**

1. **Idempotent Processing**
   - Checks if event was already processed
   - Prevents duplicate charges/subscriptions
   - Safe to retry failed webhooks

2. **Comprehensive Event Handling**
   - `checkout.session.completed` - New subscriptions
   - `customer.subscription.*` - Subscription lifecycle
   - `payment_intent.*` - Payment tracking
   - `charge.*` - Charge updates
   - `payout.*` - Creator payouts
   - `charge.dispute.*` - Dispute management
   - `account.updated` - Connect account changes
   - `customer.*` - Customer updates

3. **Error Tracking**
   - Logs errors to `stripe_events.error_message`
   - Tracks processing attempts
   - Enables debugging failed events

4. **Full Audit Trail**
   - Every event stored with complete data
   - Queryable event history
   - Event replay capability

### 🔒 **Security:**

- Uses service role key for database access
- Verifies webhook signatures (if `STRIPE_WEBHOOK_SECRET` set)
- RLS policies restrict data access
- Full CORS support

---

## Event Processing Flow

```
┌─────────────────┐
│  Stripe Event   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Webhook Handler Receives   │
│  (stripe-webhook/index.ts)  │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Check if already processed │
│  (stripe_events table)      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Store raw event            │
│  (idempotency)              │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Process event by type:     │
│  - Subscriptions            │
│  - Payments                 │
│  - Payouts                  │
│  - Disputes                 │
│  - Accounts                 │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Update relevant tables     │
│  Mark event as processed    │
└─────────────────────────────┘
```

---

## Environment Variables Required

Add these to Supabase Edge Function secrets:

```bash
STRIPE_SECRET_KEY=sk_test_... # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... # Optional but recommended
```

**To add secrets:**
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → Secrets
3. Add the required keys

---

## Migration Applied

**File:** `20251123_add_comprehensive_stripe_event_schema.sql`

**What it does:**
- Creates 7 new tables for Stripe data
- Adds indexes for performance
- Sets up RLS policies for security
- Enables full event tracking

**Backward Compatible:**
- Existing `subscriptions` table still works
- No breaking changes to current code
- Enhanced tracking is additive

---

## Benefits

### 🎯 **For Operations:**
- Full payment history for support
- Dispute tracking and management
- Payout monitoring
- Event replay for debugging

### 💰 **For Finance:**
- Accurate revenue tracking
- Platform fee reporting
- Payout reconciliation
- Chargeback analysis

### 🔒 **For Security:**
- Complete audit trail
- Idempotent processing
- No duplicate charges
- Full data retention

### 📊 **For Analytics:**
- Subscription metrics
- Payment success rates
- Payout timing analysis
- Dispute patterns

---

## Next Steps

### Recommended Implementation:

1. **Deploy webhook to Stripe:**
   ```bash
   # In Stripe Dashboard → Webhooks
   # Add endpoint: https://[your-project].supabase.co/functions/v1/stripe-webhook
   # Select all events or specific ones
   ```

2. **Add webhook secret:**
   ```bash
   # Copy webhook signing secret from Stripe
   # Add to Supabase Edge Function secrets as STRIPE_WEBHOOK_SECRET
   ```

3. **Monitor events:**
   ```sql
   -- Check for failed events
   SELECT * FROM stripe_events
   WHERE processed = false
   ORDER BY created_at DESC;
   ```

4. **Build admin dashboards:**
   - Payment history view
   - Payout monitoring
   - Dispute management
   - Revenue reports

---

## Testing

### Test webhook locally:

```bash
# Use Stripe CLI to forward webhooks
stripe listen --forward-to http://localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger payment_intent.succeeded
```

### Verify events are logged:

```sql
SELECT event_type, processed, created_at
FROM stripe_events
ORDER BY created_at DESC
LIMIT 10;
```

---

## Support

For issues or questions:
1. Check `stripe_events` table for error messages
2. Review Supabase Edge Function logs
3. Verify webhook secret is configured
4. Ensure RLS policies allow access

**The Stripe event schema is production-ready and provides enterprise-level financial tracking for peak.boo.**
