const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const aiQuizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    answer: { type: String, default: '', trim: true },
    explanation: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const aiSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['assistant', 'quiz', 'interview'],
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
      trim: true,
    },
    prompt: {
      type: String,
      default: '',
      trim: true,
    },
    context: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    messages: {
      type: [aiMessageSchema],
      default: [],
    },
    questions: {
      type: [aiQuizQuestionSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AiSession', aiSessionSchema);
