#!/usr/bin/env node

/**
 * Quick test script to validate private channel functionality
 * Run this to check if your bot has the required permissions
 */

const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

async function testBotPermissions() {
  console.log('🔍 Testing Bot Permissions for Private Channels...\n');
  
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages
    ]
  });

  client.once('ready', async () => {
    console.log(`✅ Bot connected as ${client.user.tag}\n`);
    
    // Check each guild the bot is in
    for (const [guildId, guild] of client.guilds.cache) {
      console.log(`📋 Checking permissions in: ${guild.name}`);
      
      const botMember = guild.members.cache.get(client.user.id);
      
      if (!botMember) {
        console.log('❌ Bot is not a member of this guild');
        continue;
      }
      
      const requiredPerms = [
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.EmbedLinks
      ];
      
      const permNames = [
        'Manage Channels',
        'Manage Roles', 
        'Send Messages',
        'Embed Links'
      ];
      
      let allPermsOk = true;
      
      requiredPerms.forEach((perm, index) => {
        const hasPermission = botMember.permissions.has(perm);
        console.log(`${hasPermission ? '✅' : '❌'} ${permNames[index]}: ${hasPermission ? 'OK' : 'MISSING'}`);
        if (!hasPermission) allPermsOk = false;
      });
      
      console.log(`\n📊 Result: ${allPermsOk ? '✅ All permissions OK!' : '❌ Missing required permissions'}`);
      
      if (!allPermsOk) {
        console.log(`\n🔧 To fix: Right-click server → Server Settings → Roles → ${client.user.username} → Enable missing permissions`);
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    }
    
    console.log('🎯 Test your private channels:');
    console.log('1. Use /start command in Discord');
    console.log('2. Choose "Private Channel" as privacy setting');
    console.log('3. Complete setup - bot should create a private channel');
    console.log('4. Look for new channel in "AI Companions" category');
    
    client.destroy();
  });

  try {
    await client.login(process.env.DISCORD_TOKEN);
  } catch (error) {
    console.error('❌ Failed to connect to Discord:', error.message);
    console.log('\n🔧 Check your DISCORD_TOKEN in .env file');
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testBotPermissions();
}

module.exports = testBotPermissions;
