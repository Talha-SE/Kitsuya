const mongoose = require('mongoose');

// Admin User Schema
const adminUserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'moderator'],
    default: 'admin'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
});

// Usage Limits Schema
const usageLimitSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'server'],
    required: true
  },
  targetId: {
    type: String,
    required: true // userId or guildId
  },
  targetName: {
    type: String,
    required: true // username or server name
  },
  dailyMessageLimit: {
    type: Number,
    required: true,
    default: 100
  },
  currentUsage: {
    type: Number,
    default: 0
  },
  lastReset: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  restrictedBy: {
    type: String,
    required: true // admin username
  },
  reason: {
    type: String,
    default: ''
  },
  paymentLink: {
    type: String,
    default: 'https://your-payment-portal.com'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Server Analytics Schema
const serverAnalyticsSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  guildName: {
    type: String,
    required: true
  },
  memberCount: {
    type: Number,
    default: 0
  },
  botJoinedAt: {
    type: Date,
    default: Date.now
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  totalPersonas: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
});

// User Analytics Schema
const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  totalPersonas: {
    type: Number,
    default: 0
  },
  serversJoined: [{
    guildId: String,
    guildName: String,
    joinedAt: { type: Date, default: Date.now }
  }],
  firstSeen: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Admin Messages Schema
const adminMessageSchema = new mongoose.Schema({
  sentBy: {
    type: String,
    required: true // admin username
  },
  messageType: {
    type: String,
    enum: ['user_dm', 'server_broadcast', 'channel_message'],
    required: true
  },
  targetId: {
    type: String,
    required: true // userId, guildId, or channelId
  },
  targetName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  embed: {
    title: String,
    description: String,
    color: String,
    thumbnail: String
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveryStatus: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  }
});

// Indexes for performance
usageLimitSchema.index({ targetId: 1, type: 1 });
usageLimitSchema.index({ lastReset: 1 });
serverAnalyticsSchema.index({ lastActivity: -1 });
userAnalyticsSchema.index({ lastActivity: -1 });
adminMessageSchema.index({ sentAt: -1 });

const AdminUser = mongoose.model('AdminUser', adminUserSchema);
const UsageLimit = mongoose.model('UsageLimit', usageLimitSchema);
const ServerAnalytics = mongoose.model('ServerAnalytics', serverAnalyticsSchema);
const UserAnalytics = mongoose.model('UserAnalytics', userAnalyticsSchema);
const AdminMessage = mongoose.model('AdminMessage', adminMessageSchema);

module.exports = {
  AdminUser,
  UsageLimit,
  ServerAnalytics,
  UserAnalytics,
  AdminMessage
};
