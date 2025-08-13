const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const DatabaseService = require('../services/databaseService');
const { PERSONALITIES } = require('../utils/setupUI');

const db = new DatabaseService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('change-personality')
    .setDescription('Change your AI companion\'s personality'),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const guildId = interaction.guildId;
      
      console.log(`Command executed: /change-personality by ${username} (${userId}) in guild ${guildId}`);
      
      const persona = await db.getUserPersona(userId, guildId);
      
      if (!persona) {
        console.log(`Error: No persona found for user ${username} (${userId})`);
        return await interaction.reply({
          content: '❌ You don\'t have an AI companion yet! Use `/start` to create one.',
          flags: MessageFlags.Ephemeral
        });
      }
      
      const embed = new EmbedBuilder()
        .setColor(0xFF6B35)
        .setTitle('🔄 Change Personality')
        .setDescription(`Your current companion **${persona.persona.name}** has the personality: **${persona.persona.personality.replace(/_/g, ' ')}**\n\nChoose a new personality from the options below:`)
        .addFields({
          name: '⚠️ Note',
          value: 'Changing personality will keep all your chat history and other settings, but your companion will start behaving according to the new personality.',
          inline: false
        });

      // Create select menus for personalities (split into chunks due to 25 option limit)
      const selectMenus = [];
      const personalityChunks = [];
      
      for (let i = 0; i < PERSONALITIES.length; i += 25) {
        personalityChunks.push(PERSONALITIES.slice(i, i + 25));
      }

      personalityChunks.forEach((chunk, index) => {
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId(`change_personality_${index}`)
          .setPlaceholder(`Choose new personality (Page ${index + 1})...`)
          .addOptions(chunk);
        
        selectMenus.push(new ActionRowBuilder().addComponents(selectMenu));
      });
      
      await interaction.reply({
        embeds: [embed],
        components: selectMenus,
        flags: MessageFlags.Ephemeral
      });
      
    } catch (error) {
      console.error('Error in change-personality command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      console.error(error.stack);
      
      await interaction.reply({
        content: `❌ An error occurred while changing personality. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
