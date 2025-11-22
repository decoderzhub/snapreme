export interface Creator {
  id: string;
  user_id: string;
  name: string;
  display_name?: string;
  handle: string;
  avatar_url: string | null;
  cover_url: string | null;
  card_image_url?: string | null;
  tier: 'Rising' | 'Pro' | 'Elite';
  bio: string | null;
  short_bio?: string;
  about?: string;
  region: string | null;
  followers: number;
  engagement_rate: number;
  starting_rate: number;
  starting_rate_label?: string;
  snapcode_url: string | null;
  content_types?: string[];
  top_regions?: string[];
  avg_story_views?: number;
  is_admin?: boolean;
  verification_status?: 'unverified' | 'pending' | 'verified' | 'rejected';
  verification_submitted_at?: string;
  verification_notes?: string;
  account_status?: 'active' | 'suspended' | 'deleted';
  admin_notes?: string;
  onboarding_complete?: boolean;
  is_stripe_connected?: boolean;
  created_at: string;
  updated_at: string;
  niches?: string[];
  offers?: CreatorOffer[];
  is_priority?: boolean;
  profile_views?: number;
  subscribers?: number;
  subscription_price?: number;
  posts?: number;
  category?: string;
}

export interface CreatorNiche {
  id: string;
  creator_id: string;
  niche: string;
}

export interface Campaign {
  id: string;
  brand_name: string;
  title: string;
  budget_range: string;
  deadline: string;
  description: string;
  logo_initials: string;
  is_active: boolean;
  created_at: string;
  niches?: string[];
  regions?: string[];
}

export interface CampaignNiche {
  id: string;
  campaign_id: string;
  niche: string;
}

export interface CampaignRegion {
  id: string;
  campaign_id: string;
  region: string;
}

export interface CollaborationRequest {
  id: string;
  creator_id: string;
  requester_id: string;
  campaign_id: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  message: string | null;
  created_at: string;
}

export interface ProfileView {
  id: string;
  creator_id: string;
  viewer_id: string | null;
  viewed_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface NetworkStats {
  totalCreators: number;
  activeBrands: number;
  monthlyCollabs: number;
  averageRating: number;
}

export interface CreatorOffer {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  price_label: string;
  delivery_window: string;
  best_for: string;
  is_active: boolean;
  created_at: string;
}

export interface CreatorApplication {
  id?: string;
  full_name: string;
  snapchat_handle: string;
  email: string;
  region: string;
  niches: string[];
  snapcode_file?: File | null;
  followers?: number;
  avg_story_views?: number;
  short_bio?: string;
  content_types?: string;
  open_to_collabs: boolean;
  open_to_swaps: boolean;
  offers: {
    title: string;
    description: string;
    price_label: string;
    delivery_window: string;
    best_for: string;
  }[];
}

export interface BookingRequest {
  name: string;
  email: string;
  brand_project: string;
  offer_id: string;
  message: string;
  creator_id: string;
}

export interface BrandBrief {
  campaign_title: string;
  promoting: string;
  target_audience: string;
  regions: string[];
  creator_niche: string;
  budget_range: string;
  deliverables: string[];
}

export interface FilterState {
  search: string;
  niche: string;
  tier: string;
  region: string;
  minFollowers: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface AdminStats {
  totalCreators: number;
  verifiedCreators: number;
  pendingVerification: number;
  newSignups24h: number;
  newSignups7d: number;
  activeBrands: number;
  liveCampaigns: number;
  pendingCampaigns: number;
  totalBookingRequests: number;
  completedCollaborations: number;
  pendingRequests: number;
}
