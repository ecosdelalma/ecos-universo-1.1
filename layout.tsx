
import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/components/Nav';
export const metadata: Metadata = { title:'Ecos Universe', description:'MVP emocional – ecos' };
export default function RootLayout({ children }:{ children:React.ReactNode }){
  return (<html lang="es"><body><Nav/><main className="container">{children}</main></body></html>);
}
