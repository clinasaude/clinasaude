import { Link } from "@tanstack/react-router";
import { Heart, Star, Video } from "lucide-react";
import { useState } from "react";
import type { Professional } from "@/lib/data";
import { brl } from "@/lib/finance";
import { Button } from "@/components/ui/button";

export function ProCard({ p }: { p: Professional }) {
  const [fav,setFav]=useState(false);
  const price=p.session_price_cents/100;
  return <article className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5">
    <div className="flex gap-4"><div className="flex h-20 w-20 items-center justify-center rounded-xl bg-accent text-2xl font-semibold text-primary">{p.public_name.slice(0,1).toUpperCase()}</div>
      <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-sans text-base font-bold">{p.public_name}</h3><p className="text-sm text-muted-foreground">{p.category}</p></div>
      <button aria-label="Favoritar" onClick={()=>setFav(!fav)} className="rounded-full p-2 hover:bg-muted"><Heart className={fav?"h-4 w-4 fill-primary text-primary":"h-4 w-4 text-muted-foreground"}/></button></div>
      <p className="mt-1 text-xs text-muted-foreground">{p.registration_type} {p.registration_number}</p>
      {p.rating!==null&&p.reviews_count>0&&<p className="mt-1 flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-sand text-sand"/><b>{p.rating.toFixed(1)}</b><span className="text-muted-foreground">({p.reviews_count})</span></p>}
    </div></div>
    <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{p.biography||"Perfil profissional aprovado pela equipe CLINA."}</p>
    <div className="mt-3 flex flex-wrap gap-1.5">{(p.specialties??[]).map(s=><span key={s} className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">{s}</span>)}</div>
    <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm"><div><p className="font-semibold">{brl(price)} <span className="font-normal text-muted-foreground">/ {p.session_duration_minutes} min</span></p><p className="flex items-center gap-1 text-xs text-muted-foreground"><Video className="h-3 w-3"/> Teleconsulta</p></div>
    <Button asChild size="sm" className="rounded-full"><Link to="/profissionais/$id" params={{id:p.user_id}}>Ver perfil</Link></Button></div>
  </article>;
}
