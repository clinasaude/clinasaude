import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShieldCheck, CalendarCheck, Video, HeartHandshake, Sparkles, Lock, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/clina/SiteLayout";
import { ProCard } from "@/components/clina/ProCard";
import { professionals, specialties } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "CLINA — Sua saúde merece cuidado" },
    { name: "description", content: "Encontre psicólogos, psiquiatras e psicanalistas e cuide da sua saúde mental com segurança e acolhimento." },
    { property: "og:title", content: "CLINA — Sua saúde merece cuidado" },
    { property: "og:description", content: "Marketplace e clínica digital de saúde mental." },
  ] }),
  component: Home,
});

const faq = [
  ["Como escolho um profissional?", "Use os filtros por especialidade, abordagem, preço e disponibilidade, e leia o perfil completo antes de agendar."],
  ["As consultas são sigilosas?", "Sim. Prontuários são acessíveis somente ao profissional responsável, com criptografia e trilha de auditoria conforme a LGPD."],
  ["Preciso do Clina Plus para ser atendido?", "Não. O Plus oferece recursos de bem-estar e nunca bloqueia o acesso a atendimento clínico."],
  ["Como funciona para profissionais?", "Cadastro gratuito, validação do registro (CRP/CRM) e repasse de 80% de cada consulta paga."],
];

function Home() {
  const [q, setQ] = useState("");
  const nav = useNavigate();
  return (
    <SiteLayout>
      <section className="relative overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-sage/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-[380px] w-[380px] rounded-full bg-sand/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary"><ShieldCheck className="h-3.5 w-3.5" /> Profissionais com registro validado</span>
            <h1 className="mt-6 text-5xl font-medium leading-[1.05] text-primary md:text-7xl">Sua saúde merece <em className="text-chart-4">cuidado.</em></h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">Encontre profissionais que acolhem você e cuide da sua saúde mental com mais praticidade, segurança e acolhimento.</p>
            <form onSubmit={(e) => { e.preventDefault(); nav({ to: "/profissionais", search: { q } }); }} className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-border bg-surface p-2 shadow-soft">
              <Search className="ml-3 h-5 w-5 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Especialidade, nome ou abordagem" className="flex-1 bg-transparent px-2 text-sm outline-none" />
              <Button type="submit" className="rounded-full">Encontrar profissional</Button>
            </form>
            <div className="mt-4 flex gap-3"><Button variant="outline" asChild className="rounded-full"><Link to="/profissional">Sou profissional</Link></Button></div>
          </div>
          <div className="relative hidden lg:block">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <p className="text-sm text-muted-foreground">Próxima sessão</p>
              <div className="mt-3 flex items-center gap-4">
                <img src={professionals[0]!.photo} alt="" className="h-14 w-14 rounded-xl object-cover" />
                <div><p className="font-semibold">{professionals[0]!.name}</p><p className="text-sm text-muted-foreground">Hoje às 18:00 · Teleconsulta</p></div>
                <Button size="sm" className="ml-auto rounded-full"><Video className="h-4 w-4" /> Entrar</Button>
              </div>
            </div>
            <div className="ml-16 mt-5 rounded-3xl bg-primary p-6 text-primary-foreground shadow-soft">
              <p className="text-sm opacity-80">Check-in de hoje</p>
              <p className="mt-2 font-display text-2xl">Como você está se sentindo?</p>
              <div className="mt-4 flex gap-2 text-2xl">{["😔", "😕", "😐", "🙂", "😊"].map((e) => <span key={e} className="rounded-xl bg-sidebar-accent px-3 py-2">{e}</span>)}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl text-primary">Especialidades</h2>
        <div className="mt-6 flex flex-wrap gap-3">{specialties.map((s) => (
          <Link key={s} to="/profissionais" search={{ q: s }} className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium hover:border-primary hover:text-primary">{s}</Link>
        ))}</div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-end justify-between"><h2 className="text-3xl text-primary">Profissionais em destaque</h2><Link to="/profissionais" search={{ q: "" }} className="flex items-center gap-1 text-sm font-semibold text-primary">Ver todos <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{professionals.slice(0, 3).map((p) => <ProCard key={p.id} p={p} />)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl text-primary">Como funciona</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          {[[Search, "Busque", "Filtre por especialidade, abordagem e preço."], [CalendarCheck, "Agende", "Escolha o horário que cabe na sua rotina."], [Video, "Converse", "Teleconsulta segura, direto na plataforma."], [HeartHandshake, "Acompanhe", "Diário emocional e check-ins entre sessões."]].map(([I, t, d], i) => {
            const Icon = I as typeof Search;
            return <div key={i} className="rounded-2xl bg-surface p-6 shadow-soft"><span className="text-xs font-semibold text-muted-foreground">0{i + 1}</span><Icon className="mt-3 h-6 w-6 text-primary" /><h3 className="mt-3 font-sans font-bold">{t as string}</h3><p className="mt-1 text-sm text-muted-foreground">{d as string}</p></div>;
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 lg:grid-cols-2">
        <div className="rounded-3xl bg-primary p-10 text-primary-foreground">
          <Lock className="h-6 w-6" />
          <h2 className="mt-4 text-3xl">Para profissionais</h2>
          <p className="mt-3 opacity-85">Agenda, CRM, prontuário eletrônico com sigilo absoluto e extrato financeiro. Você recebe 80% de cada consulta.</p>
          <Button asChild variant="secondary" className="mt-6 rounded-full"><Link to="/planos">Conhecer planos</Link></Button>
        </div>
        <div className="rounded-3xl bg-sand/60 p-10">
          <Sparkles className="h-6 w-6 text-primary" />
          <h2 className="mt-4 text-3xl text-primary">Clina Plus</h2>
          <p className="mt-3 text-muted-foreground">Diário emocional avançado, meditações, trilhas de bem-estar e metas por R$ 19,90/mês.</p>
          <Button asChild className="mt-6 rounded-full"><Link to="/planos">Assinar Plus</Link></Button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="text-center text-3xl text-primary">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-8">{faq.map(([q, a]) => (
          <AccordionItem key={q} value={q!}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>
        ))}</Accordion>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl border border-border bg-surface p-12 text-center shadow-soft">
          <h2 className="text-4xl text-primary">Dê o primeiro passo hoje.</h2>
          <Button asChild size="lg" className="mt-6 rounded-full"><Link to="/profissionais" search={{ q: "" }}>Encontrar profissional</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}