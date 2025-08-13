const { ChannelType, PermissionFlagsBits } = require('discord.js');

class PrivateChannelService {
  constructor(client) {
    this.client = client;
  }

  async createPrivateChannel(guild, user, companionName) {
    try {
      // Check if bot has permissions to manage channels
      const botMember = guild.members.cache.get(this.client.user.id);
      if (!botMember.permissions.has([
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles
      ])) {
        throw new Error('Bot lacks permissions to create private channels');
      }

      // Create or find the "AI Companions" category
      let category = guild.channels.cache.find(
        channel => channel.type === ChannelType.GuildCategory && 
        channel.name === 'AI Companions'
      );

      if (!category) {
        category = await guild.channels.create({
          name: 'AI Companions',
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel]
            },
            {
              id: this.client.user.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
              ]
            }
          ]
        });
      }

      // Create the private channel
      const channelName = `${companionName.toLowerCase().replace(/\s+/g, '-')}-${user.username}`;
      
      const privateChannel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `Private AI companion chat for ${user.username} with ${companionName}`,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.AddReactions
            ]
          },
          {
            id: this.client.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.AddReactions
            ]
          }
        ]
      });

      // Send welcome message to the private channel
      await privateChannel.send({
        content: `🎉 Welcome to your private AI companion space, ${user}!\n\n` +
                `This is your exclusive channel with **${companionName}**. ` +
                `Only you and the bot can see this channel. Start chatting by typing your message!`
      });

      return privateChannel;
    } catch (error) {
      console.error('Error creating private channel:', error);
      throw error;
    }
  }

  async deletePrivateChannel(channelId) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel) {
        await channel.delete('User reset their AI companion');
      }
    } catch (error) {
      console.error('Error deleting private channel:', error);
    }
  }

  async checkChannelAccess(channelId, userId) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (!channel) return false;

      const permissions = channel.permissionsFor(userId);
      return permissions && permissions.has(PermissionFlagsBits.ViewChannel);
    } catch (error) {
      console.error('Error checking channel access:', error);
      return false;
    }
  }

  async sendToPrivateChannel(channelId, content) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel) {
        await channel.send(content);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error sending to private channel:', error);
      return false;
    }
  }
}

module.exports = PrivateChannelService;
