
'use client';
import { useRouter } from 'next/navigation';
type Node={id:string;label:string;x:number;y:number;route:string;};
const NODES:Node[]=[
  {id:'origen',label:'Origen',x:50,y:50,route:'/dashboard'},
  {id:'jardin',label:'Jardín',x:20,y:70,route:'/dashboard'},
  {id:'ecos',label:'Ecos Lejanos',x:80,y:65,route:'/dashboard'},
  {id:'trans',label:'Transformación',x:30,y:30,route:'/dashboard'},
  {id:'refugio',label:'Refugio',x:70,y:30,route:'/dashboard'},
  {id:'mural',label:'Mural',x:50,y:80,route:'/dashboard'}
];
const EDGES=[['origen','jardin'],['origen','ecos'],['origen','trans'],['origen','refugio'],['origen','mural'],['jardin','trans'],['ecos','refugio']];
export default function ConstellationGraph(){
  const r=useRouter(); const width=800,height=480;
  return (
    <div className="relative rounded-2xl overflow-hidden ecos-glow">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block">
        <defs>
          <radialGradient id="bg" cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="rgba(255,255,255,0.08)"/><stop offset="100%" stopColor="rgba(0,0,0,0.6)"/></radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)" />
        {EDGES.map(([a,b],i)=>{const A=NODES.find(n=>n.id===a)!;const B=NODES.find(n=>n.id===b)!;return <line key={i} x1={(A.x/100)*width} y1={(A.y/100)*height} x2={(B.x/100)*width} y2={(B.y/100)*height} stroke="rgba(200,220,255,.25)" strokeWidth="1.2" />;})}
        {NODES.map(n=>(
          <g key={n.id} transform={`translate(${(n.x/100)*width}, ${(n.y/100)*height})`} onClick={()=>r.push(n.route)} style={{cursor:'pointer'}}>
            <circle r="8" fill="white" filter="url(#glow)" />
            <text x="12" y="5" fill="white" opacity=".85" fontSize="14">{n.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
