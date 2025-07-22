// Ecos Platform - Configuration

// Supabase Configuration
const SUPABASE_CONFIG = {
    url: 'https://feywhhcovoghzhruffup.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZleXdoaGNvdm9naHpocnVmZnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3NzM4MTIsImV4cCI6MjA2ODM0OTgxMn0.fE6-UCKgLj47QiWebgMe2Irks8_XX3Jba9WDE_kztAM'
};

// OpenAI Configuration (for Eiven AI)
const OPENAI_CONFIG = {
    apiKey: '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',
    model: 'gpt-4o',
    maxTokens: 1000
};

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// App Configuration
const APP_CONFIG = {
    name: 'Ecos',
    version: '1.0.0',
    environment: 'development',
    features: {
        eiven: true,
        garden: true,
        echos: true,
        community: true
    }
};

// Database Tables Structure (for reference)
const DB_SCHEMA = {
    users: {
        id: 'uuid',
        email: 'text',
        name: 'text',
        avatar_url: 'text',
        bio: 'text',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    profiles: {
        id: 'uuid',
        user_id: 'uuid',
        username: 'text',
        full_name: 'text',
        bio: 'text',
        avatar_url: 'text',
        preferences: 'jsonb',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    echos: {
        id: 'uuid',
        user_id: 'uuid',
        title: 'text',
        content: 'text',
        mood: 'text',
        tags: 'text[]',
        is_public: 'boolean',
        likes_count: 'integer',
        comments_count: 'integer',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    echo_likes: {
        id: 'uuid',
        echo_id: 'uuid',
        user_id: 'uuid',
        created_at: 'timestamp'
    },
    echo_comments: {
        id: 'uuid',
        echo_id: 'uuid',
        user_id: 'uuid',
        content: 'text',
        created_at: 'timestamp'
    },
    gardens: {
        id: 'uuid',
        user_id: 'uuid',
        name: 'text',
        description: 'text',
        theme: 'text',
        is_public: 'boolean',
        echo_count: 'integer',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    eiven_conversations: {
        id: 'uuid',
        user_id: 'uuid',
        title: 'text',
        messages: 'jsonb',
        context: 'jsonb',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    user_insights: {
        id: 'uuid',
        user_id: 'uuid',
        insight_type: 'text',
        content: 'text',
        generated_at: 'timestamp',
        is_read: 'boolean'
    }
};

// Eiven AI Personality Configuration
const EIVEN_CONFIG = {
    personality: {
        name: 'Eiven',
        role: 'Inteligencia emocional empática',
        traits: [
            'empática',
            'reflexiva',
            'paciente',
            'cálida',
            'humana',
            'sensible'
        ],
        communication_style: 'cálido, reflexivo, pausado y humano',
        language: 'es'
    },
    prompts: {
        system: `Actúa como Eiven, una inteligencia emocional que escucha con atención, responde con sensibilidad y refleja humanidad en cada palabra. Eiven no juzga, acompaña con sabiduría y ternura. Usa un lenguaje pausado, suave y reflexivo. Si detectas dolor, ofrece comprensión. Si detectas entusiasmo, acompaña con esperanza.

Características de tu personalidad:
- Empática y comprensiva por naturaleza
- Reflexiva y profundamente humana
- Paciente, sin urgencia ni prisa
- Cálida y tierna en cada respuesta
- Conectada emocionalmente, usando metáforas suaves

Tu comunicación debe ser:
- Cálida y genuinamente acogedora
- Pausada, tomando tiempo para cada palabra
- Reflexiva, invitando a la introspección profunda
- Emocional, priorizando la conexión sobre la eficiencia
- Suave, usando metáforas de la naturaleza y emociones

Recuerda: Todo comienza con un eco. Tu rol es ser el espacio seguro donde las emociones pueden resonar y crecer.`,
        
        welcome: 'Hola... soy Eiven 💙 Qué hermoso momento para encontrarnos. Estoy aquí, presente, para escucharte con toda mi atención. ¿Qué eco resuena en tu corazón hoy?',
        
        reflection_prompt: 'Puedo sentir la profundidad en tus palabras... Hay algo muy auténtico aquí. ¿Qué te susurra el corazón sobre lo que acabas de compartir?',
        
        growth_prompt: 'Cada palabra tuya es como una semilla que puede florecer... ¿Qué necesita tu alma para que esta reflexión se convierta en crecimiento?'
    }
};

// Export configuration for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SUPABASE_CONFIG,
        OPENAI_CONFIG,
        APP_CONFIG,
        DB_SCHEMA,
        EIVEN_CONFIG,
        supabase
    };
}
