import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { PpmThread, PpmMessage, Gift, Wallet } from '../types/database';

export function usePpmThread(creatorId: string | undefined, fanId: string | undefined) {
  const [thread, setThread] = useState<PpmThread | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!creatorId || !fanId) {
      setThread(null);
      setLoading(false);
      return;
    }

    async function fetchOrCreateThread() {
      setLoading(true);

      const { data: existing } = await supabase
        .from('ppm_threads')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('fan_id', fanId)
        .maybeSingle();

      if (existing) {
        setThread(existing);
      } else {
        const { data: newThread } = await supabase
          .from('ppm_threads')
          .insert({
            creator_id: creatorId,
            fan_id: fanId,
          })
          .select()
          .single();

        setThread(newThread || null);
      }

      setLoading(false);
    }

    fetchOrCreateThread();
  }, [creatorId, fanId]);

  return { thread, loading };
}

export function usePpmMessages(threadId: string | undefined) {
  const [messages, setMessages] = useState<PpmMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    async function fetchMessages() {
      setLoading(true);

      const { data } = await supabase
        .from('ppm_messages')
        .select('*')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
      setLoading(false);
    }

    fetchMessages();

    const subscription = supabase
      .channel(`ppm_messages:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ppm_messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as PpmMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [threadId]);

  return { messages, loading };
}

export function useGifts() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGifts() {
      setLoading(true);

      const { data } = await supabase
        .from('gifts')
        .select('*')
        .order('coin_cost', { ascending: true });

      setGifts(data || []);
      setLoading(false);
    }

    fetchGifts();
  }, []);

  return { gifts, loading };
}

export function useWalletBalance(userId: string | undefined) {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBalance(0);
      setLoading(false);
      return;
    }

    async function fetchBalance() {
      setLoading(true);

      const { data } = await supabase
        .from('wallets')
        .select('coin_balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (!data) {
        await supabase
          .from('wallets')
          .insert({ user_id: userId, coin_balance: 0 });
        setBalance(0);
      } else {
        setBalance(data.coin_balance);
      }

      setLoading(false);
    }

    fetchBalance();
  }, [userId]);

  const refetch = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setBalance(data.coin_balance);
    }
  };

  return { balance, loading, refetch };
}
