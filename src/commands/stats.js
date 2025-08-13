const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const DatabaseService = require('../services/databaseService');

const db = new DatabaseService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('View your chat statistics'),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const guildId = interaction.guildId;
      
      console.log(`Command executed: /stats by ${username} (${userId}) in guild ${guildId}`);
      
      const stats = await db.getUserStats(userId, guildId);
      
      if (!stats || !stats.hasPersona) {
        console.log(`Error: No stats found for user ${username} (${userId})`);
        return await interaction.reply({
          content: '❌ You don\'t have an AI companion yet! Use `/start` to create one.',
          flags: MessageFlags.Ephemeral
        });
      }
      
      console.log(`Stats displayed for ${username}: ${stats.totalMessages} messages with ${stats.personaName}`);
      
      const embed = new EmbedBuilder()
        .setColor(0x17A2B8)
        .setTitle('📊 Your Chat Statistics')
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          {
            name: '🤖 Companion Name',
            value: stats.personaName || 'Unknown',
            inline: true
          },
          {
            name: '💬 Total Messages',
            value: stats.totalMessages.toString(),
            inline: true
          },
          {
            name: '📅 Companion Created',
            value: `<t:${Math.floor(stats.personaCreated.getTime() / 1000)}:F>`,
            inline: false
          }
        );
      
      if (stats.lastActive) {
        embed.addFields({
          name: '🕐 Last Chat',
          value: `<t:${Math.floor(stats.lastActive.getTime() / 1000)}:R>`,
          inline: true
        });
      }
      
      // Calculate days since creation
      const daysSinceCreation = Math.floor((Date.now() - stats.personaCreated.getTime()) / (1000 * 60 * 60 * 24));
      const averageMessagesPerDay = daysSinceCreation > 0 ? (stats.totalMessages / daysSinceCreation).toFixed(1) : stats.totalMessages;
      
      embed.addFields({
        name: '📈 Average Messages/Day',
        value: averageMessagesPerDay.toString(),
        inline: true
      });
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      
    } catch (error) {
      console.error('Error in stats command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      console.error(error.stack);
      
      await interaction.reply({
        content: `❌ An error occurred while fetching your statistics. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
