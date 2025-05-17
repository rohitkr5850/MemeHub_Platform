import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3,
  Image,
  ThumbsUp,
  Eye,
  MessageSquare,
  Award,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { getUserMemes, getUserStats } from '../services/memeService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import MemeCard from '../components/meme/MemeCard';
import { BADGES } from '../config/constants';

interface UserStats {
  totalMemes: number;
  totalUpvotes: number;
  totalDownvotes: number;
  totalScore: number;
  totalViews: number;
  totalComments: number;
  averageScore: number;
}

interface TimelineData {
  date: string;
  count: number;
  upvotes: number;
  views: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [timeline, setTimeline] = useState<TimelineData[]>([]);
  const [memes, setMemes] = useState<any[]>([]);
  const [sort, setSort] = useState<'new' | 'top'>('new');
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (!user?._id) return;
        
        const [statsData, memesData] = await Promise.all([
          getUserStats(user._id),
          getUserMemes(user._id),
        ]);
        
        setStats(statsData.stats);
        setTimeline(statsData.timeline);
        setMemes(memesData.memes);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user?._id]);
  
  const StatCard = ({ icon: Icon, title, value, color }: any) => (
    <div className="bg-base-100 rounded-lg p-4 shadow-md">
      <div className="flex items-center mb-2">
        <Icon className={`w-5 h-5 ${color} mr-2`} />
        <span className="text-sm font-medium text-gray-600">{title}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
  
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="bg-base-100 rounded-lg p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white mr-4">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.username} 
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl">{user?.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">{user?.username}</h1>
              <p className="text-gray-600">{user?.bio || 'No bio yet'}</p>
            </div>
          </div>
          
          {user?.badges && user.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  <Award className="w-4 h-4 mr-1" />
                  {BADGES[badge as keyof typeof BADGES]?.name}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Image}
            title="Total Memes"
            value={stats?.totalMemes || 0}
            color="text-primary-500"
          />
          <StatCard
            icon={ThumbsUp}
            title="Total Upvotes"
            value={stats?.totalUpvotes || 0}
            color="text-success-500"
          />
          <StatCard
            icon={Eye}
            title="Total Views"
            value={stats?.totalViews || 0}
            color="text-info-500"
          />
          <StatCard
            icon={MessageSquare}
            title="Total Comments"
            value={stats?.totalComments || 0}
            color="text-warning-500"
          />
        </div>
        
        {/* Analytics Chart */}
        <div className="bg-base-100 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Performance Over Time
            </h2>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Last 30 days</span>
            </div>
          </div>
          
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#3b82f6" 
                  name="Views"
                />
                <Line 
                  type="monotone" 
                  dataKey="upvotes" 
                  stroke="#10b981" 
                  name="Upvotes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Memes Section */}
        <div className="bg-base-100 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Your Memes
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setSort('new')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sort === 'new'
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-base-200'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Newest
              </button>
              <button
                onClick={() => setSort('top')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  sort === 'top'
                    ? 'bg-primary-500 text-white'
                    : 'hover:bg-base-200'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Top
              </button>
            </div>
          </div>
          
          {memes.length === 0 ? (
            <div className="text-center py-10">
              <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No memes yet</h3>
              <p className="text-gray-600 mb-4">
                Start creating and sharing your memes with the world!
              </p>
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
              >
                <Image className="w-4 h-4 mr-2" />
                Create Your First Meme
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {memes.map((meme) => (
                <MemeCard key={meme._id} meme={meme} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;