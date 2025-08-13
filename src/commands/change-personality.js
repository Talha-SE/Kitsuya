const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');
const DatabaseService = require('../services/databaseService');
const { PERSONALITIES, getPersonalityDisplayName } = require('../utils/setupUI');

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
        .setDescription(`Your current companion **${persona.persona.name}** has the personality: **${getPersonalityDisplayName(persona.persona.personality)}**

**🎭 Available Personalities (Choose by Number 1-28):**

**🎉 Fun & Social Personalities**
1. Playful Banter Buddy - Witty, light-hearted responses
2. Friendly Flirt - Light romantic compliments and teasing
3. Storyteller - Interactive stories and adventures
4. Gaming Partner - Gaming tips and text-based games

**📚 Educational Personalities**
5. The Professor - Academic explanations and teaching
6. Language Tutor - Learn and practice languages
7. Skill Coach - Step-by-step skill development
8. Trivia Master - Quizzes and knowledge challenges

**💼 Business & Finance Personalities**
9. Entrepreneur Mentor - Business guidance
10. Trading Analyst - Market analysis and investment tips
11. Career Coach - Resume help and career planning
12. Marketing Guru - Social media and branding advice

**🌟 Health & Well-Being Personalities**
13. Therapist/Listener - Emotional support
14. Life Coach - Goal setting and motivation
15. Fitness Trainer - Workout routines and health tips
16. Mindfulness Guide - Meditation and relaxation

**🏠 Lifestyle & Daily Help Personalities**
17. Personal Assistant - Task management
18. Travel Guide - Destination tips and itineraries
19. Chef Mode - Recipes and cooking techniques
20. Style Consultant - Fashion and grooming advice

**🎭 Entertainment Personalities**
21. Movie Critic - Film reviews and recommendations
22. Music Buddy - Playlist suggestions and music chat
23. Book Club Partner - Literature discussion
24. Joke Machine - Clean humor and entertainment

**🔮 Experimental / Unique Personalities**
25. Debate Partner - Logical arguments and discussions
26. Philosopher - Deep life questions and ethics
27. Time-Travel Historian - Historical perspectives
28. Mystery Oracle - Cryptic wisdom and riddles`)
        .addFields({
          name: '⚠️ Note',
          value: 'Changing personality will keep all your chat history and other settings, but your companion will start behaving according to the new personality.',
          inline: false
        });

      const button = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('change_personality_modal')
            .setLabel('Select Personality by Number')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎭')
        );
      
      await interaction.reply({
        embeds: [embed],
        components: [button],
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
