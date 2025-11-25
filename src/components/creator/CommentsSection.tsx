import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Send, Trash2, MessageCircle } from 'lucide-react';
import { useComments } from '../../hooks/useComments';

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

interface CommentsSectionProps {
  creatorId: string;
  currentUserId: string | undefined;
  isSubscribed: boolean;
}

export function CommentsSection({ creatorId, currentUserId, isSubscribed }: CommentsSectionProps) {
  const { comments, loading, addComment, toggleReaction, deleteComment } = useComments(creatorId, currentUserId);
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

  const canComment = currentUserId && isSubscribed;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Comments</h3>
          <span className="text-sm text-slate-500">({comments.length})</span>
        </div>
      </div>

      {/* Comment Input */}
      {canComment ? (
        <form onSubmit={handleSubmit} className="px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
              {currentUserId?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                rows={2}
                maxLength={500}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">{newComment.length}/500</span>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 text-center">
          <p className="text-sm text-slate-500">
            {!currentUserId
              ? 'Sign in to leave a comment'
              : 'Subscribe to leave a comment'}
          </p>
        </div>
      )}

      {/* Comments List */}
      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {loading ? (
          <div className="px-5 py-8 text-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-sm text-slate-500 mt-2">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No comments yet</p>
            <p className="text-xs text-slate-400 mt-1">Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="px-5 py-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.user_avatar_url ? (
                    <img
                      src={comment.user_avatar_url}
                      alt={comment.user_display_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white font-semibold text-sm">
                      {(comment.user_display_name || 'A').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-slate-900">
                      {comment.user_display_name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatTimeAgo(comment.created_at)}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                    {comment.text}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    {/* Like */}
                    <button
                      onClick={() => currentUserId && toggleReaction(comment.id, 'like')}
                      disabled={!currentUserId}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        comment.user_reaction === 'like'
                          ? 'text-green-600'
                          : 'text-slate-400 hover:text-green-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${comment.user_reaction === 'like' ? 'fill-current' : ''}`} />
                      <span>{comment.likes_count || 0}</span>
                    </button>

                    {/* Dislike */}
                    <button
                      onClick={() => currentUserId && toggleReaction(comment.id, 'dislike')}
                      disabled={!currentUserId}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        comment.user_reaction === 'dislike'
                          ? 'text-red-500'
                          : 'text-slate-400 hover:text-red-500'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <ThumbsDown className={`w-4 h-4 ${comment.user_reaction === 'dislike' ? 'fill-current' : ''}`} />
                      <span>{comment.dislikes_count || 0}</span>
                    </button>

                    {/* Delete (only for own comments) */}
                    {currentUserId === comment.user_id && (
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
