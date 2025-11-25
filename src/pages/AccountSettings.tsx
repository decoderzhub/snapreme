import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader, CheckCircle, AlertCircle, Eye, Lock, X, TrendingUp, Star, Crown, Heart, Camera, User, Palette, Dumbbell, Shirt, Briefcase, Gamepad2, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import {
  getCurrentUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
  updateUserPassword,
  ProfileUpdateData,
} from '../lib/profileHelpers';
import { Creator } from '../types/database';
import { supabase } from '../lib/supabase';

// Categories aligned with Explore/Network page
const CATEGORY_OPTIONS = [
  { id: 'Fitness', label: 'Fitness', icon: Dumbbell },
  { id: 'Fashion', label: 'Fashion', icon: Shirt },
  { id: 'Art', label: 'Art & Design', icon: Palette },
  { id: 'Coaching', label: 'Coaching', icon: Briefcase },
  { id: 'Cosplay', label: 'Cosplay', icon: Gamepad2 },
  { id: 'Lifestyle', label: 'Lifestyle', icon: Sparkles },
];

const REGION_OPTIONS = [
  'North America',
  'Europe',
  'Asia',
  'South America',
  'Africa',
  'Oceania',
  'Middle East',
];

function calculateTierFromFollowers(followers: number): 'Rising' | 'Pro' | 'Elite' {
  if (followers >= 1000000) return 'Elite';
  if (followers >= 100000) return 'Pro';
  return 'Rising';
}

function getTierStyle(tier: 'Rising' | 'Pro' | 'Elite') {
  const styles = {
    Rising: {
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
    },
    Pro: {
      icon: Star,
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-500/20',
      text: 'text-blue-400',
    },
    Elite: {
      icon: Crown,
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-500/20',
      text: 'text-amber-400',
    }
  };
  return styles[tier];
}

interface PreviewCardProps {
  formData: ProfileUpdateData;
  tier: 'Rising' | 'Pro' | 'Elite';
  category: string;
}

function PreviewCard({ formData, tier, category }: PreviewCardProps) {
  const tierStyle = getTierStyle(tier);
  const TierIcon = tierStyle.icon;
  const price = formData.subscription_price || 5;

  if (!formData.card_image_url) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 p-8 text-center">
        <Camera className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Upload a card image to preview</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-800/50 backdrop-blur-sm rounded-3xl border border-slate-700 overflow-hidden">
      <div className="relative h-[420px] w-full">
        <img
          src={formData.card_image_url}
          alt={formData.name || 'Preview'}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

        <div className={`absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r ${tierStyle.gradient} rounded-full flex items-center gap-1.5 shadow-lg`}>
          <TierIcon className="w-3.5 h-3.5 text-white" />
          <span className="text-white text-xs font-semibold">{tier}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          <div className="text-left space-y-1 flex-1">
            <p className="text-white text-lg font-semibold leading-tight">
              {formData.display_name || formData.name || 'Your Name'}
            </p>
            <p className="text-white/80 text-sm">{formData.handle || '@yourhandle'}</p>

            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-[11px] bg-white/20 text-white rounded-full">
                {category || 'Creator'}
              </span>
            </div>
          </div>

          {formData.avatar_url && (
            <div className="flex-shrink-0 ml-3">
              <img
                src={formData.avatar_url}
                alt={formData.name || 'Avatar'}
                className="w-16 h-16 rounded-full border-2 border-white shadow-lg object-cover"
              />
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 px-3 py-1 bg-black/60 text-white text-xs rounded-full flex items-center gap-1">
          <Heart className="w-3 h-3 text-pink-400" />
          <span>${price}/mo</span>
        </div>
      </div>
    </div>
  );
}

export default function AccountSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCardImage, setUploadingCardImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Creator | null>(null);
  const [isFan, setIsFan] = useState(false);
  const [fanProfile, setFanProfile] = useState<any>(null);
  const [fanUsername, setFanUsername] = useState('');
  const [fanAvatarUrl, setFanAvatarUrl] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: '',
    display_name: '',
    handle: '',
    bio: '',
    short_bio: '',
    about: '',
    region: '',
    followers: 0,
    engagement_rate: 0,
    starting_rate: 0,
    starting_rate_label: '',
    avg_story_views: 0,
    tier: 'Rising',
    content_types: [],
    top_regions: [],
    avatar_url: null,
    card_image_url: null,
    cover_url: null,
    snapcode_url: null,
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const derivedTier = calculateTierFromFollowers(formData.followers || 0);

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  async function loadProfile() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setIsFan(false);
    setProfile(null);

    const { profile: profileData, error: profileError } = await getCurrentUserProfile();

    if (profileError) {
      console.error('Error loading creator profile:', profileError);
    }

    if (profileData) {
      setProfile(profileData);
      setIsFan(false);
      const followers = profileData.followers || 0;

      const extractedUsername = profileData.handle ? profileData.handle.replace(/^@+/, '') : '';
      setUsername(extractedUsername);

      // Get first niche as category
      const niches = profileData.niches || [];
      setSelectedCategory(niches[0] || '');

      setFormData({
        name: profileData.name || '',
        display_name: profileData.display_name || '',
        handle: profileData.handle || '',
        bio: profileData.bio || '',
        short_bio: profileData.short_bio || '',
        about: profileData.about || '',
        region: profileData.region || '',
        followers,
        engagement_rate: profileData.engagement_rate || 0,
        starting_rate: profileData.starting_rate || 0,
        starting_rate_label: profileData.starting_rate_label || '',
        avg_story_views: profileData.avg_story_views || 0,
        tier: calculateTierFromFollowers(followers),
        content_types: profileData.content_types || [],
        top_regions: profileData.top_regions || [],
        avatar_url: profileData.avatar_url,
        card_image_url: (profileData as any).card_image_url || null,
        cover_url: profileData.cover_url,
        snapcode_url: profileData.snapcode_url,
      });
    } else {
      const { data: fanData } = await supabase
        .from('fan_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fanData) {
        setIsFan(true);
        setFanProfile(fanData);
        setFanUsername(fanData.username || '');
        setFanAvatarUrl(fanData.avatar_url || null);
      }
    }

    setLoading(false);
  }

  const handleInputChange = (field: keyof ProfileUpdateData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleUsernameChange = (value: string) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(sanitized);
    setFormData((prev) => ({
      ...prev,
      handle: sanitized ? `@${sanitized}` : ''
    }));
    setHasUnsavedChanges(true);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    setUploadingAvatar(true);
    if (formData.avatar_url) {
      await deleteProfileImage(formData.avatar_url);
    }

    const { url, error: uploadError } = await uploadProfileImage(file, user.id, 'avatar');

    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      handleInputChange('avatar_url', url);
    }

    setUploadingAvatar(false);
  };

  const handleCardImageUpload = async (file: File) => {
    if (!user) return;

    setUploadingCardImage(true);
    if (formData.card_image_url) {
      await deleteProfileImage(formData.card_image_url);
    }

    const { url, error: uploadError } = await uploadProfileImage(file, user.id, 'card');

    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      handleInputChange('card_image_url', url);
    }

    setUploadingCardImage(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setError('');
    setSaving(true);

    if (!formData.handle?.startsWith('@')) {
      setError('Handle must start with @');
      setSaving(false);
      return;
    }

    if (!formData.avatar_url || !formData.card_image_url) {
      setError('You must upload a profile avatar and card image to continue.');
      setSaving(false);
      return;
    }

    const derivedTierValue = calculateTierFromFollowers(formData.followers || 0);
    const niches = selectedCategory ? [selectedCategory] : [];

    const { error: updateError } = await updateUserProfile(
      user.id,
      { ...formData, tier: derivedTierValue, onboarding_complete: true },
      niches
    );

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setSaving(false);
        return;
      }

      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        setSaving(false);
        return;
      }

      const { error: passwordError } = await updateUserPassword(newPassword);
      if (passwordError) {
        setError(`Profile updated but password change failed: ${passwordError.message}`);
        setSaving(false);
        return;
      }

      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    }

    setSuccess(true);
    setHasUnsavedChanges(false);
    setSaving(false);

    setTimeout(() => setSuccess(false), 3000);
    await loadProfile();
  };

  const calculateCompleteness = () => {
    // Only count essential required fields
    const fields = [
      formData.display_name || formData.name,
      formData.handle,
      formData.avatar_url,
      formData.card_image_url,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!profile && !isFan) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Profile Found</h2>
          <p className="text-slate-400 mb-6">
            You need to create a creator profile first.
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:brightness-110 transition-all"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  // Fan profile view
  if (isFan) {
    return (
      <div className="min-h-screen bg-neutral-950 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
            <p className="text-slate-400">Manage your fan account preferences</p>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-start gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>Settings updated successfully!</span>
              </div>
            )}

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Fan Profile</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Profile Picture</label>
                  <ImageUpload
                    currentImageUrl={fanAvatarUrl}
                    onUploadStart={() => setUploadingAvatar(true)}
                    onUploadComplete={(url) => {
                      setFanAvatarUrl(url);
                      setUploadingAvatar(false);
                      setHasUnsavedChanges(true);
                    }}
                    onDelete={async () => {
                      if (fanAvatarUrl) {
                        await deleteProfileImage(fanAvatarUrl);
                        setFanAvatarUrl(null);
                        setHasUnsavedChanges(true);
                      }
                    }}
                    uploadPath="fan-avatars"
                    aspectRatio="square"
                    label="Upload Avatar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                  <input
                    type="text"
                    value={fanUsername}
                    onChange={(e) => {
                      const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                      setFanUsername(sanitized);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="username"
                    maxLength={30}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-500"
                  />
                </div>

                <button
                  onClick={async () => {
                    if (!user) return;
                    setSaving(true);
                    setError('');

                    const { error: updateError } = await supabase
                      .from('fan_profiles')
                      .update({
                        avatar_url: fanAvatarUrl,
                        username: fanUsername,
                      })
                      .eq('id', user.id);

                    if (updateError) {
                      setError(updateError.message);
                    } else {
                      setSuccess(true);
                      setHasUnsavedChanges(false);
                      setTimeout(() => setSuccess(false), 3000);
                    }
                    setSaving(false);
                  }}
                  disabled={saving || !hasUnsavedChanges}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Want to become a creator?</h3>
              <p className="text-sm text-slate-400 mb-4">
                Start monetizing your content and connect with fans.
              </p>
              <button
                onClick={() => navigate('/apply')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all"
              >
                Apply as Creator
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completeness = calculateCompleteness();
  const tierStyle = getTierStyle(derivedTier);
  const TierIcon = tierStyle.icon;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-purple-900/50 via-slate-900 to-blue-900/50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
              <p className="text-slate-400">Customize your creator card and profile details</p>
            </div>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl flex items-start gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Profile updated successfully!</span>
              </div>
            )}

            {/* Progress */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Profile Completeness</h3>
                <span className="text-2xl font-bold text-purple-400">{completeness}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Complete your profile to increase visibility
              </p>
            </div>

            {/* Profile Images */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Profile Images</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  currentImage={formData.avatar_url}
                  onImageSelect={handleAvatarUpload}
                  onImageRemove={() => handleInputChange('avatar_url', null)}
                  label="Profile Picture"
                  aspectRatio="aspect-square"
                  uploading={uploadingAvatar}
                />
                <ImageUpload
                  currentImage={formData.card_image_url}
                  onImageSelect={handleCardImageUpload}
                  onImageRemove={() => handleInputChange('card_image_url', null)}
                  label="Card Image"
                  aspectRatio="aspect-[3/4]"
                  uploading={uploadingCardImage}
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Display Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.display_name || ''}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Your display name"
                    maxLength={50}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <div className="flex">
                    <span className="px-4 py-3 bg-slate-700 border border-slate-600 border-r-0 rounded-l-xl text-slate-400">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-r-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="username"
                      maxLength={30}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Letters, numbers, and underscores only</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                  <textarea
                    value={formData.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                    placeholder="Tell fans about yourself..."
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.bio?.length || 0}/300 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Creator Tier</label>
                  <div className={`flex items-center gap-3 px-4 py-3 ${tierStyle.bg} border border-slate-600 rounded-xl`}>
                    <TierIcon className={`w-5 h-5 ${tierStyle.text}`} />
                    <span className={`font-semibold ${tierStyle.text}`}>{derivedTier}</span>
                    <span className="text-xs text-slate-500">• Based on followers</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Region</label>
                  <select
                    value={formData.region || ''}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-purple-500 transition-colors"
                  >
                    <option value="">Select a region</option>
                    {REGION_OPTIONS.map((region) => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h2 className="text-xl font-bold text-white mb-2">Content Category</h2>
              <p className="text-sm text-slate-400 mb-6">Select your primary content category</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORY_OPTIONS.map((category) => {
                  const isSelected = selectedCategory === category.id;
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setHasUnsavedChanges(true);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-purple-500/20 border-purple-500 text-white'
                          : 'bg-slate-900/30 border-slate-600 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-400' : ''}`} />
                      <span className="font-medium">{category.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-slate-400" />
                <h2 className="text-xl font-bold text-white">Account Security</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="text"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-slate-900/30 border border-slate-700 rounded-xl text-slate-500"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
                </div>

                {!showPasswordSection ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(true)}
                    className="text-purple-400 hover:text-purple-300 font-medium text-sm"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-4 pt-4 border-t border-slate-700">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-slate-400 hover:text-slate-300 font-medium text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-4 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4">
              <button
                type="button"
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (confirm('Discard unsaved changes?')) {
                      loadProfile();
                      setHasUnsavedChanges(false);
                    }
                  } else {
                    navigate(-1);
                  }
                }}
                className="px-6 py-3 text-slate-400 font-semibold hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-lg font-semibold text-white">Card Preview</h3>
              <PreviewCard
                formData={formData}
                tier={derivedTier}
                category={CATEGORY_OPTIONS.find(c => c.id === selectedCategory)?.label || 'Creator'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:hidden">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <PreviewCard
              formData={formData}
              tier={derivedTier}
              category={CATEGORY_OPTIONS.find(c => c.id === selectedCategory)?.label || 'Creator'}
            />
          </div>
        </div>
      )}
    </div>
  );
}
