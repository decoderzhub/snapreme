import { supabase } from './supabase';
import { Creator } from '../types/database';

export interface ProfileUpdateData {
  name?: string;
  display_name?: string;
  handle?: string;
  bio?: string;
  short_bio?: string;
  about?: string;
  region?: string;
  followers?: number;
  engagement_rate?: number;
  starting_rate?: number;
  starting_rate_label?: string;
  avg_story_views?: number;
  content_types?: string[];
  top_regions?: string[];
  avatar_url?: string | null;
  cover_url?: string | null;
  card_image_url?: string | null;
  snapcode_url?: string | null;
  tier?: 'Rising' | 'Pro' | 'Elite';
  onboarding_complete?: boolean;
}

export async function uploadProfileImage(
  file: File,
  userId: string,
  type: 'avatar' | 'cover' | 'snapcode' | 'card'
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

export async function deleteProfileImage(url: string): Promise<{ error: Error | null }> {
  try {
    const path = url.split('/profile-images/')[1];
    if (!path) return { error: null };

    const { error } = await supabase.storage
      .from('profile-images')
      .remove([path]);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function getCurrentUserProfile(): Promise<{
  profile: Creator | null;
  error: Error | null;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { profile: null, error: new Error('Not authenticated') };
    }

    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      const { data: niches } = await supabase
        .from('creator_niches')
        .select('niche')
        .eq('creator_id', data.id);

      return {
        profile: {
          ...data,
          niches: niches?.map((n) => n.niche) || [],
        },
        error: null,
      };
    }

    return { profile: null, error: null };
  } catch (error) {
    return { profile: null, error: error as Error };
  }
}

export async function updateUserProfile(
  userId: string,
  updates: ProfileUpdateData,
  niches?: string[]
): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: creator } = await supabase
      .from('creators')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!creator) {
      throw new Error('Creator profile not found');
    }

    const { error: updateError } = await supabase
      .from('creators')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creator.id);

    if (updateError) throw updateError;

    if (niches !== undefined) {
      await supabase
        .from('creator_niches')
        .delete()
        .eq('creator_id', creator.id);

      if (niches.length > 0) {
        const nicheRecords = niches.map((niche) => ({
          creator_id: creator.id,
          niche,
        }));

        const { error: nichesError } = await supabase
          .from('creator_niches')
          .insert(nicheRecords);

        if (nichesError) throw nichesError;
      }
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function updateUserEmail(
  newEmail: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function updateUserPassword(
  newPassword: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
