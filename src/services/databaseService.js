const { UserPersona, ChatMessage } = require('../models/User');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  // Create new user persona with limits enforcement
  async createUserPersona(userId, guildId, personaData) {
    try {
      // Check limits based on privacy setting
      if (personaData.privacySetting === 'dm') {
        // DM setup: Max 1 per user
        const existingInboxPersona = await UserPersona.findOne({ 
          userId, 
          isInboxPersonality: true 
        });
        
        if (existingInboxPersona) {
          // Update existing inbox personality instead of creating new
          existingInboxPersona.persona = personaData;
          existingInboxPersona.lastUpdated = new Date();
          await existingInboxPersona.save();
          return existingInboxPersona;
        }
      } else if (personaData.privacySetting === 'public') {
        // Public setup: Max 1 per user per server
        const existingPublicPersona = await UserPersona.findOne({
          userId,
          guildId,
          'persona.privacySetting': 'public'
        });
        
        if (existingPublicPersona) {
          throw new Error(`LIMIT_EXCEEDED:PUBLIC:You already have a public AI companion in this server. Use \`/change-personality\` to modify it, or \`/reset\` to start over.`);
        }
      } else if (personaData.privacySetting === 'private_channel') {
        // Private channel setup: Max 5 per user
        const existingPrivatePersonas = await UserPersona.countDocuments({
          userId,
          'persona.privacySetting': 'private_channel'
        });
        
        if (existingPrivatePersonas >= 5) {
          throw new Error(`LIMIT_EXCEEDED:PRIVATE:You already have the maximum number of private channel companions (5). Use \`/manage\` to delete some before creating new ones.`);
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
      console.log(`Created new ${personaData.privacySetting} persona for user ${userId}: ${personaData.name}`);
      return newPersona;
    } catch (error) {
      console.error('Error creating user persona:', error);
      throw error;
    }
  }

  // Get user's inbox (DM) persona
  async getInboxPersona(userId) {
    try {
      let inboxPersona = await UserPersona.findOne({ 
        userId, 
        isInboxPersonality: true 
      });
      
      // If no inbox persona found, check for old DM personas and auto-fix
      if (!inboxPersona) {
        const dmPersona = await UserPersona.findOne({
          userId,
          'persona.privacySetting': 'dm'
        });
        
        if (dmPersona) {
          console.log(`Auto-fixing inbox persona for user ${userId}: marking ${dmPersona.persona.name} as inbox`);
          dmPersona.isInboxPersonality = true;
          await dmPersona.save();
          inboxPersona = dmPersona;
        }
      }
      
      return inboxPersona;
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

  // Get user persona limits and current counts
  async getUserPersonaLimits(userId, guildId = null) {
    try {
      const query = { userId };
      if (guildId) query.guildId = guildId;
      
      const allPersonas = await UserPersona.find(query);
      
      const counts = {
        dm: allPersonas.filter(p => p.persona.privacySetting === 'dm').length,
        public: guildId ? allPersonas.filter(p => p.persona.privacySetting === 'public').length : 0,
        private_channel: allPersonas.filter(p => p.persona.privacySetting === 'private_channel').length,
        total: allPersonas.length
      };
      
      const limits = {
        dm: 1,
        public: 1, // Per server
        private_channel: 5,
        total: 7 // 1 DM + 1 Public + 5 Private
      };
      
      const available = {
        dm: Math.max(0, limits.dm - counts.dm),
        public: guildId ? Math.max(0, limits.public - counts.public) : 0,
        private_channel: Math.max(0, limits.private_channel - counts.private_channel)
      };
      
      return {
        counts,
        limits,
        available,
        personas: allPersonas.map(p => ({
          setupId: p.setupId,
          name: p.persona.name,
          personality: p.persona.personality,
          privacySetting: p.persona.privacySetting,
          guildId: p.guildId,
          createdAt: p.createdAt
        }))
      };
    } catch (error) {
      console.error('Error fetching user persona limits:', error);
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
