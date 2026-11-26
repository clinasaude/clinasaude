import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth, type AppRole } from "@/components/clina/AuthProvider";

export function RequireAuth({ children, allowedRoles }: { children: ReactNode; allowedRoles: AppRole[] }) {
  const { user, profile, loading, configured, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && configured && !user) void navigate({ to: "/entrar" });
  }, [loading, configured, user, navigate]);

  if (!configured) return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-semibold text-primary">Acesso em configuração</h1>
        <p className="mt-3 text-sm text-muted-foreground">O login seguro ainda não está configurado neste ambiente. Os portais permanecem bloqueados até a conexão ser concluída.</p>
        <Link to="/" className="mt-5 inline-block text-sm font-semibold text-primary underline">Voltar ao início</Link>
      </div>
    </div>
  );
  if (loading || (user && !profile)) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Verificando acesso seguro…</div>;
  if (!user) return null;
  if (!profile || !allowedRoles.includes(profile.role)) return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-semibold text-primary">Este portal não está liberado para sua conta</h1>
        <p className="mt-3 text-sm text-muted-foreground">Entre com a conta correspondente ou solicite à equipe CLINA a habilitação do perfil correto.</p>
        <div className="mt-5 flex justify-center gap-4"><Link to="/" className="text-sm font-semibold text-primary underline">Início</Link><button className="text-sm underline" onClick={() => void signOut()}>Sair</button></div>
      </div>
    </div>
  );
  return <>{children}</>;
}
