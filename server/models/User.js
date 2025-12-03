import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      default: null,  
    },

    username: {
      type: String,
      required: false,         
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: false,          // Google users do NOT have password
      minlength: 6,
    },

    profilePicture: {
      type: String,
      default: '',
    },

    bio: {
      type: String,
      maxlength: 160,
      default: '',
    },

    badges: [
      {
        type: String,
        enum: [
          'first_upload',
          'viral_post',
          'comment_king',
          'prolific_creator',
          'weekly_winner',
        ],
      },
    ],

    upvotedMemes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
      },
    ],

    downvotedMemes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meme',
      },
    ],
  },
  { timestamps: true }
);

// Virtual: Total memes created
userSchema.virtual('memesCount', {
  ref: 'Meme',
  localField: '_id',
  foreignField: 'creator',
  count: true,
});

// Virtual: Total upvotes
userSchema.virtual('totalUpvotes', {
  ref: 'Meme',
  localField: '_id',
  foreignField: 'creator',
  pipeline: [
    {
      $group: {
        _id: null,
        total: { $sum: '$upvotes' },
      },
    },
  ],
});

// Virtual: Total comments
userSchema.virtual('totalComments', {
  ref: 'Meme',
  localField: '_id',
  foreignField: 'creator',
  pipeline: [
    {
      $lookup: {
        from: 'comments',
        localField: 'comments',
        foreignField: '_id',
        as: 'comments',
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $size: '$comments' } },
      },
    },
  ],
});

// Method: Check badge
userSchema.methods.hasBadge = function (badgeName) {
  return this.badges.includes(badgeName);
};

// Method: Add badge
userSchema.methods.addBadge = async function (badgeName) {
  if (!this.badges.includes(badgeName)) {
    this.badges.push(badgeName);
    return this.save();
  }
  return this;
};

export default mongoose.model('User', userSchema);
