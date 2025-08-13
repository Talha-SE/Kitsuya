const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const DatabaseService = require('../services/databaseService');
const { UserPersona, ChatMessage } = require('../models/User');

const db = new DatabaseService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reset')
    .setDescription('Reset your AI companion (⚠️ This will delete all your data)'),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const guildId = interaction.guildId;
      
      console.log(`Command executed: /reset by ${username} (${userId}) in guild ${guildId}`);
      
      const persona = await db.getUserPersona(userId, guildId);
      
      if (!persona) {
        console.log(`Error: No persona found for user ${username} (${userId})`);
        return await interaction.reply({
          content: '❌ You don\'t have an AI companion to reset. Use `/start` to create one!',
          flags: MessageFlags.Ephemeral
        });
      }
      
      const embed = new EmbedBuilder()
        .setColor(0xFF4444)
        .setTitle('⚠️ Reset Confirmation')
        .setDescription(`Are you sure you want to reset your AI companion **${persona.persona.name}**?`)
        .addFields(
          {
            name: '🗑️ What will be deleted:',
            value: '• Your companion\'s personality and settings\n• All chat history and conversations\n• All stored memories and summaries',
            inline: false
          },
          {
            name: '❗ This action cannot be undone!',
            value: 'You will need to run `/start` again to create a new companion.',
            inline: false
          }
        );
      
      const confirmButton = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_reset_${userId}`)
            .setLabel('Yes, Reset Everything')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️'),
          new ButtonBuilder()
            .setCustomId(`cancel_reset_${userId}`)
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❌')
        );
      
      await interaction.reply({
        embeds: [embed],
        components: [confirmButton],
        flags: MessageFlags.Ephemeral
      });
      
    } catch (error) {
      console.error('Error in reset command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      console.error(error.stack);
      
      await interaction.reply({
        content: `❌ An error occurred while processing the reset command. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
