import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { SiteLayout } from "@/components/clina/SiteLayout";
import { Button } from "@/components/ui/button";
import { brl, PRO_PREMIUM_PRICE, PATIENT_PLUS_PRICE } from "@/lib/finance";

export const Route = createFileRoute("/planos")({
  head: () => ({ meta: [
    { title: "Planos — CLINA" },
    { name: "description", content: "Planos Free e Premium para profissionais e Clina Plus para pacientes." },
    { property: "og:title", content: "Planos — CLINA" },
    { property: "og:description", content: "Free, Premium R$ 59,90 e Clina Plus R$ 19,90." },
  ] }),
  component: Plans,
});

const Plan = ({ name, price, items, featured }: { name: string; price: number; items: string[]; featured?: boolean }) => (
  <div className={`rounded-3xl border p-8 ${featured ? "border-primary bg-primary text-primary-foreground shadow-soft" : "border-border bg-surface"}`}>
    <p className="font-semibold">{name}</p>
    <p className="mt-3 font-display text-4xl">{price ? brl(price) : "Grátis"}{price > 0 && <span className="text-base opacity-70">/mês</span>}</p>
    <ul className="mt-6 space-y-2 text-sm">{items.map((i) => <li key={i} className="flex gap-2"><Check className="h-4 w-4 shrink-0" />{i}</li>)}</ul>
    <Button asChild variant={featured ? "secondary" : "default"} className="mt-8 w-full rounded-full"><Link to="/entrar">Começar</Link></Button>
  </div>
);

function Plans() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-center text-5xl text-primary">Planos para profissionais</h1>
        <p className="mt-3 text-center text-muted-foreground">Em todas as consultas pagas, você recebe 80% e a CLINA retém 20%.</p>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          <Plan name="Free" price={0} items={["Até 10 pacientes ativos", "Até 20 consultas/mês", "Perfil profissional básico", "Agenda básica"]} />
          <Plan featured name="Premium" price={PRO_PREMIUM_PRICE} items={["Pacientes ilimitados", "Agenda completa", "Prontuários e anamnese", "Relatórios e indicadores", "Templates"]} />
        </div>
        <h2 className="mt-24 text-center text-4xl text-primary">Para pacientes</h2>
        <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
          <Plan name="Free" price={0} items={["Busca e agendamentos", "Consultas e histórico", "Favoritos", "Bem-estar básico"]} />
          <Plan featured name="Clina Plus" price={PATIENT_PLUS_PRICE} items={["Diário emocional avançado e gráficos", "Meditações e exercícios", "Trilhas de bem-estar", "Lembretes e metas"]} />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">O Clina Plus nunca bloqueia o acesso a atendimento clínico.</p>
      </div>
    </SiteLayout>
  );
}