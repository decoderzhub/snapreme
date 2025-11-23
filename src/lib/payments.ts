import { supabase } from './supabase';

export async function unlockPost(postId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-post-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ postId }),
    }
  );

  const json = await res.json();
  if (json.error) throw new Error(json.error);

  return json;
}

export async function purchaseContentPackage(packageId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-package-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ packageId }),
    }
  );

  const json = await res.json();
  if (json.error) throw new Error(json.error);

  return json;
}

export async function sendPaidMessage(params: {
  threadId: string;
  text: string;
  isPriority?: boolean;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const messageCost = params.isPriority ? 20 : 10;

  const { data: wallet } = await supabase
    .from('wallets')
    .select('coin_balance')
    .eq('user_id', user.id)
    .single();

  if (!wallet || wallet.coin_balance < messageCost) {
    throw new Error('Insufficient coins');
  }

  await supabase
    .from('wallets')
    .update({ coin_balance: wallet.coin_balance - messageCost })
    .eq('user_id', user.id);

  const { error } = await supabase
    .from('ppm_messages')
    .insert({
      thread_id: params.threadId,
      sender_id: user.id,
      is_creator: false,
      text: params.text,
      is_priority: params.isPriority || false,
    });

  if (error) throw error;

  await supabase
    .from('ppm_threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', params.threadId);
}

export async function sendTip(params: {
  threadId: string;
  tipCents: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const coinCost = Math.ceil(params.tipCents / 10);

  const { data: wallet } = await supabase
    .from('wallets')
    .select('coin_balance')
    .eq('user_id', user.id)
    .single();

  if (!wallet || wallet.coin_balance < coinCost) {
    throw new Error('Insufficient coins');
  }

  await supabase
    .from('wallets')
    .update({ coin_balance: wallet.coin_balance - coinCost })
    .eq('user_id', user.id);

  const { error } = await supabase
    .from('ppm_messages')
    .insert({
      thread_id: params.threadId,
      sender_id: user.id,
      is_creator: false,
      tip_cents: params.tipCents,
      text: `Sent a $${(params.tipCents / 100).toFixed(2)} tip`,
    });

  if (error) throw error;

  await supabase
    .from('ppm_threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', params.threadId);
}

export async function sendGift(params: {
  threadId: string;
  giftEmoji: string;
  coinCost: number;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: wallet } = await supabase
    .from('wallets')
    .select('coin_balance')
    .eq('user_id', user.id)
    .single();

  if (!wallet || wallet.coin_balance < params.coinCost) {
    throw new Error('Insufficient coins');
  }

  await supabase
    .from('wallets')
    .update({ coin_balance: wallet.coin_balance - params.coinCost })
    .eq('user_id', user.id);

  const { error } = await supabase
    .from('ppm_messages')
    .insert({
      thread_id: params.threadId,
      sender_id: user.id,
      is_creator: false,
      gift_emoji: params.giftEmoji,
      text: `Sent ${params.giftEmoji}`,
    });

  if (error) throw error;

  await supabase
    .from('ppm_threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', params.threadId);
}

export async function buyCoins(packageType: 'small' | 'medium' | 'large') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-coin-checkout`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ packageType }),
    }
  );

  const json = await res.json();
  if (json.error) throw new Error(json.error);

  return json;
}
