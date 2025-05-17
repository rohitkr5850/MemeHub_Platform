import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import Meme from '../models/Meme.js';
import User from '../models/User.js';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET ,
});

// Get memes with pagination, sorting, and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'new', timeFrame = 'all', tag } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build filter criteria
    let filterCriteria = {};
    if (tag) {
      filterCriteria.tags = tag;
    }

    // Add time frame filter if not 'all'
    if (timeFrame !== 'all') {
      const now = new Date();
      let dateLimit;

      switch (timeFrame) {
        case '24h':
          dateLimit = new Date(now - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          dateLimit = new Date(now - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          dateLimit = new Date(now - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateLimit = null;
      }

      if (dateLimit) {
        filterCriteria.createdAt = { $gte: dateLimit };
      }
    }

    // Determine sort order
    let sortCriteria = {};
    if (sort === 'new') {
      sortCriteria = { createdAt: -1 };
    } else if (sort === 'top') {
      sortCriteria = { upvotes: -1, createdAt: -1 };
    }

    // Get total count for pagination
    const totalCount = await Meme.countDocuments(filterCriteria);

    // Fetch memes
    const memes = await Meme.find(filterCriteria)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limitNumber)
      .populate('creator', 'username profilePicture')
      .lean();

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
    console.error('Error fetching memes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trending tags
router.get('/trending-tags', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNumber = parseInt(limit);

    // Aggregate to find most used tags
    const tags = await Meme.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limitNumber },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);

    res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching trending tags:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get meme by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid meme ID' });
    }

    // Find meme and increment view count
    const meme = await Meme.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('creator', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');

    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }

    res.status(200).json(meme);
  } catch (error) {
    console.error('Error fetching meme:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new meme
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, imageData, tags } = req.body;
    const { userId } = req.user;

    if (!title || !imageData) {
      return res.status(400).json({ message: 'Title and image are required' });
    }

    // Upload image to Cloudinary
    // For demo purposes, we'll use a placeholder if no Cloudinary config
    let imageUrl;
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'demo') {
      const uploadResponse = await cloudinary.uploader.upload(imageData, {
        upload_preset: 'memes_upload',
      });
      imageUrl = uploadResponse.secure_url;
    } else {
      // Use the image data directly for demo
      imageUrl = imageData.startsWith('data:image') 
        ? imageData 
        : 'https://via.placeholder.com/600x400?text=Meme+Image+Placeholder';
    }

    // Create new meme
    const newMeme = new Meme({
      title,
      description,
      imageUrl,
      creator: userId,
      tags: tags || [],
    });

    // Save meme
    const savedMeme = await newMeme.save();

    // Check if user needs "first_upload" badge
    const user = await User.findById(userId);
    const memesCount = await Meme.countDocuments({ creator: userId });
    
    if (memesCount === 1) {
      await user.addBadge('first_upload');
    } else if (memesCount >= 10) {
      await user.addBadge('prolific_creator');
    }

    // Populate creator info
    await savedMeme.populate('creator', 'username profilePicture');

    res.status(201).json({
      message: 'Meme created successfully',
      meme: savedMeme,
    });
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upvote a meme
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid meme ID' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already voted
    if (user.upvotedMemes.includes(id)) {
      return res.status(400).json({ message: 'Already upvoted this meme' });
    }

    // Remove downvote if exists
    let updateOps = {};
    if (user.downvotedMemes.includes(id)) {
      await User.findByIdAndUpdate(userId, { $pull: { downvotedMemes: id } });
      updateOps.$inc = { upvotes: 1, downvotes: -1 };
    } else {
      updateOps.$inc = { upvotes: 1 };
    }

    // Update meme
    const meme = await Meme.findByIdAndUpdate(id, updateOps, { new: true });
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }

    // Add to user's upvoted memes
    await User.findByIdAndUpdate(userId, { $addToSet: { upvotedMemes: id } });

    // Check if creator earns 'viral_post' badge (over 100 upvotes)
    if (meme.upvotes >= 100) {
      const creator = await User.findById(meme.creator);
      if (creator && !creator.hasBadge('viral_post')) {
        await creator.addBadge('viral_post');
      }
    }

    res.status(200).json({
      message: 'Meme upvoted successfully',
      meme,
    });
  } catch (error) {
    console.error('Error upvoting meme:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Downvote a meme
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid meme ID' });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already voted
    if (user.downvotedMemes.includes(id)) {
      return res.status(400).json({ message: 'Already downvoted this meme' });
    }

    // Remove upvote if exists
    let updateOps = {};
    if (user.upvotedMemes.includes(id)) {
      await User.findByIdAndUpdate(userId, { $pull: { upvotedMemes: id } });
      updateOps.$inc = { downvotes: 1, upvotes: -1 };
    } else {
      updateOps.$inc = { downvotes: 1 };
    }

    // Update meme
    const meme = await Meme.findByIdAndUpdate(id, updateOps, { new: true });
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }

    // Add to user's downvoted memes
    await User.findByIdAndUpdate(userId, { $addToSet: { downvotedMemes: id } });

    res.status(200).json({
      message: 'Meme downvoted successfully',
      meme,
    });
  } catch (error) {
    console.error('Error downvoting meme:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a comment to a meme
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const { userId } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid meme ID' });
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    if (text.length > 140) {
      return res.status(400).json({ message: 'Comment must be 140 characters or less' });
    }

    // Create comment
    const comment = {
      user: userId,
      text,
      createdAt: new Date(),
    };

    // Add comment to meme
    const meme = await Meme.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    ).populate('comments.user', 'username profilePicture');

    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }

    // Check if the meme creator earns 'comment_king' badge
    const commentCount = await Meme.aggregate([
      { $match: { creator: meme.creator } },
      { $project: { commentCount: { $size: '$comments' } } },
      { $group: { _id: null, total: { $sum: '$commentCount' } } },
    ]);

    if (commentCount.length > 0 && commentCount[0].total >= 50) {
      const creator = await User.findById(meme.creator);
      if (creator && !creator.hasBadge('comment_king')) {
        await creator.addBadge('comment_king');
      }
    }

    res.status(201).json({
      message: 'Comment added successfully',
      comment: meme.comments[meme.comments.length - 1],
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a meme
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid meme ID' });
    }

    // Find meme
    const meme = await Meme.findById(id);
    if (!meme) {
      return res.status(404).json({ message: 'Meme not found' });
    }

    // Check if user is the creator
    if (meme.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this meme' });
    }

    // Delete from Cloudinary if applicable
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_CLOUD_NAME !== 'demo' &&
      meme.imageUrl.includes('cloudinary')
    ) {
      // Extract public_id from the Cloudinary URL
      const publicId = meme.imageUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete meme
    await Meme.findByIdAndDelete(id);

    // Remove from users' upvoted/downvoted lists
    await User.updateMany(
      {},
      { $pull: { upvotedMemes: id, downvotedMemes: id } }
    );

    res.status(200).json({ message: 'Meme deleted successfully' });
  } catch (error) {
    console.error('Error deleting meme:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;