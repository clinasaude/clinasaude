import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, Video, BookHeart, SmilePlus, Mic, MicOff, PhoneOff, Camera } from "lucide-react";
import { toast } from "sonner";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { PortalLayout, Panel, Stat } from "@/components/clina/PortalLayout";
import { professionals } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/paciente")({
  head: () => ({ meta: [
    { title: "Portal do paciente — CLINA" },
    { name: "description", content: "Agendamentos, teleconsulta, diário emocional e check-in." },
    { property: "og:title", content: "Portal do paciente — CLINA" },
    { property: "og:description", content: "Seu espaço de cuidado na CLINA." },
  ] }),
  component: Patient,
});

const nav = [
  { key: "agenda", label: "Agendamentos", icon: CalendarDays },
  { key: "tele", label: "Teleconsulta", icon: Video },
  { key: "diario", label: "Diário emocional", icon: BookHeart },
  { key: "checkin", label: "Check-in", icon: SmilePlus },
];
const moods = ["😔", "😕", "😐", "🙂", "😊"];
const week = [3, 2, 4, 3, 4, 5, 4].map((v, i) => ({ d: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i], humor: v }));

function Patient() {
  const [tab, setTab] = useState("agenda");
  const [entries, setEntries] = useState([{ date: "24/11", mood: 3, text: "Dia cansativo, mas consegui caminhar à tarde." }]);
  const [text, setText] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [mic, setMic] = useState(true);
  const appts = [
    { p: professionals[0]!, when: "Hoje · 18:00", status: "Confirmada" },
    { p: professionals[2]!, when: "Qui, 28/11 · 14:00", status: "Confirmada" },
    { p: professionals[0]!, when: "19/11 · 18:00", status: "Realizada" },
  ];
  return (
    <PortalLayout title={nav.find((n) => n.key === tab)!.label} role="Paciente · Lucas Martins" nav={nav} active={tab} onChange={setTab}>
      {tab === "agenda" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3"><Stat label="Próxima sessão" value="Hoje" hint="18:00 com Dra. Ana" /><Stat label="Sessões realizadas" value="12" /><Stat label="Sequência de check-ins" value="6 dias" /></div>
          <Panel title="Minhas consultas">
            <div className="divide-y divide-border">{appts.map((a, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <img src={a.p.photo} alt="" className="h-11 w-11 rounded-lg object-cover" />
                <div className="flex-1"><p className="font-semibold">{a.p.name}</p><p className="text-sm text-muted-foreground">{a.when}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs ${a.status === "Realizada" ? "bg-muted text-muted-foreground" : "bg-accent text-primary"}`}>{a.status}</span>
                {a.status !== "Realizada" && <Button size="sm" variant="outline" onClick={() => toast("Reagendamento solicitado")}>Reagendar</Button>}
              </div>
            ))}</div>
          </Panel>
        </div>
      )}
      {tab === "tele" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="relative aspect-video overflow-hidden rounded-3xl bg-primary">
            <img src={professionals[0]!.photo} alt="" className="h-full w-full object-cover opacity-80" />
            <div className="absolute bottom-4 right-4 flex h-28 w-40 items-center justify-center rounded-xl bg-sidebar-accent text-sm text-primary-foreground"><Camera className="mr-1 h-4 w-4" /> Você</div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
              <Button size="icon" variant="secondary" className="rounded-full" onClick={() => setMic(!mic)}>{mic ? <Mic /> : <MicOff />}</Button>
              <Button size="icon" variant="destructive" className="rounded-full" onClick={() => toast("Sessão encerrada")}><PhoneOff /></Button>
            </div>
          </div>
          <Panel title="Sala segura"><p className="text-sm text-muted-foreground">Conexão criptografada ponta a ponta. A sessão não é gravada. O provedor de vídeo será conectado na etapa de backend.</p></Panel>
        </div>
      )}
      {tab === "diario" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Novo registro">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Como foi seu dia? O que você sentiu?" rows={6} />
            <Button className="mt-3 rounded-full" disabled={!text.trim()} onClick={() => { setEntries([{ date: "Hoje", mood: mood ?? 3, text: text.trim().slice(0, 2000) }, ...entries]); setText(""); toast.success("Registro salvo no seu diário"); }}>Salvar registro</Button>
            <p className="mt-2 text-xs text-muted-foreground">Seu diário é privado. Você escolhe se compartilha com seu profissional.</p>
          </Panel>
          <Panel title="Humor da semana">
            <div className="h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={week}><XAxis dataKey="d" fontSize={12} /><YAxis domain={[1, 5]} hide /><Tooltip /><Area dataKey="humor" stroke="var(--color-primary)" fill="var(--color-sage)" /></AreaChart></ResponsiveContainer></div>
          </Panel>
          <div className="lg:col-span-2"><Panel title="Registros">{entries.map((e, i) => (
            <div key={i} className="border-b border-border py-3 last:border-0"><p className="text-sm font-semibold">{e.date} {moods[e.mood - 1]}</p><p className="text-sm text-muted-foreground">{e.text}</p></div>
          ))}</Panel></div>
        </div>
      )}
      {tab === "checkin" && (
        <Panel title="Como você está agora?">
          <div className="flex gap-3">{moods.map((m, i) => (
            <button key={m} onClick={() => setMood(i + 1)} className={`rounded-2xl border-2 px-5 py-4 text-4xl transition ${mood === i + 1 ? "border-primary bg-accent" : "border-border"}`}>{m}</button>
          ))}</div>
          <Button className="mt-6 rounded-full" disabled={!mood} onClick={() => toast.success("Check-in registrado. Obrigado por cuidar de você.")}>Registrar check-in</Button>
          <p className="mt-6 rounded-xl bg-sand/50 p-4 text-sm">Se você estiver em sofrimento intenso, ligue para o CVV (188) — gratuito, 24h.</p>
        </Panel>
      )}
    </PortalLayout>
  );
}