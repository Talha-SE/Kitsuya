# AI Discord Companion Bot

A sophisticated Discord bot that creates personalized AI companions for users, featuring **28 diverse personalities**, **advanced privacy options**, and conversation memory with appropriate content filtering.

## 🌟 Features

### 🔐 Advanced Privacy System (NEW!)
Choose how you want to interact with your AI companion:

**📩 Private DMs**
- Complete privacy via direct messages
- No server interaction required
- Maximum personal space

**🔒 Private Server Channels**  
- Auto-created hidden channels in your server
- Only you and the bot can access
- Organized under "AI Companions" category

**💬 Public Server Chat**
- Traditional bot mentions and slash commands
- Community interaction and shared experiences
- Public engagement features

### 🎭 28 Diverse Personalities
Choose from 7 categories with 4 personalities each:

**🎉 Fun & Social**
- **Playful Banter Buddy** - Witty jokes and light-hearted conversations
- **Friendly Flirt** - Sweet romantic compliments and gentle teasing (safe/appropriate)
- **Storyteller** - Interactive tales, adventures, and creative narratives
- **Gaming Partner** - Gaming tips, strategies, and text-based mini-games

**🎓 Educational**
- **The Professor** - Academic explanations and detailed teaching
- **Language Tutor** - Learn and practice new languages interactively
- **Skill Coach** - Step-by-step coaching for coding, design, music, etc.
- **Trivia Master** - Quizzes, knowledge challenges, and brain teasers

**💼 Business & Finance**
- **Entrepreneur Mentor** - Business guidance and startup strategies
- **Trading Analyst** - Market analysis and investment education
- **Career Coach** - Resume help, interview prep, career planning
- **Marketing Guru** - Social media growth and branding strategies

**💚 Health & Well-Being**
- **Therapist/Listener** - Emotional support and reflective conversations
- **Life Coach** - Goal setting, motivation, and personal development
- **Fitness Trainer** - Workout routines, nutrition tips, health advice
- **Mindfulness Guide** - Meditation, relaxation, and mindfulness practices

**🏠 Lifestyle & Daily Help**
- **Personal Assistant** - Task management, schedules, and organization
- **Travel Guide** - Destination recommendations and travel planning
- **Chef Mode** - Recipes, cooking techniques, and culinary tips
- **Style Consultant** - Fashion advice, grooming, and personal style

**🎬 Entertainment**
- **Movie Critic** - Film reviews, recommendations, and cinema discussion
- **Music Buddy** - Playlist suggestions, artist discussions, music discovery
- **Book Club Partner** - Literature discussion and reading recommendations
- **Joke Machine** - Clean humor, puns, and family-friendly entertainment

**🔮 Experimental & Unique**
- **Debate Partner** - Logical arguments and discussion practice
- **Philosopher** - Deep life questions, ethics, and existential discussions
- **Time-Travel Historian** - Historical perspectives from different eras
- **Mystery Oracle** - Cryptic wisdom, riddles, and mystical insights

### 🛡️ Safe & Appropriate Content
- **Content Filtering** - No explicit sexual content or inappropriate material
- **Respectful Boundaries** - Romantic interactions kept sweet and tasteful
- **Family-Friendly** - Safe for all audiences with appropriate responses
- **Professional Standards** - Maintains appropriate boundaries while being engaging

### 💬 Intelligent Conversations
- **Mistral AI Integration** - Powered by advanced AI for natural responses
- **Conversation Memory** - Remembers context and past interactions
- **Smart Summaries** - Automatically summarizes conversations for efficiency
- **Personality Consistency** - Stays in character based on chosen personality

### 🗄️ Advanced Data Management
- **MongoDB Atlas** - Secure cloud database storage
- **Individual Profiles** - Separate personas per user per server
- **Chat History** - Complete conversation logging and retrieval
- **Automatic Cleanup** - Optimizes database size with smart cleanup
- **Privacy Protection** - User data isolated and secure

### 🚀 Easy Setup Process
Interactive setup wizard with **7 simple steps**:
1. **Privacy Selection** - Choose your interaction mode (NEW!)
2. **Language Selection** - Choose your preferred language
3. **Name Input** - Give your companion a name
4. **Gender Selection** - Pick male, female, non-binary, or other
5. **Personality Choice** - Select from 28 personality types
6. **Age Setting** - Set age between 18-99
7. **Characteristics** - Choose 3-5 unique traits

## 📋 Commands

### Essential Commands
- `/start` - Create your AI companion (interactive setup wizard)
- `/chat <message>` - Chat with your AI companion
- `/personalities` - Browse all 28 available personality types
- `/profile` - View your companion's profile and details
- `/stats` - See your chat statistics and activity

### Customization Commands
- `/change-personality` - Change your companion's personality anytime
- `/reset` - Reset your companion (⚠️ deletes all data)

### Utility Commands
- `/help` - Show all available commands and features
- `/ping` - Check bot latency and status

### Chat Methods
- **Slash Commands**: Use `/chat <message>` anywhere
- **Private Channels**: Chat in your exclusive private channel (if selected)
- **Direct Messages**: DM the bot directly for private chats (if selected)
- **Mentions**: `@YourBot hello there!` (public mode)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Discord Bot Token
- Mistral AI API Key

### Installation

1. **Clone and Install**
```bash
git clone <repository>
cd discord-ai-chatbot
npm install
```

2. **Environment Configuration**
```bash
# Copy the example environment file
copy .env.example .env
```

3. **Configure Environment Variables**
Edit `.env` file with your credentials:
```env
DISCORD_TOKEN=your_discord_bot_token_here
MONGODB_URI=your_mongodb_atlas_connection_string_here
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
```

### Getting Your API Keys

#### Discord Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section
4. Click "Reset Token" and copy the token
5. Enable "Message Content Intent" and "Server Members Intent"

#### MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Get connection string from "Connect" → "Connect your application"
5. Replace `<password>` with your database user password

#### Mistral AI API Key
1. Sign up at [Mistral AI](https://mistral.ai/)
2. Go to API section in dashboard
3. Generate a new API key
4. Copy the key to your .env file

### Bot Permissions
Your Discord bot needs these permissions:
- Read Messages/View Channels
- Send Messages
- Use Slash Commands
- Embed Links
- Read Message History
- Add Reactions

**Invite Link Template:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_BOT_ID&permissions=2147486720&scope=bot%20applications.commands
```

## 🚀 Running the Bot

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📁 Project Structure

```
src/
├── bot.js                 # Main bot file and entry point
├── config/
│   └── database.js        # MongoDB connection setup
├── models/
│   └── User.js           # Database schemas for users and messages
├── services/
│   ├── mistralService.js  # Mistral AI API integration
│   └── databaseService.js # Database operations and queries
├── commands/             # Slash commands
│   ├── start.js         # Setup command
│   ├── chat.js          # Chat command
│   ├── profile.js       # Profile viewing
│   ├── stats.js         # User statistics
│   ├── help.js          # Help information
│   ├── ping.js          # Latency check
│   └── reset.js         # Data reset
├── events/              # Discord event handlers
│   ├── ready.js         # Bot startup
│   ├── interactionCreate.js # Button/modal interactions
│   └── messageCreate.js  # Message handling
└── utils/
    └── setupUI.js       # UI components and embed builders
```

## 🎨 Customization

### Adding New Personalities
Edit `src/utils/setupUI.js` and add to the `PERSONALITIES` array:
```javascript
{ label: 'Your New Personality', value: 'your_new_personality', emoji: '🎭' }
```

### Adding New Languages
Add to the `LANGUAGES` array in `src/utils/setupUI.js`:
```javascript
{ label: 'Your Language', value: 'your_language', emoji: '🇫🇷' }
```

### Customizing AI Responses
Modify the system prompt in `src/services/mistralService.js` in the `createSystemPrompt()` method.

## 🔒 Privacy & Security

- All user data is stored securely in MongoDB Atlas
- Conversations are encrypted in transit
- User data is separated by Discord server
- No personal information is stored beyond Discord user IDs
- Users can reset all their data at any time

## 🐛 Troubleshooting

### Common Issues

**Bot not responding to commands:**
- Check bot permissions in Discord server
- Ensure bot has "Use Slash Commands" permission
- Verify bot token is correct

**Database connection errors:**
- Check MongoDB Atlas connection string
- Ensure database user has read/write permissions
- Verify network access is configured correctly

**AI not responding:**
- Check Mistral API key is valid
- Verify API endpoint URL
- Check API rate limits

**Setup process stuck:**
- Try using the `/reset` command and starting over
- Check console for error messages
- Ensure all required fields are filled

### Debug Mode
Set environment variable for detailed logging:
```bash
NODE_ENV=development
```

## 📈 Performance Tips

- Bot automatically cleans old messages every 20 conversations
- Conversation summaries are generated to maintain context efficiently
- Database queries are optimized with proper indexing
- API calls are rate-limited to prevent quota exhaustion

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

Need help? Here are your options:
1. Check this README for common solutions
2. Review the `/help` command in Discord
3. Check console logs for error messages
4. Create an issue in the repository

## 🔮 Future Features

- Image generation for companions
- Voice message support
- Companion customization after creation
- Group chat support
- Advanced memory management
- Custom personality training
- Integration with more AI providers

---

**Happy chatting! 💕**
