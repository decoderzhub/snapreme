# Snapreme Creator Guide

## Overview

This guide explains how creators can manage their content and monetization on Snapreme.

---

## 📱 Content Management

### Where to Upload Content

**Current Status:** The content upload feature is in development.

**Temporary Workaround:**
- Content posts are currently managed directly in the database via Supabase
- Admin panel includes creator management tools
- Contact support for bulk uploads or manual content addition

**Coming Soon:**
- Direct upload from creator dashboard
- Drag-and-drop video/image uploads
- Bulk upload capabilities
- Content scheduling

### Post Types

Each post can be configured as:
- **Free** - Visible to all subscribers (set `is_locked: false`)
- **Paid unlock** - One-time payment to view (set `is_locked: true` + `unlock_price_cents`)
- **Subscriber-only** - Only active subscribers can view (requires active subscription)

---

## 📦 Content Packages

Create bundles of multiple posts at discounted prices:

**Location:** Dashboard → Monetization → Content Packages (Coming Soon)

**Current Method:** Manage via Supabase `content_packages` table

**Fields:**
- `title` - Package name
- `description` - What's included
- `price_cents` - Bundle price
- `items_count` - Number of posts
- `cover_image_url` - Package thumbnail

---

## 💬 Pay-Per-Message (PPM) System

### How It Works

**For Fans:**
1. Purchase coins (1 coin ≈ $0.10)
2. Send messages to creators:
   - **Regular message:** 10 coins
   - **Priority message:** 20 coins (highlighted)
3. Send tips or gifts directly in chat

**For Creators:**
- Receive all PPM messages in your inbox
- Priority messages are highlighted in gold
- Earn 90% of message value (10% platform fee)
- Withdraw earnings via Stripe Connect

### Where to Access PPM

**For Fans:**
- PPM chat card appears on creator profile pages (mobile view)
- Located below the content feed on mobile
- Requires coin purchase to send messages

**For Creators:**
- View incoming messages on your dashboard
- Respond to fans to build engagement
- Track PPM earnings in monetization settings

### PPM Best Practices

1. **Respond quickly** - Fans pay per message, so timely responses increase satisfaction
2. **Be personal** - Fans value authentic one-on-one interaction
3. **Set boundaries** - You control response frequency
4. **Encourage priority** - Let fans know priority messages get faster responses

---

## 💰 Monetization Setup

### Step 1: Connect Stripe

1. Go to **Dashboard → Monetization**
2. Click **"Connect Stripe Account"**
3. Complete Stripe Connect onboarding
4. Verify your bank account details

### Step 2: Set Subscription Price

1. Navigate to **Monetization Settings**
2. Set monthly subscription price ($5-$50 recommended)
3. Price applies to all subscriber-only content

### Step 3: Configure Content Pricing

- **Free posts** - Build audience, tease premium content
- **Paid unlocks** - $2-$20 per post based on quality/length
- **Bundles** - 20-30% discount vs individual post prices

---

## 🎯 Profile Features Explained

### Left Column - Recent Videos
- Shows newest content chronologically
- Fans click thumbnails to preview
- Locked content shows blur + price
- **Pro Tip:** Post 3-5 times per week for best engagement

### Center Column - Main Player
- Full vertical video player (TikTok style)
- Action buttons for likes, comments, tips
- Caption area with hashtags
- **Pro Tip:** Use hashtags for discoverability (#fitness #lifestyle)

### Right Column - Highlights & Bundles

**Highlights:**
- Automatically shows your most-liked content
- Helps fans discover your best work first
- Updates dynamically based on engagement

**Popular Themes:**
- Hashtags from your posts
- Helps fans filter by interest
- Use consistent tags for better organization

**Bundles & Deals:**
- Showcase content packages
- Drive bundle sales with attractive covers
- **Pro Tip:** Create themed bundles (e.g., "Best of November")

---

## 📊 Analytics & Growth

### Track Your Performance

**Dashboard Stats:**
- Subscriber count
- Profile views
- Favorites
- PPM earnings
- Total revenue

### Growth Strategies

1. **Cross-promote** - Share profile on Instagram, Twitter, TikTok
2. **Consistent posting** - 3-5 posts per week minimum
3. **Engage via PPM** - Build loyal fan relationships
4. **Bundle strategy** - Offer value packages for higher revenue
5. **Tease premium** - Post free samples to entice subscriptions

---

## 🔒 Privacy & Security

### Snapchat QR Integration

- Upload your Snapchat QR code in Account Settings
- Only paying subscribers can view it
- Never share your Snapchat username publicly
- Snapreme acts as a secure gateway

### Content Protection

- All content is gated behind authentication
- RLS (Row Level Security) protects your data
- Subscribers are verified via Stripe
- Report abuse to support immediately

---

## ❓ FAQ

**Q: When will content upload be available?**
A: Content upload feature is in development. ETA: Q1 2025

**Q: How do I respond to PPM messages?**
A: PPM response interface is coming to the creator dashboard soon

**Q: What's the platform fee?**
A: Snapreme takes 10% of all transactions (subscriptions, unlocks, PPM)

**Q: Can I change my subscription price?**
A: Yes, in Monetization Settings. Changes apply to new subscribers only.

**Q: How do I get paid?**
A: Earnings are automatically transferred to your Stripe account weekly

---

## 🆘 Support

**Need Help?**
- Email: support@snapreme.com
- Dashboard → Help Center
- Community Discord (link in dashboard)

**Report Issues:**
- Bug reports: github.com/snapreme/issues
- Security concerns: security@snapreme.com
