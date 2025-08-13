const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { SetupUI } = require('../utils/setupUI');
const DatabaseService = require('../services/databaseService');

const db = new DatabaseService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your AI companion\'s profile'),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const guildId = interaction.guildId;
      
      console.log(`Command executed: /profile by ${username} (${userId}) in guild ${guildId}`);
      
      const persona = await db.getUserPersona(userId, guildId);
      
      if (!persona) {
        console.log(`Error: No persona found for user ${username} (${userId})`);
        return await interaction.reply({
          content: '❌ You don\'t have an AI companion yet! Use `/start` to create one.',
          flags: MessageFlags.Ephemeral
        });
      }
      
      console.log(`Profile displayed for ${username}: ${persona.persona.name}`);
      
      const stats = await db.getUserStats(userId, guildId);
      const embed = SetupUI.createProfileEmbed(persona.persona, stats, persona.createdAt);
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      
    } catch (error) {
      console.error('Error in profile command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      console.error(error.stack);
      
      await interaction.reply({
        content: `❌ An error occurred while fetching your profile. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
