import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Video, ShieldCheck, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/clina/SiteLayout";
import { professionals } from "@/lib/data";
import { brl, splitConsultation } from "@/lib/finance";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profissionais/$id")({
  loader: ({ params }) => {
    const p = professionals.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({ meta: [
    { title: loaderData ? `${loaderData.name} — CLINA` : "Profissional — CLINA" },
    { name: "description", content: loaderData?.bio ?? "Perfil profissional na CLINA." },
    { property: "og:title", content: loaderData ? `${loaderData.name} — ${loaderData.category}` : "CLINA" },
    { property: "og:description", content: loaderData?.bio ?? "Perfil profissional na CLINA." },
    ...(loaderData ? [{ property: "og:image", content: loaderData.photo }, { name: "twitter:image", content: loaderData.photo }] : []),
  ] }),
  notFoundComponent: () => <SiteLayout><p className="p-20 text-center">Profissional não encontrado. <Link to="/profissionais" search={{ q: "" }} className="text-primary underline">Voltar</Link></p></SiteLayout>,
  component: Profile,
});

const days = ["Hoje", "Amanhã", "Qui", "Sex", "Seg"];
const hours = ["09:00", "10:30", "14:00", "16:00", "18:00", "20:00"];

function Profile() {
  const p = Route.useLoaderData();
  const [day, setDay] = useState(days[0]!);
  const [hour, setHour] = useState<string | null>(null);
  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="flex flex-col gap-6 rounded-3xl border border-border bg-surface p-8 shadow-soft sm:flex-row">
            <img src={p.photo} alt={p.name} className="h-36 w-36 rounded-2xl object-cover" />
            <div>
              <h1 className="text-4xl text-primary">{p.name}</h1>
              <p className="mt-1 text-muted-foreground">{p.category} · {p.approach}</p>
              <p className="mt-3 flex items-center gap-2 text-sm"><ShieldCheck className="h-4 w-4 text-primary" /> {p.register} — registro validado</p>
              <p className="mt-1 flex items-center gap-2 text-sm"><GraduationCap className="h-4 w-4 text-primary" /> {p.education}</p>
              <p className="mt-1 flex items-center gap-2 text-sm"><Star className="h-4 w-4 fill-sand text-sand" /> {p.rating} · {p.reviews} avaliações</p>
            </div>
          </div>
          <div className="rounded-3xl border border-border bg-surface p-8">
            <h2 className="text-2xl text-primary">Sobre</h2>
            <p className="mt-3 text-muted-foreground">{p.bio}</p>
            <h3 className="mt-6 font-sans font-bold">Especialidades</h3>
            <div className="mt-2 flex flex-wrap gap-2">{p.specialties.map((s) => <span key={s} className="rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground">{s}</span>)}</div>
            <h3 className="mt-6 font-sans font-bold">Público atendido</h3>
            <p className="text-muted-foreground">{p.audience.join(", ")}</p>
          </div>
        </div>
        <aside className="h-fit rounded-3xl border border-border bg-surface p-6 shadow-soft lg:sticky lg:top-28">
          <p className="text-2xl font-bold">{brl(p.price)} <span className="text-sm font-normal text-muted-foreground">/ {p.duration} min</span></p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><Video className="h-4 w-4" /> Teleconsulta</p>
          <div className="mt-5 flex gap-2 overflow-x-auto">{days.map((d) => (
            <button key={d} onClick={() => setDay(d)} className={`rounded-xl border px-3 py-2 text-sm ${day === d ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{d}</button>
          ))}</div>
          <div className="mt-3 grid grid-cols-3 gap-2">{hours.map((h) => (
            <button key={h} onClick={() => setHour(h)} className={`rounded-lg border py-2 text-sm ${hour === h ? "border-primary bg-accent font-semibold text-primary" : "border-border"}`}>{h}</button>
          ))}</div>
          <Button className="mt-5 w-full rounded-full" disabled={!hour} onClick={() => toast.success(`Pré-agendado: ${day} às ${hour}. Pagamento será habilitado ao conectar o backend.`)}>Agendar consulta</Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">Pagamento seguro. Do valor, {brl(splitConsultation(p.price).professional)} vão para o profissional.</p>
        </aside>
      </div>
    </SiteLayout>
  );
}