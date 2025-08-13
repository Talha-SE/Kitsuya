const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`🌐 Connected to ${client.guilds.cache.size} server(s)`);
    console.log(`👥 Serving ${client.users.cache.size} user(s)`);
    
    // Set bot status
    client.user.setActivity('with AI companions | /help', { 
      type: 'PLAYING' 
    });
    
    console.log('🤖 AI Companion Bot is fully operational!');
  }
};
