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
  { label: 'Male', value: 'male', emoji: '♂️' },
  { label: 'Non-Binary', value: 'non-binary', emoji: '⚧️' },
  { label: 'Other', value: 'other', emoji: '🌈' }
];

const PERSONALITIES = [
  { label: 'Friendly & Cheerful', value: 'friendly', emoji: '😊', description: 'Warm, optimistic, and encouraging' },
  { label: 'Witty & Sarcastic', value: 'witty', emoji: '😏', description: 'Sharp humor with playful teasing' },
  { label: 'Caring & Nurturing', value: 'caring', emoji: '💕', description: 'Supportive, empathetic, and protective' },
  { label: 'Flirty & Playful', value: 'flirty', emoji: '😘', description: 'Charming, teasing, and romantic' },
  { label: 'Mysterious & Intriguing', value: 'mysterious', emoji: '🌙', description: 'Enigmatic with hidden depths' },
  { label: 'Confident & Bold', value: 'confident', emoji: '💪', description: 'Assertive, decisive, and fearless' },
  { label: 'Shy & Sweet', value: 'shy', emoji: '🙈', description: 'Gentle, modest, and endearing' },
  { label: 'Intellectual & Wise', value: 'intellectual', emoji: '🤓', description: 'Thoughtful, knowledgeable, and insightful' },
  { label: 'Adventurous & Wild', value: 'adventurous', emoji: '🌟', description: 'Spontaneous, daring, and free-spirited' },
  { label: 'Calm & Zen', value: 'calm', emoji: '🧘', description: 'Peaceful, balanced, and meditative' },
  { label: 'Tsundere', value: 'tsundere', emoji: '😤', description: 'Initially cold but secretly caring' },
  { label: 'Dominant & Assertive', value: 'dominant', emoji: '👑', description: 'Takes charge and leads confidently' },
  { label: 'Submissive & Gentle', value: 'submissive', emoji: '🥺', description: 'Soft-spoken and yielding' },
  { label: 'Yandere', value: 'yandere', emoji: '😈', description: 'Obsessively devoted and protective' },
  { label: 'Custom Personality', value: 'custom', emoji: '✨', description: 'Define your own unique traits' }
];

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

const CHARACTERISTICS = [
  // Physical Traits
  { category: 'Physical', label: 'Tall', value: 'tall' },
  { category: 'Physical', label: 'Short', value: 'short' },
  { category: 'Physical', label: 'Athletic', value: 'athletic' },
  { category: 'Physical', label: 'Curvy', value: 'curvy' },
  { category: 'Physical', label: 'Petite', value: 'petite' },
  { category: 'Physical', label: 'Strong', value: 'strong' },
  
  // Hair
  { category: 'Hair', label: 'Long Hair', value: 'long-hair' },
  { category: 'Hair', label: 'Short Hair', value: 'short-hair' },
  { category: 'Hair', label: 'Curly Hair', value: 'curly-hair' },
  { category: 'Hair', label: 'Dark Hair', value: 'dark-hair' },
  { category: 'Hair', label: 'Light Hair', value: 'light-hair' },
  { category: 'Hair', label: 'Colorful Hair', value: 'colorful-hair' },
  
  // Eyes
  { category: 'Eyes', label: 'Blue Eyes', value: 'blue-eyes' },
  { category: 'Eyes', label: 'Brown Eyes', value: 'brown-eyes' },
  { category: 'Eyes', label: 'Green Eyes', value: 'green-eyes' },
  { category: 'Eyes', label: 'Hazel Eyes', value: 'hazel-eyes' },
  
  // Style
  { category: 'Style', label: 'Casual Style', value: 'casual' },
  { category: 'Style', label: 'Elegant Style', value: 'elegant' },
  { category: 'Style', label: 'Gothic Style', value: 'gothic' },
  { category: 'Style', label: 'Sporty Style', value: 'sporty' },
  { category: 'Style', label: 'Vintage Style', value: 'vintage' },
  { category: 'Style', label: 'Modern Style', value: 'modern' },
  
  // Personality Traits
  { category: 'Personality', label: 'Outgoing', value: 'outgoing' },
  { category: 'Personality', label: 'Introverted', value: 'introverted' },
  { category: 'Personality', label: 'Artistic', value: 'artistic' },
  { category: 'Personality', label: 'Sporty', value: 'sporty' },
  { category: 'Personality', label: 'Bookish', value: 'bookish' },
  { category: 'Personality', label: 'Tech-Savvy', value: 'tech-savvy' },
  
  // Hobbies
  { category: 'Hobbies', label: 'Gaming', value: 'gaming' },
  { category: 'Hobbies', label: 'Music', value: 'music' },
  { category: 'Hobbies', label: 'Art', value: 'art' },
  { category: 'Hobbies', label: 'Cooking', value: 'cooking' },
  { category: 'Hobbies', label: 'Travel', value: 'travel' },
  { category: 'Hobbies', label: 'Reading', value: 'reading' },
  { category: 'Hobbies', label: 'Fitness', value: 'fitness' },
  { category: 'Hobbies', label: 'Photography', value: 'photography' }
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

  static createLanguageSelect() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('🌍 Step 2: Select Language')
      .setDescription('What language should your AI companion speak?');

    const select = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_language')
          .setPlaceholder('Choose a language...')
          .addOptions(LANGUAGES)
      );

    return { embed, component: select };
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
      .setTitle('🎭 Step 4: Choose Personality')
      .setDescription('What kind of personality should your companion have?');

    // Split personalities into chunks of 25 for Discord limit
    const personalityOptions = PERSONALITIES.slice(0, 25).map(personality => ({
      label: `${personality.emoji} ${personality.label}`,
      value: personality.value,
      description: personality.description
    }));

    const select = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_personality')
          .setPlaceholder('Choose personality type...')
          .addOptions(personalityOptions)
      );

    return { embed, components: [select] };
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

  static createCharacteristicSelect() {
    const embed = new EmbedBuilder()
      .setColor(0xFF1493)
      .setTitle('✨ Step 7: Characteristics (Optional)')
      .setDescription(`Choose up to 5 characteristics for your companion:
      
**Categories:** Physical traits, hair, eyes, style, personality, hobbies
      
You can skip this step if you prefer a surprise!`);

    const characteristics = CHARACTERISTICS.slice(0, 25).map(char => ({
      label: `${char.category}: ${char.label}`,
      value: char.value
    }));

    const select = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_characteristics')
          .setPlaceholder('Choose characteristics (max 5)...')
          .setMaxValues(5)
          .setMinValues(0)
          .addOptions(characteristics)
      );

    const buttons = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('skip_characteristics')
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
        { name: '✨ Characteristics', value: persona.characteristics?.length > 0 ? persona.characteristics.join(', ') : 'Surprise me!', inline: false }
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
        { name: '🎭 Personality', value: persona.personality.replace(/_/g, ' '), inline: true },
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

    if (persona.characteristics && persona.characteristics.length > 0) {
      embed.addFields({
        name: '✨ Characteristics',
        value: persona.characteristics.join('\n'),
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
  RELATIONSHIP_TYPES,
  AGE_RANGES,
  CHARACTERISTICS
};
