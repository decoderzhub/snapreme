import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Users, TrendingUp, Eye, ExternalLink, Copy, CheckCircle, X, Edit } from 'lucide-react';
import OfferCard from '../components/OfferCard';
import { Creator } from '../types/database';
import { mockCreators, mockOffers } from '../data/creators';
import { useAuth } from '../contexts/AuthContext';

export default function CreatorProfile() {
  const { handle } = useParams<{ handle: string }>();
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    brand_project: '',
    message: '',
  });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const cleanHandle = handle?.replace('@', '');
    const foundCreator = mockCreators.find((c) => c.handle.replace('@', '') === cleanHandle);
    setCreator(foundCreator || null);
  }, [handle]);

  if (!creator) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Creator Not Found</h2>
          <p className="text-slate-600 mb-6">This creator profile doesn't exist or has been removed.</p>
          <Link
            to="/network"
            className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all"
          >
            Browse Creators
          </Link>
        </div>
      </div>
    );
  }

  const creatorOffers = mockOffers[creator.id] || [];
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Elite':
        return 'bg-yellow-500 text-white';
      case 'Pro':
        return 'bg-blue-600 text-white';
      case 'Rising':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-slate-600 text-white';
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const handleBookOffer = (offerId: string) => {
    setSelectedOfferId(offerId);
    setShowBookingModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Booking request:', { ...bookingForm, creator_id: creator.id, offer_id: selectedOfferId });
    setBookingSuccess(true);
    setTimeout(() => {
      setShowBookingModal(false);
      setBookingSuccess(false);
      setBookingForm({ name: '', email: '', brand_project: '', message: '' });
    }, 2000);
  };

  const relatedCreators = mockCreators
    .filter((c) => c.id !== creator.id && c.niches?.some((n) => creator.niches?.includes(n)))
    .slice(0, 3);

  const isOwnProfile = user?.id === creator.user_id;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className="h-72 sm:h-96 overflow-hidden">
          <img
            src={creator.cover_url || 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg'}
            alt={creator.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isOwnProfile && (
            <Link
              to="/account/settings"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg font-medium"
            >
              <Edit size={18} />
              <span className="text-sm">Edit Profile</span>
            </Link>
          )}
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all flex items-center gap-2 shadow-lg"
          >
            {copiedLink ? (
              <>
                <CheckCircle size={18} className="text-green-600" />
                <span className="text-sm font-medium text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={18} className="text-slate-700" />
                <span className="text-sm font-medium text-slate-700">Share Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-32 flex-shrink-0">
            {creator.avatar_url && (
              <img
                src={creator.avatar_url}
                alt={creator.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-xl"
              />
            )}
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">{creator.name}</h1>
                  <p className="text-lg text-blue-600 font-medium mb-3">{creator.handle}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getTierColor(creator.tier)}`}>
                      {creator.tier} Creator
                    </span>
                    {creator.niches?.map((niche) => (
                      <span
                        key={niche}
                        className="px-3 py-1 text-sm font-medium rounded-full bg-blue-50 text-blue-600"
                      >
                        {niche}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Users size={18} />
                    <span className="text-xs uppercase tracking-wide font-medium">Followers</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{formatFollowers(creator.followers)}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <TrendingUp size={18} />
                    <span className="text-xs uppercase tracking-wide font-medium">Engagement</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{creator.engagement_rate}%</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Eye size={18} />
                    <span className="text-xs uppercase tracking-wide font-medium">Avg Views</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatFollowers(creator.avg_story_views || 0)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <MapPin size={18} />
                    <span className="text-xs uppercase tracking-wide font-medium">Region</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{creator.region}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 mt-8">
          <div className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About</h2>
              <div className="prose prose-slate max-w-none">
                {creator.about?.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-slate-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {creator.content_types && creator.content_types.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Content Focus</h2>
                <div className="flex flex-wrap gap-2">
                  {creator.content_types.map((type) => (
                    <span
                      key={type}
                      className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {creator.top_regions && creator.top_regions.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Audience Highlights</h2>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-600">
                      <span className="font-semibold">Top Regions:</span> {creator.top_regions.join(', ')}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-600">
                      <span className="font-semibold">Primary Age Group:</span> 18-34 years old
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-600">
                      <span className="font-semibold">Most Active:</span> Evenings & weekends
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Shoppable Offers</h2>

              {creatorOffers.length > 0 ? (
                <div className="space-y-4">
                  {creatorOffers.map((offer) => (
                    <OfferCard
                      key={offer.id}
                      title={offer.title}
                      description={offer.description}
                      priceLabel={offer.price_label}
                      deliveryWindow={offer.delivery_window}
                      bestFor={offer.best_for}
                      onBook={() => handleBookOffer(offer.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  This creator hasn't set up offers yet. Check back soon!
                </p>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  Payments processed securely via Stripe (coming soon)
                </p>
              </div>
            </div>

            {creator.snapcode_url && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Connect on Snapchat</h3>
                <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-center">
                  <img
                    src={creator.snapcode_url}
                    alt="Snapcode"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-xs text-slate-500 text-center mt-3">Scan to add on Snapchat</p>
              </div>
            )}
          </div>
        </div>

        {relatedCreators.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">More creators like {creator.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCreators.map((relatedCreator) => (
                <Link
                  key={relatedCreator.id}
                  to={`/creator/${relatedCreator.handle.replace('@', '')}`}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={relatedCreator.cover_url || ''}
                      alt={relatedCreator.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-1">{relatedCreator.name}</h3>
                    <p className="text-sm text-blue-600 mb-2">{relatedCreator.handle}</p>
                    <p className="text-xs text-slate-600 line-clamp-2">{relatedCreator.short_bio}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            {bookingSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</h3>
                <p className="text-slate-600">
                  {creator.name} will review your collaboration request and get back to you soon.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Collaboration</h3>
                <p className="text-slate-600 mb-6">Send a collaboration request to {creator.name}</p>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Brand / Project *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.brand_project}
                      onChange={(e) => setBookingForm({ ...bookingForm, brand_project: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your brand or project name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">Message</label>
                    <textarea
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y"
                      placeholder="Tell the creator about your collaboration idea..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                  >
                    Send Request
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
