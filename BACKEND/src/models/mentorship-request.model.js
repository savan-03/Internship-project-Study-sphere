const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    goals: {
      type: String,
      default: '',
      trim: true,
    },
    topics: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['open', 'accepted', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
