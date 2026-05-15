// src/models/badge.model.js

const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      description: 'URL or icon name',
    },
    category: {
      type: String,
      enum: ['Learning', 'Community', 'Achievement', 'Milestone', 'Contribution', 'Special'],
      default: 'Achievement',
    },
    criterion: {
      type: String,
      enum: [
        'dsaProblemsSolved',
        'streakDays',
        'resourcesShared',
        'forumsAnswered',
        'codingLanguages',
        'aiInterviewsPassed',
        'mentorshipHours',
        'communityRating',
        'coursesCompleted',
        'specificAction',
      ],
      required: true,
    },
    requiredValue: {
      type: Number,
      required: true,
      description: 'Value required to earn badge',
    },
    color: {
      type: String,
      default: '#FFD700',
      description: 'Badge color (hex)',
    },
    rarity: {
      type: String,
      enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
      default: 'Common',
    },
    pointsReward: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalEarned: {
      type: Number,
      default: 0,
      description: 'How many users have earned this badge',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ─── User Badge Schema ───────────────────────────────────────────────────────
const UserBadgeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },
    earnedAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      default: 0,
      description: 'Progress towards earning this badge (0-100)',
    },
    isNew: {
      type: Boolean,
      default: true,
      description: 'Whether the badge is newly earned',
    },
  },
  { timestamps: true }
);

// Unique index: user can only earn each badge once
UserBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true });

// ─── Static Methods for Badge ──────────────────────────────────────────────────
BadgeSchema.statics.getPopularBadges = async function (limit = 5) {
  return this.find({ isActive: true })
    .sort({ totalEarned: -1 })
    .limit(limit);
};

BadgeSchema.statics.getBadgesByCategory = async function (category) {
  return this.find({ category, isActive: true }).sort({ rarity: 1 });
};

BadgeSchema.statics.getBadgeByCriterion = async function (criterion) {
  return this.findOne({ criterion, isActive: true });
};

// ─── Static Methods for UserBadge ─────────────────────────────────────────────
UserBadgeSchema.statics.awardBadge = async function (userId, badgeId) {
  try {
    const userBadge = new this({
      userId,
      badgeId,
      earnedAt: new Date(),
    });

    await userBadge.save();

    // Increment badge total earned count
    await mongoose.model('Badge').updateOne(
      { _id: badgeId },
      { $inc: { totalEarned: 1 }}
    );

    return userBadge;
  } catch (err) {
    if (err.code === 11000) {
      throw new Error('Badge already earned by this user');
    }
    throw err;
  }
};

UserBadgeSchema.statics.getUserBadges = async function (userId) {
  return this.find({ userId })
    .populate('badgeId', 'name description icon category rarity pointsReward')
    .sort({ earnedAt: -1 });
};

UserBadgeSchema.statics.getBadgeProgress = async function (userId, badgeId) {
  return this.findOne({ userId, badgeId });
};

UserBadgeSchema.statics.updateBadgeProgress = async function (userId, badgeId, progress) {
  return this.findOneAndUpdate(
    { userId, badgeId },
    { progress: Math.min(100, progress) },
    { new: true }
  );
};

UserBadgeSchema.statics.markBadgeAsViewed = async function (userId, badgeId) {
  return this.findOneAndUpdate(
    { userId, badgeId },
    { isNew: false },
    { new: true }
  );
};

UserBadgeSchema.statics.getNewBadges = async function (userId) {
  return this.find({ userId, isNew: true })
    .populate('badgeId', 'name description icon')
    .sort({ earnedAt: -1 });
};

UserBadgeSchema.statics.getBadgeStats = async function (userId) {
  const badges = await this.find({ userId });
  const badgeIds = badges.map(b => b.badgeId);

  const categories = await this.aggregate([
    { $match: { userId } },
    { $group: {
      _id: '$badgeId',
      count: { $sum: 1 },
    }},
  ]);

  return {
    totalBadges: badges.length,
    categories,
  };
};

const Badge = mongoose.model('Badge', BadgeSchema);
const UserBadge = mongoose.model('UserBadge', UserBadgeSchema);

module.exports = { Badge, UserBadge };
