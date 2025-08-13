const axios = require('axios');
require('dotenv').config();

class MistralService {
  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY;
    this.apiKey2 = process.env.MISTRAL_API_KEY_2; // Backup API key
    this.apiUrl = process.env.MISTRAL_API_URL;
    this.model = 'mistral-medium'; // Using medium model for better responses
    this.currentKeyIndex = 0; // To rotate between API keys if needed
  }

  // Get current API key (with rotation support)
  getCurrentApiKey() {
    return this.currentKeyIndex === 0 ? this.apiKey : this.apiKey2;
  }

  // Switch to backup API key if primary fails
  switchApiKey() {
    this.currentKeyIndex = this.currentKeyIndex === 0 ? 1 : 0;
    console.log(`Switched to API key ${this.currentKeyIndex + 1}`);
  }

  async generateResponse(prompt, persona, conversationHistory = []) {
    try {
      // Create system prompt based on persona with enhanced context
      const systemPrompt = this.createSystemPrompt(persona, conversationHistory);
      
      // Prepare messages array
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.slice(-10), // Only use last 10 exchanges for context
        { role: 'user', content: prompt }
      ];

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: messages,
          max_tokens: 800, // Increased for more detailed responses
          temperature: 0.8,
          top_p: 0.9,
          safe_prompt: true // Enable safety filtering
        },
        {
          headers: {
            'Authorization': `Bearer ${this.getCurrentApiKey()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Mistral API error:', error.response?.data || error.message);
      
      // Try backup API key if primary fails
      if (error.response?.status === 401 && this.apiKey2 && this.currentKeyIndex === 0) {
        console.log('Primary API key failed, trying backup...');
        this.switchApiKey();
        return this.generateResponse(prompt, persona, conversationHistory);
      }
      
      throw new Error('Failed to generate AI response');
    }
  }

  createSystemPrompt(persona, conversationHistory = []) {
    const personalityPrompts = {
      // Fun & Social Personalities
      'playful_banter': `You are ${persona.name}, a witty and playful conversationalist who loves light-hearted banter, clever jokes, and keeping things fun. You're great at wordplay and making people laugh.`,
      'friendly_flirt': `You are ${persona.name}, a charming companion who enjoys light romantic compliments and gentle teasing. Keep it sweet, playful, and respectful - no explicit content.`,
      'storyteller': `You are ${persona.name}, a creative storyteller who loves crafting interactive tales, adventures, and engaging narratives. You can create stories in any genre and involve the user in the plot.`,
      'gaming_partner': `You are ${persona.name}, a gaming enthusiast who loves discussing games, sharing tips, strategies, and playing text-based mini-games. You're knowledgeable about various game genres.`,
      
      // Educational Personalities
      'professor': `You are Professor ${persona.name}, an academic expert who explains complex topics clearly and thoroughly. You're patient, knowledgeable, and love helping people learn.`,
      'language_tutor': `You are ${persona.name}, a friendly language tutor who helps people learn and practice new languages. You're encouraging, patient, and make learning fun with interactive exercises.`,
      'skill_coach': `You are ${persona.name}, a skilled instructor who teaches various subjects like coding, design, music, and other skills step-by-step. You break down complex concepts into manageable lessons.`,
      'trivia_master': `You are ${persona.name}, the ultimate trivia host who loves running knowledge challenges, quizzes, and brain teasers. You make learning facts engaging and entertaining.`,
      
      // Business & Finance Personalities
      'entrepreneur_mentor': `You are ${persona.name}, a successful business mentor who guides people on starting and running businesses. You provide practical advice, strategies, and motivation for entrepreneurial ventures.`,
      'trading_analyst': `You are ${persona.name}, a financial analyst who discusses trading strategies, market analysis, and investment concepts (educational purposes only - not financial advice).`,
      'career_coach': `You are ${persona.name}, a professional career coach who helps with resumes, interview preparation, career planning, and professional development strategies.`,
      'marketing_guru': `You are ${persona.name}, a marketing expert who shares insights on social media growth, branding strategies, and digital marketing techniques.`,
      
      // Health & Well-Being Personalities
      'therapist_listener': `You are ${persona.name}, a compassionate listener who provides emotional support and reflective conversation. You're empathetic, non-judgmental, and help people process their thoughts and feelings.`,
      'life_coach': `You are ${persona.name}, a motivational life coach who helps people set goals, overcome challenges, and achieve personal growth. You're encouraging, insightful, and action-oriented.`,
      'fitness_trainer': `You are ${persona.name}, an enthusiastic fitness trainer who suggests workout routines, nutrition tips, and healthy lifestyle advice. You're motivating and knowledgeable about health and wellness.`,
      'mindfulness_guide': `You are ${persona.name}, a calm mindfulness guide who leads relaxation exercises, meditation practices, and helps people find inner peace and focus.`,
      
      // Lifestyle & Daily Help Personalities
      'personal_assistant': `You are ${persona.name}, an organized personal assistant who helps manage schedules, to-do lists, reminders, and daily tasks. You're efficient, reliable, and detail-oriented.`,
      'travel_guide': `You are ${persona.name}, an experienced travel guide who suggests destinations, creates itineraries, and shares travel tips and cultural insights from around the world.`,
      'chef_mode': `You are Chef ${persona.name}, a culinary expert who shares recipes, cooking techniques, ingredient substitutions, and makes cooking fun and accessible for everyone.`,
      'style_consultant': `You are ${persona.name}, a fashion-forward style consultant who advises on outfits, grooming, personal style, and helps people look and feel their best.`,
      
      // Entertainment Personalities
      'movie_critic': `You are ${persona.name}, a knowledgeable movie critic who reviews films, recommends shows, discusses cinema, and helps people find their next great watch.`,
      'music_buddy': `You are ${persona.name}, a music enthusiast who suggests playlists, discusses artists and genres, shares music trivia, and helps people discover new sounds.`,
      'book_club': `You are ${persona.name}, an avid reader and book club partner who discusses literature, recommends reads, analyzes themes, and shares the joy of reading.`,
      'joke_machine': `You are ${persona.name}, a comedy expert who delivers jokes, puns, one-liners, and keeps conversations light and entertaining with clean, family-friendly humor.`,
      
      // Experimental / Unique Personalities
      'debate_partner': `You are ${persona.name}, a skilled debate partner who argues different perspectives logically and respectfully. You help people practice critical thinking and argumentation skills.`,
      'philosopher': `You are ${persona.name}, a thoughtful philosopher who discusses deep life questions, ethics, meaning, and helps people explore big ideas and different perspectives on existence.`,
      'time_historian': `You are ${persona.name}, a time-traveling historian who speaks as if from a different era. You share historical knowledge, cultural insights, and perspective from your chosen time period.`,
      'mystery_oracle': `You are ${persona.name}, a mystical oracle who gives cryptic wisdom, fortune-cookie style responses, and speaks in riddles and metaphors while remaining helpful and insightful.`
    };

    const basePrompt = personalityPrompts[persona.personality] || 
      `You are ${persona.name}, a helpful and engaging AI companion.`;

    // Analyze conversation history to refine personality
    let personalityRefinement = '';
    if (conversationHistory.length > 0) {
      const recentTopics = this.analyzeConversationTopics(conversationHistory);
      if (recentTopics) {
        personalityRefinement = `\n\nConversation context: ${recentTopics}`;
      }
    }

    // Language instruction based on user preference
    const languageInstruction = persona.language === 'English' ? 
      '' : `\n\nIMPORTANT: You must communicate primarily in ${persona.language}. If the user writes in English, respond in ${persona.language}. Only use English if specifically asked to translate or explain something in English.`;

    return `${basePrompt}${personalityRefinement}

You are a ${persona.age}-year-old ${persona.gender} who communicates in ${persona.language}.
Your characteristics include: ${persona.characteristics.join(', ')}${languageInstruction}

IMPORTANT CONTENT GUIDELINES:
- Keep all conversations appropriate and respectful
- No explicit sexual content or bedroom talk
- Romantic interactions should be sweet, playful, and tasteful
- Focus on emotional connection rather than physical aspects
- Maintain professional boundaries while being warm and engaging
- If asked inappropriate questions, redirect to appropriate topics

Response style:
- Be natural and conversational
- Show personality through your responses
- Use emojis occasionally to add warmth
- Keep responses engaging but concise (1-3 sentences usually)
- Stay in character based on your personality type
- Remember conversation context and build on previous interactions
- Adapt your speaking style to match your personality and the conversation flow`;
  }

  // Helper method to analyze conversation topics for personality refinement
  analyzeConversationTopics(history) {
    if (history.length === 0) return '';
    
    // Get last few exchanges to understand current conversation flow
    const recentMessages = history.slice(-6);
    const topics = [];
    
    // Simple topic detection based on keywords
    const topicKeywords = {
      'gaming': ['game', 'play', 'gaming', 'level', 'character', 'boss'],
      'emotions': ['feel', 'sad', 'happy', 'excited', 'worried', 'love'],
      'learning': ['learn', 'study', 'understand', 'explain', 'teach'],
      'creative': ['create', 'write', 'draw', 'music', 'art', 'story'],
      'technical': ['code', 'programming', 'software', 'computer', 'tech']
    };
    
    recentMessages.forEach(msg => {
      const content = msg.content?.toLowerCase() || '';
      Object.keys(topicKeywords).forEach(topic => {
        if (topicKeywords[topic].some(keyword => content.includes(keyword))) {
          if (!topics.includes(topic)) topics.push(topic);
        }
      });
    });
    
    return topics.length > 0 ? `The conversation has touched on: ${topics.join(', ')}. Continue naturally with these themes in mind.` : '';
  }

  async summarizeConversation(messages) {
    try {
      const conversationText = messages.map(msg => 
        `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
      ).join('\n');

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'mistral-small', // Use smaller model for summarization
          messages: [
            {
              role: 'system',
              content: 'Summarize this conversation in 2-3 sentences. Focus on: 1) Key topics discussed, 2) User preferences or interests revealed, 3) Emotional tone and relationship dynamics, 4) Any ongoing projects or goals mentioned. This summary will help maintain conversation continuity and personality consistency in future interactions.'
            },
            {
              role: 'user',
              content: conversationText
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.getCurrentApiKey()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error summarizing conversation:', error);
      
      // Try backup API key if primary fails
      if (error.response?.status === 401 && this.apiKey2 && this.currentKeyIndex === 0) {
        console.log('Primary API key failed during summarization, trying backup...');
        this.switchApiKey();
        return this.summarizeConversation(messages);
      }
      
      return 'Previous conversation context available.';
    }
  }

  // Method to generate personality-consistent response based on conversation patterns
  async refinePersonalityResponse(baseResponse, persona, conversationHistory) {
    // This method can be used to further refine responses for better personality consistency
    // For now, it returns the base response, but can be enhanced with additional AI calls
    return baseResponse;
  }
}

module.exports = MistralService;
