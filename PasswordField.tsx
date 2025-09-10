
'use client';
import { useState } from 'react';
export default function PasswordField({ name, placeholder }:{name:string; placeholder:string;}){
  const [show,setShow]=useState(false);
  return (
    <div className="relative">
      <input className="w-full px-3 py-2 pr-10 rounded bg-white/10 border border-white/20" name={name} placeholder={placeholder} type={show?'text':'password'} required />
      <button type="button" aria-label={show?'ocultar contraseña':'mostrar contraseña'} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white" onClick={()=>setShow(s=>!s)}>{show?'🙈':'👁️'}</button>
    </div>
  );
}
