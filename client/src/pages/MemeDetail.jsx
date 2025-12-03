import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Eye, 
  Share2, 
  Clock,
  Send,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { 
  getMemeById, 
  upvoteMeme, 
  downvoteMeme, 
  addComment,
  deleteMeme
} from '../services/memeService';
import { formatDistanceToNow, formatDate } from '../utils/dateUtils';

const MemeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [meme, setMeme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch meme
  useEffect(() => {
    const fetchMeme = async () => {
      try {
        if (!id) return;
        const data = await getMemeById(id);
        setMeme(data);
      } catch (error) {
        showToast('Failed to load meme', 'error');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchMeme();
  }, [id, navigate, showToast]);

  // Voting handlers
  const handleUpvote = async () => {
    if (!isAuthenticated) return showToast('You need to login to vote', 'info');

    try {
      await upvoteMeme(id);
      const updated = await getMemeById(id);
      setMeme(updated);
      showToast('Upvoted!', 'success');
    } catch {
      showToast('Failed to upvote', 'error');
    }
  };

  const handleDownvote = async () => {
    if (!isAuthenticated) return showToast('You need to login to vote', 'info');

    try {
      await downvoteMeme(id);
      const updated = await getMemeById(id);
      setMeme(updated);
      showToast('Downvoted!', 'success');
    } catch {
      showToast('Failed to downvote', 'error');
    }
  };

  // Share
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: meme?.title || 'Check out this meme!',
        text: meme?.description || 'Found this awesome meme!',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  // Comment submit
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) return showToast('You need to login to comment', 'info');

    if (!comment.trim()) {
      return showToast('Comment cannot be empty', 'warning');
    }

    try {
      setIsSubmitting(true);
      await addComment(id, comment);
      const updated = await getMemeById(id);
      setMeme(updated);
      setComment('');
      showToast('Comment added!', 'success');
    } catch {
      showToast('Failed to add comment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete meme
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this meme?')) return;

    try {
      setIsDeleting(true);
      await deleteMeme(id);
      showToast('Meme deleted successfully', 'success');
      navigate('/');
    } catch {
      showToast('Failed to delete meme', 'error');
      setIsDeleting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Not found
  if (!meme) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-medium">Meme not found</h2>
        <p className="mt-2 text-gray-600">This meme might have been deleted or doesn't exist.</p>
      </div>
    );
  }

  const isOwner =
    user?._id && meme?.creator?._id
      ? user._id === meme.creator._id
      : false;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-100 rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            {/* Creator Info */}
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white mr-3 overflow-hidden">
                {meme?.creator?.profilePicture ? (
                  <img
                    src={meme.creator.profilePicture}
                    alt={meme?.creator?.username}
                    className="w-10 h-10 object-cover rounded-full"
                  />
                ) : (
                  <span className="text-lg">{meme?.creator?.username?.charAt(0)?.toUpperCase() || "?"}</span>
                )}
              </div>

              <div>
                <h2 className="font-medium">{meme?.creator?.username || "Unknown User"}</h2>
                <div className="flex items-center text-sm text-gray-500">
                  <Clock size={14} className="mr-1" />
                  <time dateTime={meme.createdAt}>
                    {formatDistanceToNow(new Date(meme.createdAt))}
                  </time>
                </div>
              </div>
            </div>

            {/* Delete Button */}
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-error-500 hover:bg-error-50 rounded-full transition-colors"
                title="Delete meme"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-2">{meme.title}</h1>
          {meme.description && (
            <p className="text-gray-600 mb-4">{meme.description}</p>
          )}

          {meme.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {meme.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-base-300 rounded-full text-sm font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Image */}
        <div className="relative">
          <img
            src={meme.imageUrl}
            alt={meme.title}
            className="w-full max-h-[600px] object-contain"
          />
        </div>
{/* Stats */}
<div className="p-6 border-t border-base-300">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex flex-wrap items-center gap-4">
      {/* Upvotes */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleUpvote}
          className="p-2 rounded-full hover:bg-base-300 transition-colors"
        >
          <ThumbsUp size={20} />
        </button>
        <span className="font-medium">{meme.upvotes}</span>
      </div>

      {/* Downvotes */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDownvote}
          className="p-2 rounded-full hover:bg-base-300 transition-colors"
        >
          <ThumbsDown size={20} />
        </button>
        <span className="font-medium">{meme.downvotes}</span>
      </div>

      {/* Comments */}
      <div className="flex items-center space-x-2">
        <MessageSquare size={20} />
        <span>{meme.comments?.length || 0} comments</span>
      </div>

      {/* Views */}
      <div className="flex items-center space-x-2">
        <Eye size={20} />
        <span>{meme.views}</span>
      </div>
    </div>

    <button
      onClick={handleShare}
      className="p-2 rounded-full hover:bg-base-300 transition-colors"
    >
      <Share2 size={20} />
    </button>
  </div>
</div>

{/* Comments Section */}
<div className="border-t border-base-300">
  <div className="p-6">
    <h3 className="text-lg font-medium mb-4">Comments</h3>

    {/* Add comment */}
    <form onSubmit={handleCommentSubmit} className="mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          maxLength={140}
          className="flex-1 px-4 py-2 text-black rounded-md border border-base-300 w-full sm:w-auto"
        />

       <button
  type="submit"
  disabled={isSubmitting || !comment.trim()}
  className="px-4 py-2 w-full sm:w-auto flex items-center justify-center 
             text-white rounded-md font-medium 
             bg-gradient-to-r from-primary-500 to-secondary-500 
             shadow-md hover:shadow-lg active:scale-[0.98] 
             transition-all duration-200 
             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
             disabled:opacity-50"
>
  {isSubmitting ? (
    <LoadingSpinner size="sm" color="text-white" />
  ) : (
    <>
      <Send size={16} className="mr-2" />
      Send
    </>
  )}
</button>

      </div>

      <p className="mt-1 text-sm text-gray-500">
        {140 - comment.length} characters remaining
      </p>
    </form>


            {/* List comments */}
            <div className="space-y-4">
              {(!meme.comments || meme.comments.length === 0) ? (
                <p className="text-center text-gray-500 py-4">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                meme.comments.map((c) => (
                  <div key={c._id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center overflow-hidden">
                      {c?.user?.profilePicture ? (
                        <img
                          src={c.user.profilePicture}
                          alt={c.user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{c?.user?.username?.charAt(0)?.toUpperCase() || "?"}</span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium">{c?.user?.username || "Unknown"}</span>
                        <span className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(c.createdAt))}
                        </span>
                      </div>
                      <p className="mt-1">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MemeDetail;
