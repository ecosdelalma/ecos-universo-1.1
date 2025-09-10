
import { createBrowserClient, createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
export function createClient(){ return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!); }
export function createServer(){ const cookieStore=cookies(); return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { get:(n:string)=>cookieStore.get(n)?.value } }); }
