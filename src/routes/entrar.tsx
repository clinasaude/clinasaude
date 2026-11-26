import { createFileRoute, Link } from "@tanstack/react-router";
import { User, Stethoscope, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/clina/Logo";

export const Route = createFileRoute("/entrar")({
  head: () => ({ meta: [
    { title: "Entrar — CLINA" },
    { name: "description", content: "Acesse seu portal CLINA como paciente, profissional ou administrador." },
    { property: "og:title", content: "Entrar — CLINA" },
    { property: "og:description", content: "Acesse seu portal CLINA." },
  ] }),
  component: Login,
});

function Login() {
  const opts = [
    { to: "/paciente" as const, icon: User, t: "Sou paciente", d: "Agendamentos, teleconsulta e diário emocional." },
    { to: "/profissional" as const, icon: Stethoscope, t: "Sou profissional", d: "Agenda, pacientes, prontuários e financeiro." },
    { to: "/admin" as const, icon: ShieldCheck, t: "Administração", d: "Métricas, validações, assinaturas e LGPD." },
  ];
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center"><Logo className="h-16 mix-blend-multiply" /></Link>
        <h1 className="mt-8 text-center text-3xl text-primary">Bem-vindo de volta</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">Modo demonstração: escolha um portal para explorar.</p>
        <div className="mt-8 space-y-3">{opts.map((o) => (
          <Link key={o.to} to={o.to} className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft transition hover:border-primary">
            <span className="rounded-xl bg-accent p-3 text-primary"><o.icon className="h-5 w-5" /></span>
            <span><span className="block font-bold">{o.t}</span><span className="text-sm text-muted-foreground">{o.d}</span></span>
          </Link>
        ))}</div>
      </div>
    </div>
  );
}