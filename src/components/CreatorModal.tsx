import { X, Lock, MessageCircle } from 'lucide-react';
import { Creator } from '../types/database';

interface Props {
  creator: Creator;
  onClose: () => void;
}

export default function CreatorModal({ creator, onClose }: Props) {
  const cover =
    creator.cover_url ||
    creator.avatar_url ||
    'https://images.pexels.com/photos/3348748/pexels-photo-3348748.jpeg';

  const price = creator.subscription_price || 5;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 bg-black/10 hover:bg-black/20 rounded-full p-1.5 z-10"
        >
          <X className="w-4 h-4 text-slate-700" />
        </button>

        <div className="relative h-60">
          <img src={cover} alt={creator.display_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />

          <div className="absolute bottom-3 left-4">
            <p className="text-xl text-white font-semibold">
              {creator.display_name || creator.name}
            </p>
            <p className="text-white/80 text-sm">{creator.handle}</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {creator.profile_views ?? 0}
              </p>
              <p className="text-xs text-slate-500">Views</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {creator.subscribers ?? 0}
              </p>
              <p className="text-xs text-slate-500">Fans</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">
                {creator.posts ?? 0}
              </p>
              <p className="text-xs text-slate-500">Posts</p>
            </div>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {creator.bio || 'This creator has not added a bio yet.'}
          </p>

          {creator.category && (
            <div className="flex gap-2 flex-wrap">
              <span className="text-xs px-2 py-1 bg-blue-600/10 text-blue-600 rounded-full">
                {creator.category}
              </span>
            </div>
          )}

          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-full shadow-md hover:brightness-105 transition-all font-semibold">
            <Lock className="w-4 h-4" />
            Unlock all content — ${price}/month
          </button>

          <button className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-full hover:bg-slate-200 transition-all">
            <MessageCircle className="w-4 h-4" />
            Message (coming soon)
          </button>
        </div>
      </div>
    </div>
  );
}
