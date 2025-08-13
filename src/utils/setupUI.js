const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const LANGUAGES = [
  // Top 25 World Languages - Discord limit
  { label: '🇺🇸 English', value: 'english' },
  { label: '🇨🇳 Chinese', value: 'chinese' },
  { label: '🇪🇸 Spanish', value: 'spanish' },
  { label: '🇮🇳 Hindi', value: 'hindi' },
  { label: '🇸🇦 Arabic', value: 'arabic' },
  { label: '🇫🇷 French', value: 'french' },
  { label: '🇷🇺 Russian', value: 'russian' },
  { label: '🇵🇹 Portuguese', value: 'portuguese' },
  { label: '🇩🇪 German', value: 'german' },
  { label: '🇯🇵 Japanese', value: 'japanese' },
  { label: '🇰🇷 Korean', value: 'korean' },
  { label: '🇮🇹 Italian', value: 'italian' },
  { label: '🇹🇷 Turkish', value: 'turkish' },
  { label: '🇻🇳 Vietnamese', value: 'vietnamese' },
  { label: '🇵🇱 Polish', value: 'polish' },
  { label: '🇺🇦 Ukrainian', value: 'ukrainian' },
  { label: '🇳🇱 Dutch', value: 'dutch' },
  { label: '🇬🇷 Greek', value: 'greek' },
  { label: '🇨🇿 Czech', value: 'czech' },
  { label: '🇭🇺 Hungarian', value: 'hungarian' },
  { label: '🇸🇪 Swedish', value: 'swedish' },
  { label: '🇳🇴 Norwegian', value: 'norwegian' },
  { label: '🇩🇰 Danish', value: 'danish' },
  { label: '🇫🇮 Finnish', value: 'finnish' },
  { label: '🌐 Other Language', value: 'other' }
];

const PRIVACY_OPTIONS = [
  { label: '🔒 DM Only', value: 'dm' },
  { label: '👁️‍🗨️ Private Channel', value: 'private_channel' },
  { label: '🌐 Public', value: 'public' }
];

const GENDERS = [
  { label: 'Female', value: 'female', emoji: '♀️' },
  { label: 'Male', value: 'male', emoji: '♂️' }
];

const PERSONALITY_CATEGORIES = {
  'Fun & Social': [
    { label: 'Playful Banter Buddy', value: 'playful_banter', emoji: '😄', description: 'Witty, light-hearted, joking responses, ideal for killing time' },
    { label: 'Friendly Flirt', value: 'friendly_flirt', emoji: '�', description: 'Light teasing and romantic compliments (non-explicit for halal safety)' },
    { label: 'Storyteller', value: 'storyteller', emoji: '📚', description: 'Makes up interactive stories, adventures, and role-plays' },
    { label: 'Gaming Partner', value: 'gaming_partner', emoji: '🎮', description: 'Talks about games, gives tips, and plays text-based mini-games' }
  ],
  'Educational': [
    { label: 'The Professor', value: 'professor', emoji: '�‍🏫', description: 'Explains academic topics in detail with expertise' },
    { label: 'Language Tutor', value: 'language_tutor', emoji: '🗣️', description: 'Helps learn and practice new languages with patience' },
    { label: 'Skill Coach', value: 'skill_coach', emoji: '🎯', description: 'Teaches coding, design, music, or other skills step-by-step' },
    { label: 'Trivia Master', value: 'trivia_master', emoji: '🧠', description: 'Runs quizzes and knowledge challenges with fun facts' }
  ],
  'Business & Finance': [
    { label: 'Entrepreneur Mentor', value: 'entrepreneur_mentor', emoji: '💼', description: 'Guides you on starting/running a business with wisdom' },
    { label: 'Trading Analyst', value: 'trading_analyst', emoji: '�', description: 'Discusses Forex, stocks, crypto strategies and market analysis' },
    { label: 'Career Coach', value: 'career_coach', emoji: '�', description: 'Helps with resumes, interviews, and career planning' },
    { label: 'Marketing Guru', value: 'marketing_guru', emoji: '📱', description: 'Gives social media growth and branding tips' }
  ],
  'Health & Well-Being': [
    { label: 'Therapist/Listener', value: 'therapist', emoji: '🤗', description: 'Provides emotional support and reflective conversation' },
    { label: 'Life Coach', value: 'life_coach', emoji: '⭐', description: 'Motivates, sets goals, and tracks progress with encouragement' },
    { label: 'Fitness Trainer', value: 'fitness_trainer', emoji: '💪', description: 'Suggests workout routines and diet plans with motivation' },
    { label: 'Mindfulness Guide', value: 'mindfulness_guide', emoji: '🧘', description: 'Leads relaxation, meditation, and focus exercises' }
  ],
  'Lifestyle & Daily Help': [
    { label: 'Personal Assistant', value: 'personal_assistant', emoji: '📝', description: 'Manages to-do lists, reminders, and schedules efficiently' },
    { label: 'Travel Guide', value: 'travel_guide', emoji: '✈️', description: 'Suggests destinations, makes itineraries with local insights' },
    { label: 'Chef Mode', value: 'chef_mode', emoji: '👨‍🍳', description: 'Shares recipes and cooking tips with culinary passion' },
    { label: 'Style Consultant', value: 'style_consultant', emoji: '👗', description: 'Advises on outfits and grooming with fashion sense' }
  ],
  'Entertainment': [
    { label: 'Movie Critic', value: 'movie_critic', emoji: '🎬', description: 'Reviews films and recommends shows with cinematic knowledge' },
    { label: 'Music Buddy', value: 'music_buddy', emoji: '🎵', description: 'Suggests playlists and discusses artists with musical passion' },
    { label: 'Book Club Partner', value: 'book_club', emoji: '📖', description: 'Talks about literature and suggests reads with literary insight' },
    { label: 'Joke Machine', value: 'joke_machine', emoji: '😂', description: 'Delivers jokes, puns, and one-liners with perfect timing' }
  ],
  'Experimental / Unique': [
    { label: 'Debate Partner', value: 'debate_partner', emoji: '⚖️', description: 'Argues logically on any topic for practice and growth' },
    { label: 'Philosopher', value: 'philosopher', emoji: '🤔', description: 'Discusses deep life questions and ethics with wisdom' },
    { label: 'Time-Travel Historian', value: 'historian', emoji: '⏰', description: 'Pretends to come from a different era with historical knowledge' },
    { label: 'Mystery Oracle', value: 'mystery_oracle', emoji: '🔮', description: 'Gives cryptic, fortune-cookie style responses with mystique' }
  ]
};

// Flatten all personalities for the select menu
const PERSONALITIES = Object.values(PERSONALITY_CATEGORIES).flat();

// Personality number mapping for user input
const PERSONALITY_NUMBER_MAP = {
  1: 'playful_banter',
  2: 'friendly_flirt', 
  3: 'storyteller',
  4: 'gaming_partner',
  5: 'professor',
  6: 'language_tutor',
  7: 'skill_coach',
  8: 'trivia_master',
  9: 'entrepreneur_mentor',
  10: 'trading_analyst',
  11: 'career_coach',
  12: 'marketing_guru',
  13: 'therapist',
  14: 'life_coach',
  15: 'fitness_trainer',
  16: 'mindfulness_guide',
  17: 'personal_assistant',
  18: 'travel_guide',
  19: 'chef_mode',
  20: 'style_consultant',
  21: 'movie_critic',
  22: 'music_buddy',
  23: 'book_club',
  24: 'joke_machine',
  25: 'debate_partner',
  26: 'philosopher',
  27: 'historian',
  28: 'mystery_oracle'
};

// Function to get personality by number
function getPersonalityByNumber(number) {
  const personalityValue = PERSONALITY_NUMBER_MAP[number];
  if (!personalityValue) return null;
  
  return PERSONALITIES.find(p => p.value === personalityValue);
}

// Function to get personality display name by value
function getPersonalityDisplayName(value) {
  const personality = PERSONALITIES.find(p => p.value === value);
  return personality ? personality.label : value.replace(/_/g, ' ');
}

const RELATIONSHIP_TYPES = [
  { label: '💕 Romantic Partner', value: 'romantic', description: 'Loving, intimate, and devoted companion' },
  { label: '👥 Best Friend', value: 'friend', description: 'Loyal, supportive, and fun companion' },
  { label: '👨‍🏫 Mentor/Teacher', value: 'mentor', description: 'Wise guide who helps you grow' },
  { label: '🎭 Roleplay Character', value: 'roleplay', description: 'Fictional character for storytelling' },
  { label: '💼 Professional Assistant', value: 'assistant', description: 'Helpful and efficient work partner' },
  { label: '🎮 Gaming Buddy', value: 'gaming', description: 'Enthusiastic gaming companion' },
  { label: '🎨 Creative Partner', value: 'creative', description: 'Artistic and imaginative collaborator' },
  { label: '💪 Workout Buddy', value: 'fitness', description: 'Motivating fitness companion' },
  { label: '📚 Study Partner', value: 'study', description: 'Academic support and motivation' },
  { label: '🌟 Custom Relationship', value: 'custom', description: 'Define your own unique dynamic' }
];

const AGE_RANGES = [
  { label: '18-20 (Young Adult)', value: '18-20', description: 'Energetic and discovering life' },
  { label: '21-25 (College Age)', value: '21-25', description: 'Ambitious and social' },
  { label: '26-30 (Young Professional)', value: '26-30', description: 'Career-focused and mature' },
  { label: '31-35 (Established Adult)', value: '31-35', description: 'Experienced and confident' },
  { label: '36-40 (Prime Adult)', value: '36-40', description: 'Wise and accomplished' },
  { label: '41+ (Mature Adult)', value: '41+', description: 'Sophisticated and worldly' }
];

const MBTI_TRAITS = [
  // MBTI Personality Types
  { label: 'INTJ - The Architect', value: 'intj', description: 'Imaginative and strategic thinkers with a plan for everything' },
  { label: 'INTP - The Thinker', value: 'intp', description: 'Innovative inventors with an unquenchable thirst for knowledge' },
  { label: 'ENTJ - The Commander', value: 'entj', description: 'Bold, imaginative strong-willed leaders' },
  { label: 'ENTP - The Debater', value: 'entp', description: 'Smart and curious thinkers who cannot resist an intellectual challenge' },
  { label: 'INFJ - The Advocate', value: 'infj', description: 'Quiet and mystical, yet very inspiring and tireless idealists' },
  { label: 'INFP - The Mediator', value: 'infp', description: 'Poetic, kind and altruistic people, always eager to help a good cause' },
  { label: 'ENFJ - The Protagonist', value: 'enfj', description: 'Charismatic and inspiring leaders, able to mesmerize listeners' },
  { label: 'ENFP - The Campaigner', value: 'enfp', description: 'Enthusiastic, creative and sociable free spirits' },
  { label: 'ISTJ - The Logistician', value: 'istj', description: 'Practical and fact-minded, reliable and responsible' },
  { label: 'ISFJ - The Protector', value: 'isfj', description: 'Warm-hearted and dedicated, always ready to protect their loved ones' },
  { label: 'ESTJ - The Executive', value: 'estj', description: 'Excellent administrators, unsurpassed at managing things or people' },
  { label: 'ESFJ - The Consul', value: 'esfj', description: 'Extraordinarily caring, social and popular people, always eager to help' },
  { label: 'ISTP - The Virtuoso', value: 'istp', description: 'Bold and practical experimenters, masters of all kinds of tools' },
  { label: 'ISFP - The Adventurer', value: 'isfp', description: 'Flexible and charming artists, always ready to explore new possibilities' },
  { label: 'ESTP - The Entrepreneur', value: 'estp', description: 'Smart, energetic and very perceptive people, truly enjoy living on the edge' },
  { label: 'ESFP - The Entertainer', value: 'esfp', description: 'Spontaneous, energetic and enthusiastic people - life is never boring around them' }
];

class SetupUI {
  static createStartEmbed() {
    const embed = new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('✨ Create Your AI Companion')
      .setDescription(`Welcome to the AI Companion Bot! Let's create your perfect virtual companion.
      
**What you can do:**
• 💕 Create personalized AI companions
• 🎭 Choose personalities, looks, and traits  
• 💬 Have engaging conversations
• 🔒 Keep conversations private or share them
• 🧠 Your AI remembers your chat history

**Ready to begin?** Click the button below to start creating your companion!`)
      .setImage('https://i.imgur.com/placeholder.png') // Add a nice banner image
      .setFooter({ text: 'This process takes about 2-3 minutes to complete' });

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('setup_start')
          .setLabel('Create My Companion')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('✨')
      );

    return { embed, component: button };
  }

  static createNameInput() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('💝 Step 1: Choose a Name')
      .setDescription(`What would you like to name your AI companion?
      
**Examples:**
• Emma, Alex, Luna, Phoenix
• Unique names like Zara, Kai, Nova
• Any name that feels right to you!
      
**Please type your companion's name now:**`);

    return { embed };
  }

  static createLanguageInput() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('🌍 Step 1: Choose Language')
      .setDescription(`What language should your AI companion speak?
      
**Popular Languages:**
• English, Spanish, French, German, Italian
• Chinese, Japanese, Korean, Hindi, Arabic
• Portuguese, Russian, Dutch, Polish, Turkish
• Or any other language you prefer!
      
**Please type your preferred language now:**`)
      .addFields({
        name: '💡 Examples',
        value: 'English, Spanish, French, Japanese, Hindi, Arabic, etc.',
        inline: false
      });

    return { embed };
  }

  static createGenderSelect() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('👤 Step 3: Select Gender')
      .setDescription('What gender should your AI companion be?');

    const select = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_gender')
          .setPlaceholder('Choose gender...')
          .addOptions(GENDERS.map(gender => ({
            label: `${gender.emoji} ${gender.label}`,
            value: gender.value
          })))
      );

    return { embed, component: select };
  }

  static createPersonalitySelect() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('🎭 Step 4: Choose Your Companion\'s Personality')
      .setDescription(`Select from our specialized personality categories by typing the **number** of your choice:

**🎉 Fun & Social Personalities**
1. **Playful Banter Buddy** - Witty, light-hearted, joking responses
2. **Friendly Flirt** - Light teasing and romantic compliments
3. **Storyteller** - Interactive stories, adventures, and role-plays
4. **Gaming Partner** - Gaming tips and text-based mini-games

**📚 Educational Personalities**
5. **The Professor** - Explains academic topics in detail
6. **Language Tutor** - Helps learn and practice languages
7. **Skill Coach** - Teaches coding, design, music step-by-step
8. **Trivia Master** - Quizzes and knowledge challenges

**💼 Business & Finance Personalities**
9. **Entrepreneur Mentor** - Business guidance and wisdom
10. **Trading Analyst** - Forex, stocks, crypto strategies
11. **Career Coach** - Resumes, interviews, career planning
12. **Marketing Guru** - Social media growth and branding

**🌟 Health & Well-Being Personalities**
13. **Therapist/Listener** - Emotional support and reflection
14. **Life Coach** - Motivation, goals, and progress tracking
15. **Fitness Trainer** - Workout routines and diet plans
16. **Mindfulness Guide** - Relaxation and meditation

**🏠 Lifestyle & Daily Help Personalities**
17. **Personal Assistant** - To-do lists, reminders, schedules
18. **Travel Guide** - Destinations and itinerary planning
19. **Chef Mode** - Recipes and cooking tips
20. **Style Consultant** - Outfit and grooming advice

**🎭 Entertainment Personalities**
21. **Movie Critic** - Film reviews and show recommendations
22. **Music Buddy** - Playlists and artist discussions
23. **Book Club Partner** - Literature discussions and recommendations
24. **Joke Machine** - Jokes, puns, and one-liners

**🔮 Experimental / Unique Personalities**
25. **Debate Partner** - Logical arguments on any topic
26. **Philosopher** - Deep life questions and ethics
27. **Time-Travel Historian** - Historical perspectives from different eras
28. **Mystery Oracle** - Cryptic, fortune-cookie style responses

**Please type the number (1-28) of your preferred personality:**`);

    return { embed };
  }

  static createRelationshipSelect() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('💖 Step 5: Relationship Type')
      .setDescription('What kind of relationship dynamic would you like?');

    const select = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_relationship')
          .setPlaceholder('Choose relationship type...')
          .addOptions(RELATIONSHIP_TYPES.map(type => ({
            label: type.label,
            value: type.value,
            description: type.description
          })))
      );

    return { embed, component: select };
  }

  static createAgeSelect() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('🎂 Step 6: Age Range')
      .setDescription('What age range should your companion be? (18+ only)');

    const select = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_age')
          .setPlaceholder('Choose age range...')
          .addOptions(AGE_RANGES.map(age => ({
            label: age.label,
            value: age.value,
            description: age.description
          })))
      );

    return { embed, component: select };
  }

  static createMBTISelect() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('🧠 Step 7: MBTI Personality Traits (Optional)')
      .setDescription(`Choose your companion's MBTI personality type:
      
**Analysts:**
• INTJ - The Architect • INTP - The Thinker
• ENTJ - The Commander • ENTP - The Debater

**Diplomats:**
• INFJ - The Advocate • INFP - The Mediator
• ENFJ - The Protagonist • ENFP - The Campaigner

**Sentinels:**
• ISTJ - The Logistician • ISFJ - The Protector
• ESTJ - The Executive • ESFJ - The Consul

**Explorers:**
• ISTP - The Virtuoso • ISFP - The Adventurer
• ESTP - The Entrepreneur • ESFP - The Entertainer
      
You can skip this step if you prefer a surprise!`);

    const mbtiOptions = MBTI_TRAITS.map(trait => ({
      label: trait.label,
      value: trait.value,
      description: trait.description
    }));

    const select = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_mbti')
          .setPlaceholder('Choose MBTI type (optional)...')
          .setMaxValues(1)
          .setMinValues(0)
          .addOptions(mbtiOptions)
      );

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('skip_mbti')
          .setLabel('Skip This Step')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('⏭️')
      );

    return { embed, components: [select, buttons] };
  }

  static createPrivacySelect() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('🔒 Step 8: Privacy Settings')
      .setDescription(`Where should conversations with your companion take place?
      
**Options:**
• **DM Only** - Private messages only
• **Private Channel** - Hidden channel for you only  
• **Public** - Anyone in server can see conversations`);

    const select = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_privacy')
          .setPlaceholder('Choose privacy setting...')
          .addOptions([
            {
              label: '🔒 DM Only',
              value: 'dm',
              description: 'Completely private - DMs only'
            },
            {
              label: '👁️‍🗨️ Private Channel',
              value: 'private_channel',
              description: 'Hidden channel for you only'
            },
            {
              label: '🌐 Public',
              value: 'public',
              description: 'Anyone can see conversations'
            }
          ])
      );

    return { embed, component: select };
  }

  static createFinalReview(persona) {
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎉 Review Your Companion')
      .setDescription(`**${persona.name}** is ready to meet you!`)
      .addFields(
        { name: '🌍 Language', value: persona.language || 'English', inline: true },
        { name: '👤 Gender', value: persona.gender || 'Not specified', inline: true },
        { name: '🎭 Personality', value: persona.personality || 'Friendly', inline: true },
        { name: '💖 Relationship', value: persona.relationship || 'Friend', inline: true },
        { name: '🎂 Age', value: persona.ageRange || '21-25', inline: true },
        { name: '🔒 Privacy', value: persona.privacySetting || 'Public', inline: true },
        { name: '🧠 MBTI Type', value: persona.mbtiType ? MBTI_TRAITS.find(t => t.value === persona.mbtiType)?.label || persona.mbtiType.toUpperCase() : 'Surprise me!', inline: false }
      )
      .setFooter({ text: 'Click "Create Companion" to finalize, or "Start Over" to begin again' });

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_final')
          .setLabel('Create Companion')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅'),
        new ButtonBuilder()
          .setCustomId('setup_restart')
          .setLabel('Start Over')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔄')
      );

    return { embed, component: buttons };
  }

  static createSuccessEmbed(persona) {
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎉 Companion Created Successfully!')
      .setDescription(`**${persona.name}** is now ready to chat with you!
      
**Your companion's details:**
• **Language:** ${persona.language || 'English'}
• **Personality:** ${persona.personality || 'Friendly'}
• **Privacy:** ${persona.privacySetting || 'Public'}

**How to start chatting:**
• Use the \`/chat\` command
• Type your message after the command
• Your AI companion will respond based on their personality

**Example:** \`/chat Hello ${persona.name}! How are you?\``)
      .setFooter({ text: 'Your companion remembers your conversations and will grow with you!' });

    const button = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('start_chatting')
          .setLabel(`Chat with ${persona.name}`)
          .setStyle(ButtonStyle.Primary)
          .setEmoji('💬')
      );

    return { embed, component: button };
  }

  static createWelcomeEmbed() {
    return new EmbedBuilder()
      .setColor(0xFF69B4)
      .setTitle('🎭 AI Companion Setup')
      .setDescription('Welcome! Let\'s create your perfect AI companion. This setup will help customize your chatbot\'s personality, appearance, and conversation style.')
      .addFields(
        {
          name: '📋 Setup Steps',
          value: '1️⃣ Choose Language\n2️⃣ Pick a Name\n3️⃣ Select Gender\n4️⃣ Choose Personality\n5️⃣ Set Age\n6️⃣ Pick Characteristics\n7️⃣ Choose Privacy Setting',
          inline: false
        },
        {
          name: '✨ What You\'ll Get',
          value: 'A personalized AI companion that responds automatically based on your privacy settings!',
          inline: false
        },
        {
          name: '💬 Chat Methods',
          value: '• **DM Only**: Chat privately in DMs\n• **Private Channel**: Hidden server channel\n• **Public**: Use `-c message` in any channel',
          inline: false
        }
      )
      .setFooter({ text: 'Click the button below to start!' });
  }

  static createStartButton() {
    return new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('start_setup')
          .setLabel('Start Setup')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🚀')
      );
  }

  static createProfileEmbed(persona, stats, createdAt = null) {
    const privacyLabel = PRIVACY_OPTIONS.find(p => p.value === persona.privacySetting)?.label || 'Public Chat';
    
    const embed = new EmbedBuilder()
      .setColor(0x7289DA)
      .setTitle(`👤 ${persona.name}'s Profile`)
      .addFields(
        { name: '🗣️ Language', value: persona.language, inline: true },
        { name: '👤 Gender', value: persona.gender, inline: true },
        { name: '🎂 Age', value: persona.age.toString(), inline: true },
        { name: '🎭 Personality', value: getPersonalityDisplayName(persona.personality), inline: true },
        { name: '🔐 Privacy Mode', value: privacyLabel, inline: true },
        { name: '💬 Total Chats', value: stats ? stats.totalMessages.toString() : '0', inline: true }
      );

    // Add creation date if available
    if (createdAt) {
      const createdTime = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
      embed.addFields({
        name: '📅 Created',
        value: `<t:${Math.floor(createdTime / 1000)}:R>`,
        inline: true
      });
    }

    if (stats && stats.lastActive) {
      // Handle both Date objects and timestamps
      const lastActiveTime = stats.lastActive instanceof Date ? 
        stats.lastActive.getTime() : 
        (typeof stats.lastActive === 'number' ? stats.lastActive : new Date(stats.lastActive).getTime());
      
      embed.addFields({
        name: '🕐 Last Active',
        value: `<t:${Math.floor(lastActiveTime / 1000)}:R>`,
        inline: true
      });
    }

    if (persona.mbtiType) {
      const mbtiTrait = MBTI_TRAITS.find(trait => trait.value === persona.mbtiType);
      embed.addFields({
        name: '🧠 MBTI Type',
        value: mbtiTrait ? mbtiTrait.label : persona.mbtiType.toUpperCase(),
        inline: false
      });
    }

    return embed;
  }

  static createHelpEmbed() {
    return new EmbedBuilder()
      .setColor(0x17A2B8)
      .setTitle('🤖 AI Companion Bot - Help')
      .setDescription('Your all-in-one AI companion with multiple personalities!')
      .addFields(
        {
          name: '🚀 Getting Started',
          value: '`/start` - Create your AI companion\n`/personalities` - Browse all available personalities\n`/profile` - View your companion\'s profile',
          inline: false
        },
        {
          name: '💬 Chatting',
          value: '• **DM Only**: Just type in DMs - no commands needed!\n• **Private Channel**: Type in your private channel\n• **Public Mode**: Use `-c your message` in any channel\n• **Direct Messages**: Always work regardless of mode!',
          inline: false
        },
        {
          name: '🔧 Customization',
          value: '`/change-personality` - Change your companion\'s personality\n`/reset` - Reset your companion (⚠️ Deletes all data)',
          inline: false
        },
        {
          name: '📊 Information',
          value: '`/stats` - View your chat statistics\n`/help` - Show this help message\n`/ping` - Check bot latency',
          inline: false
        },
        {
          name: '✨ Key Features',
          value: '• Multiple unique personalities\n• Automatic conversation detection\n• Conversation memory & context\n• Multi-language support (25 languages)\n• Private, semi-private, or public chat modes',
          inline: false
        }
      )
      .setFooter({ text: 'Use /personalities to see all available companion types!' });
  }
}

module.exports = {
  SetupUI,
  LANGUAGES,
  PRIVACY_OPTIONS,
  GENDERS,
  PERSONALITIES,
  PERSONALITY_CATEGORIES,
  PERSONALITY_NUMBER_MAP,
  getPersonalityByNumber,
  getPersonalityDisplayName,
  RELATIONSHIP_TYPES,
  AGE_RANGES,
  MBTI_TRAITS
};
