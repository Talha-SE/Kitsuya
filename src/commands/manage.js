const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const DatabaseService = require('../services/databaseService');

const db = new DatabaseService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('View and manage your AI companion personas'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const guildId = interaction.guildId;
    
    console.log(`Command executed: /manage by ${username} (${userId}) in guild ${guildId}`);

    try {
      // Get persona limits and current counts
      const limitInfo = await db.getUserPersonaLimits(userId, guildId);
      const personas = limitInfo ? limitInfo.personas : [];
      
      console.log(`Found ${personas.length} personas for user ${username}`);
      
      if (personas.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#FF6B35')
          .setTitle('📭 No AI Companions Found')
          .setDescription('You haven\'t created any AI companions yet!')
          .addFields({
            name: '🚀 Getting Started',
            value: '• Use `/start` to create your first AI companion\n• Choose from 28+ unique personalities\n• Create companions for different purposes',
            inline: false
          }, {
            name: '📋 Companion Limits',
            value: '• **DM Companions:** 1 maximum\n• **Public Companions:** 1 per server\n• **Private Channel Companions:** 5 maximum',
            inline: false
          });

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
      }

      // Create main embed with limits information
      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('🎭 Your AI Companions')
        .setDescription(`**Current Usage:**\n📩 DM: ${limitInfo.counts.dm}/${limitInfo.limits.dm}\n💬 Public: ${limitInfo.counts.public}/${limitInfo.limits.public} (this server)\n🔒 Private: ${limitInfo.counts.private_channel}/${limitInfo.limits.private_channel}`)
        .setFooter({ text: 'Use /reset to delete companions • /change-personality to modify existing ones' });

      // Group personas by type
      const dmPersonas = personas.filter(p => p.privacySetting === 'dm');
      const publicPersonas = personas.filter(p => p.privacySetting === 'public' && p.guildId === guildId);
      const privatePersonas = personas.filter(p => p.privacySetting === 'private_channel');

      // Add DM personas
      if (dmPersonas.length > 0) {
        const dmText = dmPersonas.map(p => 
          `**${p.name}** - ${p.personality.replace(/_/g, ' ')}\n*Created:* ${new Date(p.createdAt).toLocaleDateString()}`
        ).join('\n\n');
        embed.addFields({ name: '📩 DM Companions', value: dmText, inline: false });
      }

      // Add public personas for this server
      if (publicPersonas.length > 0) {
        const publicText = publicPersonas.map(p => 
          `**${p.name}** - ${p.personality.replace(/_/g, ' ')}\n*Created:* ${new Date(p.createdAt).toLocaleDateString()}`
        ).join('\n\n');
        embed.addFields({ name: '💬 Public Companions (This Server)', value: publicText, inline: false });
      }

      // Add private channel personas
      if (privatePersonas.length > 0) {
        const privateText = privatePersonas.map(p => 
          `**${p.name}** - ${p.personality.replace(/_/g, ' ')}\n*Created:* ${new Date(p.createdAt).toLocaleDateString()}`
        ).join('\n\n');
        embed.addFields({ name: '🔒 Private Channel Companions', value: privateText, inline: false });
      }

      // Add available slots info
      const availableText = [];
      if (limitInfo.available.dm > 0) availableText.push(`📩 DM: ${limitInfo.available.dm} slot available`);
      if (limitInfo.available.public > 0) availableText.push(`💬 Public: ${limitInfo.available.public} slot available`);
      if (limitInfo.available.private_channel > 0) availableText.push(`🔒 Private: ${limitInfo.available.private_channel} slots available`);
      
      if (availableText.length > 0) {
        embed.addFields({ name: '🆕 Available Slots', value: availableText.join('\n'), inline: false });
      } else {
        embed.addFields({ 
          name: '🚫 All Slots Used', 
          value: 'Use `/reset` to delete existing companions and create new ones', 
          inline: false 
        });
      }

      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

    } catch (error) {
      console.error('Error in manage command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      
      await interaction.reply({
        content: `❌ An error occurred while fetching your companions. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
