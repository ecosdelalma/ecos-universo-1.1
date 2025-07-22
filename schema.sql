-- Ecos Platform - Database Schema
-- Configuración completa de Supabase para la plataforma Ecos

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE mood_type AS ENUM ('alegre', 'reflexivo', 'melancólico', 'esperanzado', 'ansioso', 'sereno', 'energético', 'contemplativo');
CREATE TYPE insight_type AS ENUM ('patrón_emocional', 'crecimiento_personal', 'recomendación', 'reflexión_profunda');
CREATE TYPE garden_theme AS ENUM ('océano', 'bosque', 'montaña', 'jardín', 'desierto', 'pradera');

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    birth_date DATE,
    location TEXT,
    website TEXT,
    preferences JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- GARDENS TABLE (espacios personales de reflexión)
-- =====================================================
CREATE TABLE public.gardens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    theme garden_theme DEFAULT 'jardín',
    is_public BOOLEAN DEFAULT FALSE,
    echo_count INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ECHOS TABLE (reflexiones principales)
-- =====================================================
CREATE TABLE public.echos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    garden_id UUID REFERENCES public.gardens(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood mood_type,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    eiven_insights JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ECHO_LIKES TABLE
-- =====================================================
CREATE TABLE public.echo_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    echo_id UUID REFERENCES public.echos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(echo_id, user_id)
);

-- =====================================================
-- ECHO_COMMENTS TABLE
-- =====================================================
CREATE TABLE public.echo_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    echo_id UUID REFERENCES public.echos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.echo_comments(id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- EIVEN_CONVERSATIONS TABLE (conversaciones con IA)
-- =====================================================
CREATE TABLE public.eiven_conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    messages JSONB DEFAULT '[]',
    context JSONB DEFAULT '{}',
    mood_analysis JSONB DEFAULT '{}',
    conversation_summary TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER_INSIGHTS TABLE (insights generados por Eiven)
-- =====================================================
CREATE TABLE public.user_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    insight_type insight_type NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    related_echo_id UUID REFERENCES public.echos(id) ON DELETE SET NULL,
    related_conversation_id UUID REFERENCES public.eiven_conversations(id) ON DELETE SET NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER_CONNECTIONS TABLE (seguimientos entre usuarios)
-- =====================================================
CREATE TABLE public.user_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- =====================================================
-- ECHO_SHARES TABLE (ecos compartidos públicamente)
-- =====================================================
CREATE TABLE public.echo_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    echo_id UUID REFERENCES public.echos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    share_type TEXT DEFAULT 'public_wall',
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(echo_id, user_id, share_type)
);

-- =====================================================
-- USER_ACHIEVEMENTS TABLE (logros y badges)
-- =====================================================
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- =====================================================
-- INDICES para optimización
-- =====================================================
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_gardens_user_id ON public.gardens(user_id);
CREATE INDEX idx_gardens_public ON public.gardens(is_public) WHERE is_public = true;
CREATE INDEX idx_echos_user_id ON public.echos(user_id);
CREATE INDEX idx_echos_garden_id ON public.echos(garden_id);
CREATE INDEX idx_echos_public ON public.echos(is_public) WHERE is_public = true;
CREATE INDEX idx_echos_created_at ON public.echos(created_at DESC);
CREATE INDEX idx_echos_mood ON public.echos(mood);
CREATE INDEX idx_echos_tags ON public.echos USING GIN(tags);
CREATE INDEX idx_echo_likes_user_echo ON public.echo_likes(user_id, echo_id);
CREATE INDEX idx_echo_comments_echo_id ON public.echo_comments(echo_id);
CREATE INDEX idx_eiven_conversations_user_id ON public.eiven_conversations(user_id);
CREATE INDEX idx_eiven_conversations_active ON public.eiven_conversations(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_user_insights_user_id ON public.user_insights(user_id);
CREATE INDEX idx_user_insights_unread ON public.user_insights(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_user_connections_follower ON public.user_connections(follower_id);
CREATE INDEX idx_user_connections_following ON public.user_connections(following_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gardens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echo_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eiven_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.echo_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- GARDENS POLICIES
CREATE POLICY "Users can view own gardens" ON public.gardens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public gardens" ON public.gardens FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own gardens" ON public.gardens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gardens" ON public.gardens FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gardens" ON public.gardens FOR DELETE USING (auth.uid() = user_id);

-- ECHOS POLICIES
CREATE POLICY "Users can view own echos" ON public.echos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public echos" ON public.echos FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own echos" ON public.echos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own echos" ON public.echos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own echos" ON public.echos FOR DELETE USING (auth.uid() = user_id);

-- ECHO_LIKES POLICIES
CREATE POLICY "Users can view all likes" ON public.echo_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.echo_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.echo_likes FOR DELETE USING (auth.uid() = user_id);

-- ECHO_COMMENTS POLICIES
CREATE POLICY "Users can view all comments" ON public.echo_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.echo_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON public.echo_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.echo_comments FOR DELETE USING (auth.uid() = user_id);

-- EIVEN_CONVERSATIONS POLICIES
CREATE POLICY "Users can view own conversations" ON public.eiven_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.eiven_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.eiven_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.eiven_conversations FOR DELETE USING (auth.uid() = user_id);

-- USER_INSIGHTS POLICIES
CREATE POLICY "Users can view own insights" ON public.user_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert insights" ON public.user_insights FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own insights" ON public.user_insights FOR UPDATE USING (auth.uid() = user_id);

-- USER_CONNECTIONS POLICIES
CREATE POLICY "Users can view all connections" ON public.user_connections FOR SELECT USING (true);
CREATE POLICY "Users can insert own connections" ON public.user_connections FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete own connections" ON public.user_connections FOR DELETE USING (auth.uid() = follower_id);

-- ECHO_SHARES POLICIES
CREATE POLICY "Users can view all shares" ON public.echo_shares FOR SELECT USING (true);
CREATE POLICY "Users can insert own shares" ON public.echo_shares FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own shares" ON public.echo_shares FOR DELETE USING (auth.uid() = user_id);

-- USER_ACHIEVEMENTS POLICIES
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);