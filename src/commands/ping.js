const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency and status'),
  
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const username = interaction.user.username;
      const guildId = interaction.guildId;
      
      console.log(`Command executed: /ping by ${username} (${userId}) in guild ${guildId}`);
      
      const sent = await interaction.reply({ 
        content: '🏓 Pinging...', 
        fetchReply: true,
        flags: MessageFlags.Ephemeral
      });
      
      const roundtripLatency = sent.createdTimestamp - interaction.createdTimestamp;
      const heartbeat = Math.round(interaction.client.ws.ping);
      
      console.log(`Ping result for ${username}: Roundtrip ${roundtripLatency}ms, Heartbeat ${heartbeat}ms`);
      
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🏓 Pong!')
        .addFields(
          {
            name: '⏱️ Roundtrip Latency',
            value: `${roundtripLatency}ms`,
            inline: true
          },
          {
            name: '💓 Heartbeat',
            value: `${heartbeat}ms`,
            inline: true
          },
          {
            name: '🤖 Status',
            value: 'Online and Ready!',
            inline: true
          }
        )
        .setTimestamp();
      
      await interaction.editReply({
        content: null,
        embeds: [embed]
      });
      
    } catch (error) {
      console.error('Error in ping command:', error);
      
      const errorId = Math.random().toString(36).substring(2, 8);
      console.error(`[Error ID: ${errorId}] ${error.message}`);
      console.error(error.stack);
      
      await interaction.reply({
        content: `❌ An error occurred while checking latency. (Error ID: ${errorId})`,
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
