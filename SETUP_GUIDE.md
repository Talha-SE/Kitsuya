# Discord Bot Setup Guide

## Step 1: Create Discord Application

1. **Go to Discord Developer Portal**
   - Visit: https://discord.com/developers/applications
   - Log in with your Discord account

2. **Create New Application**
   - Click "New Application" button (top right)
   - Enter bot name (suggested: "CompanionAI" or "PersonaBot")
   - Click "Create"

## Step 2: Configure Bot Settings

### General Information Tab:
- **Name**: Your chosen bot name
- **Description**: "AI Companion Bot with 28 diverse personalities for education, entertainment, and support"
- **Tags**: Add tags like "AI", "Chat", "Education", "Entertainment"
- **Avatar**: Upload a nice bot avatar image (optional)

### Bot Tab (IMPORTANT):
1. Click "Bot" in left sidebar
2. **Create Bot**: Click "Add Bot" if not already created
3. **Token**: Click "Reset Token" → Copy and save this token securely
4. **Privileged Gateway Intents** (REQUIRED):
   - ✅ Enable "Message Content Intent"
   - ✅ Enable "Server Members Intent" (optional but recommended)
   - ✅ Enable "Presence Intent" (optional)

### OAuth2 → URL Generator:
1. **Scopes**: Check both:
   - ✅ `bot`
   - ✅ `applications.commands`

2. **Bot Permissions**: Select these permissions:
   - ✅ Send Messages
   - ✅ Use Slash Commands
   - ✅ Read Messages/View Channels
   - ✅ Read Message History
   - ✅ Embed Links
   - ✅ Add Reactions
   - ✅ Use External Emojis
   - ✅ Manage Messages (optional, for cleanup)

3. **Copy the Generated URL** - Use this to invite your bot to servers

## Step 3: Bot Requirements

### Server Requirements:
- No specific server requirements
- Works in any Discord server where you have "Manage Server" permission
- Can work in DMs as well

### Rate Limits to Consider:
- Discord: 50 slash commands per hour per guild
- Mistral API: Depends on your plan
- Bot can handle multiple servers simultaneously

## Step 4: Recommended Settings

### In Discord Developer Portal:
- **Public Bot**: Enable if you want others to invite your bot
- **Require OAuth2 Code Grant**: Keep disabled
- **Bot Token**: Keep private and secure

### Bot Permissions Explanation:
- **Send Messages**: Required for responses
- **Use Slash Commands**: Required for /commands
- **Read Messages**: To see mentions and DMs
- **Embed Links**: For rich message formatting
- **Add Reactions**: For interactive features
