import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, LockKeyhole } from "lucide-react";
import { useAuth } from "@/components/clina/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/clina/Logo";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({ meta: [{ title: "Redefinir senha — CLINA" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirm) { toast.error("As senhas não coincidem."); return; }
    setBusy(true);
    try {
      await updatePassword(password);
      toast.success("Senha atualizada. Entre novamente com sua nova senha.");
      void navigate({ to: "/entrar" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar sua senha.");
    } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-soft">
        <Link to="/" className="mb-7 flex justify-center"><Logo className="h-12" /></Link>
        <h1 className="text-2xl text-primary">Defina uma nova senha</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use pelo menos 8 caracteres.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Nova senha</label>
          <div className="relative"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" /></div>
          <label className="block text-sm font-medium">Confirme a nova senha</label>
          <Input required minLength={8} type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <Button className="w-full rounded-full" disabled={busy}>{busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Atualizar senha</Button>
        </form>
      </section>
    </main>
  );
}
