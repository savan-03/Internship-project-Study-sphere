// src/models/skill-endorsement.model.js

const mongoose = require('mongoose');

const SkillEndorsementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    endorsementCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    endorsedBy: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      endorsedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate',
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
      min: 0,
    },
    endorsements: {
      type: Number,
      default: 0,
    },
    isEndorsed: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
      description: 'Whether the skill has been verified by the user',
    },
    certificateUrl: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Technical', 'Soft Skills', 'Language', 'Tool', 'Framework', 'Other'],
      default: 'Technical',
    },
    lastEndorsedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for finding skills by user
SkillEndorsementSchema.index({ userId: 1, skill: 1 }, { unique: true });

// Index for finding most endorsed skills
SkillEndorsementSchema.index({ endorsementCount: -1 });

// Index for finding recent endorsements
SkillEndorsementSchema.index({ lastEndorsedAt: -1 });

// Static method: Add endorsement
SkillEndorsementSchema.statics.addEndorsement = async function (userId, skill, endorsedByUserId) {
  if (userId.toString() === endorsedByUserId.toString()) {
    throw new Error('Cannot endorse your own skill');
  }

  const skillEndorsement = await this.findOne({ userId, skill: skill.toLowerCase() });

  if (!skillEndorsement) {
    return this.create({
      userId,
      skill: skill.toLowerCase(),
      endorsedBy: [{ userId: endorsedByUserId }],
      endorsementCount: 1,
      lastEndorsedAt: new Date(),
    });
  }

  // Check if already endorsed by this user
  const alreadyEndorsed = skillEndorsement.endorsedBy.some(
    e => e.userId.toString() === endorsedByUserId.toString()
  );

  if (alreadyEndorsed) {
    throw new Error('Already endorsed this skill');
  }

  // Add new endorsement
  skillEndorsement.endorsedBy.push({ userId: endorsedByUserId });
  skillEndorsement.endorsementCount += 1;
  skillEndorsement.lastEndorsedAt = new Date();

  return skillEndorsement.save();
};

// Static method: Remove endorsement
SkillEndorsementSchema.statics.removeEndorsement = async function (userId, skill, endorsedByUserId) {
  const skillEndorsement = await this.findOne({ userId, skill: skill.toLowerCase() });

  if (!skillEndorsement) {
    throw new Error('Skill not found');
  }

  const endorsementIndex = skillEndorsement.endorsedBy.findIndex(
    e => e.userId.toString() === endorsedByUserId.toString()
  );

  if (endorsementIndex === -1) {
    throw new Error('Endorsement not found');
  }

  skillEndorsement.endorsedBy.splice(endorsementIndex, 1);
  skillEndorsement.endorsementCount = Math.max(0, skillEndorsement.endorsementCount - 1);

  if (skillEndorsement.endorsedBy.length === 0) {
    return this.deleteOne({ _id: skillEndorsement._id });
  }

  return skillEndorsement.save();
};

// Static method: Get user skills
SkillEndorsementSchema.statics.getUserSkills = async function (userId, sort = 'endorsementCount') {
  const sortObj = {};
  if (sort === 'endorsementCount') {
    sortObj.endorsementCount = -1;
  } else if (sort === 'recent') {
    sortObj.lastEndorsedAt = -1;
  } else if (sort === 'skill') {
    sortObj.skill = 1;
  }

  return this.find({ userId })
    .sort(sortObj)
    .populate('endorsedBy.userId', 'username avatar fullName');
};

// Static method: Get top skills globally
SkillEndorsementSchema.statics.getTopSkills = async function (limit = 10) {
  return this.aggregate([
    { $group: {
      _id: '$skill',
      totalEndorsements: { $sum: '$endorsementCount' },
      uniqueUsers: { $sum: 1 },
    }},
    { $sort: { totalEndorsements: -1 }},
    { $limit: limit },
  ]);
};

module.exports = mongoose.model('SkillEndorsement', SkillEndorsementSchema);
