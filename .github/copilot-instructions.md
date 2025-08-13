<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Discord AI Companion Bot - Copilot Instructions

This is a Node.js Discord bot project that creates personalized AI companions with the following key components:

## Project Overview
- **Framework**: Discord.js v14
- **AI Provider**: Mistral AI API
- **Database**: MongoDB Atlas with Mongoose
- **Features**: Personality customization, conversation memory, flirty chatbot interactions

## Key Files and Architecture
- `src/bot.js`: Main bot entry point and command registration
- `src/models/User.js`: MongoDB schemas for user personas and chat messages  
- `src/services/mistralService.js`: Mistral AI API integration
- `src/services/databaseService.js`: Database operations
- `src/commands/`: Slash commands (start, chat, profile, stats, etc.)
- `src/events/`: Discord event handlers
- `src/utils/setupUI.js`: UI components and embed builders

## Development Guidelines
- Use Discord.js v14 patterns and best practices
- Implement proper error handling for all async operations
- Follow the existing code structure and naming conventions
- Ensure all database operations are properly indexed
- Use embeds for rich Discord messages
- Implement proper permission checks
- Handle rate limiting for AI API calls

## Security Considerations
- Never commit API keys or tokens
- Use environment variables for all sensitive data
- Implement proper user data validation
- Ensure proper database query sanitization

## Testing Notes
- Test slash commands in Discord servers
- Verify modal and button interactions work correctly
- Check conversation memory and summarization
- Validate database cleanup operations
- Test error handling and recovery scenarios
