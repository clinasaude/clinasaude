import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { SiteLayout } from "@/components/clina/SiteLayout";
import { ProCard } from "@/components/clina/ProCard";
import { professionals, specialties, approaches, audiences } from "@/lib/data";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/profissionais/")({
  validateSearch: zodValidator(z.object({ q: fallback(z.string(), "").default("") })),
  head: () => ({ meta: [
    { title: "Encontrar profissionais — CLINA" },
    { name: "description", content: "Psicólogos, psiquiatras e psicanalistas com registro validado. Filtre por especialidade, abordagem e preço." },
    { property: "og:title", content: "Encontrar profissionais — CLINA" },
    { property: "og:description", content: "Busque e agende com profissionais de saúde mental." },
  ] }),
  component: Market,
});

function toggle(list: string[], v: string) { return list.includes(v) ? list.filter((x) => x !== v) : [...list, v]; }

function Market() {
  const { q: initial } = Route.useSearch();
  const [q, setQ] = useState(initial);
  const [cats, setCats] = useState<string[]>([]);
  const [specs, setSpecs] = useState<string[]>([]);
  const [apps, setApps] = useState<string[]>([]);
  const [aud, setAud] = useState<string[]>([]);
  const [max, setMax] = useState(400);
  const [minRating, setMinRating] = useState(0);
  const [today, setToday] = useState(false);

  const list = useMemo(() => professionals.filter((p) => {
    const t = q.toLowerCase();
    if (t && ![p.name, p.approach, p.category, ...p.specialties].some((x) => x.toLowerCase().includes(t))) return false;
    if (cats.length && !cats.includes(p.category)) return false;
    if (specs.length && !specs.some((s) => p.specialties.includes(s))) return false;
    if (apps.length && !apps.includes(p.approach)) return false;
    if (aud.length && !aud.some((a) => p.audience.includes(a))) return false;
    if (p.price > max || p.rating < minRating) return false;
    if (today && !p.nextSlot.startsWith("Hoje")) return false;
    return true;
  }), [q, cats, specs, apps, aud, max, minRating, today]);

  const Group = ({ title, items, value, set }: { title: string; items: string[]; value: string[]; set: (v: string[]) => void }) => (
    <div><p className="mb-2 text-sm font-semibold">{title}</p><div className="space-y-2">{items.map((i) => (
      <label key={i} className="flex items-center gap-2 text-sm text-muted-foreground"><Checkbox checked={value.includes(i)} onCheckedChange={() => set(toggle(value, i))} />{i}</label>
    ))}</div></div>
  );

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="text-4xl text-primary">Encontre seu profissional</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, especialidade ou abordagem" className="mt-6 w-full rounded-full border border-border bg-surface px-5 py-3 text-sm shadow-soft outline-none focus:border-primary" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="space-y-6 rounded-2xl border border-border bg-surface p-5 h-fit">
            <Group title="Área" items={["Psicologia", "Psiquiatria", "Psicanálise"]} value={cats} set={setCats} />
            <Group title="Especialidades" items={specialties} value={specs} set={setSpecs} />
            <Group title="Abordagem" items={approaches} value={apps} set={setApps} />
            <Group title="Público atendido" items={audiences} value={aud} set={setAud} />
            <div><p className="mb-3 text-sm font-semibold">Preço até R$ {max}</p><Slider min={100} max={400} step={10} value={[max]} onValueChange={(v) => setMax(v[0] ?? 400)} /></div>
            <div><p className="mb-2 text-sm font-semibold">Avaliação mínima</p><div className="flex gap-1">{[0, 4.5, 4.8].map((r) => (
              <button key={r} onClick={() => setMinRating(r)} className={`rounded-full border px-3 py-1 text-xs ${minRating === r ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{r ? `${r}+` : "Todas"}</button>
            ))}</div></div>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={today} onCheckedChange={(v) => setToday(!!v)} /> Disponível hoje</label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground"><Checkbox checked disabled /> Atendimento online</label>
          </aside>
          <div>
            <p className="mb-4 text-sm text-muted-foreground">{list.length} profissionais encontrados</p>
            <div className="grid gap-5 md:grid-cols-2">{list.map((p) => <ProCard key={p.id} p={p} />)}</div>
            {!list.length && <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Nenhum profissional com esses filtros.</p>}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}