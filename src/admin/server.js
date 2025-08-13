const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { io: SocketIOClient } = require('socket.io-client');
require('dotenv').config();

const mongoose = require('mongoose');
const { AdminUser, UsageLimit, ServerAnalytics, UserAnalytics, AdminMessage } = require('../models/Admin');
const { UserPersona, ChatMessage } = require('../models/User');
const MonetizationService = require('../services/monetizationService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to bot's socket server
let botSocket = null;
const connectToBotSocket = () => {
  botSocket = SocketIOClient('http://localhost:3002');
  
  botSocket.on('connect', () => {
    console.log('✅ Connected to bot socket server');
  });
  
  botSocket.on('disconnect', () => {
    console.log('❌ Disconnected from bot socket server');
  });
  
  botSocket.on('message-delivery-result', (data) => {
    // Relay result to admin dashboard
    io.emit('message-delivery-result', data);
  });
  
  botSocket.on('message-status', (data) => {
    // Relay status to admin dashboard
    io.emit('message-status', data);
  });
};

// Initialize bot socket connection
connectToBotSocket();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.ADMIN_SESSION_SECRET || 'admin-dashboard-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (req.session.adminUser) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Routes
app.get('/', (req, res) => {
  if (req.session.adminUser) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  if (req.session.adminUser) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: null });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await AdminUser.findOne({ username });
    
    if (!admin) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.render('login', { error: 'Invalid username or password' });
    }
    
    admin.lastLogin = new Date();
    await admin.save();
    
    req.session.adminUser = {
      id: admin._id,
      username: admin.username,
      role: admin.role
    };
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'An error occurred. Please try again.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Dashboard Routes
app.get('/dashboard', requireAuth, async (req, res) => {
  try {
    // Get overview statistics
    const totalUsers = await UserAnalytics.countDocuments({ isActive: true });
    const totalServers = await ServerAnalytics.countDocuments({ isActive: true });
    const totalPersonas = await UserPersona.countDocuments();
    const totalMessages = await ChatMessage.countDocuments();
    const activeRestrictions = await UsageLimit.countDocuments({ isActive: true });
    
    // Recent activity
    const recentUsers = await UserAnalytics.find({ isActive: true })
      .sort({ lastActivity: -1 })
      .limit(10);
    
    const recentServers = await ServerAnalytics.find({ isActive: true })
      .sort({ lastActivity: -1 })
      .limit(10);
    
    res.render('dashboard', {
      admin: req.session.adminUser,
      page: 'dashboard',
      pageTitle: 'Dashboard',
      stats: {
        totalUsers,
        totalServers,
        totalPersonas,
        totalMessages,
        activeRestrictions
      },
      recentUsers,
      recentServers
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).send('Server error');
  }
});

// Messaging Routes
app.get('/messaging', requireAuth, async (req, res) => {
  try {
    const recentMessages = await AdminMessage.find()
      .sort({ sentAt: -1 })
      .limit(50);
    
    res.render('messaging', {
      admin: req.session.adminUser,
      page: 'messaging',
      pageTitle: 'Messaging',
      recentMessages
    });
  } catch (error) {
    console.error('Messaging error:', error);
    res.status(500).send('Server error');
  }
});

app.post('/send-message', requireAuth, async (req, res) => {
  try {
    const { messageType, targetId, targetName, message, embedTitle, embedDescription, embedColor } = req.body;
    
    const adminMessage = new AdminMessage({
      sentBy: req.session.adminUser.username,
      messageType,
      targetId,
      targetName,
      message,
      embed: embedTitle ? {
        title: embedTitle,
        description: embedDescription,
        color: embedColor || '#0099ff'
      } : null
    });
    
    await adminMessage.save();
    
    // Send message through bot socket
    if (botSocket && botSocket.connected) {
      botSocket.emit('admin-message', {
        messageType,
        targetId,
        message,
        embed: adminMessage.embed,
        messageId: adminMessage._id
      });
      res.json({ success: true, message: 'Message sent to bot for processing' });
    } else {
      res.json({ success: false, error: 'Bot is not connected. Please try again later.' });
    }
  } catch (error) {
    console.error('Send message error:', error);
    res.json({ success: false, error: 'Failed to send message' });
  }
});

// Analytics Routes
app.get('/analytics', requireAuth, async (req, res) => {
  try {
    const userStats = await UserAnalytics.find({ isActive: true })
      .sort({ totalMessages: -1 })
      .limit(100);
    
    const serverStats = await ServerAnalytics.find({ isActive: true })
      .sort({ totalMessages: -1 })
      .limit(100);
    
    // Growth data for charts (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyUsers = await UserAnalytics.aggregate([
      { $match: { firstSeen: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$firstSeen" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.render('analytics', {
      admin: req.session.adminUser,
      page: 'analytics',
      pageTitle: 'Analytics Dashboard',
      userStats,
      serverStats,
      dailyUsers
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).send('Server error');
  }
});

// Analytics API endpoint
app.get('/api/analytics', requireAuth, async (req, res) => {
  try {
    const period = req.query.period || 'day';
    let dateFilter = {};
    
    // Calculate date filter based on period
    if (period !== 'all') {
      const days = period === 'day' ? 1 : period === 'week' ? 7 : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      dateFilter = { lastActive: { $gte: startDate } };
    }

    // Get overview data
    const totalMessages = await ChatMessage.countDocuments(dateFilter.lastActive ? { timestamp: dateFilter.lastActive } : {});
    const activeUsers = await UserAnalytics.countDocuments({ isActive: true, ...dateFilter });
    const activeServers = await ServerAnalytics.countDocuments({ isActive: true, ...dateFilter });
    const restrictedUsers = await UsageLimit.countDocuments({ 
      isActive: true, 
      currentUsage: { $gte: '$dailyMessageLimit' }
    });

    // Get chart data
    const messageActivity = await ChatMessage.aggregate([
      ...(dateFilter.lastActive ? [{ $match: { timestamp: dateFilter.lastActive } }] : []),
      {
        $group: {
          _id: { 
            $dateToString: { 
              format: period === 'day' ? '%H' : '%Y-%m-%d', 
              date: '$timestamp' 
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get usage distribution
    const freeUsers = await UserAnalytics.countDocuments({ isActive: true });
    const restrictedCount = await UsageLimit.countDocuments({ isActive: true });
    
    // Get top users and servers
    const topUsers = await UserAnalytics.find({ isActive: true })
      .sort({ messageCount: -1 })
      .limit(10)
      .lean();

    const topServers = await ServerAnalytics.find({ isActive: true })
      .sort({ messageCount: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      overview: {
        totalMessages,
        activeUsers,
        activeServers,
        restrictedUsers
      },
      charts: {
        messageActivity: {
          labels: messageActivity.map(item => item._id),
          data: messageActivity.map(item => item.count)
        },
        usageDistribution: [freeUsers - restrictedCount, restrictedCount, 0] // [free, restricted, premium]
      },
      tables: {
        topUsers: topUsers.map(user => ({
          username: user.username || `User ${user.userId.slice(-4)}`,
          userId: user.userId,
          messageCount: user.messageCount || 0,
          lastActive: user.lastActive
        })),
        topServers: topServers.map(server => ({
          serverName: server.guildName || `Server ${server.guildId.slice(-4)}`,
          serverId: server.guildId,
          messageCount: server.messageCount || 0,
          userCount: server.memberCount || 0
        }))
      }
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    res.json({ success: false, error: 'Failed to fetch analytics data' });
  }
});

// Monetization Routes
app.get('/monetization', requireAuth, async (req, res) => {
  try {
    const restrictions = await UsageLimit.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    // Add calculated fields for template
    const restrictionsWithCalc = restrictions.map(restriction => {
      const usagePercent = Math.min((restriction.currentUsage / restriction.dailyMessageLimit) * 100, 100);
      let progressClass = 'bg-success';
      
      if (restriction.currentUsage >= restriction.dailyMessageLimit) {
        progressClass = 'bg-danger';
      } else if (restriction.currentUsage >= restriction.dailyMessageLimit * 0.8) {
        progressClass = 'bg-warning';
      }
      
      return {
        ...restriction.toObject(),
        usagePercent: usagePercent.toFixed(1),
        progressClass
      };
    });
    
    res.render('monetization', {
      admin: req.session.adminUser,
      page: 'monetization',
      pageTitle: 'Monetization',
      restrictions: restrictionsWithCalc
    });
  } catch (error) {
    console.error('Monetization error:', error);
    res.status(500).send('Server error');
  }
});

app.post('/add-restriction', requireAuth, async (req, res) => {
  try {
    const { type, targetId, targetName, dailyMessageLimit, reason, paymentLink } = req.body;
    
    // Check if restriction already exists
    const existing = await UsageLimit.findOne({ targetId, type });
    if (existing) {
      existing.dailyMessageLimit = dailyMessageLimit;
      existing.reason = reason;
      existing.paymentLink = paymentLink || existing.paymentLink;
      existing.isActive = true;
      await existing.save();
    } else {
      const restriction = new UsageLimit({
        type,
        targetId,
        targetName,
        dailyMessageLimit,
        reason,
        paymentLink: paymentLink || 'https://your-payment-portal.com',
        restrictedBy: req.session.adminUser.username
      });
      await restriction.save();
    }
    
    res.json({ success: true, message: 'Restriction added successfully' });
  } catch (error) {
    console.error('Add restriction error:', error);
    res.json({ success: false, error: 'Failed to add restriction' });
  }
});

app.post('/remove-restriction', requireAuth, async (req, res) => {
  try {
    const { restrictionId } = req.body;
    await UsageLimit.findByIdAndUpdate(restrictionId, { isActive: false });
    res.json({ success: true, message: 'Restriction removed successfully' });
  } catch (error) {
    console.error('Remove restriction error:', error);
    res.json({ success: false, error: 'Failed to remove restriction' });
  }
});

app.post('/reset-usage', requireAuth, async (req, res) => {
  try {
    const { restrictionId, targetId, targetType } = req.body;
    
    let updateResult;
    
    if (restrictionId) {
      // Reset usage for specific restriction by ID
      updateResult = await UsageLimit.findByIdAndUpdate(restrictionId, { 
        currentUsage: 0,
        lastReset: new Date()
      });
    } else if (targetId && targetType) {
      // Reset usage for target by ID and type
      const filter = { isActive: true };
      if (targetType === 'user') {
        filter.targetId = targetId;
        filter.type = 'user';
      } else if (targetType === 'server') {
        filter.targetId = targetId;
        filter.type = 'server';
      }
      
      updateResult = await UsageLimit.updateMany(filter, { 
        currentUsage: 0,
        lastReset: new Date()
      });
    } else {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    
    if (updateResult) {
      res.json({ success: true, message: 'Usage reset successfully' });
    } else {
      res.status(404).json({ success: false, error: 'Restriction not found' });
    }
  } catch (error) {
    console.error('Reset usage error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset usage: ' + error.message });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Admin dashboard connected');
  
  socket.on('bot-analytics-update', (data) => {
    socket.broadcast.emit('analytics-update', data);
  });
  
  socket.on('message-status-update', (data) => {
    socket.broadcast.emit('message-status', data);
  });
});

const PORT = process.env.ADMIN_PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎛️  Admin Dashboard running on http://localhost:${PORT}`);
  console.log(`🔐 Default admin login: admin / admin123 (change this!)`);
});

// Create default admin user if none exists
async function createDefaultAdmin() {
  try {
    const adminExists = await AdminUser.findOne({});
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const defaultAdmin = new AdminUser({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      });
      await defaultAdmin.save();
      console.log('✅ Default admin user created: admin / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
}

mongoose.connection.once('open', () => {
  console.log('📊 Admin Dashboard MongoDB connected');
  createDefaultAdmin();
});

module.exports = { app, server, io };
