
import { NextResponse } from 'next/server';
import { createServer } from '@/lib/supabaseClient';
export async function POST(request:Request){
  const formData=await request.formData();
  const email=String(formData.get('email')||'');
  const password=String(formData.get('password')||'');
  const dob=String(formData.get('dob')||'');
  const omitDob=String(formData.get('omitDob')||'0')==='1';
  const constellation=String(formData.get('constellation')||'origen');
  const supabase=createServer();
  const { data:signData, error }=await supabase.auth.signUp({ email, password });
  if(error) return NextResponse.redirect(new URL('/signup?error='+encodeURIComponent(error.message), request.url));
  const user=signData.user;
  if(user){
    const payload:any={ id:user.id, constellation:constellation||'origen', updated_at:new Date().toISOString() };
    if(!omitDob && dob) payload.dob=dob;
    await supabase.from('profiles').upsert(payload);
  }
  return NextResponse.redirect(new URL('/dashboard', request.url));
}
