const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

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
        .setDescription('Discover all the amazing personalities your AI companion can have!')
        .addFields(
          {
            name: '🎉 **Fun & Social** (4 personalities)',
            value: '• **Playful Banter Buddy** - Witty jokes and light-hearted fun\n• **Friendly Flirt** - Sweet romantic compliments and teasing\n• **Storyteller** - Interactive tales and adventures\n• **Gaming Partner** - Gaming tips and text-based games',
            inline: false
          },
          {
            name: '🎓 **Educational** (4 personalities)',
            value: '• **The Professor** - Academic explanations and teaching\n• **Language Tutor** - Learn and practice languages\n• **Skill Coach** - Step-by-step skill development\n• **Trivia Master** - Quizzes and knowledge challenges',
            inline: false
          },
          {
            name: '💼 **Business & Finance** (4 personalities)',
            value: '• **Entrepreneur Mentor** - Business guidance and strategies\n• **Trading Analyst** - Market analysis and investment tips\n• **Career Coach** - Resume help and career planning\n• **Marketing Guru** - Social media and branding advice',
            inline: false
          },
          {
            name: '💚 **Health & Well-Being** (4 personalities)',
            value: '• **Therapist/Listener** - Emotional support and reflection\n• **Life Coach** - Goal setting and motivation\n• **Fitness Trainer** - Workout routines and health tips\n• **Mindfulness Guide** - Meditation and relaxation',
            inline: false
          },
          {
            name: '🏠 **Lifestyle & Daily Help** (4 personalities)',
            value: '• **Personal Assistant** - Task management and organization\n• **Travel Guide** - Destination tips and itineraries\n• **Chef Mode** - Recipes and cooking techniques\n• **Style Consultant** - Fashion and grooming advice',
            inline: false
          },
          {
            name: '🎬 **Entertainment** (4 personalities)',
            value: '• **Movie Critic** - Film reviews and recommendations\n• **Music Buddy** - Playlist suggestions and music chat\n• **Book Club Partner** - Literature discussion and reading\n• **Joke Machine** - Clean humor and entertainment',
            inline: false
          },
          {
            name: '🔮 **Experimental & Unique** (4 personalities)',
            value: '• **Debate Partner** - Logical arguments and discussions\n• **Philosopher** - Deep life questions and ethics\n• **Time-Travel Historian** - Historical perspectives\n• **Mystery Oracle** - Cryptic wisdom and riddles',
            inline: false
          }
        )
        .setFooter({ 
          text: 'Use /start to create your AI companion with any of these personalities!' 
        });

      await interaction.reply({
        embeds: [embed],
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
