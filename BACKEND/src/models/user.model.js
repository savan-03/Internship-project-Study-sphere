// src/models/user.model.js

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      default: '',
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    pointsAwarded: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type:     String,
      required: [true, 'Full name is required'],
      trim:     true,
    },
    username: {
      type:      String,
      required:  [true, 'Username is required'],
      unique:    true,
      trim:      true,
      lowercase: true,
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      trim:      true,
      lowercase: true,
      match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      minlength: 8,
      select:   false,   // never returned in queries by default
    },
    role: {
      type:    String,
      enum:    ['user', 'moderator', 'admin'],
      default: 'user',
    },
    avatar: {
      type:    String,
      default: '',
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    learningGoals: {
      type: [String],
      default: [],
    },
    dailyStudyHours: {
      type: String,
      default: '',
    },
    currentRole: {
      type: String,
      default: '',
      trim: true,
    },
    yearsOfExperience: {
      type: String,
      default: '',
    },
    targetRole: {
      type: String,
      default: '',
      trim: true,
    },
    careerGoal: {
      type: String,
      default: '',
      trim: true,
    },
    profileType: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user',
    },
    profileSetupCompleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    bookmarkedResources: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'file',
    }],
    followingUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    followerUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    resourceCollections: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          default: '',
          trim: true,
        },
        resourceIds: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'file',
          },
        ],
      },
    ],
    stats: {
      points: {
        type: Number,
        default: 0,
      },
      streak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      level: {
        type: String,
        default: 'Beginner',
      },
    },
    rewardInventory: {
      streakFreezesUsed: {
        type: Number,
        default: 0,
      },
      streakFreezeArmed: {
        type: Boolean,
        default: false,
      },
      lastFreezeArmedAt: {
        type: Date,
        default: null,
      },
    },
    lastActiveAt: {
      type: Date,
      default: null,
    },
    activityLog: {
      type: [activityLogSchema],
      default: [],
    },
    notificationPreferences: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: false,
      },
      push: {
        type: Boolean,
        default: false,
      },
      digest: {
        type: Boolean,
        default: true,
      },
      studyReminders: {
        type: Boolean,
        default: true,
      },
      doNotDisturb: {
        type: Boolean,
        default: false,
      },
      quietHoursStart: {
        type: String,
        default: '22:00',
      },
      quietHoursEnd: {
        type: String,
        default: '07:00',
      },
      reminderHour: {
        type: String,
        default: '19:00',
      },
      digestFrequency: {
        type: String,
        enum: ['daily', 'weekly'],
        default: 'daily',
      },
      categories: {
        system: { type: Boolean, default: true },
        resources: { type: Boolean, default: true },
        social: { type: Boolean, default: true },
        dsa: { type: Boolean, default: true },
        ai: { type: Boolean, default: true },
      },
    },
    socialProfile: {
      headline: {
        type: String,
        default: '',
        trim: true,
      },
      mentorBio: {
        type: String,
        default: '',
        trim: true,
      },
      openToMentoring: {
        type: Boolean,
        default: false,
      },
      openToCollaboration: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

// ─── Hash password before saving ─────────────────────────────────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

// ─── Instance method: compare plain password with hashed ─────────────────────
UserSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// ─── Instance method: return safe user object (no password) ──────────────────
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
