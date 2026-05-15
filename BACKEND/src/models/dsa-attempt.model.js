const mongoose = require('mongoose');

const dsaAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DsaProblem',
      required: true,
      index: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp'],
      default: 'javascript',
    },
    code: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'attempted', 'solved'],
      default: 'attempted',
    },
    runtime: {
      type: String,
      default: '',
      trim: true,
    },
    memory: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    testResults: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    publicPassedCount: {
      type: Number,
      default: 0,
    },
    publicTotalTests: {
      type: Number,
      default: 0,
    },
    passedCount: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    hiddenPassedCount: {
      type: Number,
      default: 0,
    },
    hiddenTotalTests: {
      type: Number,
      default: 0,
    },
    scorePercent: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DsaAttempt', dsaAttemptSchema);
