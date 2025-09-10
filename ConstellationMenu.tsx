
'use client';
export const CONSTELLATIONS=[
  {value:'origen',label:'Origen (predeterminado)'},
  {value:'jardin',label:'Jardín de la Escucha'},
  {value:'ecos_lejanos',label:'Rincón de los Ecos Lejanos'},
  {value:'transformacion',label:'Camino de la Transformación'},
  {value:'refugio',label:'El Refugio'},
  {value:'mural',label:'Mural de Creaciones'}
];
export default function ConstellationMenu({name,defaultValue}:{name:string;defaultValue?:string}){
  return (
    <select className="px-3 py-2 rounded bg-white/10 border border-white/20 w-full" name={name} defaultValue={defaultValue||'origen'} required>
      {CONSTELLATIONS.map(c=>(<option key={c.value} value={c.value}>{c.label}</option>))}
    </select>
  );
}
