import { Link } from "@tanstack/react-router";
import { Heart, Star, Clock, Video } from "lucide-react";
import { useState } from "react";
import type { Professional } from "@/lib/data";
import { brl } from "@/lib/finance";
import { Button } from "@/components/ui/button";

export function ProCard({ p }: { p: Professional }) {
  const [fav, setFav] = useState(false);
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5">
      <div className="flex gap-4">
        <img src={p.photo} alt={p.name} className="h-20 w-20 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-sans text-base font-bold">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.category} · {p.approach}</p>
            </div>
            <button aria-label="Favoritar" onClick={() => setFav(!fav)} className="rounded-full p-2 hover:bg-muted">
              <Heart className={fav ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4 text-muted-foreground"} />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{p.register} · {p.education}</p>
          <p className="mt-1 flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-sand text-sand" /> <b>{p.rating}</b> <span className="text-muted-foreground">({p.reviews})</span></p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{p.specialties.map((s) => <span key={s} className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">{s}</span>)}</div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <div>
          <p className="font-semibold">{brl(p.price)} <span className="font-normal text-muted-foreground">/ {p.duration} min</span></p>
          <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {p.nextSlot} {p.online && <><Video className="ml-1 h-3 w-3" /> Online</>}</p>
        </div>
        <Button asChild size="sm" className="rounded-full"><Link to="/profissionais/$id" params={{ id: p.id }}>Ver perfil</Link></Button>
      </div>
    </article>
  );
}