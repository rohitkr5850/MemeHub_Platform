import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ThumbsUp, 
  ThumbsDown,
  MessageSquare,
  Eye,
  Share2,
  Clock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { Meme, upvoteMeme, downvoteMeme } from '../../services/memeService';
import { formatDistanceToNow } from '../../utils/dateUtils';

interface MemeCardProps {
  meme: Meme;
  onVote?: () => void;
}

const MemeCard = ({ meme, onVote }: MemeCardProps) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isVoting, setIsVoting] = useState(false);
  const [votes, setVotes] = useState(meme.upvotes - meme.downvotes);
  
  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast('You need to login to vote on memes', 'info');
      return;
    }
    
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      await upvoteMeme(meme._id);
      setVotes(prev => prev + 1);
      if (onVote) onVote();
    } catch (error) {
      showToast('You already voted on this meme', 'error');
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleDownvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      showToast('You need to login to vote on memes', 'info');
      return;
    }
    
    if (isVoting) return;
    
    setIsVoting(true);
    try {
      await downvoteMeme(meme._id);
      setVotes(prev => prev - 1);
      if (onVote) onVote();
    } catch (error) {
      showToast('You already voted on this meme', 'error');
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      navigator.share({
        title: meme.title,
        text: meme.description || 'Check out this meme on MemeHub!',
        url: `/meme/${meme._id}`,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support share API
      const url = `${window.location.origin}/meme/${meme._id}`;
      navigator.clipboard.writeText(url);
      showToast('Link copied to clipboard!', 'success');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-base-100 rounded-lg shadow-md overflow-hidden"
    >
      <Link to={`/meme/${meme._id}`} className="block">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white mr-2">
              {meme.creator.profilePicture ? (
                <img 
                  src={meme.creator.profilePicture} 
                  alt={meme.creator.username} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span>{meme.creator.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <span className="font-medium">{meme.creator.username}</span>
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={12} className="mr-1" />
                <span>{formatDistanceToNow(new Date(meme.createdAt))}</span>
              </div>
            </div>
          </div>
          
          <h3 className="font-medium text-lg mb-2">{meme.title}</h3>
          {meme.description && (
            <p className="text-sm mb-3 text-gray-600">{meme.description}</p>
          )}
        </div>
        
        <div className="relative">
          <img 
            src={meme.imageUrl} 
            alt={meme.title} 
            className="w-full object-cover"
            style={{ maxHeight: '500px' }}
          />
        </div>
        
        <div className="p-4">
          {meme.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {meme.tags.map(tag => (
                <span 
                  key={tag} 
                  className="inline-block px-2 py-1 bg-base-300 rounded-full text-xs font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <button 
                  onClick={handleUpvote}
                  className="p-1.5 rounded-full hover:bg-base-300 transition-colors"
                >
                  <ThumbsUp size={18} />
                </button>
                <span className="text-sm font-medium">{votes}</span>
                <button 
                  onClick={handleDownvote}
                  className="p-1.5 rounded-full hover:bg-base-300 transition-colors"
                >
                  <ThumbsDown size={18} />
                </button>
              </div>
              
              <div className="flex items-center space-x-1">
                <MessageSquare size={18} />
                <span className="text-sm">{meme.comments.length}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Eye size={18} />
                <span className="text-sm">{meme.views}</span>
              </div>
            </div>
            
            <button 
              onClick={handleShare}
              className="p-1.5 rounded-full hover:bg-base-300 transition-colors"
            >
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MemeCard;