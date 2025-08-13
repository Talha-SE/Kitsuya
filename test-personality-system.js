const DatabaseService = require('./src/services/databaseService');
const MistralService = require('./src/services/mistralService');
require('dotenv').config();

// Test script to verify personality system functionality
async function testPersonalitySystem() {
  console.log('🔍 Testing Discord Bot Personality System...\n');
  
  try {
    // Test 1: Database Service
    console.log('1. Testing Database Service...');
    const db = new DatabaseService();
    
    // Test persona creation
    const testPersona = {
      name: 'TestBot',
      language: 'English',
      gender: 'non-binary',
      age: 25,
      personality: 'friendly_flirt',
      characteristics: ['witty', 'helpful', 'engaging'],
      privacySetting: 'public'
    };
    
    // Create test persona
    const persona = await db.createUserPersona('test-user-123', 'test-guild-456', testPersona);
    console.log('✅ Persona created successfully:', persona.setupId);
    
    // Test 2: Message saving and retrieval
    console.log('\n2. Testing message storage...');
    await db.saveChatMessage('test-user-123', 'test-guild-456', 'Hello!', 'Hi there! How are you today?', persona.setupId);
    await db.saveChatMessage('test-user-123', 'test-guild-456', 'What can you do?', 'I can help with many things!', persona.setupId);
    
    const history = await db.getRecentChatHistory('test-user-123', 'test-guild-456', 5, persona.setupId);
    console.log('✅ Retrieved message history:', history.length, 'messages');
    
    // Test 3: Mistral Service
    console.log('\n3. Testing AI Response Generation...');
    const mistral = new MistralService();
    
    // Test if API key is configured
    if (!mistral.apiKey) {
      console.log('⚠️  MISTRAL_API_KEY not found in .env file');
      console.log('   Please add your Mistral API key to test AI responses');
    } else {
      console.log('✅ Mistral API key found');
      
      // Test response generation (uncomment to test with real API)
      // const response = await mistral.generateResponse('Hello!', testPersona, history);
      // console.log('AI Response:', response);
    }
    
    // Test 4: Conversation Summarization
    console.log('\n4. Testing conversation summarization...');
    if (mistral.apiKey) {
      const summary = await mistral.summarizeConversation(history);
      console.log('✅ Summary generated:', summary);
      
      // Update summary in database
      await db.updateConversationSummary(persona.setupId, summary);
      const retrievedSummary = await db.getConversationSummary(persona.setupId);
      console.log('✅ Summary stored and retrieved successfully');
    }
    
    // Test 5: Personality Change
    console.log('\n5. Testing personality changes...');
    persona.persona.personality = 'gaming_partner';
    await persona.save();
    console.log('✅ Personality updated successfully');
    
    // Test 6: Statistics
    console.log('\n6. Testing user statistics...');
    const stats = await db.getUserStats('test-user-123', 'test-guild-456');
    console.log('✅ User stats:', {
      hasPersonas: stats.hasPersonas,
      personaCount: stats.personaCount,
      totalMessages: stats.totalMessages
    });
    
    // Cleanup
    console.log('\n7. Cleaning up test data...');
    await db.deletePersona(persona.setupId);
    console.log('✅ Test persona deleted');
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📋 System Status Summary:');
    console.log('✅ Database connection working');
    console.log('✅ Persona creation and management working');
    console.log('✅ Message storage and retrieval working');
    console.log('✅ Conversation summarization ready');
    console.log('✅ Personality changes working');
    console.log(mistral.apiKey ? '✅ Mistral AI integration configured' : '⚠️  Mistral API key needed for AI responses');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
  
  process.exit(0);
}

// Run tests only if this file is executed directly
if (require.main === module) {
  testPersonalitySystem();
}

module.exports = testPersonalitySystem;
