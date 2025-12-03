import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Eye,
  Share2,
  Clock,
  Bookmark,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { upvoteMeme, downvoteMeme } from "../../services/memeService";
import { formatDistanceToNow } from "../../utils/dateUtils";

const MemeCard = ({
  meme,
  onVote,
  isSaved = false,
  onToggleSave,
  compact = false,
}) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [votes, setVotes] = useState(meme.upvotes - meme.downvotes);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast("You need to login to vote on memes", "info");
      return;
    }
    if (isVoting) return;
    setIsVoting(true);
    try {
      await upvoteMeme(meme._id);
      setVotes((prev) => prev + 1);
      if (onVote) onVote();
    } catch {
      showToast("You already voted on this meme", "error");
    } finally {
      setIsVoting(false);
    }
  };

  const handleDownvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast("You need to login to vote on memes", "info");
      return;
    }
    if (isVoting) return;
    setIsVoting(true);
    try {
      await downvoteMeme(meme._id);
      setVotes((prev) => prev - 1);
      if (onVote) onVote();
    } catch {
      showToast("You already voted on this meme", "error");
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/meme/${meme._id}`;
    if (navigator.share) {
      navigator.share({
        title: meme.title,
        text: meme.description || "Check out this meme on MemeHub!",
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard!", "success");
    }
  };

  const cardClass = compact
    ? "bg-base-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-base-300 p-3"
    : "bg-base-100 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-base-300";

  return (
    <div className={cardClass + (compact ? " flex flex-col" : "")}>
      <Link to={`/meme/${meme._id}`} className="block">
        {/* Header */}
        <div className="p-4 pb-2 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-primary-500 flex items-center justify-center text-white mr-3 shadow-sm">
              {meme.creator.profilePicture ? (
                <img
                  src={meme.creator.profilePicture}
                  alt={meme.creator.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <span className="font-semibold">
                  {meme.creator.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <span className="font-semibold">{meme.creator.username}</span>
              <div className="flex items-center text-xs">
                <Clock size={12} className="mr-1" />
                <span>{formatDistanceToNow(new Date(meme.createdAt))}</span>
              </div>
            </div>
          </div>

          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleSave();
              }}
              title={isSaved ? "Unsave Meme" : "Save Meme"}
              className={`ml-2 p-2 rounded-full hover:bg-base-200 transition-colors ${
                isSaved ? "text-accent-500" : "text-gray-400"
              }`}
            >
              <Bookmark fill={isSaved ? "#fb7185" : "none"} size={20} />
            </button>
          )}
        </div>

        {/* Title + Description */}
        <div className="px-4">
          <h3 className="font-bold text-lg mb-2">{meme.title}</h3>
          {meme.description && (
            <p className="text-sm mb-3 leading-relaxed">{meme.description}</p>
          )}
        </div>

        {/* Meme Image */}
        <div className="relative">
          <img
            src={meme.imageUrl}
            alt={meme.title}
            className="w-full object-cover"
            style={{ maxHeight: compact ? "300px" : "500px" }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 pt-2">
          {meme.tags.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {meme.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-2 py-1 bg-base-200 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            {/* Votes + Stats */}
            <div className="flex items-center space-x-5">
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleUpvote}
                  className="p-1.5 rounded-full hover:bg-base-200 transition-colors disabled:opacity-50"
                  disabled={isVoting}
                >
                  <ThumbsUp size={18} />
                </button>
                <span className="text-sm font-semibold">{votes}</span>
                <button
                  onClick={handleDownvote}
                  className="p-1.5 rounded-full hover:bg-base-200 transition-colors disabled:opacity-50"
                  disabled={isVoting}
                >
                  <ThumbsDown size={18} />
                </button>
              </div>

              <div className="flex items-center space-x-1">
                <MessageSquare size={18} />
                <span className="text-sm">{meme.comments?.length ?? 0}</span>
              </div>

              <div className="flex items-center space-x-1">
                <Eye size={18} />
                <span className="text-sm">{meme.views}</span>
              </div>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-base-200 transition-colors"
              title="Share Meme"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MemeCard;
