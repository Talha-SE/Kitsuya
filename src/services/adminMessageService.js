const { AdminMessage } = require('../models/Admin');
const { EmbedBuilder } = require('discord.js');

class AdminMessageService {
  constructor(client) {
    this.client = client;
  }

  // Send message to user via DM
  async sendUserDM(targetId, message, embed = null) {
    try {
      const user = await this.client.users.fetch(targetId);
      if (!user) {
        throw new Error('User not found');
      }

      const messageOptions = { content: message };
      if (embed) {
        const discordEmbed = new EmbedBuilder()
          .setTitle(embed.title)
          .setDescription(embed.description)
          .setColor(embed.color || '#0099ff');
        
        if (embed.thumbnail) {
          discordEmbed.setThumbnail(embed.thumbnail);
        }
        
        messageOptions.embeds = [discordEmbed];
      }

      await user.send(messageOptions);
      return { success: true, message: 'DM sent successfully' };
    } catch (error) {
      console.error('Error sending user DM:', error);
      return { success: false, error: error.message };
    }
  }

  // Send broadcast message to all channels in a server
  async sendServerBroadcast(targetId, message, embed = null) {
    try {
      const guild = this.client.guilds.cache.get(targetId);
      if (!guild) {
        throw new Error('Server not found');
      }

      const messageOptions = { content: message };
      if (embed) {
        const discordEmbed = new EmbedBuilder()
          .setTitle(embed.title)
          .setDescription(embed.description)
          .setColor(embed.color || '#0099ff');
        
        messageOptions.embeds = [discordEmbed];
      }

      // Find the best channel to send the message
      const channels = guild.channels.cache
        .filter(channel => 
          channel.type === 0 && // Text channel
          channel.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks']) &&
          (channel.name.includes('general') || 
           channel.name.includes('announce') || 
           channel.name.includes('bot') ||
           channel.name.includes('chat'))
        );

      let targetChannel = channels.first();
      
      // If no suitable channel found, use the first available text channel
      if (!targetChannel) {
        targetChannel = guild.channels.cache
          .filter(channel => 
            channel.type === 0 && 
            channel.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks'])
          )
          .first();
      }

      if (targetChannel) {
        await targetChannel.send(messageOptions);
        return { success: true, message: `Broadcast sent to ${guild.name} in #${targetChannel.name}` };
      } else {
        throw new Error('No suitable channel found to send message');
      }
    } catch (error) {
      console.error('Error sending server broadcast:', error);
      return { success: false, error: error.message };
    }
  }

  // Send message to specific channel
  async sendChannelMessage(targetId, message, embed = null) {
    try {
      const channel = await this.client.channels.fetch(targetId);
      if (!channel) {
        throw new Error('Channel not found');
      }

      if (channel.type !== 0) {
        throw new Error('Target is not a text channel');
      }

      const messageOptions = { content: message };
      if (embed) {
        const discordEmbed = new EmbedBuilder()
          .setTitle(embed.title)
          .setDescription(embed.description)
          .setColor(embed.color || '#0099ff');
        
        messageOptions.embeds = [discordEmbed];
      }

      await channel.send(messageOptions);
      return { success: true, message: `Message sent to #${channel.name}` };
    } catch (error) {
      console.error('Error sending channel message:', error);
      return { success: false, error: error.message };
    }
  }

  // Process admin message from dashboard
  async processAdminMessage(messageData) {
    const { messageType, targetId, message, embed, messageId } = messageData;
    
    let result;
    switch (messageType) {
      case 'user_dm':
        result = await this.sendUserDM(targetId, message, embed);
        break;
      case 'server_broadcast':
        result = await this.sendServerBroadcast(targetId, message, embed);
        break;
      case 'channel_message':
        result = await this.sendChannelMessage(targetId, message, embed);
        break;
      default:
        result = { success: false, error: 'Unknown message type' };
    }

    // Update message status in database
    try {
      await AdminMessage.findByIdAndUpdate(messageId, {
        deliveryStatus: result.success ? 'sent' : 'failed'
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }

    return result;
  }

  // Initialize socket connection with admin dashboard
  initializeSocketConnection(io) {
    io.on('connection', (socket) => {
      console.log('Admin dashboard connected via socket');
      
      socket.on('admin-message', async (data) => {
        console.log('Processing admin message:', data);
        const result = await this.processAdminMessage(data);
        
        // Emit result back to dashboard
        socket.emit('message-delivery-result', {
          messageId: data.messageId,
          result
        });
        
        // Broadcast status update to all connected dashboards
        io.emit('message-status', {
          messageId: data.messageId,
          status: result.success ? 'sent' : 'failed',
          message: result.message || result.error
        });
      });
    });
  }
}

module.exports = AdminMessageService;
