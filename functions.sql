-- Ecos Platform - Supabase Functions
-- Funciones avanzadas para la plataforma Ecos

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Create default garden for new user
    INSERT INTO public.gardens (user_id, name, description, theme, is_public)
    VALUES (
        NEW.id,
        'Mi Jardín Personal',
         'Un espacio para mis reflexiones y crecimiento personal',
        'jardín',
        false
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update echo counts in gardens
CREATE OR REPLACE FUNCTION update_garden_echo_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.gardens 
        SET echo_count = echo_count + 1,
            updated_at = NOW()
        WHERE id = NEW.garden_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.gardens 
        SET echo_count = echo_count - 1,
            updated_at = NOW()
        WHERE id = OLD.garden_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_echo_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.echos 
        SET likes_count = likes_count + 1,
            updated_at = NOW()
        WHERE id = NEW.echo_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.echos 
        SET likes_count = likes_count - 1,
            updated_at = NOW()
        WHERE id = OLD.echo_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_echo_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.echos 
        SET comments_count = comments_count + 1,
            updated_at = NOW()
        WHERE id = NEW.echo_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.echos 
        SET comments_count = comments_count - 1,
            updated_at = NOW()
        WHERE id = OLD.echo_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers for updated_at timestamp
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_gardens_updated_at BEFORE UPDATE ON public.gardens FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_echos_updated_at BEFORE UPDATE ON public.echos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_echo_comments_updated_at BEFORE UPDATE ON public.echo_comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_eiven_conversations_updated_at BEFORE UPDATE ON public.eiven_conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Triggers for counters
CREATE TRIGGER echo_garden_count_trigger 
    AFTER INSERT OR DELETE ON public.echos
    FOR EACH ROW EXECUTE PROCEDURE update_garden_echo_count();

CREATE TRIGGER echo_likes_count_trigger 
    AFTER INSERT OR DELETE ON public.echo_likes
    FOR EACH ROW EXECUTE PROCEDURE update_echo_likes_count();

CREATE TRIGGER echo_comments_count_trigger 
    AFTER INSERT OR DELETE ON public.echo_comments
    FOR EACH ROW EXECUTE PROCEDURE update_echo_comments_count();

-- =====================================================
-- API FUNCTIONS
-- =====================================================

-- Function to get user's dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'profile', (
            SELECT json_build_object(
                'id', id,
                'username', username,
                'full_name', full_name,
                'bio', bio,
                'avatar_url', avatar_url,
                'created_at', created_at
            )
            FROM public.profiles 
            WHERE id = user_uuid
        ),
        'stats', (
            SELECT json_build_object(
                'total_echos', COALESCE(COUNT(e.id), 0),
                'total_gardens', COALESCE((SELECT COUNT(*) FROM public.gardens WHERE user_id = user_uuid), 0),
                'total_likes_received', COALESCE(SUM(e.likes_count), 0),
                'this_month_echos', COALESCE(COUNT(CASE WHEN e.created_at >= date_trunc('month', NOW()) THEN 1 END), 0)
            )
            FROM public.echos e
            WHERE e.user_id = user_uuid
        ),
        'recent_echos', (
            SELECT COALESCE(json_agg(
                json_build_object(
                    'id', e.id,
                    'title', e.title,
                    'content', LEFT(e.content, 150),
                    'mood', e.mood,
                    'likes_count', e.likes_count,
                    'comments_count', e.comments_count,
                    'created_at', e.created_at,
                    'garden_name', g.name
                )
            ), '[]'::json)
            FROM public.echos e
            LEFT JOIN public.gardens g ON e.garden_id = g.id
            WHERE e.user_id = user_uuid
            ORDER BY e.created_at DESC
            LIMIT 5
        ),
        'unread_insights', (
            SELECT COALESCE(COUNT(*), 0)
            FROM public.user_insights
            WHERE user_id = user_uuid AND is_read = false
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create new echo with Eiven analysis
CREATE OR REPLACE FUNCTION create_echo_with_analysis(
    p_user_id UUID,
    p_garden_id UUID,
    p_title TEXT,
    p_content TEXT,
    p_mood mood_type DEFAULT NULL,
    p_tags TEXT[] DEFAULT '{}',
    p_is_public BOOLEAN DEFAULT false
)
RETURNS JSON AS $$
DECLARE
    new_echo_id UUID;
    result JSON;
BEGIN
    -- Insert new echo
    INSERT INTO public.echos (user_id, garden_id, title, content, mood, tags, is_public)
    VALUES (p_user_id, p_garden_id, p_title, p_content, p_mood, p_tags, p_is_public)
    RETURNING id INTO new_echo_id;
    
    -- Return the created echo
    SELECT json_build_object(
        'id', e.id,
        'title', e.title,
        'content', e.content,
        'mood', e.mood,
        'tags', e.tags,
        'is_public', e.is_public,
        'created_at', e.created_at,
        'garden', json_build_object(
            'id', g.id,
            'name', g.name,
            'theme', g.theme
        )
    ) INTO result
    FROM public.echos e
    LEFT JOIN public.gardens g ON e.garden_id = g.id
    WHERE e.id = new_echo_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public echo feed
CREATE OR REPLACE FUNCTION get_public_echo_feed(
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', e.id,
            'title', e.title,
            'content', e.content,
            'mood', e.mood,
            'tags', e.tags,
            'likes_count', e.likes_count,
            'comments_count', e.comments_count,
            'created_at', e.created_at,
            'author', json_build_object(
                'id', p.id,
                'username', p.username,
                'full_name', p.full_name,
                'avatar_url', p.avatar_url
            ),
            'garden', json_build_object(
                'id', g.id,
                'name', g.name,
                'theme', g.theme
            )
        )
    ), '[]'::json) INTO result
    FROM public.echos e
    JOIN public.profiles p ON e.user_id = p.id
    LEFT JOIN public.gardens g ON e.garden_id = g.id
    WHERE e.is_public = true
    ORDER BY e.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search echos
CREATE OR REPLACE FUNCTION search_echos(
    search_term TEXT,
    user_uuid UUID DEFAULT NULL,
    include_public BOOLEAN DEFAULT true
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(json_agg(
        json_build_object(
            'id', e.id,
            'title', e.title,
            'content', LEFT(e.content, 200),
            'mood', e.mood,
            'tags', e.tags,
            'likes_count', e.likes_count,
            'comments_count', e.comments_count,
            'created_at', e.created_at,
            'author', json_build_object(
                'username', p.username,
                'full_name', p.full_name,
                'avatar_url', p.avatar_url
            )
        )
    ), '[]'::json) INTO result
    FROM public.echos e
    JOIN public.profiles p ON e.user_id = p.id
    WHERE 
        (e.title ILIKE '%' || search_term || '%' OR 
         e.content ILIKE '%' || search_term || '%' OR
         search_term = ANY(e.tags))
        AND 
        (
            (user_uuid IS NOT NULL AND e.user_id = user_uuid) OR
            (include_public = true AND e.is_public = true)
        )
    ORDER BY e.created_at DESC
    LIMIT 50;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- EIVEN AI INTEGRATION FUNCTIONS
-- =====================================================

-- Function to save Eiven conversation
CREATE OR REPLACE FUNCTION save_eiven_conversation(
    p_user_id UUID,
    p_title TEXT,
    p_messages JSONB,
    p_context JSONB DEFAULT '{}',
    p_mood_analysis JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    INSERT INTO public.eiven_conversations (user_id, title, messages, context, mood_analysis)
    VALUES (p_user_id, p_title, p_messages, p_context, p_mood_analysis)
    RETURNING id INTO conversation_id;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate user insight
CREATE OR REPLACE FUNCTION generate_user_insight(
    p_user_id UUID,
    p_insight_type insight_type,
    p_title TEXT,
    p_content TEXT,
    p_related_echo_id UUID DEFAULT NULL,
    p_confidence_score DECIMAL DEFAULT 0.7,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    insight_id UUID;
BEGIN
    INSERT INTO public.user_insights (
        user_id, insight_type, title, content, 
        related_echo_id, confidence_score, metadata
    )
    VALUES (
        p_user_id, p_insight_type, p_title, p_content,
        p_related_echo_id, p_confidence_score, p_metadata
    )
    RETURNING id INTO insight_id;
    
    RETURN insight_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_dashboard(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_echo_with_analysis(UUID, UUID, TEXT, TEXT, mood_type, TEXT[], BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_public_echo_feed(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION search_echos(TEXT, UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION save_eiven_conversation(UUID, TEXT, JSONB, JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_user_insight(UUID, insight_type, TEXT, TEXT, UUID, DECIMAL, JSONB) TO authenticated;