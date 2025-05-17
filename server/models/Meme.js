import mongoose from 'mongoose';

const memeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: 140, // Character limit for comments
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for faster querying
memeSchema.index({ createdAt: -1 });
memeSchema.index({ upvotes: -1 });
memeSchema.index({ tags: 1 });
memeSchema.index({ creator: 1 });

// Virtual for score (upvotes - downvotes)
memeSchema.virtual('score').get(function () {
  return this.upvotes - this.downvotes;
});

// Static to get trending memes
memeSchema.statics.getTrending = function (timeFrame = '24h', limit = 10) {
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

  return this.find(dateFilter)
    .sort({ upvotes: -1, createdAt: -1 })
    .limit(limit)
    .populate('creator', 'username profilePicture');
};

export default mongoose.model('Meme', memeSchema);