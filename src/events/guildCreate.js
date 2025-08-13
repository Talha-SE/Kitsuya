const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'guildCreate',
  async execute(guild, client) {
    try {
      console.log(`Bot joined new guild: ${guild.name} (${guild.id})`);
      
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
        .setDescription(`Thank you for inviting **Wizzle** to **${guild.name}**!\n\nI'm your personal AI companion bot with 28 unique personalities across 7 categories. From flirty and romantic to intellectual and supportive - I've got the perfect personality for every mood!`)
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
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ 
          text: 'AI Companions • Your Perfect Chat Partner',
          iconURL: client.user.displayAvatarURL({ dynamic: true })
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
            .setURL('https://discord.gg/aicompanions') // Replace with your actual server invite
            .setStyle(ButtonStyle.Link)
        );

      // Send welcome message to the inviter if found
      if (inviter && !inviter.bot) {
        try {
          await inviter.send({
            embeds: [welcomeEmbed],
            components: [buttons]
          });
          console.log(`Welcome message sent to inviter: ${inviter.tag}`);
        } catch (error) {
          console.log(`Could not DM inviter ${inviter.tag}:`, error.message);
          // Fall back to sending in a channel
          await sendInChannel(guild, welcomeEmbed, buttons);
        }
      } else {
        // No inviter found, send in a channel
        await sendInChannel(guild, welcomeEmbed, buttons);
      }

    } catch (error) {
      console.error('Error in guildCreate event:', error);
    }
  }
};

async function sendInChannel(guild, embed, buttons) {
  try {
    // Try to find a general channel to send the welcome message
    const channels = guild.channels.cache
      .filter(channel => 
        channel.type === 0 && // Text channel
        channel.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks']) &&
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
          channel.permissionsFor(guild.members.me).has(['SendMessages', 'EmbedLinks'])
        )
        .first();
    }

    if (targetChannel) {
      await targetChannel.send({
        embeds: [embed],
        components: [buttons]
      });
      console.log(`Welcome message sent to channel: ${targetChannel.name}`);
    } else {
      console.log('No suitable channel found to send welcome message');
    }
  } catch (error) {
    console.error('Error sending welcome message in channel:', error);
  }
}
