const { UserPersona, ChatMessage } = require('../models/User');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  // Create new user persona (allows multiple per user)
  async createUserPersona(userId, guildId, personaData) {
    try {
      // If creating a DM personality, check if user already has one
      if (personaData.privacySetting === 'dm') {
        const existingInboxPersona = await UserPersona.findOne({ 
          userId, 
          isInboxPersonality: true 
        });
        
        if (existingInboxPersona) {
          // Update existing inbox personality
          existingInboxPersona.persona = personaData;
          existingInboxPersona.lastUpdated = new Date();
          await existingInboxPersona.save();
          return existingInboxPersona;
        }
      }
      
      // Create new persona with unique setup ID
      const newPersona = new UserPersona({
        userId,
        guildId,
        setupId: uuidv4(),
        persona: personaData,
        isInboxPersonality: personaData.privacySetting === 'dm',
        createdAt: new Date(),
        lastUpdated: new Date()
      });
      
      await newPersona.save();
      return newPersona;
    } catch (error) {
      console.error('Error creating user persona:', error);
      throw error;
    }
  }

  // Get user's inbox (DM) persona
  async getInboxPersona(userId) {
    try {
      return await UserPersona.findOne({ 
        userId, 
        isInboxPersonality: true 
      });
    } catch (error) {
      console.error('Error fetching inbox persona:', error);
      return null;
    }
  }

  // Get user persona by setup ID
  async getPersonaBySetupId(setupId) {
    try {
      return await UserPersona.findOne({ setupId });
    } catch (error) {
      console.error('Error fetching persona by setup ID:', error);
      return null;
    }
  }

  // Get user persona for specific channel/context
  async getUserPersona(userId, guildId, channelId = null) {
    try {
      if (channelId) {
        // Try to find persona for specific private channel
        const channelPersona = await UserPersona.findOne({ 
          userId, 
          guildId,
          privateChannelId: channelId 
        });
        if (channelPersona) return channelPersona;
      }
      
      // Fall back to any persona for this guild
      return await UserPersona.findOne({ userId, guildId });
    } catch (error) {
      console.error('Error fetching user persona:', error);
      return null;
    }
  }

  // Get all user personas
  async getAllUserPersonas(userId, guildId = null) {
    try {
      const query = { userId };
      if (guildId) query.guildId = guildId;
      
      return await UserPersona.find(query).sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error fetching user personas:', error);
      return [];
    }
  }

  // Update persona's private channel ID
  async updatePersonaChannelId(setupId, privateChannelId) {
    try {
      return await UserPersona.findOneAndUpdate(
        { setupId },
        { 
          privateChannelId,
          lastUpdated: new Date()
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating persona channel ID:', error);
      throw error;
    }
  }

  // Save chat message (now linked to specific persona)
  async saveChatMessage(userId, guildId, message, response, setupId = null) {
    try {
      const chatMessage = new ChatMessage({
        userId,
        guildId,
        message,
        response,
        setupId // Link message to specific persona
      });
      await chatMessage.save();
      return chatMessage;
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  // Get recent chat history for specific persona
  async getRecentChatHistory(userId, guildId, limit = 10, setupId = null) {
    try {
      const query = { userId, guildId };
      if (setupId) query.setupId = setupId;
      
      const messages = await ChatMessage.find(query)
        .sort({ timestamp: -1 })
        .limit(limit);
      
      return messages.reverse().map(msg => ([
        { role: 'user', content: msg.message },
        { role: 'assistant', content: msg.response }
      ])).flat();
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  // Update conversation summary for specific persona
  async updateConversationSummary(setupId, summary) {
    try {
      await UserPersona.findOneAndUpdate(
        { setupId },
        { 
          conversationSummary: summary,
          lastUpdated: new Date()
        }
      );
    } catch (error) {
      console.error('Error updating conversation summary:', error);
    }
  }

  // Get conversation summary for specific persona
  async getConversationSummary(setupId) {
    try {
      const persona = await UserPersona.findOne({ setupId });
      return persona?.conversationSummary || '';
    } catch (error) {
      console.error('Error fetching conversation summary:', error);
      return '';
    }
  }

  // Clean old messages for specific persona
  async cleanOldMessages(setupId, keepCount = 50) {
    try {
      const messages = await ChatMessage.find({ setupId })
        .sort({ timestamp: -1 })
        .skip(keepCount);
      
      if (messages.length > 0) {
        const idsToDelete = messages.map(msg => msg._id);
        await ChatMessage.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`Cleaned ${messages.length} old messages for persona ${setupId}`);
      }
    } catch (error) {
      console.error('Error cleaning old messages:', error);
    }
  }

  // Get user statistics (updated for multiple personas)
  async getUserStats(userId, guildId) {
    try {
      const personas = await UserPersona.find({ userId, guildId });
      const messageCount = await ChatMessage.countDocuments({ userId, guildId });
      const inboxPersona = await this.getInboxPersona(userId);
      
      return {
        hasPersonas: personas.length > 0,
        personaCount: personas.length,
        hasInboxPersona: !!inboxPersona,
        inboxPersonaName: inboxPersona?.persona?.name,
        lastActive: personas.length > 0 ? Math.max(...personas.map(p => new Date(p.lastUpdated))) : null,
        totalMessages: messageCount,
        personas: personas.map(p => ({
          setupId: p.setupId,
          name: p.persona.name,
          personality: p.persona.personality,
          privacySetting: p.persona.privacySetting,
          createdAt: p.createdAt
        }))
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }

  // Delete persona by setup ID
  async deletePersona(setupId) {
    try {
      const persona = await UserPersona.findOneAndDelete({ setupId });
      if (persona) {
        // Also delete related chat messages
        await ChatMessage.deleteMany({ setupId });
        return persona;
      }
      return null;
    } catch (error) {
      console.error('Error deleting persona:', error);
      throw error;
    }
  }

  // Delete all user data for a specific user in a specific guild
  async deleteUserData(userId, guildId) {
    try {
      // Find all personas for this user in this guild
      const userPersonas = await UserPersona.find({ userId, guildId });
      
      if (userPersonas.length === 0) {
        return { success: false, message: 'No personas found' };
      }
      
      // Get all setup IDs
      const setupIds = userPersonas.map(persona => persona.setupId);
      
      // Delete all personas
      await UserPersona.deleteMany({ userId, guildId });
      
      // Delete all chat messages
      await ChatMessage.deleteMany({ setupId: { $in: setupIds } });
      
      console.log(`Deleted all data for user ${userId} in guild ${guildId}`);
      
      return { 
        success: true, 
        count: userPersonas.length,
        message: 'All user data deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = DatabaseService;
