const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { SetupUI } = require('../utils/setupUI');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show help information about the bot'),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const guildId = interaction.guildId;
      
      console.log(`Command executed: /help by ${username} (${userId}) in guild ${guildId}`);
      
      const embed = SetupUI.createHelpEmbed();
      
      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral
      });
      
    } catch (error) {
      console.error('Error in help command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      console.error(error.stack);
      
      await interaction.reply({
        content: `❌ An error occurred while showing help information. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
