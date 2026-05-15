const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema(
  {
    input: { type: String, required: true, trim: true },
    output: { type: String, required: true, trim: true },
    explanation: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const testCaseSchema = new mongoose.Schema(
  {
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expectedOutput: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const editorialSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const videoResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: '',
      trim: true,
    },
    provider: {
      type: String,
      default: 'StudySphere',
      trim: true,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['placeholder', 'ready'],
      default: 'placeholder',
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const dsaProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    category: {
      type: String,
      default: 'Arrays',
      trim: true,
    },
    topic: {
      type: String,
      default: 'Core Patterns',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    companyTags: {
      type: [String],
      default: [],
    },
    patterns: {
      type: [String],
      default: [],
    },
    statement: {
      type: String,
      required: true,
      trim: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    hints: {
      type: [String],
      default: [],
    },
    examples: {
      type: [exampleSchema],
      default: [],
    },
    starterCode: {
      javascript: { type: String, default: '' },
      python: { type: String, default: '' },
      java: { type: String, default: '' },
      cpp: { type: String, default: '' },
    },
    functionName: {
      type: String,
      default: 'solve',
      trim: true,
    },
    testCases: {
      type: [testCaseSchema],
      default: [],
    },
    hiddenTests: {
      type: [testCaseSchema],
      default: [],
    },
    complexity: {
      time: {
        type: String,
        default: '',
        trim: true,
      },
      space: {
        type: String,
        default: '',
        trim: true,
      },
    },
    estimatedMinutes: {
      type: Number,
      default: 20,
    },
    editorial: {
      type: String,
      default: '',
      trim: true,
    },
    editorialSections: {
      type: [editorialSectionSchema],
      default: [],
    },
    videoResource: {
      type: videoResourceSchema,
      default: () => ({}),
    },
    acceptanceRate: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DsaProblem', dsaProblemSchema);
