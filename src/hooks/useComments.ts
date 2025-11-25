import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Comment } from '../types/database';

export function useComments(creatorId: string | undefined, currentUserId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    if (!creatorId) {
      setComments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch comments without join (simpler, more reliable)
      const { data: commentsData, error: fetchError } = await supabase
        .from('comments')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Fetch reaction counts for each comment
      const commentsWithReactions = await Promise.all(
        (commentsData || []).map(async (comment: any) => {
          // Get likes count
          const { count: likesCount } = await supabase
            .from('comment_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id)
            .eq('reaction_type', 'like');

          // Get dislikes count
          const { count: dislikesCount } = await supabase
            .from('comment_reactions')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', comment.id)
            .eq('reaction_type', 'dislike');

          // Get current user's reaction if logged in
          let userReaction = null;
          if (currentUserId) {
            const { data: reactionData } = await supabase
              .from('comment_reactions')
              .select('reaction_type')
              .eq('comment_id', comment.id)
              .eq('user_id', currentUserId)
              .maybeSingle();

            userReaction = reactionData?.reaction_type || null;
          }

          return {
            ...comment,
            user_display_name: 'User',
            user_avatar_url: null,
            likes_count: likesCount || 0,
            dislikes_count: dislikesCount || 0,
            user_reaction: userReaction,
          };
        })
      );

      setComments(commentsWithReactions);
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [creatorId, currentUserId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (text: string) => {
    if (!creatorId || !currentUserId || !text.trim()) return null;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          creator_id: creatorId,
          user_id: currentUserId,
          text: text.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }

      // Refresh comments to get the new one
      await fetchComments();
      return data;
    } catch (err: any) {
      console.error('Error adding comment:', err);
      return null;
    }
  };

  const toggleReaction = async (commentId: string, reactionType: 'like' | 'dislike') => {
    if (!currentUserId) return;

    try {
      // Check if user already has a reaction on this comment
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('*')
        .eq('comment_id', commentId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (existingReaction) {
        if (existingReaction.reaction_type === reactionType) {
          // Same reaction - remove it
          await supabase
            .from('comment_reactions')
            .delete()
            .eq('id', existingReaction.id);
        } else {
          // Different reaction - update it
          await supabase
            .from('comment_reactions')
            .update({ reaction_type: reactionType })
            .eq('id', existingReaction.id);
        }
      } else {
        // No existing reaction - create new one
        await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: currentUserId,
            reaction_type: reactionType,
          });
      }

      // Refresh comments to update counts
      await fetchComments();
    } catch (err: any) {
      console.error('Error toggling reaction:', err);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', currentUserId);

      if (error) throw error;

      await fetchComments();
    } catch (err: any) {
      console.error('Error deleting comment:', err);
    }
  };

  return {
    comments,
    loading,
    error,
    addComment,
    toggleReaction,
    deleteComment,
    refetch: fetchComments,
  };
}

// Hook to get comment count for a creator
export function useCommentCount(creatorId: string | undefined) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!creatorId) {
      setCount(0);
      return;
    }

    async function fetchCount() {
      const { count: commentCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', creatorId);

      setCount(commentCount || 0);
    }

    fetchCount();
  }, [creatorId]);

  return count;
}
