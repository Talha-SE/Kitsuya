const { Events, EmbedBuilder } = require('discord.js');
const DatabaseService = require('../services/databaseService');
const MistralService = require('../services/mistralService');
const PrivateChannelService = require('../services/privateChannelService');

const db = new DatabaseService();
const mistral = new MistralService();
let privateChannelService;

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Initialize private channel service if not already done
    if (!privateChannelService) {
      privateChannelService = new PrivateChannelService(message.client);
    }

    // Ignore messages from bots
    if (message.author.bot) return;

    // Check if bot is mentioned or if it's a DM or private channel
    const botMentioned = message.mentions.has(message.client.user);
    const isDM = message.channel.type === 1; // DM channel type
    const isPublicCommand = message.content.startsWith('-c ');
    
    const userId = message.author.id;
    const guildId = message.guildId || 'DM';
    
    // Check if user has a persona - handle DMs differently
    let persona = null;
    if (isDM) {
      // For DMs, use the inbox persona
      persona = await db.getInboxPersona(userId);
    } else {
      // For guild messages, get persona for this guild/channel
      persona = await db.getUserPersona(userId, guildId, message.channel.id);
    }
    
    // Check if this is a private channel for this user
    let isPrivateChannel = false;
    if (persona && persona.privateChannelId === message.channel.id) {
      isPrivateChannel = true;
    }

    // Determine if bot should respond based on privacy settings
    let shouldRespond = false;
    let privacyMode = 'public';

    if (persona) {
      privacyMode = persona.persona.privacySetting || 'public';
      
      switch (privacyMode) {
        case 'dm':
          shouldRespond = isDM;
          break;
        case 'private_channel':
          shouldRespond = isPrivateChannel;
          break;
        case 'public':
          shouldRespond = isPublicCommand;
          break;
      }
    } else {
      // No persona - only respond to mentions or DMs for setup
      shouldRespond = botMentioned || isDM;
    }

    if (!shouldRespond) return;

    try {
      // Check if user has a persona
      if (!persona) {
        const embed = new EmbedBuilder()
          .setColor(0xFF4444)
          .setTitle('🤖 No AI Companion Found')
          .setDescription('You need to set up your AI companion first!')
          .addFields({
            name: '🚀 Get Started',
            value: 'Use `/start` to create your personalized AI companion.',
            inline: false
          });
        
        return await message.reply({ embeds: [embed] });
      }

      // Show typing indicator
      await message.channel.sendTyping();

      // Get user message (remove bot mention or -c prefix if present)
      let userMessage = message.content;
      if (botMentioned) {
        userMessage = userMessage.replace(`<@${message.client.user.id}>`, '').trim();
      } else if (isPublicCommand) {
        userMessage = userMessage.substring(3).trim(); // Remove '-c ' prefix
      }

      if (!userMessage) {
        if (privacyMode === 'public') {
          return await message.reply('👋 Hey there! Use `-c your message` to chat with your companion!');
        } else {
          return await message.reply('👋 Hey there! What would you like to chat about?');
        }
      }

      // Get conversation history for this specific persona
      const setupId = persona.setupId;
      const effectiveGuildId = isDM ? 'DM' : guildId;
      
      const recentHistory = await db.getRecentChatHistory(userId, effectiveGuildId, 5, setupId);
      const conversationSummary = await db.getConversationSummary(setupId);
      
      // Add context from summary if available
      let contextMessages = [];
      if (conversationSummary) {
        contextMessages.push({
          role: 'system',
          content: `Previous conversation context: ${conversationSummary}`
        });
      }
      
      // Generate AI response
      const response = await mistral.generateResponse(
        userMessage,
        persona.persona,
        [...contextMessages, ...recentHistory]
      );
      
      // Save the conversation linked to this specific persona
      await db.saveChatMessage(userId, effectiveGuildId, userMessage, response, setupId);
      
      // Create response embed
      const embed = new EmbedBuilder()
        .setColor(0xFF69B4)
        .setAuthor({
          name: persona.persona.name,
          iconURL: message.client.user.displayAvatarURL()
        })
        .setDescription(response)
        .setFooter({
          text: `${persona.persona.gender} • ${persona.persona.age} years old`,
          iconURL: message.author.displayAvatarURL()
        });
      
      await message.reply({ embeds: [embed] });
      
      // Clean old messages periodically (every 20 messages)
      const messageCount = await db.getUserStats(userId, effectiveGuildId);
      if (messageCount && messageCount.totalMessages % 20 === 0) {
        await db.cleanOldMessages(setupId);
        
        // Update conversation summary for this specific persona
        const allHistory = await db.getRecentChatHistory(userId, effectiveGuildId, 50, setupId);
        if (allHistory.length > 10) {
          const summary = await mistral.summarizeConversation(allHistory);
          await db.updateConversationSummary(setupId, summary);
        }
      }
      
    } catch (error) {
      console.error('Error handling message:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF4444)
        .setTitle('❌ Error')
        .setDescription('Sorry, I encountered an error while processing your message. Please try again later.');
      
      await message.reply({ embeds: [errorEmbed] });
    }
  }
};
