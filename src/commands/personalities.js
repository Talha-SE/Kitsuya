const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('personalities')
    .setDescription('Browse all available AI companion personalities'),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const guildId = interaction.guildId;
      
      console.log(`Command executed: /personalities by ${username} (${userId}) in guild ${guildId}`);
      
      const embed = new EmbedBuilder()
        .setColor(0x7289DA)
        .setTitle('🎭 AI Companion Personalities')
        .setDescription('Choose from **28 specialized personalities** across 7 categories. When setting up your bot, simply type the **number** of your preferred personality!')
        .addFields(
          {
            name: '🎉 **Fun & Social Personalities**',
            value: '**1.** Playful Banter Buddy - Witty, light-hearted, joking responses\n**2.** Friendly Flirt - Light teasing and romantic compliments\n**3.** Storyteller - Interactive stories, adventures, and role-plays\n**4.** Gaming Partner - Gaming tips and text-based mini-games',
            inline: false
          },
          {
            name: '📚 **Educational Personalities**',
            value: '**5.** The Professor - Explains academic topics in detail\n**6.** Language Tutor - Helps learn and practice languages\n**7.** Skill Coach - Teaches coding, design, music step-by-step\n**8.** Trivia Master - Quizzes and knowledge challenges',
            inline: false
          },
          {
            name: '💼 **Business & Finance Personalities**',
            value: '**9.** Entrepreneur Mentor - Business guidance and wisdom\n**10.** Trading Analyst - Forex, stocks, crypto strategies\n**11.** Career Coach - Resumes, interviews, career planning\n**12.** Marketing Guru - Social media growth and branding',
            inline: false
          },
          {
            name: '🌟 **Health & Well-Being Personalities**',
            value: '**13.** Therapist/Listener - Emotional support and reflection\n**14.** Life Coach - Motivation, goals, and progress tracking\n**15.** Fitness Trainer - Workout routines and diet plans\n**16.** Mindfulness Guide - Relaxation and meditation',
            inline: false
          },
          {
            name: '🏠 **Lifestyle & Daily Help Personalities**',
            value: '**17.** Personal Assistant - To-do lists, reminders, schedules\n**18.** Travel Guide - Destinations and itinerary planning\n**19.** Chef Mode - Recipes and cooking tips\n**20.** Style Consultant - Outfit and grooming advice',
            inline: false
          },
          {
            name: '� **Entertainment Personalities**',
            value: '**21.** Movie Critic - Film reviews and show recommendations\n**22.** Music Buddy - Playlists and artist discussions\n**23.** Book Club Partner - Literature discussions and recommendations\n**24.** Joke Machine - Jokes, puns, and one-liners',
            inline: false
          },
          {
            name: '🔮 **Experimental / Unique Personalities**',
            value: '**25.** Debate Partner - Logical arguments on any topic\n**26.** Philosopher - Deep life questions and ethics\n**27.** Time-Travel Historian - Historical perspectives from different eras\n**28.** Mystery Oracle - Cryptic, fortune-cookie style responses',
            inline: false
          }
        )
        .setFooter({ 
          text: 'Use /start to create your companion or /change-personality to switch personalities!' 
        });

      // Create action buttons
      const buttons = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('start_setup')
            .setLabel('Create New Companion')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✨'),
          new ButtonBuilder()
            .setCustomId('change_personality_start')
            .setLabel('Change Personality')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔄')
        );

      await interaction.reply({
        embeds: [embed],
        components: [buttons],
        flags: MessageFlags.Ephemeral
      });
      
    } catch (error) {
      console.error('Error in personalities command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      console.error(error.stack);
      
      await interaction.reply({
        content: `❌ An error occurred while showing personality information. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
