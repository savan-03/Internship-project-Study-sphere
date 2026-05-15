const mongoose = require('mongoose');

const directMessageSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const directConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    messages: {
      type: [directMessageSchema],
      default: [],
    },
  },
  { timestamps: true }
);

directConversationSchema.index({ participants: 1 });

module.exports = mongoose.model('DirectConversation', directConversationSchema);
