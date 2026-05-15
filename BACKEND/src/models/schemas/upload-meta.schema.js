const mongoose = require('mongoose');

const uploadMetaSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ['imagekit', 'local', 'external'],
      default: 'external',
      trim: true,
    },
    fileId: {
      type: String,
      default: '',
      trim: true,
    },
    folder: {
      type: String,
      default: '',
      trim: true,
    },
    url: {
      type: String,
      default: '',
      trim: true,
    },
    path: {
      type: String,
      default: '',
      trim: true,
    },
    originalFileName: {
      type: String,
      default: '',
      trim: true,
    },
    storedFileName: {
      type: String,
      default: '',
      trim: true,
    },
    extension: {
      type: String,
      default: '',
      trim: true,
    },
    mimeType: {
      type: String,
      default: '',
      trim: true,
    },
    sizeBytes: {
      type: Number,
      default: 0,
      min: 0,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

module.exports = uploadMetaSchema;
