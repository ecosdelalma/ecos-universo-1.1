// Ecos Platform - Eiven AI System
// Sistema completo de IA empática Eiven

class EivenAI {
    constructor() {
        this.conversations = new Map();
        this.currentConversationId = null;
        this.isTyping = false;
        this.personalityTraits = EIVEN_CONFIG.personality.traits;
        this.initialize();
    }

    initialize() {
        this.loadConversations();
        this.setupEventListeners();
    }

    // =====================================================
    // CONVERSATION MANAGEMENT
    // =====================================================

    async startNewConversation(initialMessage = null) {
        try {
            const userId = ecosAuth.getCurrentUserId();
            if (!userId) {
                throw new Error('Usuario no autenticado');
            }

            const conversationId = crypto.randomUUID();
            const messages = [];

            // Add welcome message
            messages.push({
                role: 'assistant',
                content: EIVEN_CONFIG.prompts.welcome,
                timestamp: new Date().toISOString(),
                mood: 'alegre'
            });

            // Add initial user message if provided
            if (initialMessage) {
                messages.push({
                    role: 'user',
                    content: initialMessage,
                    timestamp: new Date().toISOString()
                });

                // Generate Eiven response
                const response = await this.generateResponse(initialMessage, []);
                if (response.success) {
                    messages.push({
                        role: 'assistant',
                        content: response.message,
                        timestamp: new Date().toISOString(),
                        mood: response.mood,
                        insights: response.insights
                    });
                }
            }

            // Save conversation to database
            const { data, error } = await supabase
                .rpc('save_eiven_conversation', {
                    p_user_id: userId,
                    p_title: this.generateConversationTitle(messages),
                    p_messages: messages,
                    p_context: {
                        started_at: new Date().toISOString(),
                        user_mood: 'neutral',
                        conversation_type: 'general'
                    }
                });

            if (error) {
                console.error('Save conversation error:', error);
                throw error;
            }

            this.currentConversationId = data;
            this.conversations.set(data, {
                id: data,
                messages: messages,
                context: {
                    started_at: new Date().toISOString(),
                    user_mood: 'neutral'
                }
            });

            return {
                success: true,
                conversationId: data,
                messages: messages
            };

        } catch (error) {
            console.error('Start conversation error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async sendMessage(message, mood = null) {
        if (!this.currentConversationId) {
            const newConv = await this.startNewConversation(message);
            if (!newConv.success) {
                return newConv;
            }
            return {
                success: true,
                messages: newConv.messages
            };
        }

        try {
            const conversation = this.conversations.get(this.currentConversationId);
            if (!conversation) {
                throw new Error('Conversación no encontrada');
            }

            // Add user message
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
                mood: mood
            };

            conversation.messages.push(userMessage);

            // Generate Eiven response
            this.setTyping(true);
            const response = await this.generateResponse(message, conversation.messages, mood);
            this.setTyping(false);

            if (response.success) {
                const assistantMessage = {
                    role: 'assistant',
                    content: response.message,
                    timestamp: new Date().toISOString(),
                    mood: response.mood,
                    insights: response.insights,
                    suggestions: response.suggestions
                };

                conversation.messages.push(assistantMessage);

                // Update conversation in database
                await this.saveConversation(conversation);

                return {
                    success: true,
                    message: assistantMessage,
                    conversation: conversation
                };
            } else {
                throw new Error(response.error);
            }

        } catch (error) {
            this.setTyping(false);
            console.error('Send message error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async generateResponse(userMessage, conversationHistory = [], userMood = null) {
        try {
            // Analyze user context
            const context = this.analyzeUserContext(userMessage, conversationHistory, userMood);
            
            // Build conversation context for AI
            const messages = this.buildAIContext(userMessage, conversationHistory, context);

            // Call OpenAI API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: OPENAI_CONFIG.model,
                    max_tokens: OPENAI_CONFIG.maxTokens,
                    temperature: 0.8,
                    presence_penalty: 0.1,
                    frequency_penalty: 0.1,
                    messages: messages
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content;

            if (!aiResponse) {
                throw new Error('No se recibió respuesta de Eiven');
            }

            // Process and enhance response
            const processedResponse = this.processAIResponse(aiResponse, context);

            return {
                success: true,
                message: processedResponse.message,
                mood: processedResponse.mood,
                insights: processedResponse.insights,
                suggestions: processedResponse.suggestions
            };

        } catch (error) {
            console.error('Generate response error:', error);
            
            // Fallback response
            return {
                success: true,
                message: this.getFallbackResponse(userMood),
                mood: 'comprensivo',
                insights: [],
                suggestions: []
            };
        }
    }

    // =====================================================
    // AI CONTEXT BUILDING
    // =====================================================

    analyzeUserContext(message, history = [], mood = null) {
        const context = {
            userMood: mood,
            messageLength: message.length,
            conversationLength: history.length,
            topics: this.extractTopics(message),
            emotionalTone: this.detectEmotionalTone(message),
            needsSupport: this.detectSupportNeeds(message),
            timeOfDay: new Date().getHours()
        };

        // Analyze conversation patterns
        if (history.length > 0) {
            context.previousMoods = this.extractMoodsFromHistory(history);
            context.conversationFlow = this.analyzeConversationFlow(history);
        }

        return context;
    }

    buildAIContext(userMessage, history, context) {
        const messages = [
            {
                role: 'system',
                content: this.buildSystemPrompt(context)
            }
        ];

        // Add relevant conversation history (last 6 messages)
        const recentHistory = history.slice(-6);
        recentHistory.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                messages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        });

        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage
        });

        return messages;
    }

    buildSystemPrompt(context) {
        let prompt = EIVEN_CONFIG.prompts.system;

        // Add contextual information
        prompt += `\n\nContexto actual:`;
        
        if (context.userMood) {
            prompt += `\n- Estado emocional del usuario: ${context.userMood}`;
        }

        if (context.emotionalTone) {
            prompt += `\n- Tono emocional detectado: ${context.emotionalTone}`;
        }

        if (context.needsSupport) {
            prompt += `\n- El usuario parece necesitar apoyo emocional`;
        }

        if (context.topics && context.topics.length > 0) {
            prompt += `\n- Temas principales: ${context.topics.join(', ')}`;
        }

        prompt += `\n\nResponde de manera empática, reflexiva y que invite al crecimiento personal. Usa metáforas de la naturaleza cuando sea apropiado.`;

        return prompt;
    }

    // =====================================================
    // RESPONSE PROCESSING
    // =====================================================

    processAIResponse(aiResponse, context) {
        // Extract insights and suggestions from response
        const insights = this.extractInsights(aiResponse);
        const suggestions = this.extractSuggestions(aiResponse);
        const mood = this.determineEivenMood(aiResponse, context);

        // Clean and format the main message
        let message = aiResponse;
        
        // Remove any extracted insights/suggestions from main message
        message = this.cleanResponseMessage(message);

        return {
            message: message,
            mood: mood,
            insights: insights,
            suggestions: suggestions
        };
    }

    extractInsights(response) {
        const insights = [];
        
        // Look for insight patterns
        const insightPatterns = [
            /(?:me parece|observo|noto) que (.*?)(?:\.|$)/gi,
            /(?:reflexiona sobre|considera) (.*?)(?:\.|$)/gi,
            /(?:insight|reflexión): (.*?)(?:\.|$)/gi
        ];

        insightPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(response)) !== null) {
                insights.push({
                    type: 'observation',
                    content: match[1].trim(),
                    confidence: 0.7
                });
            }
        });

        return insights;
    }

    extractSuggestions(response) {
        const suggestions = [];
        
        // Look for suggestion patterns
        const suggestionPatterns = [
            /(?:podrías|te sugiero|considera) (.*?)(?:\.|$)/gi,
            /¿(?:qué tal si|por qué no) (.*?)\?/gi,
            /(?:sugerencia|recomendación): (.*?)(?:\.|$)/gi
        ];

        suggestionPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(response)) !== null) {
                suggestions.push({
                    type: 'reflection',
                    content: match[1].trim(),
                    actionable: true
                });
            }
        });

        return suggestions;
    }

    determineEivenMood(response, context) {
        const moodKeywords = {
            'alegre': ['alegría', 'feliz', 'contento', 'celebrar', 'éxito'],
            'comprensivo': ['entiendo', 'comprendo', 'natural', 'normal'],
            'reflexivo': ['reflexiona', 'piensa', 'considera', 'profundo'],
            'alentador': ['puedes', 'capaz', 'fortaleza', 'crecimiento'],
            'sereno': ['calma', 'paz', 'tranquilo', 'serenidad']
        };

        let maxScore = 0;
        let detectedMood = 'reflexivo';

        Object.entries(moodKeywords).forEach(([mood, keywords]) => {
            const score = keywords.reduce((acc, keyword) => {
                return acc + (response.toLowerCase().includes(keyword) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                detectedMood = mood;
            }
        });

        return detectedMood;
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    extractTopics(message) {
        const topicKeywords = {
            'trabajo': ['trabajo', 'oficina', 'jefe', 'carrera', 'profesional'],
            'relaciones': ['pareja', 'familia', 'amigo', 'amor', 'relación'],
            'salud': ['salud', 'ejercicio', 'dormir', 'cansado', 'energía'],
            'emociones': ['siento', 'emoción', 'tristeza', 'alegría', 'miedo'],
            'futuro': ['futuro', 'mañana', 'planear', 'objetivo', 'meta']
        };

        const topics = [];
        const lowerMessage = message.toLowerCase();

        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            const found = keywords.some(keyword => lowerMessage.includes(keyword));
            if (found) {
                topics.push(topic);
            }
        });

        return topics;
    }

    detectEmotionalTone(message) {
        const emotionalIndicators = {
            'positivo': ['bien', 'feliz', 'alegre', 'genial', 'increíble'],
            'negativo': ['mal', 'triste', 'difícil', 'problema', 'preocupado'],
            'neutral': ['normal', 'regular', 'común', 'habitual'],
            'reflexivo': ['pienso', 'reflexiono', 'me pregunto', 'considero']
        };

        let maxScore = 0;
        let tone = 'neutral';

        Object.entries(emotionalIndicators).forEach(([toneName, indicators]) => {
            const score = indicators.reduce((acc, indicator) => {
                return acc + (message.toLowerCase().includes(indicator) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                tone = toneName;
            }
        });

        return tone;
    }

    detectSupportNeeds(message) {
        const supportIndicators = [
            'ayuda', 'no sé', 'confundido', 'perdido', 'difícil',
            'no puedo', 'problema', 'preocupado', 'ansioso'
        ];

        return supportIndicators.some(indicator => 
            message.toLowerCase().includes(indicator)
        );
    }

    getFallbackResponse(mood = null) {
        const fallbackResponses = [
            'Me interesa mucho lo que compartes. ¿Podrías contarme un poco más sobre cómo te sientes al respecto?',
            'Veo que hay algo importante en lo que dices. ¿Qué resonancia encuentras en tu interior con estas palabras?',
            'Cada reflexión es valiosa. ¿Qué te gustaría explorar más profundamente de lo que acabas de compartir?',
            'Percibo que hay una invitación al crecimiento en lo que expresas. ¿Cómo te conectas con esa sensación?'
        ];

        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    // =====================================================
    // CONVERSATION PERSISTENCE
    // =====================================================

    async saveConversation(conversation) {
        try {
            const { error } = await supabase
                .from('eiven_conversations')
                .update({
                    messages: conversation.messages,
                    context: conversation.context,
                    updated_at: new Date().toISOString()
                })
                .eq('id', conversation.id);

            if (error) {
                console.error('Save conversation error:', error);
            }

        } catch (error) {
            console.error('Save conversation error:', error);
        }
    }

    async loadConversations() {
        try {
            const userId = ecosAuth.getCurrentUserId();
            if (!userId) return;

            const { data, error } = await supabase
                .from('eiven_conversations')
                .select('*')
                .eq('user_id', userId)
                .eq('is_active', true)
                .order('updated_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Load conversations error:', error);
                return;
            }

            data?.forEach(conv => {
                this.conversations.set(conv.id, conv);
            });

        } catch (error) {
            console.error('Load conversations error:', error);
        }
    }

    generateConversationTitle(messages) {
        const userMessages = messages.filter(m => m.role === 'user');
        if (userMessages.length > 0) {
            const firstMessage = userMessages[0].content;
            const title = firstMessage.length > 30 
                ? firstMessage.substring(0, 27) + '...'
                : firstMessage;
            return title;
        }
        return 'Conversación con Eiven';
    }

    // =====================================================
    // UI INTEGRATION
    // =====================================================

    setTyping(typing) {
        this.isTyping = typing;
        // Trigger UI update
        const event = new CustomEvent('eiven-typing', { 
            detail: { typing: typing } 
        });
        document.dispatchEvent(event);
    }

    setupEventListeners() {
        // Listen for echo creation to provide insights
        document.addEventListener('echo-created', async (event) => {
            const { echo } = event.detail;
            await this.analyzeEcho(echo);
        });
    }

    async analyzeEcho(echo) {
        try {
            const analysis = await ecosAPI.callEivenAI(
                echo.content, 
                echo.mood, 
                'echo_analysis'
            );

            if (analysis.success) {
                // Show insight notification
                const event = new CustomEvent('eiven-insight', {
                    detail: {
                        insight: analysis.response,
                        echo: echo
                    }
                });
                document.dispatchEvent(event);
            }

        } catch (error) {
            console.error('Analyze echo error:', error);
        }
    }

    // Public interface methods
    getCurrentConversation() {
        return this.conversations.get(this.currentConversationId);
    }

    isCurrentlyTyping() {
        return this.isTyping;
    }

    getConversationHistory() {
        return Array.from(this.conversations.values());
    }
}

// Initialize Eiven AI
const eiven = new EivenAI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EivenAI, eiven };
}