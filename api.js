// Ecos Platform - API Layer
// API completa para manejo de ecos, jardines y datos

class EcosAPI {
    constructor() {
        this.baseUrl = SUPABASE_CONFIG.url;
        this.apiKey = SUPABASE_CONFIG.anonKey;
    }

    // =====================================================
    // AUTHENTICATION HELPERS
    // =====================================================

    getAuthHeaders() {
        const user = ecosAuth.getCurrentUser();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.access_token || this.apiKey}`,
            'apikey': this.apiKey
        };
    }

    ensureAuthenticated() {
        if (!ecosAuth.isAuthenticated()) {
            throw new Error('Usuario no autenticado');
        }
    }

    // =====================================================
    // ECOS API
    // =====================================================

    async createEcho(echoData) {
        this.ensureAuthenticated();
        
        try {
            const userId = ecosAuth.getCurrentUserId();
            
            // Validate required fields
            if (!echoData.content || !echoData.gardenId) {
                throw new Error('Contenido y jardín son requeridos');
            }

            const { data, error } = await supabase
                .rpc('create_echo_with_analysis', {
                    p_user_id: userId,
                    p_garden_id: echoData.gardenId,
                    p_title: echoData.title || null,
                    p_content: echoData.content,
                    p_mood: echoData.mood || null,
                    p_tags: echoData.tags || [],
                    p_is_public: echoData.isPublic || false
                });

            if (error) {
                console.error('Create echo error:', error);
                throw error;
            }

            // Generate Eiven insights if enabled
            if (APP_CONFIG.features.eiven) {
                setTimeout(() => {
                    this.generateEivenInsight(data.id, echoData.content, echoData.mood);
                }, 1000);
            }

            return {
                success: true,
                echo: data
            };

        } catch (error) {
            console.error('Create echo error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getEchos(options = {}) {
        try {
            let query = supabase
                .from('echos')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        username,
                        full_name,
                        avatar_url
                    ),
                    gardens:garden_id (
                        id,
                        name,
                        theme
                    )
                `);

            // Apply filters
            if (options.userId) {
                query = query.eq('user_id', options.userId);
            }

            if (options.gardenId) {
                query = query.eq('garden_id', options.gardenId);
            }

            if (options.isPublic !== undefined) {
                query = query.eq('is_public', options.isPublic);
            }

            if (options.mood) {
                query = query.eq('mood', options.mood);
            }

            if (options.tags && options.tags.length > 0) {
                query = query.overlaps('tags', options.tags);
            }

            // Apply sorting
            const sortBy = options.sortBy || 'created_at';
            const sortOrder = options.sortOrder || 'desc';
            query = query.order(sortBy, { ascending: sortOrder === 'asc' });

            // Apply pagination
            const limit = options.limit || 20;
            const offset = options.offset || 0;
            query = query.range(offset, offset + limit - 1);

            const { data, error } = await query;

            if (error) {
                console.error('Get echos error:', error);
                throw error;
            }

            return {
                success: true,
                echos: data || []
            };

        } catch (error) {
            console.error('Get echos error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getEcho(echoId) {
        try {
            const { data, error } = await supabase
                .from('echos')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        username,
                        full_name,
                        avatar_url,
                        bio
                    ),
                    gardens:garden_id (
                        id,
                        name,
                        description,
                        theme
                    ),
                    echo_likes (
                        user_id,
                        created_at
                    ),
                    echo_comments (
                        id,
                        content,
                        created_at,
                        profiles:user_id (
                            username,
                            full_name,
                            avatar_url
                        )
                    )
                `)
                .eq('id', echoId)
                .single();

            if (error) {
                console.error('Get echo error:', error);
                throw error;
            }

            return {
                success: true,
                echo: data
            };

        } catch (error) {
            console.error('Get echo error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateEcho(echoId, updates) {
        this.ensureAuthenticated();
        
        try {
            const userId = ecosAuth.getCurrentUserId();

            const { data, error } = await supabase
                .from('echos')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', echoId)
                .eq('user_id', userId) // Ensure user owns the echo
                .select()
                .single();

            if (error) {
                console.error('Update echo error:', error);
                throw error;
            }

            return {
                success: true,
                echo: data
            };

        } catch (error) {
            console.error('Update echo error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteEcho(echoId) {
        this.ensureAuthenticated();
        
        try {
            const userId = ecosAuth.getCurrentUserId();

            const { error } = await supabase
                .from('echos')
                .delete()
                .eq('id', echoId)
                .eq('user_id', userId); // Ensure user owns the echo

            if (error) {
                console.error('Delete echo error:', error);
                throw error;
            }

            return {
                success: true
            };

        } catch (error) {
            console.error('Delete echo error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async toggleEchoLike(echoId) {
        this.ensureAuthenticated();
        
        try {
            const userId = ecosAuth.getCurrentUserId();

            // Check if already liked
            const { data: existingLike } = await supabase
                .from('echo_likes')
                .select('id')
                .eq('echo_id', echoId)
                .eq('user_id', userId)
                .single();

            if (existingLike) {
                // Unlike
                const { error } = await supabase
                    .from('echo_likes')
                    .delete()
                    .eq('echo_id', echoId)
                    .eq('user_id', userId);

                if (error) throw error;

                return {
                    success: true,
                    liked: false
                };
            } else {
                // Like
                const { error } = await supabase
                    .from('echo_likes')
                    .insert({
                        echo_id: echoId,
                        user_id: userId
                    });

                if (error) throw error;

                return {
                    success: true,
                    liked: true
                };
            }

        } catch (error) {
            console.error('Toggle echo like error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async addEchoComment(echoId, content) {
        this.ensureAuthenticated();
        
        try {
            const userId = ecosAuth.getCurrentUserId();

            const { data, error } = await supabase
                .from('echo_comments')
                .insert({
                    echo_id: echoId,
                    user_id: userId,
                    content: content
                })
                .select(`
                    *,
                    profiles:user_id (
                        username,
                        full_name,
                        avatar_url
                    )
                `)
                .single();

            if (error) {
                console.error('Add comment error:', error);
                throw error;
            }

            return {
                success: true,
                comment: data
            };

        } catch (error) {
            console.error('Add comment error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =====================================================
    // GARDENS API
    // =====================================================

    async createGarden(gardenData) {
        this.ensureAuthenticated();
        
        try {
            const userId = ecosAuth.getCurrentUserId();

            const { data, error } = await supabase
                .from('gardens')
                .insert({
                    user_id: userId,
                    name: gardenData.name,
                    description: gardenData.description || '',
                    theme: gardenData.theme || 'jardín',
                    is_public: gardenData.isPublic || false,
                    settings: gardenData.settings || {}
                })
                .select()
                .single();

            if (error) {
                console.error('Create garden error:', error);
                throw error;
            }

            return {
                success: true,
                garden: data
            };

        } catch (error) {
            console.error('Create garden error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getGardens(userId = null) {
        try {
            let query = supabase
                .from('gardens')
                .select(`
                    *,
                    profiles:user_id (
                        id,
                        username,
                        full_name,
                        avatar_url
                    )
                `);

            if (userId) {
                query = query.eq('user_id', userId);
            } else {
                // Get current user's gardens or public gardens
                const currentUserId = ecosAuth.getCurrentUserId();
                if (currentUserId) {
                    query = query.or(`user_id.eq.${currentUserId},is_public.eq.true`);
                } else {
                    query = query.eq('is_public', true);
                }
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                console.error('Get gardens error:', error);
                throw error;
            }

            return {
                success: true,
                gardens: data || []
            };

        } catch (error) {
            console.error('Get gardens error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async updateGarden(gardenId, updates) {
        this.ensureAuthenticated();
        
        try {
            const userId = ecosAuth.getCurrentUserId();

            const { data, error } = await supabase
                .from('gardens')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', gardenId)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) {
                console.error('Update garden error:', error);
                throw error;
            }

            return {
                success: true,
                garden: data
            };

        } catch (error) {
            console.error('Update garden error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =====================================================
    // DASHBOARD API
    // =====================================================

    async getDashboardData() {
        this.ensureAuthenticated();
        
        try {
            const userId = ecosAuth.getCurrentUserId();

            const { data, error } = await supabase
                .rpc('get_user_dashboard', {
                    user_uuid: userId
                });

            if (error) {
                console.error('Get dashboard error:', error);
                throw error;
            }

            return {
                success: true,
                dashboard: data
            };

        } catch (error) {
            console.error('Get dashboard error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getPublicFeed(options = {}) {
        try {
            const limit = options.limit || 20;
            const offset = options.offset || 0;

            const { data, error } = await supabase
                .rpc('get_public_echo_feed', {
                    limit_count: limit,
                    offset_count: offset
                });

            if (error) {
                console.error('Get public feed error:', error);
                throw error;
            }

            return {
                success: true,
                echos: data || []
            };

        } catch (error) {
            console.error('Get public feed error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async searchEchos(searchTerm, options = {}) {
        try {
            const userId = options.userOnly ? ecosAuth.getCurrentUserId() : null;
            const includePublic = options.includePublic !== false;

            const { data, error } = await supabase
                .rpc('search_echos', {
                    search_term: searchTerm,
                    user_uuid: userId,
                    include_public: includePublic
                });

            if (error) {
                console.error('Search echos error:', error);
                throw error;
            }

            return {
                success: true,
                echos: data || []
            };

        } catch (error) {
            console.error('Search echos error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // =====================================================
    // EIVEN AI INTEGRATION
    // =====================================================

    async generateEivenInsight(echoId, content, mood = null) {
        if (!APP_CONFIG.features.eiven) return;

        try {
            const userId = ecosAuth.getCurrentUserId();
            
            // Call Eiven AI to analyze the echo
            const analysis = await this.callEivenAI(content, mood, 'echo_analysis');

            if (analysis.success) {
                // Save insight to database
                const { error } = await supabase
                    .rpc('generate_user_insight', {
                        p_user_id: userId,
                        p_insight_type: 'reflexión_profunda',
                        p_title: analysis.title || 'Reflexión sobre tu eco',
                        p_content: analysis.insight,
                        p_related_echo_id: echoId,
                        p_confidence_score: analysis.confidence || 0.7,
                        p_metadata: {
                            generated_by: 'eiven_ai',
                            echo_mood: mood,
                            analysis_type: 'echo_insight'
                        }
                    });

                if (error) {
                    console.error('Save insight error:', error);
                }
            }

        } catch (error) {
            console.error('Generate Eiven insight error:', error);
        }
    }

    async callEivenAI(message, mood = null, context = 'conversation') {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: OPENAI_CONFIG.model,
                    max_tokens: OPENAI_CONFIG.maxTokens,
                    temperature: 0.7,
                    messages: [
                        {
                            role: 'system',
                            content: EIVEN_CONFIG.prompts.system
                        },
                        {
                            role: 'user',
                            content: this.buildEivenPrompt(message, mood, context)
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0]?.message?.content;

            if (!aiResponse) {
                throw new Error('No response from Eiven AI');
            }

            return {
                success: true,
                response: aiResponse,
                insight: aiResponse,
                title: this.extractInsightTitle(aiResponse),
                confidence: 0.8
            };

        } catch (error) {
            console.error('Eiven AI error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    buildEivenPrompt(message, mood, context) {
        let prompt = '';

        if (context === 'echo_analysis') {
            prompt = `Un usuario ha compartido esta reflexión en su jardín personal: "${message}"`;
            if (mood) {
                prompt += ` La emoción asociada es: ${mood}.`;
            }
            prompt += `\n\nComo Eiven, proporciona una reflexión empática y profunda que invite al crecimiento personal. Ofrece una perspectiva que pueda ayudar al usuario a profundizar en su autoconocimiento.`;
        } else {
            prompt = message;
            if (mood) {
                prompt += `\n\n(El usuario se siente: ${mood})`;
            }
        }

        return prompt;
    }

    extractInsightTitle(response) {
        // Extract a meaningful title from the AI response
        const sentences = response.split('.').filter(s => s.trim().length > 0);
        if (sentences.length > 0) {
            let title = sentences[0].trim();
            if (title.length > 50) {
                title = title.substring(0, 47) + '...';
            }
            return title;
        }
        return 'Reflexión de Eiven';
    }
}

// Initialize API
const ecosAPI = new EcosAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EcosAPI, ecosAPI };
}