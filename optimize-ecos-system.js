// Ecos System Optimization Script
// Optimizaciones específicas para el sistema de ecos y Eiven

class EcosOptimizer {
    constructor() {
        this.performanceMetrics = {
            echoCreationTime: [],
            eivenResponseTime: [],
            databaseQueryTime: []
        };
    }

    // =====================================================
    // ECHO CREATION OPTIMIZATION
    // =====================================================

    async optimizeEchoCreation() {
        console.log('🔧 Optimizing Echo Creation System...\n');

        // Enhanced echo creation with better error handling and performance
        const optimizedCreateEcho = async (echoData) => {
            const startTime = Date.now();
            
            try {
                // Validate input
                if (!echoData.content || echoData.content.trim().length === 0) {
                    throw new Error('El contenido del eco es requerido');
                }

                if (echoData.content.length > 5000) {
                    throw new Error('El contenido del eco es demasiado largo (máximo 5000 caracteres)');
                }

                // Get user and garden info
                const userId = ecosAuth.getCurrentUserId();
                if (!userId) {
                    throw new Error('Usuario no autenticado');
                }

                // Auto-detect mood if not provided
                if (!echoData.mood) {
                    echoData.mood = this.detectMoodFromContent(echoData.content);
                }

                // Extract tags automatically
                if (!echoData.tags || echoData.tags.length === 0) {
                    echoData.tags = this.extractTagsFromContent(echoData.content);
                }

                // Create echo with optimized query
                const { data, error } = await supabase
                    .rpc('create_echo_with_analysis', {
                        p_user_id: userId,
                        p_garden_id: echoData.gardenId,
                        p_title: echoData.title || null,
                        p_content: echoData.content.trim(),
                        p_mood: echoData.mood,
                        p_tags: echoData.tags,
                        p_is_public: echoData.isPublic || false
                    });

                if (error) {
                    throw error;
                }

                // Track performance
                const endTime = Date.now();
                this.performanceMetrics.echoCreationTime.push(endTime - startTime);

                // Trigger async operations
                this.scheduleAsyncOperations(data, echoData);

                return {
                    success: true,
                    echo: data,
                    metrics: {
                        creationTime: endTime - startTime
                    }
                };

            } catch (error) {
                console.error('Optimized echo creation error:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        };

        // Replace the original method
        if (typeof ecosAPI !== 'undefined') {
            ecosAPI.createEcho = optimizedCreateEcho;
        }

        console.log('✅ Echo creation system optimized');
    }

    // =====================================================
    // MOOD DETECTION
    // =====================================================

    detectMoodFromContent(content) {
        const moodKeywords = {
            'alegre': ['feliz', 'contento', 'alegre', 'bien', 'genial', 'fantástico', 'increíble', 'maravilloso'],
            'reflexivo': ['pienso', 'reflexiono', 'me pregunto', 'considero', 'analizo', 'medito'],
            'melancólico': ['triste', 'melancólico', 'nostálgico', 'solo', 'vacío', 'perdido'],
            'esperanzado': ['espero', 'futuro', 'mañana', 'posible', 'optimista', 'confiado'],
            'ansioso': ['ansioso', 'nervioso', 'preocupado', 'estresado', 'inquieto', 'agitado'],
            'sereno': ['tranquilo', 'sereno', 'paz', 'calma', 'relajado', 'equilibrado'],
            'energético': ['energía', 'activo', 'dinámico', 'motivado', 'entusiasmado'],
            'contemplativo': ['contemplo', 'observo', 'silencio', 'quietud', 'profundo']
        };

        const contentLower = content.toLowerCase();
        let maxScore = 0;
        let detectedMood = null;

        Object.entries(moodKeywords).forEach(([mood, keywords]) => {
            const score = keywords.reduce((acc, keyword) => {
                return acc + (contentLower.includes(keyword) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                detectedMood = mood;
            }
        });

        return detectedMood;
    }

    // =====================================================
    // TAG EXTRACTION
    // =====================================================

    extractTagsFromContent(content) {
        const tagPatterns = {
            'trabajo': ['trabajo', 'oficina', 'carrera', 'profesional', 'empleo'],
            'familia': ['familia', 'padre', 'madre', 'hermano', 'hijo'],
            'amor': ['amor', 'pareja', 'relación', 'enamorado'],
            'amistad': ['amigo', 'amistad', 'compañero'],
            'salud': ['salud', 'ejercicio', 'bienestar', 'cuidado'],
            'naturaleza': ['naturaleza', 'árbol', 'mar', 'montaña', 'jardín'],
            'crecimiento': ['aprender', 'crecer', 'desarrollo', 'mejorar'],
            'gratitud': ['gracias', 'agradecido', 'bendecido', 'afortunado'],
            'creatividad': ['crear', 'arte', 'música', 'pintura', 'escribir'],
            'espiritualidad': ['espiritual', 'alma', 'universo', 'meditación']
        };

        const contentLower = content.toLowerCase();
        const extractedTags = [];

        Object.entries(tagPatterns).forEach(([tag, keywords]) => {
            const found = keywords.some(keyword => contentLower.includes(keyword));
            if (found) {
                extractedTags.push(tag);
            }
        });

        return extractedTags.slice(0, 5); // Limit to 5 tags
    }

    // =====================================================
    // ASYNC OPERATIONS SCHEDULER
    // =====================================================

    scheduleAsyncOperations(echo, echoData) {
        // Schedule Eiven analysis (non-blocking)
        setTimeout(async () => {
            try {
                await this.generateEivenInsightOptimized(echo.id, echoData.content, echoData.mood);
            } catch (error) {
                console.error('Async Eiven analysis error:', error);
            }
        }, 500);

        // Schedule analytics tracking
        setTimeout(() => {
            this.trackEchoAnalytics(echo);
        }, 100);
    }

    // =====================================================
    // OPTIMIZED EIVEN INTEGRATION
    // =====================================================

    async optimizeEivenIntegration() {
        console.log('🤖 Optimizing Eiven AI Integration...\n');

        // Enhanced Eiven response generation
        const optimizedGenerateResponse = async (userMessage, conversationHistory = [], userMood = null) => {
            const startTime = Date.now();

            try {
                // Implement response caching for similar queries
                const cacheKey = this.generateCacheKey(userMessage, userMood);
                const cachedResponse = this.getCachedResponse(cacheKey);
                
                if (cachedResponse) {
                    console.log('📦 Using cached Eiven response');
                    return cachedResponse;
                }

                // Optimize context building
                const context = this.analyzeUserContextOptimized(userMessage, conversationHistory, userMood);
                const messages = this.buildAIContextOptimized(userMessage, conversationHistory, context);

                // Enhanced OpenAI call with retry logic
                const response = await this.callOpenAIWithRetry({
                    model: OPENAI_CONFIG.model,
                    max_tokens: Math.min(OPENAI_CONFIG.maxTokens, this.calculateOptimalTokens(context)),
                    temperature: this.calculateOptimalTemperature(context),
                    presence_penalty: 0.1,
                    frequency_penalty: 0.1,
                    messages: messages
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
                const processedResponse = this.processAIResponseOptimized(aiResponse, context);

                // Cache the response
                this.cacheResponse(cacheKey, processedResponse);

                // Track performance
                const endTime = Date.now();
                this.performanceMetrics.eivenResponseTime.push(endTime - startTime);

                return {
                    success: true,
                    message: processedResponse.message,
                    mood: processedResponse.mood,
                    insights: processedResponse.insights,
                    suggestions: processedResponse.suggestions,
                    metrics: {
                        responseTime: endTime - startTime,
                        tokensUsed: data.usage?.total_tokens || 0
                    }
                };

            } catch (error) {
                console.error('Optimized Eiven response error:', error);
                
                // Enhanced fallback with context awareness
                return {
                    success: true,
                    message: this.getContextualFallbackResponse(userMood, userMessage),
                    mood: 'comprensivo',
                    insights: [],
                    suggestions: []
                };
            }
        };

        // Replace the original method
        if (typeof eiven !== 'undefined') {
            eiven.generateResponse = optimizedGenerateResponse;
        }

        console.log('✅ Eiven AI integration optimized');
    }

    // =====================================================
    // PERFORMANCE OPTIMIZATION HELPERS
    // =====================================================

    calculateOptimalTokens(context) {
        // Adjust tokens based on context complexity
        let baseTokens = OPENAI_CONFIG.maxTokens;
        
        if (context.needsSupport) baseTokens += 200;
        if (context.conversationLength > 10) baseTokens = Math.max(baseTokens - 100, 500);
        if (context.topics.length > 3) baseTokens += 100;
        
        return Math.min(baseTokens, 1500); // Cap at 1500 tokens
    }

    calculateOptimalTemperature(context) {
        // Adjust creativity based on context
        let temperature = 0.8;
        
        if (context.needsSupport) temperature = 0.7; // More focused for support
        if (context.emotionalTone === 'negativo') temperature = 0.6; // More careful
        if (context.topics.includes('creatividad')) temperature = 0.9; // More creative
        
        return temperature;
    }

    async callOpenAIWithRetry(payload, maxRetries = 3) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
                    },
                    body: JSON.stringify(payload)
                });

                if (response.status === 429) {
                    // Rate limited, wait and retry
                    await this.sleep(Math.pow(2, i) * 1000); // Exponential backoff
                    continue;
                }

                return response;
            } catch (error) {
                lastError = error;
                if (i === maxRetries - 1) break;
                await this.sleep(1000 * (i + 1));
            }
        }
        
        throw lastError;
    }

    // =====================================================
    // CACHING SYSTEM
    // =====================================================

    generateCacheKey(message, mood) {
        const hash = this.simpleHash(message.toLowerCase() + (mood || ''));
        return `eiven_response_${hash}`;
    }

    getCachedResponse(key) {
        try {
            const cached = localStorage.getItem(key);
            if (cached) {
                const data = JSON.parse(cached);
                const age = Date.now() - data.timestamp;
                
                // Cache expires after 1 hour
                if (age < 3600000) {
                    return data.response;
                } else {
                    localStorage.removeItem(key);
                }
            }
        } catch (error) {
            console.error('Cache retrieval error:', error);
        }
        return null;
    }

    cacheResponse(key, response) {
        try {
            const data = {
                response: response,
                timestamp: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Cache storage error:', error);
        }
    }

    // =====================================================
    // ENHANCED INSIGHT GENERATION
    // =====================================================

    async generateEivenInsightOptimized(echoId, content, mood) {
        try {
            const userId = ecosAuth.getCurrentUserId();
            if (!userId) return;

            // Build optimized prompt for insight generation
            const insightPrompt = this.buildInsightPrompt(content, mood);
            
            const response = await this.callOpenAIWithRetry({
                model: 'gpt-4o',
                max_tokens: 300,
                temperature: 0.7,
                messages: [
                    {
                        role: 'system',
                        content: 'Eres Eiven, genera un insight breve y profundo sobre esta reflexión del usuario. Máximo 2-3 oraciones.'
                    },
                    {
                        role: 'user',
                        content: insightPrompt
                    }
                ]
            });

            if (response.ok) {
                const data = await response.json();
                const insight = data.choices[0]?.message?.content;

                if (insight) {
                    // Save insight to database
                    await supabase.rpc('generate_user_insight', {
                        p_user_id: userId,
                        p_insight_type: 'reflexión_profunda',
                        p_title: this.generateInsightTitle(insight),
                        p_content: insight,
                        p_related_echo_id: echoId,
                        p_confidence_score: 0.8,
                        p_metadata: {
                            generated_by: 'eiven_ai_optimized',
                            echo_mood: mood,
                            generation_time: new Date().toISOString()
                        }
                    });
                }
            }

        } catch (error) {
            console.error('Optimized insight generation error:', error);
        }
    }

    // =====================================================
    // UTILITY METHODS
    // =====================================================

    buildInsightPrompt(content, mood) {
        let prompt = `El usuario escribió: "${content}"`;
        if (mood) {
            prompt += ` Se siente ${mood}.`;
        }
        prompt += ' Genera un insight empático que invite a la reflexión profunda.';
        return prompt;
    }

    generateInsightTitle(insight) {
        const words = insight.split(' ').slice(0, 6).join(' ');
        return words.length > 40 ? words.substring(0, 37) + '...' : words;
    }

    getContextualFallbackResponse(mood, message) {
        const fallbacks = {
            'ansioso': 'Percibo inquietud en tus palabras. ¿Qué te ayudaría a encontrar un poco más de calma en este momento?',
            'triste': 'Siento la tristeza en lo que compartes. Es natural sentir esto. ¿Qué necesitas escuchar de ti mismo ahora?',
            'alegre': 'Hay una energía hermosa en lo que expresas. ¿Cómo puedes cultivar más de esta sensación en tu día a día?'
        };

        return fallbacks[mood] || 'Me interesa profundamente lo que compartes. ¿Qué resuena más fuerte en tu corazón sobre esto?';
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    trackEchoAnalytics(echo) {
        // Track analytics (can be enhanced with external services)
        const analytics = {
            timestamp: new Date().toISOString(),
            userId: echo.user_id,
            echoId: echo.id,
            mood: echo.mood,
            contentLength: echo.content.length,
            isPublic: echo.is_public
        };

        console.log('📊 Echo analytics:', analytics);
    }

    // =====================================================
    // PERFORMANCE MONITORING
    // =====================================================

    getPerformanceReport() {
        const avgEchoCreation = this.calculateAverage(this.performanceMetrics.echoCreationTime);
        const avgEivenResponse = this.calculateAverage(this.performanceMetrics.eivenResponseTime);

        return {
            averageEchoCreationTime: avgEchoCreation,
            averageEivenResponseTime: avgEivenResponse,
            totalEcosCreated: this.performanceMetrics.echoCreationTime.length,
            totalEivenInteractions: this.performanceMetrics.eivenResponseTime.length
        };
    }

    calculateAverage(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }

    // =====================================================
    // MAIN OPTIMIZATION RUNNER
    // =====================================================

    async runAllOptimizations() {
        console.log('⚡ Starting Ecos System Optimizations...\n');

        await this.optimizeEchoCreation();
        await this.optimizeEivenIntegration();

        console.log('\n✅ All optimizations completed!');
        console.log('🚀 System performance enhanced');
        
        return this.getPerformanceReport();
    }
}

// Initialize optimizer
const ecosOptimizer = new EcosOptimizer();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcosOptimizer, ecosOptimizer };
}

// Auto-run optimizations
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            ecosOptimizer.runAllOptimizations();
        }, 2000);
    });
}