# Complete Discord Bot Setup Checklist

## 🎯 **Phase 1: Discord Developer Portal Setup**

### Step 1: Create Application
1. Go to: https://discord.com/developers/applications
2. Click "New Application"
3. **Suggested Names**: CompanionAI, PersonaBot, WisdomWing, ChatCrafter
4. Click "Create"

### Step 2: Bot Configuration
**In the "Bot" tab:**
1. Click "Add Bot"
2. **Reset Token** → Copy and save securely
3. **Enable Privileged Gateway Intents:**
   - ✅ Message Content Intent (REQUIRED)
   - ✅ Server Members Intent (Recommended)
   - ✅ Presence Intent (Optional)

### Step 3: Generate Invite Link
**In OAuth2 → URL Generator:**
1. **Scopes:** 
   - ✅ bot
   - ✅ applications.commands

2. **Permissions:**
   - ✅ Send Messages
   - ✅ Use Slash Commands  
   - ✅ Read Messages/View Channels
   - ✅ Read Message History
   - ✅ Embed Links
   - ✅ Add Reactions
   - ✅ Manage Channels (for private channels)
   - ✅ Manage Roles (for private channel permissions)
   - ✅ Create Private Threads (optional)

3. **Copy the generated URL** - This invites your bot to servers

---

## 🗄️ **Phase 2: MongoDB Atlas Setup**

### Step 1: Create Account
1. Go to: https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (Free tier: M0)

### Step 2: Database Setup
1. **Database Access**: Create user with read/write permissions
2. **Network Access**: Add IP address (0.0.0.0/0 for all IPs)
3. **Connect**: Choose "Connect your application"
4. Copy connection string (replace <password> with actual password)

---

## 🤖 **Phase 3: Bot Configuration**

### Step 1: Configure Environment
```bash
npm run setup
```
**You'll need:**
- Discord Bot Token (from Phase 1)
- MongoDB Connection String (from Phase 2)
- Mistral API keys (already included)

### Step 2: Test Connections
```bash
npm run validate
```
This tests all your API connections.

### Step 3: Launch Bot
```bash
npm start
```

---

## 🎭 **Phase 4: Bot Features**

### Available Personalities (28 Total):
- **Fun & Social**: Banter, Flirt, Storyteller, Gaming
- **Educational**: Professor, Tutor, Coach, Trivia  
- **Business**: Mentor, Analyst, Career, Marketing
- **Wellness**: Therapist, Life Coach, Fitness, Mindfulness
- **Lifestyle**: Assistant, Travel, Chef, Style
- **Entertainment**: Movies, Music, Books, Jokes
- **Unique**: Debate, Philosophy, History, Oracle

### Key Commands:
- `/start` - Create AI companion
- `/personalities` - Browse all types
- `/chat` - Talk with companion
- `/change-personality` - Switch anytime
- `/profile` - View details
- `/help` - Full help guide

---

## ✅ **Final Checklist**

- [ ] Discord application created
- [ ] Bot token obtained and saved
- [ ] Privileged intents enabled
- [ ] Invite URL generated
- [ ] MongoDB Atlas cluster created
- [ ] Database user and network access configured
- [ ] Environment variables configured (`npm run setup`)
- [ ] Connections validated (`npm run validate`)
- [ ] Bot launched (`npm start`)
- [ ] Bot invited to Discord server
- [ ] First companion created with `/start`

---

## 🚨 **Troubleshooting**

### Common Issues:
1. **Bot not responding**: Check privileged intents enabled
2. **Database errors**: Verify MongoDB connection string and user permissions
3. **API errors**: Check if Mistral API keys are working
4. **Permission errors**: Ensure bot has required permissions in Discord server

### Support:
- Check console logs for detailed error messages
- Use `/ping` command to test bot responsiveness
- Run `npm run validate` to test all connections
