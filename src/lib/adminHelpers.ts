import { supabase } from './supabase';
import { Creator, Campaign, AdminStats } from '../types/database';

export async function getAdminStats(): Promise<{ stats: AdminStats | null; error: Error | null }> {
  try {
    const [creatorsResult, campaignsResult, bookingRequestsResult] = await Promise.all([
      supabase.from('creators').select('id, verification_status, created_at'),
      supabase.from('campaigns').select('id, is_active'),
      supabase.from('booking_requests').select('id, status'),
    ]);

    if (creatorsResult.error) throw creatorsResult.error;
    if (campaignsResult.error) throw campaignsResult.error;
    if (bookingRequestsResult.error) throw bookingRequestsResult.error;

    const creators = creatorsResult.data || [];
    const campaigns = campaignsResult.data || [];
    const bookingRequests = bookingRequestsResult.data || [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats: AdminStats = {
      totalCreators: creators.length,
      verifiedCreators: creators.filter((c) => c.verification_status === 'verified').length,
      pendingVerification: creators.filter((c) => c.verification_status === 'pending').length,
      newSignups24h: creators.filter((c) => new Date(c.created_at) > oneDayAgo).length,
      newSignups7d: creators.filter((c) => new Date(c.created_at) > sevenDaysAgo).length,
      activeBrands: 0,
      liveCampaigns: campaigns.filter((c) => c.is_active).length,
      pendingCampaigns: 0,
      totalBookingRequests: bookingRequests.length,
      completedCollaborations: bookingRequests.filter((r) => r.status === 'accepted').length,
      pendingRequests: bookingRequests.filter((r) => r.status === 'pending').length,
    };

    return { stats, error: null };
  } catch (error) {
    return { stats: null, error: error as Error };
  }
}

export async function getAllCreators(): Promise<{ creators: Creator[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const creatorsWithNiches = await Promise.all(
      (data || []).map(async (creator) => {
        const { data: niches } = await supabase
          .from('creator_niches')
          .select('niche')
          .eq('creator_id', creator.id);

        return {
          ...creator,
          niches: niches?.map((n) => n.niche) || [],
        };
      })
    );

    return { creators: creatorsWithNiches, error: null };
  } catch (error) {
    return { creators: [], error: error as Error };
  }
}

export async function getPendingVerifications(): Promise<{ creators: Creator[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('creators')
      .select('*')
      .eq('verification_status', 'pending')
      .order('verification_submitted_at', { ascending: true });

    if (error) throw error;

    const creatorsWithNiches = await Promise.all(
      (data || []).map(async (creator) => {
        const { data: niches } = await supabase
          .from('creator_niches')
          .select('niche')
          .eq('creator_id', creator.id);

        return {
          ...creator,
          niches: niches?.map((n) => n.niche) || [],
        };
      })
    );

    return { creators: creatorsWithNiches, error: null };
  } catch (error) {
    return { creators: [], error: error as Error };
  }
}

export async function updateCreatorVerification(
  creatorId: string,
  status: 'verified' | 'rejected',
  notes?: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('creators')
      .update({
        verification_status: status,
        verification_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function updateCreatorAccountStatus(
  creatorId: string,
  status: 'active' | 'suspended' | 'deleted'
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('creators')
      .update({
        account_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creatorId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function deleteCreator(creatorId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('creators').delete().eq('id', creatorId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function getAllCampaigns(): Promise<{ campaigns: Campaign[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const campaignsWithDetails = await Promise.all(
      (data || []).map(async (campaign) => {
        const { data: niches } = await supabase
          .from('campaign_niches')
          .select('niche')
          .eq('campaign_id', campaign.id);

        const { data: regions } = await supabase
          .from('campaign_regions')
          .select('region')
          .eq('campaign_id', campaign.id);

        return {
          ...campaign,
          niches: niches?.map((n) => n.niche) || [],
          regions: regions?.map((r) => r.region) || [],
        };
      })
    );

    return { campaigns: campaignsWithDetails, error: null };
  } catch (error) {
    return { campaigns: [], error: error as Error };
  }
}

export async function updateCampaignStatus(
  campaignId: string,
  isActive: boolean
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('campaigns')
      .update({ is_active: isActive })
      .eq('id', campaignId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function deleteCampaign(campaignId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('campaigns').delete().eq('id', campaignId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function logAdminActivity(
  actionType: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, any>
): Promise<{ error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.from('admin_activity_logs').insert({
      admin_id: user.id,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      details,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
