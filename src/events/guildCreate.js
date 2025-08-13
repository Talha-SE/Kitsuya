const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    try {
      console.log(`Bot joined new guild: ${guild.name} (${guild.id})`);
      
      // Get the client from the guild
      const client = guild.client;
      
      // Try to find the person who invited the bot
      let inviter = null;
      
      try {
        const invites = await guild.invites.fetch();
        const auditLogs = await guild.fetchAuditLogs({
          type: 28, // BOT_ADD
          limit: 1
        });
        
        if (auditLogs.entries.size > 0) {
          const latestEntry = auditLogs.entries.first();
          inviter = latestEntry.executor;
        }
      } catch (error) {
        console.log('Could not fetch inviter information:', error.message);
      }

      // Create welcome embed
      const welcomeEmbed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('🎉 Welcome to AI Companions!')
        .setDescription(`Thank you for inviting **Kitsuya** to **${guild.name}**!\n\nI'm your personal AI companion bot with 28 unique personalities across 7 categories. From flirty and romantic to intellectual and supportive - I've got the perfect personality for every mood!`)
        .addFields(
          {
            name: '✨ What I Can Do',
            value: '• **28 Unique Personalities** - Choose from flirty, intellectual, supportive, and more!\n• **Smart Conversations** - Powered by Mistral AI for engaging chats\n• **Privacy Options** - DMs, private channels, or public chat\n• **Memory System** - I remember our conversations\n• **Easy Setup** - Just use `/start` to begin!',
            inline: false
          },
          {
            name: '🚀 Getting Started',
            value: '1. Use `/start` to set up your AI companion\n2. Choose from 28 different personalities\n3. Pick your privacy preference\n4. Start chatting with `/chat`!',
            inline: false
          },
          {
            name: '🆘 Need Help?',
            value: 'Use `/help` for commands or join our support server for assistance and updates!',
            inline: false
          }
        )
        .setThumbnail(client?.user?.displayAvatarURL({ dynamic: true }) || null)
        .setFooter({ 
          text: 'AI Companions • Your Perfect Chat Partner',
          iconURL: client?.user?.displayAvatarURL({ dynamic: true }) || null
        })
        .setTimestamp();

      // Create action buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('welcome_start_setup')
            .setLabel('🚀 Start Setup')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('welcome_view_personalities')
            .setLabel('👥 View Personalities')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setLabel('🔗 Support Server')
            .setURL('https://discord.gg/WeynxzR9nq')
            .setStyle(ButtonStyle.Link)
        );

      // Send welcome messages to the inviter if found
      if (inviter && !inviter.bot) {
        try {
          // First message: Short welcome message
          const shortWelcomeEmbed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('🎉 Thanks for inviting me!')
            .setDescription(`Hey **${inviter.displayName || inviter.username}**!\n\nThank you for adding **Kitsuya** to **${guild.name}**! 💕\n\nI'm excited to be your AI companion with 28 unique personalities to choose from!`)
            .setThumbnail(client?.user?.displayAvatarURL({ dynamic: true }) || null)
            .setFooter({ text: 'Ready to get started? Use /start in the server!' })
            .setTimestamp();

          await inviter.send({
            embeds: [shortWelcomeEmbed]
          });

          // Small delay before second message
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Second message: Official server message with link
          const serverEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('🔗 Join Our Official Community!')
            .setDescription(`Connect with other users, get updates, and access exclusive features!\n\n**🚀 Official Server:** https://discord.gg/WeynxzR9nq\n**📚 Documentation:** https://docs.aicompanions.bot`)
            .addFields(
              {
                name: '🌟 Official Server Benefits',
                value: '• Get help and support from our team\n• Early access to new features\n• Community events and contests\n• Share your AI companion experiences\n• Connect with other users',
                inline: false
              },
              {
                name: '📢 Stay Updated',
                value: 'Be the first to know about new personalities, features, and updates!',
                inline: false
              }
            )
            .setThumbnail('https://cdn.discordapp.com/attachments/placeholder/server-icon.png')
            .setFooter({ text: 'Kitsuya Official Server • Join our growing community!' })
            .setTimestamp();

          const serverButton = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setLabel('🚀 Join Official Server')
                .setURL('https://discord.gg/WeynxzR9nq')
                .setStyle(ButtonStyle.Link),
              new ButtonBuilder()
                .setLabel('📚 Documentation')
                .setURL('https://docs.aicompanions.bot') // Replace with your docs link
                .setStyle(ButtonStyle.Link)
            );

          await inviter.send({
            embeds: [serverEmbed],
            components: [serverButton]
          });

          console.log(`Welcome messages sent to inviter: ${inviter.tag}`);

          // Also send messages to the server channel
          await sendChannelMessages(guild, client);
          
        } catch (error) {
          console.log(`Could not DM inviter ${inviter.tag}:`, error.message);
          // Fall back to sending in a channel
          await sendChannelMessages(guild, client);
        }
      } else {
        // No inviter found, send in a channel
        await sendChannelMessages(guild, client);
      }

    } catch (error) {
      console.error('Error in guildCreate event:', error);
    }
  }
};

async function sendChannelMessages(guild, client) {
  try {
    // Ensure we have the bot's guild member
    const botMember = guild.members.me || await guild.members.fetchMe();
    
    if (!botMember) {
      console.log('Could not fetch bot member information');
      return;
    }
    
    // Try to find a general channel to send the welcome messages
    const channels = guild.channels.cache
      .filter(channel => 
        channel.type === 0 && // Text channel
        channel.permissionsFor(botMember).has(['SendMessages', 'EmbedLinks']) &&
        (channel.name.includes('general') || 
         channel.name.includes('welcome') || 
         channel.name.includes('bot') ||
         channel.name.includes('chat'))
      );

    let targetChannel = channels.first();
    
    // If no suitable channel found, use the first available text channel
    if (!targetChannel) {
      targetChannel = guild.channels.cache
        .filter(channel => 
          channel.type === 0 && 
          channel.permissionsFor(botMember).has(['SendMessages', 'EmbedLinks'])
        )
        .first();
    }

    if (targetChannel) {
      // First server message: Welcome and setup info
      const serverWelcomeEmbed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('🎉 AI Companion Bot Has Arrived!')
        .setDescription(`Hello **${guild.name}**! I'm **Kitsuya**, your new AI companion bot with 28 unique personalities! 💕\n\nI'm here to provide engaging conversations, emotional support, and fun interactions for everyone in this server!`)
        .addFields(
          {
            name: '✨ What I Can Do',
            value: '• **28 Unique Personalities** - Choose from flirty, intellectual, supportive, and more!\n• **Smart Conversations**\n• **Privacy Options** - DMs, private channels, or public chat\n• **Easy Setup** - Just use `/start` to begin!',
            inline: false
          },
          {
            name: '🚀 Getting Started',
            value: '1. Use `/start` to set up your AI companion\n2. Choose from 28 different personalities\n3. Pick your privacy preference\n4. Start chatting with `/chat`!',
            inline: false
          }
        )
        .setThumbnail(client?.user?.displayAvatarURL({ dynamic: true }) || null)
        .setFooter({ 
          text: 'AI Companions • Your Perfect Chat Partner',
          iconURL: client?.user?.displayAvatarURL({ dynamic: true }) || null
        })
        .setTimestamp();

      const setupButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('welcome_start_setup')
            .setLabel('🚀 Start Setup')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('welcome_view_personalities')
            .setLabel('👥 View Personalities')
            .setStyle(ButtonStyle.Secondary)
        );

      await targetChannel.send({
        embeds: [serverWelcomeEmbed],
        components: [setupButtons]
      });

      // Small delay before second message
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Second server message: Community and support
      const communityEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🌟 Join Our Growing Community!')
        .setDescription(`Want to get the most out of your AI companion experience? Join our official community!\n\n**🚀 Official Server:** https://discord.gg/WeynxzR9nq\n**📚 Documentation:** https://docs.aicompanions.bot\n\n*Connect with other users, get exclusive updates, and participate in community events!*`)
        .setThumbnail('https://cdn.discordapp.com/attachments/placeholder/community-icon.png')
        .setFooter({ text: 'Kitsuya Community • Growing stronger together!' })
        .setTimestamp();

      const communityButtons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setLabel('🚀 Join Official Server')
            .setURL('https://discord.gg/WeynxzR9nq')
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('📚 Documentation')
            .setURL('https://docs.aicompanions.bot')
            .setStyle(ButtonStyle.Link),
          new ButtonBuilder()
            .setLabel('💖 Support Us')
            .setURL('https://ko-fi.com/aicompanions')
            .setStyle(ButtonStyle.Link)
        );

      await targetChannel.send({
        embeds: [communityEmbed],
        components: [communityButtons]
      });

      console.log(`Welcome messages sent to channel: ${targetChannel.name}`);
    } else {
      console.log('No suitable channel found to send welcome messages');
    }
  } catch (error) {
    console.error('Error sending welcome messages in channel:', error);
  }
}
