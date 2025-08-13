const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const DatabaseService = require('../services/databaseService');

const db = new DatabaseService();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Manage your AI companion personas')
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('View all your AI companions')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('switch')
        .setDescription('Switch to a different persona')
        .addStringOption(option =>
          option.setName('setup_id')
            .setDescription('The setup ID of the persona to switch to')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Delete a persona')
        .addStringOption(option =>
          option.setName('setup_id')
            .setDescription('The setup ID of the persona to delete')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const username = interaction.user.username;
    const guildId = interaction.guildId;
    
    console.log(`Command executed: /manage ${subcommand} by ${username} (${userId}) in guild ${guildId}`);

    if (subcommand === 'list') {
      try {
        const personas = await db.getAllUserPersonas(userId, guildId);
        
        console.log(`Found ${personas.length} personas for user ${username}`);
        
        if (personas.length === 0) {
          const embed = new EmbedBuilder()
            .setColor('#FF69B4')
            .setTitle('📭 No AI Companions Found')
            .setDescription('You haven\'t created any AI companions yet! Use `/start` to create your first one.')
            .addFields({
              name: '🚀 Getting Started',
              value: '• Use `/start` to create a new AI companion\n• Choose from 28 unique personalities\n• Create multiple companions for different purposes\n• Each companion can have its own private channel',
              inline: false
            });

          await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
          return;
        }

        // Create main embed
        const embed = new EmbedBuilder()
          .setColor('#FF69B4')
          .setTitle('🎭 Your AI Companions')
          .setDescription(`You have **${personas.length}** AI companions:`)
          .setFooter({ text: 'Use /manage switch <setup_id> to switch personas' });

        // Add each persona as a field
        personas.forEach((persona, index) => {
          const privacyIcon = {
            'dm': '📩',
            'private_channel': '🔒',
            'public': '💬'
          }[persona.persona.privacySetting] || '💬';

          const statusText = persona.isInboxPersonality ? ' (📥 Inbox)' : '';
          
          embed.addFields({
            name: `${index + 1}. ${persona.persona.name}${statusText}`,
            value: `**🎭 Personality:** ${persona.persona.personality}\n**🌍 Language:** ${persona.persona.language}\n**${privacyIcon} Privacy:** ${persona.persona.privacySetting}\n**🆔 Setup ID:** \`${persona.setupId}\`\n**📅 Created:** <t:${Math.floor(new Date(persona.createdAt).getTime() / 1000)}:R>`,
            inline: true
          });
        });

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

      } catch (error) {
        console.error('Error listing personas:', error);
        
        const errorId = Math.random().toString(36).substring(2, 8);
        console.error(`[Error ID: ${errorId}] ${error.message}`);
        console.error(error.stack);
        
        await interaction.reply({
          content: `❌ An error occurred while fetching your companions. Please try again. (Error ID: ${errorId})`,
          flags: MessageFlags.Ephemeral
        });
      }
    }

    else if (subcommand === 'switch') {
      const setupId = interaction.options.getString('setup_id');
      
      try {
        const persona = await db.getPersonaBySetupId(setupId);
        
        if (!persona) {
          await interaction.reply({
            content: '❌ Persona not found. Use `/manage list` to see your available companions.',
            flags: MessageFlags.Ephemeral
          });
          return;
        }

        if (persona.userId !== userId) {
          await interaction.reply({
            content: '❌ You can only switch to your own personas.',
            flags: MessageFlags.Ephemeral
          });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor('#FF69B4')
          .setTitle('✅ Persona Switched!')
          .setDescription(`You are now chatting with **${persona.persona.name}**`)
          .addFields(
            {
              name: '🎭 Personality',
              value: persona.persona.personality,
              inline: true
            },
            {
              name: '🌍 Language',
              value: persona.persona.language,
              inline: true
            },
            {
              name: '🔒 Privacy Setting',
              value: persona.persona.privacySetting,
              inline: true
            }
          )
          .setFooter({ text: `Setup ID: ${persona.setupId}` });

        if (persona.persona.privacySetting === 'private_channel' && persona.privateChannelId) {
          embed.addFields({
            name: '🔗 Private Channel',
            value: `<#${persona.privateChannelId}>`,
            inline: false
          });
        }

        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });

      } catch (error) {
        console.error('Error switching persona:', error);
        
        const errorId = Math.random().toString(36).substring(2, 8);
        console.error(`[Error ID: ${errorId}] ${error.message}`);
        console.error(error.stack);
        
        await interaction.reply({
          content: `❌ An error occurred while switching personas. Please try again. (Error ID: ${errorId})`,
          flags: MessageFlags.Ephemeral
        });
      }
    }

    else if (subcommand === 'delete') {
      const setupId = interaction.options.getString('setup_id');
      
      try {
        const persona = await db.getPersonaBySetupId(setupId);
        
        if (!persona) {
          await interaction.reply({
            content: '❌ Persona not found. Use `/manage list` to see your available companions.',
            flags: MessageFlags.Ephemeral
          });
          return;
        }

        if (persona.userId !== userId) {
          await interaction.reply({
            content: '❌ You can only delete your own personas.',
            flags: MessageFlags.Ephemeral
          });
          return;
        }

        // Create confirmation embed
        const confirmEmbed = new EmbedBuilder()
          .setColor('#FF4444')
          .setTitle('⚠️ Confirm Deletion')
          .setDescription(`Are you sure you want to delete **${persona.persona.name}**?`)
          .addFields(
            {
              name: 'What will be deleted:',
              value: '• The AI companion persona\n• All chat history with this persona\n• Private channel (if exists)\n\n**This action cannot be undone!**',
              inline: false
            }
          );

        const confirmButton = new ButtonBuilder()
          .setCustomId(`delete_persona_${setupId}`)
          .setLabel('🗑️ Delete')
          .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
          .setCustomId('cancel_delete')
          .setLabel('❌ Cancel')
          .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

        await interaction.reply({
          embeds: [confirmEmbed],
          components: [row],
          flags: MessageFlags.Ephemeral
        });

      } catch (error) {
        console.error('Error preparing persona deletion:', error);
        
        const errorId = Math.random().toString(36).substring(2, 8);
        console.error(`[Error ID: ${errorId}] ${error.message}`);
        console.error(error.stack);
        
        await interaction.reply({
          content: `❌ An error occurred. Please try again. (Error ID: ${errorId})`,
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};
