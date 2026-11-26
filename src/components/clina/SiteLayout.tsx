import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <Link to="/"><Logo className="h-11 mix-blend-multiply" /></Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <Link to="/profissionais" className="hover:text-primary">Encontrar profissionais</Link>
            <Link to="/planos" className="hover:text-primary">Planos</Link>
            <Link to="/profissional" className="hover:text-primary">Para profissionais</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild><Link to="/entrar">Entrar</Link></Button>
            <Button asChild className="rounded-full"><Link to="/profissionais">Agendar</Link></Button>
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-24 bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <Logo onDark className="h-10" />
            <p className="max-w-sm text-sm opacity-80">Clínica digital e marketplace de saúde mental. Atendimento seguro, sigiloso e em conformidade com a LGPD.</p>
          </div>
          <div className="space-y-2 text-sm opacity-85">
            <p className="font-semibold">Plataforma</p>
            <Link to="/profissionais" className="block">Encontrar profissionais</Link>
            <Link to="/planos" className="block">Planos e Clina Plus</Link>
            <Link to="/entrar" className="block">Entrar</Link>
          </div>
          <div className="space-y-2 text-sm opacity-85">
            <p className="font-semibold">Emergência</p>
            <p>Em crise? Ligue CVV 188 ou SAMU 192. A CLINA não é um serviço de emergência.</p>
          </div>
        </div>
        <div className="border-t border-sidebar-border py-5 text-center text-xs opacity-70">© 2026 CLINA. Todos os direitos reservados.</div>
      </footer>
    </div>
  );
}