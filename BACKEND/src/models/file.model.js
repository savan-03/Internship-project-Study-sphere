const mongoose = require('mongoose');
const uploadMetaSchema = require('./schemas/upload-meta.schema');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const commentReplySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    replies: {
      type: [commentReplySchema],
      default: [],
    },
  },
  { timestamps: true }
);

const fileSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    type: {
      type: String,
      enum: ['pdf', 'link', 'notes', 'video'],
      default: 'pdf',
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    externalUrl: {
      type: String,
      default: '',
      trim: true,
    },
    fileName: {
      type: String,
      default: '',
      trim: true,
    },
    fileSize: {
      type: String,
      default: '',
      trim: true,
    },
    uploadMeta: {
      type: uploadMetaSchema,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'admin',
    }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    ocrText: {
      type: String,
      default: '',
      trim: true,
    },
    extractedSummary: {
      type: String,
      default: '',
      trim: true,
    },
    plagiarismScore: {
      type: Number,
      default: 0,
    },
    plagiarismMatches: {
      type: [
        {
          resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'file',
          },
          title: {
            type: String,
            default: '',
            trim: true,
          },
          score: {
            type: Number,
            default: 0,
          },
        },
      ],
      default: [],
    },
    verificationNotes: {
      type: String,
      default: '',
      trim: true,
    },
    versionHistory: {
      type: [
        {
          title: { type: String, default: '', trim: true },
          description: { type: String, default: '', trim: true },
          tags: { type: [String], default: [] },
          externalUrl: { type: String, default: '', trim: true },
          fileName: { type: String, default: '', trim: true },
          fileSize: { type: String, default: '', trim: true },
          uploadMeta: {
            type: uploadMetaSchema,
            default: null,
          },
          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          updatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    moderationHistory: {
      type: [
        {
          action: {
            type: String,
            enum: ['submitted', 'updated', 'approved', 'rejected', 'returned_to_review', 'note_added'],
            default: 'submitted',
          },
          status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
          },
          note: {
            type: String,
            default: '',
            trim: true,
          },
          actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const fileModel = mongoose.model('file', fileSchema);

module.exports = fileModel;
