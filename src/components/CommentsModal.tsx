import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Send, Trash2, MessageCircle } from 'lucide-react';
import { useComments } from '../hooks/useComments';
import { Creator } from '../types/database';

// Simple time ago formatter
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

interface CommentsModalProps {
  creator: Creator;
  currentUserId: string | undefined;
  onClose: () => void;
}

export default function CommentsModal({ creator, currentUserId, onClose }: CommentsModalProps) {
  const { comments, loading, addComment, toggleReaction, deleteComment } = useComments(creator.id, currentUserId);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    await addComment(newComment);
    setNewComment('');
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[85vh] bg-neutral-900 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <img
              src={creator.avatar_url || ''}
              alt={creator.display_name || creator.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="text-white font-semibold">{creator.display_name || creator.name}</h3>
              <p className="text-neutral-400 text-sm">{comments.length} comments</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-12 h-12 text-neutral-700 mb-3" />
              <p className="text-neutral-400">No comments yet</p>
              <p className="text-neutral-500 text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                {/* Avatar */}
                {comment.user_avatar_url ? (
                  <img
                    src={comment.user_avatar_url}
                    alt={comment.user_display_name}
                    className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {(comment.user_display_name || 'A').slice(0, 1).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-white">
                      {comment.user_display_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-300 whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => currentUserId && toggleReaction(comment.id, 'like')}
                      disabled={!currentUserId}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        comment.user_reaction === 'like'
                          ? 'text-green-500'
                          : 'text-neutral-500 hover:text-green-500'
                      } disabled:opacity-50`}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${comment.user_reaction === 'like' ? 'fill-current' : ''}`} />
                      <span>{comment.likes_count || 0}</span>
                    </button>

                    <button
                      onClick={() => currentUserId && toggleReaction(comment.id, 'dislike')}
                      disabled={!currentUserId}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        comment.user_reaction === 'dislike'
                          ? 'text-red-500'
                          : 'text-neutral-500 hover:text-red-500'
                      } disabled:opacity-50`}
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${comment.user_reaction === 'dislike' ? 'fill-current' : ''}`} />
                      <span>{comment.dislikes_count || 0}</span>
                    </button>

                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-500 transition-colors ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        {currentUserId ? (
          <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
            <div className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 rounded-full bg-neutral-800 border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white disabled:opacity-50 hover:brightness-110 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 border-t border-neutral-800 text-center">
            <p className="text-neutral-500 text-sm">Sign in to leave a comment</p>
          </div>
        )}
      </div>
    </div>
  );
}
