import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Post, ContentPackage, PostUnlock, PackagePurchase } from '../types/database';

export function useCreatorPosts(creatorId: string | undefined) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    async function fetchPosts() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setPosts([]);
      } else {
        setPosts(data || []);
      }

      setLoading(false);
    }

    fetchPosts();
  }, [creatorId]);

  return { posts, loading, error };
}

export function useContentPackages(creatorId: string | undefined) {
  const [packages, setPackages] = useState<ContentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!creatorId) {
      setPackages([]);
      setLoading(false);
      return;
    }

    async function fetchPackages() {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('content_packages')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
        setPackages([]);
      } else {
        setPackages(data || []);
      }

      setLoading(false);
    }

    fetchPackages();
  }, [creatorId]);

  return { packages, loading, error };
}

export function usePostUnlocks(fanId: string | undefined) {
  const [unlocks, setUnlocks] = useState<PostUnlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fanId) {
      setUnlocks([]);
      setLoading(false);
      return;
    }

    async function fetchUnlocks() {
      setLoading(true);

      const { data } = await supabase
        .from('post_unlocks')
        .select('*')
        .eq('fan_id', fanId);

      setUnlocks(data || []);
      setLoading(false);
    }

    fetchUnlocks();
  }, [fanId]);

  return { unlocks, loading };
}

export function usePackagePurchases(fanId: string | undefined) {
  const [purchases, setPurchases] = useState<PackagePurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!fanId) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    async function fetchPurchases() {
      setLoading(true);

      const { data } = await supabase
        .from('package_purchases')
        .select('*')
        .eq('fan_id', fanId);

      setPurchases(data || []);
      setLoading(false);
    }

    fetchPurchases();
  }, [fanId]);

  return { purchases, loading };
}

export function usePostAccess(post: Post | null, fanId: string | undefined, isSubscribed: boolean) {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!post) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    if (!post.is_locked) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    if (isSubscribed) {
      setHasAccess(true);
      setLoading(false);
      return;
    }

    if (!fanId) {
      setHasAccess(false);
      setLoading(false);
      return;
    }

    async function checkUnlock() {
      setLoading(true);

      const { data } = await supabase
        .from('post_unlocks')
        .select('id')
        .eq('post_id', post.id)
        .eq('fan_id', fanId)
        .maybeSingle();

      setHasAccess(!!data);
      setLoading(false);
    }

    checkUnlock();
  }, [post, fanId, isSubscribed]);

  return { hasAccess, loading };
}
