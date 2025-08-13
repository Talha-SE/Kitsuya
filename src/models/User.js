const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userPersonaSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  guildId: {
    type: String,
    required: true
  },
  setupId: {
    type: String,
    required: true,
    default: () => uuidv4()
  },
  persona: {
    name: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true,
      default: 'English'
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female']
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 100
    },
    personality: {
      type: String,
      required: true
    },
    mbtiType: {
      type: String,
      required: false
    },
    privacySetting: {
      type: String,
      required: true,
      enum: ['dm', 'private_channel', 'public'],
      default: 'public'
    }
  },
  conversationSummary: {
    type: String,
    default: ''
  },
  privateChannelId: {
    type: String,
    default: null
  },
  isInboxPersonality: {
    type: Boolean,
    default: false // Only one persona per user can be the inbox (DM) personality
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  guildId: {
    type: String,
    required: true
  },
  setupId: {
    type: String,
    default: null // Link message to specific persona setup
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying - remove duplicates to fix warnings
userPersonaSchema.index({ userId: 1, guildId: 1 });
userPersonaSchema.index({ setupId: 1 }, { unique: true });
userPersonaSchema.index({ userId: 1, isInboxPersonality: 1 });
chatMessageSchema.index({ userId: 1, guildId: 1, timestamp: -1 });
chatMessageSchema.index({ setupId: 1, timestamp: -1 });

const UserPersona = mongoose.model('UserPersona', userPersonaSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = {
  UserPersona,
  ChatMessage
};
