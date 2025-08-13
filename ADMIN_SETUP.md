# Discord Bot Admin Dashboard Setup Guide

## 🚀 Quick Start

### 1. Start the Bot and Admin Dashboard
```bash
npm run start-all
```

This will start both:
- Discord Bot on port 3002 (socket server)
- Admin Dashboard on port 3001 (web interface)

### 2. Access Admin Dashboard
Open your browser and navigate to: `http://localhost:3001`

### 3. Default Admin Credentials
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANT: Change these credentials immediately after first login!**

## 🔧 Individual Commands

### Start Discord Bot Only
```bash
npm start
```

### Start Admin Dashboard Only
```bash
npm run admin
```

## 📊 Admin Dashboard Features

### 🏠 Dashboard
- Real-time server and user statistics
- Active usage limits overview
- Recent message history
- Quick actions panel

### 💬 Messaging
- Send direct messages to users
- Broadcast messages to servers
- Send messages to specific channels
- Rich embed support with custom colors

### 💰 Monetization
- Set daily message limits per user/server
- Automatic usage tracking
- Payment integration for upgrades
- Usage analytics and reporting
- Bulk restriction management

### 📈 Analytics
- User engagement metrics
- Server activity tracking
- Message volume statistics
- Usage trend analysis

## 🔐 Security Features

- Session-based authentication
- Password hashing with bcrypt
- Admin activity logging
- Secure socket communication

## 🎛️ Configuration

### Environment Variables (.env)
```
DISCORD_TOKEN=your_discord_token
DISCORD_CLIENT_ID=your_client_id
MONGODB_URI=your_mongodb_connection
MISTRAL_API_KEY=your_mistral_api_key
```

### MongoDB Collections
The system automatically creates these collections:
- `users` - Bot user data and personas
- `chatmessages` - Chat history
- `adminusers` - Admin dashboard users
- `usagelimits` - Monetization limits
- `serveranalytics` - Server statistics
- `useranalytics` - User statistics
- `adminmessages` - Admin message history

## 🔧 Troubleshooting

### Bot Not Connecting to Admin Dashboard
1. Check if both services are running
2. Verify socket server is on port 3002
3. Check console for connection errors

### Cannot Send Messages
1. Verify bot has proper Discord permissions
2. Check if target user/server/channel exists
3. Ensure bot is in the target server

### Monetization Not Working
1. Check MongoDB connection
2. Verify usage limits are properly configured
3. Check console for limit checking errors

## 📝 Admin Tasks

### Adding New Admin User
```javascript
// In MongoDB or through Node.js console
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync('newpassword', salt);

// Insert new admin user
{
  username: 'newadmin',
  password: hashedPassword,
  createdAt: new Date()
}
```

### Resetting Usage Limits
Access the Monetization tab and use the "Reset Usage" button for individual users/servers.

## 🌟 Advanced Features

### Custom Message Embeds
- Title, description, and color customization
- Thumbnail support (coming soon)
- Field support (coming soon)

### Bulk Operations
- Mass message sending
- Bulk limit adjustments
- Batch user management

### Real-time Updates
- Live message delivery status
- Real-time analytics updates
- Instant limit notifications

---

**Need Help?** Check the console logs for detailed error messages and troubleshooting information.
