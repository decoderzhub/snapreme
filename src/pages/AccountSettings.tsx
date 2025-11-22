import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader, CheckCircle, AlertCircle, Eye, Lock, X, TrendingUp, Star, Crown, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import Field from '../components/Field';
import {
  getCurrentUserProfile,
  updateUserProfile,
  uploadProfileImage,
  deleteProfileImage,
  updateUserPassword,
  ProfileUpdateData,
} from '../lib/profileHelpers';
import { Creator } from '../types/database';

const NICHE_OPTIONS = [
  'Fashion & Beauty',
  'Fitness & Health',
  'Food & Cooking',
  'Travel & Lifestyle',
  'Gaming & Tech',
  'Comedy & Entertainment',
  'Business & Finance',
  'Art & Photography',
  'Music & Dance',
  'Education & Learning',
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
    },
    Pro: {
      icon: Star,
      gradient: 'from-blue-500 to-cyan-500',
    },
    Elite: {
      icon: Crown,
      gradient: 'from-amber-500 to-orange-500',
    }
  };
  return styles[tier];
}

interface PreviewCardProps {
  formData: ProfileUpdateData;
  tier: 'Rising' | 'Pro' | 'Elite';
  niches: string[];
}

function PreviewCard({ formData, tier, niches }: PreviewCardProps) {
  const tierStyle = getTierStyle(tier);
  const TierIcon = tierStyle.icon;
  const price = formData.subscription_price || 5;
  const category = niches[0] || 'Creator';

  if (!formData.card_image_url) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
        <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Upload a card image to preview</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="relative h-[420px] w-full">
        <img
          src={formData.card_image_url}
          alt={formData.display_name || 'Preview'}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />

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
                {category}
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
  const [uploadingSnapcode, setUploadingSnapcode] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Creator | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
    snapcode_url: null,
  });

  const [niches, setNiches] = useState<string[]>([]);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [contentTypeInput, setContentTypeInput] = useState('');
  const [topRegionInput, setTopRegionInput] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const derivedTier = calculateTierFromFollowers(formData.followers || 0);

  useEffect(() => {
    loadProfile();
  }, []);

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
    setLoading(true);
    const { profile: profileData, error: profileError } = await getCurrentUserProfile();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (profileData) {
      setProfile(profileData);
      const followers = profileData.followers || 0;

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
      setNiches(profileData.niches || []);
    }

    setLoading(false);
  }

  const handleInputChange = (field: keyof ProfileUpdateData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'display_name') {
        const username = value?.trim() || '';
        updated.handle = username ? `@${username.replace(/^@+/, '')}` : '';
      }
      return updated;
    });
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

    const { url, error: uploadError } = await uploadProfileImage(
      file,
      user.id,
      'card'
    );

    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      handleInputChange('card_image_url', url);
    }

    setUploadingCardImage(false);
  };

  const handleSnapcodeUpload = async (file: File) => {
    if (!user) return;

    setUploadingSnapcode(true);
    if (formData.snapcode_url) {
      await deleteProfileImage(formData.snapcode_url);
    }

    const { url, error: uploadError } = await uploadProfileImage(file, user.id, 'snapcode');

    if (uploadError) {
      setError(uploadError.message);
    } else if (url) {
      handleInputChange('snapcode_url', url);
    }

    setUploadingSnapcode(false);
  };

  const handleNicheToggle = (niche: string) => {
    setNiches((prev) =>
      prev.includes(niche) ? prev.filter((n) => n !== niche) : [...prev, niche]
    );
    setHasUnsavedChanges(true);
  };

  const addContentType = () => {
    if (contentTypeInput.trim() && !formData.content_types?.includes(contentTypeInput.trim())) {
      handleInputChange('content_types', [...(formData.content_types || []), contentTypeInput.trim()]);
      setContentTypeInput('');
    }
  };

  const removeContentType = (type: string) => {
    handleInputChange('content_types', formData.content_types?.filter((t) => t !== type) || []);
  };

  const addTopRegion = () => {
    if (topRegionInput.trim() && !formData.top_regions?.includes(topRegionInput.trim())) {
      handleInputChange('top_regions', [...(formData.top_regions || []), topRegionInput.trim()]);
      setTopRegionInput('');
    }
  };

  const removeTopRegion = (region: string) => {
    handleInputChange('top_regions', formData.top_regions?.filter((r) => r !== region) || []);
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
    const fields = [
      formData.name,
      formData.handle,
      formData.bio,
      formData.short_bio,
      formData.avatar_url,
      formData.card_image_url,
      formData.cover_url,
      formData.region,
      niches.length > 0,
      formData.content_types && formData.content_types.length > 0,
    ];

    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Profile Found</h2>
          <p className="text-slate-600 mb-6">
            You need to create a creator profile first.
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  const completeness = calculateCompleteness();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-transparent py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Account Settings</h1>
            <p className="text-slate-600">Manage your creator profile and account preferences</p>
          </div>
          <button
            onClick={() => setShowPreviewModal(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview Card
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Profile updated successfully!</span>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-900">Profile Completeness</h3>
                <span className="text-2xl font-bold text-blue-600">{completeness}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Complete your profile to increase visibility to brands
              </p>
            </div>
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Pictures</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUpload
                currentImage={formData.avatar_url}
                onImageSelect={handleAvatarUpload}
                onImageRemove={() => handleInputChange('avatar_url', null)}
                label="Avatar Image"
                aspectRatio="aspect-square"
                uploading={uploadingAvatar}
              />
              <ImageUpload
                currentImage={formData.card_image_url}
                onImageSelect={handleCardImageUpload}
                onImageRemove={() => handleInputChange('card_image_url', null)}
                label="Card Image"
                aspectRatio="aspect-[4/3]"
                uploading={uploadingCardImage}
              />
            </div>
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  currentImage={formData.snapcode_url}
                  onImageSelect={handleSnapcodeUpload}
                  onImageRemove={() => handleInputChange('snapcode_url', null)}
                  label="Snapcode Image"
                  aspectRatio="aspect-square"
                  uploading={uploadingSnapcode}
                />

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">
                    Example Snapcode
                  </label>
                  <div className="aspect-square bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 rounded-lg p-4 flex items-center justify-center">
                    <div className="bg-yellow-400 rounded-2xl p-6 w-full h-full flex flex-col items-center justify-center border-4 border-black">
                      <div className="bg-white w-3/4 h-3/4 rounded-xl flex items-center justify-center mb-3">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto mb-2"></div>
                          <div className="space-y-1">
                            <div className="h-2 bg-slate-300 rounded w-16 mx-auto"></div>
                            <div className="h-2 bg-slate-300 rounded w-12 mx-auto"></div>
                          </div>
                        </div>
                      </div>
                      <p className="text-black text-sm font-bold">Your Name</p>
                      <p className="text-black text-xs">@username</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-1">Pro Tip: How to get your Snapcode</p>
                <p className="text-xs text-blue-700">
                  Open Snapchat, go to your profile, and tap the <span className="font-semibold">Share</span> icon in the top right.
                  You'll see your Snap QR code with a "Share" button. Tap it to download the image to your photos,
                  then upload it here for your profile. It should look similar to the example on the right.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Basic Information</h2>
            <div className="space-y-4">
              <Field
                label="Display Name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Your Name"
                required
              />
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Handle <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.handle || ''}
                  disabled
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 cursor-not-allowed"
                  placeholder="@yourusername"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Auto-generated from your username
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Creator Tier (auto-assigned)
                </label>
                <div className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                  {derivedTier}
                  <span className="ml-2 text-xs text-slate-500">
                    based on total fans
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Region
                </label>
                <select
                  value={formData.region || ''}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a region</option>
                  {REGION_OPTIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Bio & About</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Short Bio
                  <span className="text-xs text-slate-500 font-normal ml-2">
                    (shown on cards)
                  </span>
                </label>
                <textarea
                  value={formData.short_bio || ''}
                  onChange={(e) => handleInputChange('short_bio', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-y"
                  placeholder="A brief description of what you do..."
                  maxLength={160}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.short_bio?.length || 0}/160 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Bio
                  <span className="text-xs text-slate-500 font-normal ml-2">
                    (shown on profile header)
                  </span>
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                  placeholder="Tell brands about yourself..."
                  maxLength={300}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.bio?.length || 0}/300 characters
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  About
                  <span className="text-xs text-slate-500 font-normal ml-2">
                    (full profile description)
                  </span>
                </label>
                <textarea
                  value={formData.about || ''}
                  onChange={(e) => handleInputChange('about', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y"
                  placeholder="Write a detailed description about your content, style, and what makes you unique..."
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.about?.length || 0} characters
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Content & Niches</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Select Your Niches
                </label>
                <div className="flex flex-wrap gap-2">
                  {NICHE_OPTIONS.map((niche) => (
                    <button
                      key={niche}
                      type="button"
                      onClick={() => handleNicheToggle(niche)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        niches.includes(niche)
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Content Types
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={contentTypeInput}
                    onChange={(e) => setContentTypeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContentType())}
                    placeholder="e.g., Stories, Reels, Spotlights"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addContentType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.content_types?.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => removeContentType(type)}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Top Audience Regions
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={topRegionInput}
                    onChange={(e) => setTopRegionInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopRegion())}
                    placeholder="e.g., United States, United Kingdom"
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTopRegion}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.top_regions?.map((region) => (
                    <span
                      key={region}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      {region}
                      <button
                        type="button"
                        onClick={() => removeTopRegion(region)}
                        className="hover:text-slate-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Audience Stats</h2>
            <p className="text-sm text-slate-600 mb-6">
              These numbers are generated from fans who follow and view your profile.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Fans</p>
                <p className="text-2xl font-bold text-slate-900">
                  {profile?.followers ?? 0}
                </p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Profile Views</p>
                <p className="text-2xl font-bold text-slate-900">
                  {profile?.profile_views ?? 0}
                </p>
              </div>
              <div className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                <p className="text-sm text-slate-500">Subscribers</p>
                <p className="text-2xl font-bold text-slate-900">
                  {profile?.subscribers ?? 0}
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Account Security
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Email Address
                </label>
                <div className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-700">
                  {user?.email}
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Email is locked because it is used for account verification.
                </p>
              </div>

              {!showPasswordSection ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(true)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Change Password
                </button>
              ) : (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <Field
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Field
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordSection(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-slate-600 hover:text-slate-700 font-medium text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </section>

            <div className="flex items-center justify-end gap-4 bg-white rounded-xl shadow-lg border border-slate-100 p-4">
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
                className="px-6 py-3 text-slate-600 font-semibold hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Card Preview</h3>
              <PreviewCard formData={formData} tier={derivedTier} niches={niches} />
            </div>
          </div>
        </div>
      </div>

      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:hidden">
          <div className="relative w-full max-w-sm">
            <button
              onClick={() => setShowPreviewModal(false)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            <PreviewCard formData={formData} tier={derivedTier} niches={niches} />
          </div>
        </div>
      )}
    </div>
  );
}
