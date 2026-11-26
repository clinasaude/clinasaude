import { createFileRoute } from "@tanstack/react-router";
import { useEffect,useMemo,useState } from "react";
import { z } from "zod";
import { zodValidator,fallback } from "@tanstack/zod-adapter";
import { SiteLayout } from "@/components/clina/SiteLayout";
import { ProCard } from "@/components/clina/ProCard";
import { specialties,approaches,audiences,type Professional } from "@/lib/data";
import { listApprovedProfessionals } from "@/lib/clina-data";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export const Route=createFileRoute("/profissionais/")({
 validateSearch:zodValidator(z.object({q:fallback(z.string(),"").default("")})),
 head:()=>({meta:[{title:"Encontrar profissionais — CLINA"},{name:"description",content:"Encontre profissionais de saúde mental com registro validado."}]}),
 component:Market
});
function toggle(list:string[],v:string){return list.includes(v)?list.filter(x=>x!==v):[...list,v];}
function Market(){
 const {q:initial}=Route.useSearch();
 const [q,setQ]=useState(initial),[cat,setCat]=useState(""),[max,setMax]=useState(400);
 const [specs,setSpecs]=useState<string[]>([]),[apps,setApps]=useState<string[]>([]),[aud,setAud]=useState<string[]>([]);
 const [rows,setRows]=useState<Professional[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 useEffect(()=>{let active=true;setLoading(true);listApprovedProfessionals({...(q.trim()?{q:q.trim()}:{}),...(cat?{category:cat}:{}),maxPriceCents:max*100}).then(data=>{if(active)setRows(data as unknown as Professional[])}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Não foi possível carregar profissionais.")}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[q,cat,max]);
 const list=useMemo(()=>rows.filter(p=>(!specs.length||specs.some(s=>p.specialties?.includes(s)))&&(!apps.length||apps.some(a=>p.approaches?.includes(a)))&&(!aud.length||aud.some(a=>p.audiences?.includes(a)))),[rows,specs,apps,aud]);
 const Group=({title,items,value,set}:{title:string;items:string[];value:string[];set:(v:string[])=>void})=><div><p className="mb-2 text-sm font-semibold">{title}</p><div className="space-y-2">{items.map(i=><label key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><Checkbox checked={value.includes(i)} onCheckedChange={()=>set(toggle(value,i))}/>{i}</label>)}</div></div>;
 return <SiteLayout><div className="mx-auto max-w-7xl px-6 py-12"><h1 className="text-4xl text-primary">Encontre seu profissional</h1>
 <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nome ou especialidade" className="mt-6 w-full rounded-full border border-border bg-surface px-5 py-3 text-sm shadow-soft outline-none focus:border-primary"/>
 <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]"><aside className="h-fit space-y-6 rounded-2xl border border-border bg-surface p-5">
 <Group title="Área" items={["Psicologia","Psiquiatria","Psicanálise"]} value={cat?[cat]:[]} set={v=>setCat(v[0]??"")}/>
 <Group title="Especialidades" items={specialties} value={specs} set={setSpecs}/><Group title="Abordagem" items={approaches} value={apps} set={setApps}/><Group title="Público atendido" items={audiences} value={aud} set={setAud}/>
 <div><p className="mb-3 text-sm font-semibold">Preço máximo: R$ {max}</p><Slider min={50} max={1000} step={10} value={[max]} onValueChange={v=>setMax(v[0]??400)}/></div>
 </aside><div><p className="mb-4 text-sm text-muted-foreground">{loading?"Carregando profissionais…":`${list.length} profissionais encontrados`}</p>
 {error&&<p className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">Não foi possível consultar o marketplace: {error}</p>}
 {!loading&&!error&&<div className="grid gap-5 md:grid-cols-2">{list.map(p=><ProCard key={p.user_id} p={p}/>)}</div>}
 {!loading&&!error&&!list.length&&<p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Nenhum profissional aprovado encontrado com esses filtros.</p>}
 </div></div></div></SiteLayout>;
}
