const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { SetupUI, LANGUAGES, PRIVACY_OPTIONS, GENDERS, PERSONALITIES, CHARACTERISTICS } = require('../utils/setupUI');
const DatabaseService = require('../services/databaseService');
const PrivateChannelService = require('../services/privateChannelService');
const { UserPersona, ChatMessage } = require('../models/User');

const db = new DatabaseService();
let privateChannelService;

// Store user setup progress
const userSetupData = new Map();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Initialize private channel service if not already done
    if (!privateChannelService) {
      privateChannelService = new PrivateChannelService(interaction.client);
    }
    
    if (!interaction.isButton() && !interaction.isStringSelectMenu() && !interaction.isModalSubmit()) return;

    try {
      const userId = interaction.user.id;
      const guildId = interaction.guildId;

      // Handle welcome message buttons
      if (interaction.customId === 'welcome_start_setup') {
        // Check current persona limits before starting setup
        const limits = await db.getUserPersonaLimits(userId, guildId);
        
        if (limits && limits.available.dm === 0 && limits.available.public === 0 && limits.available.private_channel === 0) {
          const maxLimitEmbed = new EmbedBuilder()
            .setColor('#FF4444')
            .setTitle('🚫 Maximum Companions Reached')
            .setDescription('You\'ve reached the maximum number of AI companions allowed!')
            .addFields(
              { name: '📊 Your Companions', value: `**DM:** ${limits.counts.dm}/1\n**Public (this server):** ${limits.counts.public}/1\n**Private Channels:** ${limits.counts.private_channel}/5`, inline: false },
              { name: '💡 To Create New Companions', value: 'Use `/manage` to delete existing companions first, or `/change-personality` to modify existing ones.', inline: false }
            );
          
          return await interaction.reply({
            embeds: [maxLimitEmbed],
            flags: [MessageFlags.Ephemeral]
          });
        }
        
        const { embed, component } = SetupUI.createLanguageSelect();
        userSetupData.set(userId, { step: 'language' });
        
        await interaction.reply({
          embeds: [embed],
          components: [component],
          flags: [MessageFlags.Ephemeral]
        });
        return;
      }

      if (interaction.customId === 'welcome_view_personalities') {
        const personalitiesEmbed = new EmbedBuilder()
          .setColor('#FF69B4')
          .setTitle('🎭 Available Personalities')
          .setDescription('Choose from 28 unique AI companions across 7 categories!')
          .addFields(
            { name: '💕 Romantic & Flirty', value: 'Sweet Girlfriend, Playful Flirt, Romantic Partner, Passionate Lover', inline: false },
            { name: '🎮 Fun & Entertainment', value: 'Gaming Buddy, Meme Lord, Storyteller, Anime Enthusiast', inline: false },
            { name: '🧠 Intellectual', value: 'Study Buddy, Philosophical Thinker, Science Enthusiast, Book Lover', inline: false },
            { name: '💪 Supportive', value: 'Life Coach, Therapist, Motivational Speaker, Best Friend', inline: false },
            { name: '🎨 Creative', value: 'Artist, Musician, Writer, Creative Mentor', inline: false },
            { name: '💼 Professional', value: 'Career Advisor, Business Mentor, Tech Expert, Productivity Coach', inline: false },
            { name: '🌟 Unique', value: 'Mysterious Stranger, Time Traveler, Wise Sage, Adventure Guide', inline: false }
          )
          .setFooter({ text: 'Use /start to begin setup and choose your perfect companion!' });

        await interaction.reply({
          embeds: [personalitiesEmbed],
          flags: [MessageFlags.Ephemeral]
        });
        return;
      }

      // Handle setup start button
      if (interaction.customId === 'start_setup') {
        const { embed, component } = SetupUI.createLanguageSelect();
        userSetupData.set(userId, { step: 'language' });
        
        await interaction.update({
          embeds: [embed],
          components: [component]
        });
        return;
      }

      // Handle language selection
      if (interaction.customId === 'select_language') {
        const language = interaction.values[0];
        const languageLabel = LANGUAGES.find(l => l.value === language)?.label || language;
        
        userSetupData.set(userId, { 
          step: 'name',
          language: languageLabel.toLowerCase()
        });

        const modal = new ModalBuilder()
          .setCustomId('name_modal')
          .setTitle('🏷️ Step 3: Choose a Name');

        const nameInput = new TextInputBuilder()
          .setCustomId('companion_name')
          .setLabel('What should your AI companion be called?')
          .setStyle(TextInputStyle.Short)
          .setMinLength(1)
          .setMaxLength(30)
          .setPlaceholder('Any name, any language: Alex, 愛子, محمد, Анна, 🌟Luna🌟...')
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(nameInput));
        
        await interaction.showModal(modal);
        return;
      }

      // Handle name modal submission
      if (interaction.customId === 'name_modal') {
        try {
          const name = interaction.fields.getTextInputValue('companion_name');
          const currentData = userSetupData.get(userId);
          
          // Enhanced name validation - allow Unicode characters, emojis, and various scripts
          const trimmedName = name.trim();
          
          // Check if name is empty after trimming
          if (!trimmedName) {
            await interaction.reply({
              content: '❌ Name cannot be empty. Please enter a valid name.',
              flags: [MessageFlags.Ephemeral]
            });
            return;
          }
          
          // Check length (using Unicode-aware length counting)
          const nameLength = [...trimmedName].length; // Counts Unicode characters properly
          if (nameLength < 1 || nameLength > 30) {
            await interaction.reply({
              content: `❌ Name must be between 1-30 characters long. Your name has ${nameLength} characters.`,
              flags: [MessageFlags.Ephemeral]
            });
            return;
          }
          
          userSetupData.set(userId, {
            ...currentData,
            name: trimmedName
          });

          const { embed, component } = SetupUI.createGenderSelect();
          
          await interaction.reply({
            embeds: [embed],
            components: [component],
            flags: [MessageFlags.Ephemeral]
          });
        } catch (error) {
          console.error('Error in name modal submission:', error);
          await interaction.reply({
            content: '❌ An error occurred while processing your name. Please try again with a simpler name.',
            flags: [MessageFlags.Ephemeral]
          });
        }
        return;
      }

      // Handle gender selection
      if (interaction.customId === 'select_gender') {
        const gender = interaction.values[0];
        const currentData = userSetupData.get(userId);
        
        userSetupData.set(userId, {
          ...currentData,
          gender: gender
        });

        const { embed, components } = SetupUI.createPersonalitySelect();
        
        await interaction.update({
          embeds: [embed],
          components: components
        });
        return;
      }

      // Handle personality selection
      if (interaction.customId === 'select_personality') {
        const personality = interaction.values[0];
        const currentData = userSetupData.get(userId);
        
        userSetupData.set(userId, {
          ...currentData,
          personality: personality
        });

        const modal = new ModalBuilder()
          .setCustomId('age_modal')
          .setTitle('🎂 Step 6: Set Age');

        const ageInput = new TextInputBuilder()
          .setCustomId('companion_age')
          .setLabel('How old should your AI companion be?')
          .setStyle(TextInputStyle.Short)
          .setMinLength(2)
          .setMaxLength(2)
          .setPlaceholder('Enter age (18-99)')
          .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(ageInput));
        
        await interaction.showModal(modal);
        return;
      }

      // Handle age modal submission
      if (interaction.customId === 'age_modal') {
        const ageStr = interaction.fields.getTextInputValue('companion_age');
        const age = parseInt(ageStr);
        
        if (isNaN(age) || age < 18 || age > 99) {
          await interaction.reply({
            content: '❌ Please enter a valid age between 18 and 99.',
            flags: [MessageFlags.Ephemeral]
          });
          return;
        }

        const currentData = userSetupData.get(userId);
        userSetupData.set(userId, {
          ...currentData,
          age: age
        });

        const { embed, components } = SetupUI.createCharacteristicSelect();
        
        await interaction.reply({
          embeds: [embed],
          components: components,
          flags: [MessageFlags.Ephemeral]
        });
        return;
      }

      // Handle characteristics selection
      if (interaction.customId === 'select_characteristics') {
        const selectedValues = interaction.values || [];
        const currentData = userSetupData.get(userId);
        
        userSetupData.set(userId, {
          ...currentData,
          characteristics: selectedValues
        });

        const { embed, component } = SetupUI.createPrivacySelect();
        
        await interaction.update({
          embeds: [embed],
          components: [component]
        });
        return;
      }

      // Handle skip characteristics
      if (interaction.customId === 'skip_characteristics') {
        const currentData = userSetupData.get(userId);
        
        userSetupData.set(userId, {
          ...currentData,
          characteristics: []
        });

        const { embed, component } = SetupUI.createPrivacySelect();
        
        await interaction.update({
          embeds: [embed],
          components: [component]
        });
        return;
      }

      // Handle privacy selection (final step)
      if (interaction.customId === 'select_privacy') {
        const privacySetting = interaction.values[0];
        const currentData = userSetupData.get(userId);
        
        // Complete persona creation
        const personaData = {
          name: currentData.name,
          language: currentData.language || 'english',
          gender: currentData.gender,
          personality: currentData.personality,
          age: currentData.age,
          characteristics: currentData.characteristics || [],
          privacySetting: privacySetting
        };

        try {
          // Create persona in database
          const persona = await db.createUserPersona(userId, guildId, personaData);
          
          // Clean up setup data
          userSetupData.delete(userId);

          const successEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('✅ AI Companion Created!')
            .setDescription(`**${personaData.name}** is ready to chat with you!`)
            .addFields(
              { name: '🎭 Personality', value: personaData.personality, inline: true },
              { name: '👤 Gender', value: personaData.gender, inline: true },
              { name: '🎂 Age', value: personaData.age.toString(), inline: true },
              { name: '🗣️ Language', value: personaData.language, inline: true },
              { name: '🔒 Privacy', value: privacySetting, inline: true },
              { name: '✨ Characteristics', value: personaData.characteristics.length > 0 
                ? personaData.characteristics.slice(0, 3).join(', ') + (personaData.characteristics.length > 3 ? '...' : '')
                : 'None selected', inline: true }
            );

          // Add chat instruction based on privacy setting
          if (privacySetting === 'public') {
            successEmbed.addFields({
              name: '💬 How to chat',
              value: 'Use `-c your message` in any channel to chat with your companion!',
              inline: false
            });
          } else {
            successEmbed.setFooter({ text: 'Your companion will message you shortly!' });
          }

          await interaction.update({
            embeds: [successEmbed],
            components: []
          });

          // Send appropriate welcome message based on privacy setting
          if (privacySetting === 'dm') {
            // Send DM to user
            try {
              const dmChannel = await interaction.user.createDM();
              const welcomeEmbed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle(`💬 ${personaData.name} is here!`)
                .setDescription(`Hi! I'm **${personaData.name}**, your AI companion! 🌟\n\nYou can chat with me anytime here in DMs. Just type your message - no commands needed!`)
                .addFields(
                  { name: '💡 How it works', value: 'Simply type any message and I\'ll respond as your companion!', inline: false }
                )
                .setFooter({ text: 'Your conversations are completely private' });
              
              await dmChannel.send({ embeds: [welcomeEmbed] });
            } catch (error) {
              console.error('Could not send DM:', error);
            }
          } else if (privacySetting === 'private_channel') {
            // Create or get private channel
            try {
              if (!privateChannelService) {
                privateChannelService = new PrivateChannelService(interaction.client);
              }
              
              const privateChannel = await privateChannelService.createOrGetPrivateChannel(
                interaction.guild,
                interaction.user,
                personaData.name
              );
              
              // Update the created persona with the private channel ID
              await db.updatePersonaChannelId(persona.setupId, privateChannel.id);
              
              const welcomeEmbed = new EmbedBuilder()
                .setColor('#FF69B4')
                .setTitle(`🔒 Welcome to your private space with ${personaData.name}!`)
                .setDescription(`Hi! I'm **${personaData.name}**, your AI companion! 🌟\n\nThis is your private channel - only you can see this. Chat with me anytime by typing your messages here!`)
                .addFields(
                  { name: '💡 How it works', value: 'Simply type any message in this channel and I\'ll respond as your companion!', inline: false }
                )
                .setFooter({ text: 'This channel is private and only visible to you' });
              
              await privateChannel.send({ embeds: [welcomeEmbed] });
            } catch (error) {
              console.error('Could not create private channel:', error);
              // Don't fail the entire setup, just inform the user
              await interaction.followUp({
                content: '⚠️ Your companion was created, but I couldn\'t create a private channel. Please check that I have the necessary permissions to manage channels.',
                flags: [MessageFlags.Ephemeral]
              });
            }
          }

        } catch (error) {
          console.error('Error creating persona:', error);
          
          // Clean up setup data on error
          userSetupData.delete(userId);
          
          // Handle specific limit errors
          if (error.message.startsWith('LIMIT_EXCEEDED:')) {
            const [, limitType, message] = error.message.split(':');
            
            const limitEmbed = new EmbedBuilder()
              .setColor('#FF6B35')
              .setTitle('🚫 Companion Limit Reached')
              .setDescription(message)
              .addFields({
                name: '📊 Your Current Limits',
                value: `**DM Companions:** 1 maximum\n**Public Companions:** 1 per server\n**Private Channel Companions:** 5 maximum`,
                inline: false
              });
            
            if (limitType === 'PRIVATE') {
              limitEmbed.addFields({
                name: '💡 Manage Your Companions',
                value: 'Use `/manage` to view and delete existing private channel companions to make room for new ones.',
                inline: false
              });
            } else if (limitType === 'PUBLIC') {
              limitEmbed.addFields({
                name: '💡 Alternative Options',
                value: 'You can:\n• Use `/change-personality` to modify your existing companion\n• Use `/reset` to delete and recreate\n• Create a private channel companion instead',
                inline: false
              });
            }
            
            await interaction.reply({
              embeds: [limitEmbed],
              flags: [MessageFlags.Ephemeral]
            });
          } else {
            // Generic error handling
            await interaction.reply({
              content: '❌ An error occurred while creating your companion. Please try again.',
              flags: [MessageFlags.Ephemeral]
            });
          }
        }
        return;
      }

      // Handle reset confirmation
      if (interaction.customId.startsWith('confirm_reset_')) {
        try {
          const userId = interaction.user.id;
          const guildId = interaction.guildId;
          
          // Delete all user data from the database
          const result = await db.deleteUserData(userId, guildId);
          
          if (result.success) {
            console.log(`Reset completed for user ${userId} in guild ${guildId}`);
            
            await interaction.update({
              content: '✅ Reset complete! Your AI companion has been deleted along with all conversation history and settings. Use `/start` to create a new companion.',
              embeds: [],
              components: [],
              flags: [MessageFlags.Ephemeral]
            });
          } else {
            throw new Error('Database deletion failed');
          }
        } catch (error) {
          console.error('Error during reset operation:', error);
          
          await interaction.update({
            content: '❌ An error occurred while resetting your companion. Please try again.',
            embeds: [],
            components: [],
            flags: [MessageFlags.Ephemeral]
          });
        }
        return;
      }
      
      // Handle reset cancellation
      if (interaction.customId.startsWith('cancel_reset_')) {
        await interaction.update({
          content: '✅ Reset cancelled. Your AI companion is safe!',
          embeds: [],
          components: [],
          flags: [MessageFlags.Ephemeral]
        });
        return;
      }

      // Handle personality change selection
      if (interaction.customId.startsWith('change_personality_')) {
        try {
          const newPersonality = interaction.values[0];
          const userId = interaction.user.id;
          const guildId = interaction.guildId;
          
          // Get current persona
          const persona = await db.getUserPersona(userId, guildId);
          
          if (!persona) {
            await interaction.reply({
              content: '❌ No AI companion found! Use `/start` to create one.',
              flags: [MessageFlags.Ephemeral]
            });
            return;
          }
          
          // Update personality
          const oldPersonality = persona.persona.personality.replace(/_/g, ' ');
          persona.persona.personality = newPersonality;
          persona.lastUpdated = new Date();
          await persona.save();
          
          const newPersonalityLabel = newPersonality.replace(/_/g, ' ');
          
          const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('✅ Personality Changed Successfully!')
            .setDescription(`${persona.persona.name}'s personality has been updated!`)
            .addFields(
              { name: 'Previous Personality', value: oldPersonality, inline: true },
              { name: 'New Personality', value: newPersonalityLabel, inline: true },
              { name: '📝 Note', value: 'Your companion will now behave according to the new personality while keeping all your chat history and other settings.', inline: false }
            )
            .setFooter({ 
              text: `Changes take effect immediately in your next conversation!` 
            });
          
          await interaction.reply({
            embeds: [successEmbed],
            flags: [MessageFlags.Ephemeral]
          });
          
        } catch (error) {
          console.error('Error changing personality:', error);
          
          await interaction.reply({
            content: '❌ An error occurred while changing personality. Please try again.',
            flags: [MessageFlags.Ephemeral]
          });
        }
        return;
      }

    } catch (error) {
      console.error('Error handling interaction:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        try {
          await interaction.reply({
            content: '❌ An unexpected error occurred. Please try again.',
            flags: [MessageFlags.Ephemeral]
          });
        } catch (replyError) {
          console.error('Could not send error reply:', replyError);
        }
      }
    }
  }
};
