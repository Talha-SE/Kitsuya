const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { SetupUI } = require('../utils/setupUI');
const DatabaseService = require('../services/databaseService');

const db = new DatabaseService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('start')
    .setDescription('Start setting up your AI companion'),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const guildId = interaction.guildId;
      
      console.log(`Command executed: /start by ${username} (${userId}) in guild ${guildId}`);
      
      // Check if user already has a persona
      const existingPersona = await db.getUserPersona(userId, guildId);
      
      if (existingPersona) {
        console.log(`User ${username} (${userId}) already has persona: ${existingPersona.persona.name}`);
        return await interaction.reply({
          content: `✨ You already have an AI companion named **${existingPersona.persona.name}**!\n\nUse \`/profile\` to view their details or \`/reset\` to start over.`,
          flags: MessageFlags.Ephemeral
        });
      }

      const embed = SetupUI.createWelcomeEmbed();
      const button = SetupUI.createStartButton();

      await interaction.reply({
        embeds: [embed],
        components: [button],
        flags: MessageFlags.Ephemeral
      });
    } catch (error) {
      console.error('Error in start command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      console.error(error.stack);
      
      await interaction.reply({
        content: `❌ An error occurred while starting the setup. Please try again. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
