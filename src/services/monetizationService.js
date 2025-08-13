const { UsageLimit, ServerAnalytics, UserAnalytics } = require('../models/Admin');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

class MonetizationService {
  // Check if user/server has reached daily limit
  async checkUsageLimit(userId, guildId, username, guildName) {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Check user restriction first
      let userLimit = await UsageLimit.findOne({
        type: 'user',
        targetId: userId,
        isActive: true
      });
      
      if (userLimit) {
        // Reset daily count if it's a new day
        if (userLimit.lastReset < today) {
          userLimit.currentUsage = 0;
          userLimit.lastReset = today;
          await userLimit.save();
        }
        
        if (userLimit.currentUsage >= userLimit.dailyMessageLimit) {
          return {
            limited: true,
            type: 'user',
            restriction: userLimit,
            embed: this.createLimitReachedEmbed(userLimit, 'user', username)
          };
        }
      }
      
      // Check server restriction
      if (guildId) {
        let serverLimit = await UsageLimit.findOne({
          type: 'server',
          targetId: guildId,
          isActive: true
        });
        
        if (serverLimit) {
          // Reset daily count if it's a new day
          if (serverLimit.lastReset < today) {
            serverLimit.currentUsage = 0;
            serverLimit.lastReset = today;
            await serverLimit.save();
          }
          
          if (serverLimit.currentUsage >= serverLimit.dailyMessageLimit) {
            return {
              limited: true,
              type: 'server',
              restriction: serverLimit,
              embed: this.createLimitReachedEmbed(serverLimit, 'server', guildName)
            };
          }
        }
      }
      
      return { limited: false };
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { limited: false };
    }
  }
  
  // Increment usage count for user/server
  async incrementUsage(userId, guildId) {
    try {
      // Increment user usage
      await UsageLimit.findOneAndUpdate(
        { type: 'user', targetId: userId, isActive: true },
        { $inc: { currentUsage: 1 } }
      );
      
      // Increment server usage
      if (guildId) {
        await UsageLimit.findOneAndUpdate(
          { type: 'server', targetId: guildId, isActive: true },
          { $inc: { currentUsage: 1 } }
        );
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }
  
  // Create limit reached embed with payment button
  createLimitReachedEmbed(restriction, type, targetName) {
    const embed = new EmbedBuilder()
      .setColor('#ff9500')
      .setTitle('🚫 Daily Message Limit Reached')
      .setDescription(`**${targetName}** has reached the daily message limit for AI Companion interactions.`)
      .addFields(
        {
          name: '📊 Usage Statistics',
          value: `**Daily Limit:** ${restriction.dailyMessageLimit} messages\n**Used Today:** ${restriction.currentUsage} messages\n**Resets:** Tomorrow at midnight`,
          inline: false
        },
        {
          name: '💡 What can you do?',
          value: type === 'user' 
            ? '• Upgrade to Premium for unlimited daily messages\n• Wait until tomorrow for limit reset\n• Contact support for assistance'
            : '• Server administrator can upgrade to Premium\n• Wait until tomorrow for limit reset\n• Contact support for server upgrade options',
          inline: false
        }
      )
      .setFooter({
        text: restriction.reason || 'Upgrade to Premium for unlimited access',
        iconURL: 'https://cdn.discordapp.com/emojis/852826357322883092.png'
      })
      .setTimestamp();
    
    const paymentButton = new ButtonBuilder()
      .setLabel('💳 Upgrade to Premium')
      .setStyle(ButtonStyle.Link)
      .setURL(restriction.paymentLink);
    
    const supportButton = new ButtonBuilder()
      .setLabel('🆘 Contact Support')
      .setStyle(ButtonStyle.Link)
      .setURL('https://discord.gg/your-support-server'); // Replace with your support server
    
    const actionRow = new ActionRowBuilder()
      .addComponents(paymentButton, supportButton);
    
    return { embeds: [embed], components: [actionRow] };
  }
  
  // Update analytics when user sends message
  async updateAnalytics(userId, guildId, username, guildName, memberCount = 0) {
    try {
      const now = new Date();
      
      // Update or create user analytics
      await UserAnalytics.findOneAndUpdate(
        { userId },
        {
          userId,
          username,
          $inc: { totalMessages: 1 },
          lastActivity: now,
          isActive: true,
          $addToSet: guildId ? {
            serversJoined: {
              guildId,
              guildName,
              joinedAt: now
            }
          } : {}
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      
      // Update server analytics if in a server
      if (guildId && guildName) {
        await ServerAnalytics.findOneAndUpdate(
          { guildId },
          {
            guildId,
            guildName,
            memberCount,
            $inc: { totalMessages: 1 },
            lastActivity: now,
            isActive: true
          },
          { 
            upsert: true, 
            new: true,
            setDefaultsOnInsert: true
          }
        );
      }
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }
  
  // Get user's current usage status
  async getUserUsageStatus(userId, guildId) {
    try {
      const userLimit = await UsageLimit.findOne({
        type: 'user',
        targetId: userId,
        isActive: true
      });
      
      const serverLimit = guildId ? await UsageLimit.findOne({
        type: 'server',
        targetId: guildId,
        isActive: true
      }) : null;
      
      return {
        userRestriction: userLimit,
        serverRestriction: serverLimit,
        hasUserRestriction: !!userLimit,
        hasServerRestriction: !!serverLimit
      };
    } catch (error) {
      console.error('Error getting usage status:', error);
      return {
        hasUserRestriction: false,
        hasServerRestriction: false
      };
    }
  }
  
  // Reset daily usage counts (call this daily via cron job)
  async resetDailyUsage() {
    try {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      await UsageLimit.updateMany(
        {
          isActive: true,
          lastReset: { $lt: today.setHours(0, 0, 0, 0) }
        },
        {
          currentUsage: 0,
          lastReset: today
        }
      );
      
      console.log('Daily usage limits reset successfully');
    } catch (error) {
      console.error('Error resetting daily usage:', error);
    }
  }
}

module.exports = MonetizationService;
