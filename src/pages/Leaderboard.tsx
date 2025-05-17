import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy,
  TrendingUp,
  Award,
  Star,
  Eye,
  MessageSquare,
  ThumbsUp,
  Medal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../services/memeService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { BADGES } from '../config/constants';

interface LeaderboardEntry {
  userId: string;
  username: string;
  profilePicture?: string;
  badges: string[];
  totalMemes: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalScore: number;
  totalViews: number;
  bestMemeId: string;
}

const timeFrames = [
  { value: '24h', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
] as const;

const LeaderboardPage = () => {
  const [timeFrame, setTimeFrame] = useState<'24h' | 'week' | 'month' | 'all'>('week');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await getLeaderboard(timeFrame);
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [timeFrame]);
  
  const getBadgeIcon = (badgeId: string) => {
    const badge = BADGES[badgeId as keyof typeof BADGES];
    if (!badge) return null;
    
    switch (badge.icon) {
      case 'trophy':
        return <Trophy size={16} />;
      case 'trending-up':
        return <TrendingUp size={16} />;
      case 'award':
        return <Award size={16} />;
      case 'star':
        return <Star size={16} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-base-100 rounded-lg shadow-lg p-6"
      >
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 text-primary-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Meme Masters Leaderboard</h1>
          <p className="text-gray-600">
            Top creators making the internet a funnier place
          </p>
        </div>
        
        {/* Time Frame Selector */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            {timeFrames.map((frame) => (
              <button
                key={frame.value}
                onClick={() => setTimeFrame(frame.value)}
                className={`px-4 py-2 text-sm font-medium first:rounded-l-md last:rounded-r-md border-y border-r first:border-l ${
                  timeFrame === frame.value
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {frame.label}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-10">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-medium mb-2">No data available</h2>
            <p className="text-gray-600">
              Start creating and sharing memes to appear on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-base-200 rounded-lg p-4 flex items-center"
              >
                {/* Rank */}
                <div className="w-12 h-12 rounded-full bg-base-300 flex items-center justify-center mr-4">
                  {index === 0 ? (
                    <Medal className="w-6 h-6 text-yellow-500" />
                  ) : index === 1 ? (
                    <Medal className="w-6 h-6 text-gray-400" />
                  ) : index === 2 ? (
                    <Medal className="w-6 h-6 text-amber-700" />
                  ) : (
                    <span className="text-lg font-bold">{index + 1}</span>
                  )}
                </div>
                
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white mr-3">
                      {entry.profilePicture ? (
                        <img 
                          src={entry.profilePicture} 
                          alt={entry.username} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg">{entry.username.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <Link 
                        to={`/user/${entry.userId}`}
                        className="font-medium hover:text-primary-500 transition-colors"
                      >
                        {entry.username}
                      </Link>
                      {entry.badges.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {entry.badges.map((badge) => (
                            <span
                              key={badge}
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                              title={BADGES[badge as keyof typeof BADGES]?.description}
                            >
                              {getBadgeIcon(badge)}
                              <span className="ml-1">
                                {BADGES[badge as keyof typeof BADGES]?.name}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center">
                      <ThumbsUp size={16} className="mr-1 text-primary-500" />
                      <span>{entry.totalUpvotes} upvotes</span>
                    </div>
                    <div className="flex items-center">
                      <Eye size={16} className="mr-1 text-primary-500" />
                      <span>{entry.totalViews} views</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp size={16} className="mr-1 text-primary-500" />
                      <span>{entry.totalMemes} memes</span>
                    </div>
                    <div className="flex items-center">
                      <MessageSquare size={16} className="mr-1 text-primary-500" />
                      <span>{entry.totalScore} score</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeaderboardPage;