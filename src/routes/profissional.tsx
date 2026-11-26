import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Users, FileLock2, Wallet, Lock } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout as BasePortalLayout, Panel, Stat } from "@/components/clina/PortalLayout";
import { RequireAuth } from "@/components/clina/RequireAuth";
import type { ComponentProps } from "react";
import { brl, splitConsultation } from "@/lib/finance";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/profissional")({
  head: () => ({ meta: [
    { title: "Portal do profissional — CLINA" },
    { name: "description", content: "Agenda, CRM de pacientes, prontuário eletrônico sigiloso e extrato financeiro." },
    { property: "og:title", content: "Portal do profissional — CLINA" },
    { property: "og:description", content: "Gerencie sua clínica digital na CLINA." },
  ] }),
  component: Pro,
});

const nav = [
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "crm", label: "Pacientes (CRM)", icon: Users },
  { key: "pront", label: "Prontuário", icon: FileLock2 },
  { key: "fin", label: "Extrato financeiro", icon: Wallet },
];
const patients = [
  { name: "Lucas Martins", status: "Ativo", sessions: 12, last: "19/11", tag: "Ansiedade" },
  { name: "Beatriz Rocha", status: "Ativo", sessions: 5, last: "21/11", tag: "Autoestima" },
  { name: "Felipe Duarte", status: "Em pausa", sessions: 20, last: "02/10", tag: "Burnout" },
  { name: "Camila Nunes", status: "Novo", sessions: 0, last: "—", tag: "Triagem" },
];
const slots = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const booked: Record<string, string> = { "Seg-09:00": "Beatriz R.", "Seg-18:00": "Lucas M.", "Ter-14:00": "Camila N.", "Qua-10:00": "Felipe D.", "Qui-18:00": "Lucas M." };
const tx = [
  { date: "21/11", patient: "Beatriz Rocha", gross: 150 },
  { date: "19/11", patient: "Lucas Martins", gross: 150 },
  { date: "18/11", patient: "Camila Nunes", gross: 150 },
  { date: "14/11", patient: "Felipe Duarte", gross: 150 },
];

function PortalLayout(props: ComponentProps<typeof BasePortalLayout>) {
  return <RequireAuth allowedRoles={["professional"]}><BasePortalLayout {...props} /></RequireAuth>;
}

function Pro() {
  const [tab, setTab] = useState("agenda");
  const [sel, setSel] = useState(patients[0]!.name);
  const [notes, setNotes] = useState<Record<string, { date: string; text: string }[]>>({ "Lucas Martins": [{ date: "19/11", text: "Paciente relata melhora no sono. Mantida técnica de reestruturação cognitiva." }] });
  const [draft, setDraft] = useState("");
  const total = tx.reduce((s, t) => s + splitConsultation(t.gross).professional, 0);
  return (
    <PortalLayout title={nav.find((n) => n.key === tab)!.label} role="Profissional · Dra. Ana Ribeiro" nav={nav} active={tab} onChange={setTab}>
      {tab === "agenda" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4"><Stat label="Sessões na semana" value="5" /><Stat label="Taxa de ocupação" value="62%" /><Stat label="Pacientes ativos" value="3" hint="Plano Free: até 10" /><Stat label="Plano" value="Free" hint="Premium R$ 59,90/mês" /></div>
          <Panel title="Semana de 25 a 29/11">
            <div className="overflow-x-auto"><div className="grid min-w-[640px] grid-cols-6 gap-1 text-sm">
              <div />{["Seg", "Ter", "Qua", "Qui", "Sex"].map((d) => <div key={d} className="py-2 text-center font-semibold">{d}</div>)}
              {slots.map((h) => [<div key={h} className="py-2 text-xs text-muted-foreground">{h}</div>, ...["Seg", "Ter", "Qua", "Qui", "Sex"].map((d) => {
                const b = booked[`${d}-${h}`];
                return <div key={d + h} className={`rounded-md px-2 py-2 text-xs ${b ? "bg-primary text-primary-foreground" : "bg-muted/60"}`}>{b ?? ""}</div>;
              })])}
            </div></div>
          </Panel>
        </div>
      )}
      {tab === "crm" && (
        <Panel title="Pacientes">
          <Table><TableHeader><TableRow><TableHead>Paciente</TableHead><TableHead>Status</TableHead><TableHead>Sessões</TableHead><TableHead>Última</TableHead><TableHead>Tag</TableHead><TableHead /></TableRow></TableHeader>
            <TableBody>{patients.map((p) => (
              <TableRow key={p.name}><TableCell className="font-semibold">{p.name}</TableCell><TableCell>{p.status}</TableCell><TableCell>{p.sessions}</TableCell><TableCell>{p.last}</TableCell>
                <TableCell><span className="rounded-full bg-accent px-2 py-0.5 text-xs text-primary">{p.tag}</span></TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => { setSel(p.name); setTab("pront"); }}>Prontuário</Button></TableCell></TableRow>
            ))}</TableBody></Table>
        </Panel>
      )}
      {tab === "pront" && (
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <Panel title="Pacientes">{patients.map((p) => (
            <button key={p.name} onClick={() => setSel(p.name)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${sel === p.name ? "bg-accent font-semibold text-primary" : "hover:bg-muted"}`}>{p.name}</button>
          ))}</Panel>
          <Panel title={`Prontuário — ${sel}`} action={<span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"><Lock className="h-3 w-3" /> Sigilo absoluto</span>}>
            <p className="mb-4 rounded-xl bg-muted p-3 text-xs text-muted-foreground">Acesso restrito ao profissional responsável. Nem a administração da CLINA visualiza o conteúdo. Cada acesso é registrado na auditoria.</p>
            <Textarea rows={5} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Evolução da sessão..." />
            <Button className="mt-3 rounded-full" disabled={!draft.trim()} onClick={() => { setNotes({ ...notes, [sel]: [{ date: "Hoje", text: draft.trim() }, ...(notes[sel] ?? [])] }); setDraft(""); toast.success("Evolução registrada"); }}>Registrar evolução</Button>
            <div className="mt-6 space-y-3">{(notes[sel] ?? []).map((n, i) => <div key={i} className="rounded-xl border border-border p-4"><p className="text-xs font-semibold text-muted-foreground">{n.date}</p><p className="mt-1 text-sm">{n.text}</p></div>)}
              {!(notes[sel] ?? []).length && <p className="text-sm text-muted-foreground">Nenhuma evolução registrada.</p>}</div>
          </Panel>
        </div>
      )}
      {tab === "fin" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3"><Stat label="Bruto em novembro" value={brl(tx.length * 150)} /><Stat label="Líquido (80%)" value={brl(total)} hint="Antes de taxas externas" /><Stat label="Próximo repasse" value="05/12" /></div>
          <Panel title="Extrato">
            <Table><TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Paciente</TableHead><TableHead>Valor</TableHead><TableHead>Comissão CLINA (20%)</TableHead><TableHead>Seu repasse (80%)</TableHead></TableRow></TableHeader>
              <TableBody>{tx.map((t, i) => { const s = splitConsultation(t.gross); return (
                <TableRow key={i}><TableCell>{t.date}</TableCell><TableCell>{t.patient}</TableCell><TableCell>{brl(t.gross)}</TableCell><TableCell className="text-muted-foreground">−{brl(s.platform)}</TableCell><TableCell className="font-semibold text-primary">{brl(s.professional)}</TableCell></TableRow>
              ); })}</TableBody></Table>
          </Panel>
        </div>
      )}
    </PortalLayout>
  );
}