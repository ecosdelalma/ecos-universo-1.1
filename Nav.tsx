
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabaseClient';
export default function Nav(){
  const pathname=usePathname(); const supabase=createClient(); const [user,setUser]=useState<any>(null);
  useEffect(()=>{ supabase.auth.getUser().then(({data})=>setUser(data.user)); },[]);
  return (
    <nav className="container flex items-center justify-between py-4 sticky top-0 z-50 backdrop-blur">
      <Link href="/" className="text-xl tracking-wide lowercase">ecos</Link>
      <div className="flex gap-3 items-center">
        <Link className={`btn ${pathname==='/'?'border-white/60':''}`} href="/">inicio</Link>
        {user? (<>
          <Link className={`btn ${pathname?.startsWith('/dashboard')?'border-white/60':''}`} href="/dashboard">universo</Link>
          <Link className={`btn ${pathname?.startsWith('/constelacion')?'border-white/60':''}`} href="/constelacion">constelación</Link>
          <Link className={`btn ${pathname?.startsWith('/profile')?'border-white/60':''}`} href="/profile">perfil</Link>
          <form action="/auth/signout" method="post"><button className="btn" type="submit">salir</button></form>
        </>):(<>
          <Link className={`btn ${pathname==='/login'?'border-white/60':''}`} href="/login">entrar</Link>
          <Link className={`btn ${pathname==='/signup'?'border-white/60':''}`} href="/signup">crear cuenta</Link>
        </>)}
      </div>
    </nav>
  );
}
