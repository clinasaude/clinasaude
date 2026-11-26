import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, BadgeCheck, Users, Percent, CreditCard, ScrollText, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip, Line, LineChart } from "recharts";
import { PortalLayout, Panel, Stat } from "@/components/clina/PortalLayout";
import { brl, splitConsultation, PLATFORM_FEE, PRO_PREMIUM_PRICE, PATIENT_PLUS_PRICE } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Super Painel — CLINA" },
    { name: "description", content: "Métricas 360º, validação de registros, usuários, split, assinaturas e auditoria LGPD." },
    { property: "og:title", content: "Super Painel — CLINA" },
    { property: "og:description", content: "Administração da plataforma CLINA." },
  ] }),
  component: Admin,
});

const nav = [
  { key: "dash", label: "Dashboard 360º", icon: LayoutDashboard },
  { key: "valid", label: "Validação CRP/CRM", icon: BadgeCheck },
  { key: "users", label: "Usuários", icon: Users },
  { key: "split", label: "Split de comissão", icon: Percent },
  { key: "subs", label: "Assinaturas", icon: CreditCard },
  { key: "audit", label: "Auditoria e LGPD", icon: ScrollText },
];
const revenue = ["Jun", "Jul", "Ago", "Set", "Out", "Nov"].map((m, i) => ({ m, gmv: [42, 51, 63, 70, 86, 104][i]! * 1000, users: [820, 1040, 1310, 1620, 1980, 2410][i] }));
const initialQueue = [
  { id: 1, name: "Mariana Teixeira", reg: "CRP 06/778899", area: "Psicologia", sent: "Hoje, 09:12" },
  { id: 2, name: "Dr. Gustavo Prado", reg: "CRM-MG 33221", area: "Psiquiatria", sent: "Ontem, 17:40" },
  { id: 3, name: "Letícia Barros", reg: "CRP 08/445566", area: "Psicologia", sent: "Ontem, 11:05" },
];
const users = [
  { name: "Lucas Martins", role: "Paciente", plan: "Plus", status: "Ativo" },
  { name: "Dra. Ana Ribeiro", role: "Profissional", plan: "Free", status: "Ativo" },
  { name: "Dra. Marina Souza", role: "Profissional", plan: "Premium", status: "Ativo" },
  { name: "Beatriz Rocha", role: "Paciente", plan: "Free", status: "Ativo" },
  { name: "Felipe Duarte", role: "Paciente", plan: "Free", status: "Suspenso" },
];
const audit = [
  { at: "26/11 00:12", who: "Dra. Ana Ribeiro", act: "Acessou prontuário (paciente #1042)", ip: "189.40.x.x" },
  { at: "25/11 22:30", who: "admin@clina", act: "Aprovou registro CRP 04/112233", ip: "200.10.x.x" },
  { at: "25/11 19:02", who: "Felipe Duarte", act: "Solicitou exportação de dados (LGPD Art. 18)", ip: "177.22.x.x" },
  { at: "25/11 14:45", who: "admin@clina", act: "Alterou preço Premium", ip: "200.10.x.x" },
];

function Admin() {
  const [tab, setTab] = useState("dash");
  const [queue, setQueue] = useState(initialQueue);
  const [sim, setSim] = useState(150);
  const [premium, setPremium] = useState(PRO_PREMIUM_PRICE);
  const s = splitConsultation(sim);
  const decide = (id: number, ok: boolean) => { setQueue(queue.filter((q) => q.id !== id)); toast[ok ? "success" : "error"](ok ? "Registro aprovado" : "Registro recusado"); };
  return (
    <PortalLayout title={nav.find((n) => n.key === tab)!.label} role="Super administrador" nav={nav} active={tab} onChange={setTab}>
      {tab === "dash" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Stat label="GMV novembro" value={brl(104000)} hint="+21% vs outubro" />
            <Stat label="Receita CLINA (20%)" value={brl(104000 * PLATFORM_FEE)} />
            <Stat label="MRR assinaturas" value={brl(312 * PRO_PREMIUM_PRICE + 540 * PATIENT_PLUS_PRICE)} hint="312 Premium · 540 Plus" />
            <Stat label="Usuários ativos" value="2.410" hint="486 profissionais" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="GMV mensal"><div className="h-60"><ResponsiveContainer width="100%" height="100%"><BarChart data={revenue}><XAxis dataKey="m" fontSize={12} /><Tooltip formatter={(v: number) => brl(v)} /><Bar dataKey="gmv" fill="var(--color-primary)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Panel>
            <Panel title="Crescimento de usuários"><div className="h-60"><ResponsiveContainer width="100%" height="100%"><LineChart data={revenue}><XAxis dataKey="m" fontSize={12} /><Tooltip /><Line dataKey="users" stroke="var(--color-chart-4)" strokeWidth={2.5} /></LineChart></ResponsiveContainer></div></Panel>
          </div>
        </div>
      )}
      {tab === "valid" && (
        <Panel title={`Fila de validação (${queue.length})`}>
          {queue.map((q) => (
            <div key={q.id} className="flex flex-wrap items-center gap-4 border-b border-border py-4 last:border-0">
              <div className="flex-1"><p className="font-semibold">{q.name}</p><p className="text-sm text-muted-foreground">{q.area} · {q.reg} · enviado {q.sent}</p></div>
              <Button size="sm" variant="outline" onClick={() => toast("Consulta ao conselho será feita via backend")}>Consultar conselho</Button>
              <Button size="sm" onClick={() => decide(q.id, true)}><Check className="h-4 w-4" /> Aprovar</Button>
              <Button size="sm" variant="destructive" onClick={() => decide(q.id, false)}><X className="h-4 w-4" /> Recusar</Button>
            </div>
          ))}
          {!queue.length && <p className="text-sm text-muted-foreground">Fila vazia. Tudo validado.</p>}
        </Panel>
      )}
      {tab === "users" && (
        <Panel title="Usuários">
          <Table><TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Perfil</TableHead><TableHead>Plano</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{users.map((u) => (
              <TableRow key={u.name}><TableCell className="font-semibold">{u.name}</TableCell><TableCell>{u.role}</TableCell><TableCell>{u.plan}</TableCell>
                <TableCell><span className={`rounded-full px-2 py-0.5 text-xs ${u.status === "Ativo" ? "bg-accent text-primary" : "bg-sand text-foreground"}`}>{u.status}</span></TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => toast(`${u.status === "Ativo" ? "Suspensão" : "Reativação"} registrada na auditoria`)}>{u.status === "Ativo" ? "Suspender" : "Reativar"}</Button></TableCell></TableRow>
            ))}</TableBody></Table>
        </Panel>
      )}
      {tab === "split" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Regra vigente">
            <div className="flex h-10 overflow-hidden rounded-full text-sm font-semibold"><div className="flex w-1/5 items-center justify-center bg-sand">CLINA 20%</div><div className="flex flex-1 items-center justify-center bg-primary text-primary-foreground">Profissional 80%</div></div>
            <p className="mt-4 text-sm text-muted-foreground">Aplicada a toda consulta paga. Taxas externas do provedor de pagamento são descontadas do repasse conforme contrato.</p>
          </Panel>
          <Panel title="Simulador">
            <label className="text-sm">Valor da consulta (R$)</label>
            <Input type="number" min={0} max={10000} value={sim} onChange={(e) => setSim(Math.max(0, Math.min(10000, Number(e.target.value) || 0)))} className="mt-1" />
            <div className="mt-4 grid grid-cols-2 gap-3"><Stat label="CLINA" value={brl(s.platform)} /><Stat label="Profissional" value={brl(s.professional)} /></div>
          </Panel>
        </div>
      )}
      {tab === "subs" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4"><Stat label="Profissionais Free" value="174" /><Stat label="Profissionais Premium" value="312" /><Stat label="Pacientes Plus" value="540" /><Stat label="Churn mensal" value="2,8%" /></div>
          <Panel title="Preços configuráveis">
            <div className="grid gap-4 md:grid-cols-3">
              <div><label className="text-sm">Profissional Free</label><Input value="R$ 0,00" disabled className="mt-1" /></div>
              <div><label className="text-sm">Profissional Premium (R$/mês)</label><Input type="number" step="0.1" value={premium} onChange={(e) => setPremium(Number(e.target.value))} className="mt-1" /></div>
              <div><label className="text-sm">Paciente Clina Plus (R$/mês)</label><Input value={PATIENT_PLUS_PRICE} disabled className="mt-1" /></div>
            </div>
            <Button className="mt-4 rounded-full" onClick={() => toast.success(`Preço Premium definido em ${brl(premium)} (persistência requer backend)`)}>Salvar preços</Button>
          </Panel>
        </div>
      )}
      {tab === "audit" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3"><Stat label="Solicitações LGPD abertas" value="2" hint="Prazo legal: 15 dias" /><Stat label="Acessos a prontuários (24h)" value="148" /><Stat label="Consentimentos ativos" value="99,2%" /></div>
          <Panel title="Trilha de auditoria (imutável)">
            <Table><TableHeader><TableRow><TableHead>Data/hora</TableHead><TableHead>Usuário</TableHead><TableHead>Ação</TableHead><TableHead>IP</TableHead></TableRow></TableHeader>
              <TableBody>{audit.map((a, i) => <TableRow key={i}><TableCell className="whitespace-nowrap">{a.at}</TableCell><TableCell>{a.who}</TableCell><TableCell>{a.act}</TableCell><TableCell className="text-muted-foreground">{a.ip}</TableCell></TableRow>)}</TableBody></Table>
          </Panel>
        </div>
      )}
    </PortalLayout>
  );
}