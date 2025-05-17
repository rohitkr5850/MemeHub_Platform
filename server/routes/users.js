import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Meme from '../models/Meme.js';

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const user = await User.findById(userId)
      .select('-password')
      .populate('memesCount')
      .populate('totalUpvotes')
      .populate('totalComments');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await User.findById(id)
      .select('-password -upvotedMemes -downvotedMemes')
      .populate('memesCount')
      .populate('totalUpvotes')
      .populate('totalComments');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's memes
router.get('/:id/memes', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = 'new' } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Determine sort order
    let sortCriteria = {};
    if (sort === 'new') {
      sortCriteria = { createdAt: -1 };
    } else if (sort === 'top') {
      sortCriteria = { upvotes: -1, createdAt: -1 };
    }
    
    // Get total count for pagination
    const totalCount = await Meme.countDocuments({ creator: id });
    
    // Fetch memes
    const memes = await Meme.find({ creator: id })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNumber)
      .populate('creator', 'username profilePicture');
    
    // Calculate has more
    const hasMore = totalCount > skip + memes.length;
    
    res.status(200).json({
      memes,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      totalMemes: totalCount,
      hasMore,
    });
  } catch (error) {
    console.error('Error fetching user memes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { username, bio, profilePicture } = req.body;
    
    // Build update object
    const updateFields = {};
    if (username) updateFields.username = username;
    if (bio) updateFields.bio = bio;
    if (profilePicture) updateFields.profilePicture = profilePicture;
    
    // Check if username is taken if it's being updated
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeFrame = 'week', limit = 10 } = req.query;
    const limitNumber = parseInt(limit);
    
    // Set time filter based on timeFrame
    let dateFilter = {};
    const now = new Date();
    
    switch (timeFrame) {
      case '24h':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        // No date filter for 'all' time
        dateFilter = {};
    }
    
    // Aggregate leaderboard data
    const leaderboard = await Meme.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$creator',
          totalMemes: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' },
          totalDownvotes: { $sum: '$downvotes' },
          totalScore: { $sum: { $subtract: ['$upvotes', '$downvotes'] } },
          totalViews: { $sum: '$views' },
          bestMeme: { $max: { score: { $subtract: ['$upvotes', '$downvotes'] }, id: '$_id' } },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: limitNumber },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$user.username',
          profilePicture: '$user.profilePicture',
          badges: '$user.badges',
          totalMemes: 1,
          totalUpvotes: 1,
          totalDownvotes: 1,
          totalScore: 1,
          totalViews: 1,
          bestMemeId: '$bestMeme.id',
        },
      },
    ]);
    
    // If it's weekly leaderboard, mark the top user with the weekly_winner badge
    if (timeFrame === 'week' && leaderboard.length > 0) {
      const topUser = leaderboard[0];
      await User.findByIdAndUpdate(
        topUser.userId,
        { $addToSet: { badges: 'weekly_winner' } }
      );
    }
    
    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user stats
    const stats = await Meme.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalMemes: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' },
          totalDownvotes: { $sum: '$downvotes' },
          totalScore: { $sum: { $subtract: ['$upvotes', '$downvotes'] } },
          totalViews: { $sum: '$views' },
          totalComments: { $sum: { $size: '$comments' } },
          averageScore: { $avg: { $subtract: ['$upvotes', '$downvotes'] } },
        },
      },
      {
        $project: {
          _id: 0,
          totalMemes: 1,
          totalUpvotes: 1,
          totalDownvotes: 1,
          totalScore: 1,
          totalViews: 1,
          totalComments: 1,
          averageScore: { $round: ['$averageScore', 2] },
        },
      },
    ]);
    
    // Get top meme
    const topMeme = await Meme.findOne({ creator: id })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(1);
    
    // Get timeline of meme creation
    const timeline = await Meme.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          upvotes: { $sum: '$upvotes' },
          views: { $sum: '$views' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
          upvotes: 1,
          views: 1,
        },
      },
    ]);
    
    res.status(200).json({
      stats: stats.length > 0 ? stats[0] : {
        totalMemes: 0,
        totalUpvotes: 0,
        totalDownvotes: 0,
        totalScore: 0,
        totalViews: 0,
        totalComments: 0,
        averageScore: 0,
      },
      topMeme,
      timeline,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;