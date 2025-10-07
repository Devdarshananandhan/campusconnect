import React, { useMemo, useState } from 'react';
import { TrendingUp, Award, Star, MessageSquare } from 'lucide-react';

export interface FeedItem {
  id: string;
  content: string;
  createdAt: string;
  likes: number;
  comments: number;
  author: {
    id: string;
    name: string;
    role?: string;
    avatar?: string;
  };
}

interface FeedProps {
  currentUser: {
    profile?: {
      name: string;
      avatar?: string;
    };
  } | null;
  posts: FeedItem[];
  onCreatePost: (content: string) => Promise<void>;
  onLikePost: (postId: string) => Promise<void>;
  loading?: boolean;
}

const Feed: React.FC<FeedProps> = ({ currentUser, posts, onCreatePost, onLikePost, loading = false }) => {
  const [postContent, setPostContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeInProgress, setLikeInProgress] = useState<string | null>(null);
  const userAvatar = useMemo(
    () =>
      currentUser?.profile?.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.profile?.name || 'User')}`,
    [currentUser]
  );

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreatePost(postContent.trim());
      setPostContent('');
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    setLikeInProgress(postId);
    try {
      await onLikePost(postId);
    } catch (error) {
      console.error('Failed to like post:', error);
    } finally {
      setLikeInProgress(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-4">
          <img src={userAvatar} alt={currentUser?.profile?.name || 'You'} className="w-12 h-12 rounded-full" />
          <div className="flex-1">
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Share an update, opportunity, or achievement..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                  aria-label="Add attachments"
                >
                  <Award className="w-4 h-4 inline mr-1" />
                  Add Media
                </button>
              </div>
              <button
                type="button"
                onClick={handleCreatePost}
                disabled={isSubmitting || !postContent.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-12 text-center animate-pulse">
          <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Loading feed…</h3>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">Be the first to share something with your network!</p>
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start space-x-4">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                    <p className="text-sm text-gray-600">
                      {post.author.role ? `${post.author.role} • ` : ''}
                      {new Date(post.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-gray-800 whitespace-pre-line">{post.content}</p>
                <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleLike(post.id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 disabled:opacity-50"
                    disabled={likeInProgress === post.id}
                  >
                    <Star className="w-5 h-5" />
                    <span className="text-sm">{post.likes} Likes</span>
                  </button>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-sm">{post.comments} Comments</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Feed;