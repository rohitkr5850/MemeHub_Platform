import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Meme from '../models/Meme.js';

const router = express.Router();

/* Helper: Time filter for leaderboard*/
function getDateFilter(timeFrame) {
  const now = new Date();

  switch (timeFrame) {
    case '24h':
      return { createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) } };
    case 'week':
      return { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    case 'month':
      return { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    case 'all':
    default:
      return {}; // no filter
  }
}

/*
 CURRENT USER (/api/users/me)
 */
router.get('/me', auth, async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/*Leadervoard*/
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeFrame = 'week', limit = 10 } = req.query;
    const limitNumber = parseInt(limit, 10) || 10;

    const dateFilter = getDateFilter(timeFrame);

    const matchStage = Object.keys(dateFilter).length
      ? { $match: dateFilter }
      : { $match: {} };

    const pipeline = [
      matchStage,
      {
        $group: {
          _id: '$creator',
          totalMemes: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' },
          totalDownvotes: { $sum: '$downvotes' },
          totalScore: {
            $sum: { $subtract: ['$upvotes', '$downvotes'] },
          },
          totalViews: { $sum: '$views' },
          totalComments: {
            $sum: { $size: { $ifNull: ['$comments', []] } },
          },
        },
      },
      {
        $sort: {
          totalScore: -1,
          totalUpvotes: -1,
        },
      },
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
          totalComments: 1,
        },
      },
    ];

    const raw = await Meme.aggregate(pipeline);

    // Rank add (1,2,3,...)
    const leaderboard = raw.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    // Weekly winner badge auto-add
    if (timeFrame === 'week' && leaderboard.length > 0) {
      const topUser = leaderboard[0];
      await User.findByIdAndUpdate(topUser.userId, {
        $addToSet: { badges: 'weekly_winner' },
      });
    }

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const statsAgg = await Meme.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: null,
          totalMemes: { $sum: 1 },
          totalUpvotes: { $sum: '$upvotes' },
          totalDownvotes: { $sum: '$downvotes' },
          totalScore: { $sum: { $subtract: ['$upvotes', '$downvotes'] } },
          totalViews: { $sum: '$views' },
          totalComments: {
            $sum: { $size: { $ifNull: ['$comments', []] } },
          },
          averageScore: {
            $avg: { $subtract: ['$upvotes', '$downvotes'] },
          },
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

    const stats =
      statsAgg[0] || {
        totalMemes: 0,
        totalUpvotes: 0,
        totalDownvotes: 0,
        totalScore: 0,
        totalViews: 0,
        totalComments: 0,
        averageScore: 0,
      };

    const topMeme = await Meme.findOne({ creator: id })
      .sort({ upvotes: -1, createdAt: -1 })
      .limit(1);

    const timeline = await Meme.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(id) } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
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

    res.status(200).json({ stats, topMeme, timeline });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/:id/memes', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = 'new' } = req.query;

    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let sortCriteria = {};
    if (sort === 'new') sortCriteria = { createdAt: -1 };
    else if (sort === 'top') sortCriteria = { upvotes: -1, createdAt: -1 };

    const totalCount = await Meme.countDocuments({ creator: id });

    const memes = await Meme.find({ creator: id })
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNumber)
      .populate('creator', 'username profilePicture');

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

router.put('/me', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    const { username, bio, profilePicture } = req.body;

const updateFields = {};
if (username) updateFields.username = username;
if (bio !== undefined) updateFields.bio = bio;

if (profilePicture !== undefined) {
  updateFields.profilePicture = profilePicture;
}


    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!updatedUser)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/*User Profile by id*/
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id).select(
      '-password -upvotedMemes -downvotedMemes'
    );

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
