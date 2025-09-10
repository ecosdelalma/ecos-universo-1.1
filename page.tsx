
import Link from 'next/link';
export default function Home(){
  return (
    <section className="relative min-h-[80vh] rounded-2xl overflow-hidden ecos-glow">
      <video className="absolute inset-0 w-full h-full object-cover" src="/background.mp4" autoPlay muted loop playsInline />
      <div className="hero-overlay" />
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-4xl md:text-5xl mb-4 lowercase tracking-wide">todo comienza con un eco</h1>
        <p className="text-white/80 max-w-xl">entra cuando estés listo • un espacio etéreo y humano</p>
        <div className="mt-6 flex gap-3">
          <Link className="ecos-primary" href="/signup">be ecos</Link>
          <Link className="ecos-ghost" href="/login">ya tengo cuenta</Link>
        </div>
      </div>
    </section>
  );
}
