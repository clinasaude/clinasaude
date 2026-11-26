import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

export type NavItem = { key: string; label: string; icon: LucideIcon };

export function PortalLayout({ title, role, nav, active, onChange, children }: {
  title: string; role: string; nav: NavItem[]; active: string; onChange: (k: string) => void; children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <Link to="/"><Logo onDark className="h-9" /></Link>
        <p className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-widest opacity-60">{role}</p>
        <nav className="mt-2 space-y-1">
          {nav.map((n) => (
            <button key={n.key} onClick={() => onChange(n.key)}
              className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active === n.key ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold" : "hover:bg-sidebar-accent")}>
              <n.icon className="h-4 w-4" />{n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl bg-sidebar-accent p-3 text-xs opacity-90">Dados em modo demonstração. Conecte o backend para persistir.</div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <select className="rounded-md border border-border bg-background px-2 py-1 text-sm lg:hidden" value={active} onChange={(e) => onChange(e.target.value)}>
            {nav.map((n) => <option key={n.key} value={n.key}>{n.label}</option>)}
          </select>
        </header>
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-primary truncate">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2>{action}</div>
      {children}
    </section>
  );
}