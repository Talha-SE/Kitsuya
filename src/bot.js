const { Client, GatewayIntentBits, Collection, REST, Routes, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const connectDB = require('./config/database');
const AdminMessageService = require('./services/adminMessageService');

// Initialize Discord client with necessary intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Create collections for commands
client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

const commands = [];
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
    console.log(`✅ Loaded command: ${command.data.name}`);
  } else {
    console.log(`⚠️  The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
  console.log(`✅ Loaded event: ${event.name}`);
}

// Handle slash command interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Error executing command ${interaction.commandName}:`, error);
    
    const errorMessage = {
      content: '❌ There was an error while executing this command!',
      flags: MessageFlags.Ephemeral
    };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

// Function to register slash commands
async function deployCommands() {
  try {
    console.log('🔄 Started refreshing application (/) commands.');
    
    const rest = new REST().setToken(process.env.DISCORD_TOKEN);
    
    // Register commands globally (takes up to 1 hour to propagate)
    // For faster testing, you can register to a specific guild by using:
    // Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID)
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log('✅ Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
}

// Initialize bot
async function startBot() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Login to Discord
    await client.login(process.env.DISCORD_TOKEN);
    
    // Wait for client to be ready, then deploy commands
    client.once('ready', async () => {
      await deployCommands();
    });
    
  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Initialize admin services when bot is ready
client.once('ready', () => {
  console.log('🤖 Bot is ready!');
  
  // Initialize admin message service
  const adminMessageService = new AdminMessageService(client);
  
  // Create HTTP server for socket.io
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3001", // Admin dashboard URL
      methods: ["GET", "POST"]
    }
  });
  
  // Initialize socket connection
  adminMessageService.initializeSocketConnection(io);
  
  // Start socket server on different port than admin dashboard
  const socketPort = 3002;
  httpServer.listen(socketPort, () => {
    console.log(`🔗 Admin socket server running on port ${socketPort}`);
  });
  
  // Store services on client for access from other parts
  client.adminMessageService = adminMessageService;
  client.adminSocket = io;
});

// Handle process termination
process.on('SIGINT', async () => {
  console.log('🔄 Received SIGINT, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Received SIGTERM, shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', error => {
  console.error('❌ Unhandled promise rejection:', error);
});

// Start the bot
startBot();
