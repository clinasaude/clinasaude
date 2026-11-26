import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Mail, LockKeyhole, UserRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/clina/Logo";
import { useAuth } from "@/components/clina/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/entrar")({
  head: () => ({ meta: [
    { title: "Entrar — CLINA" },
    { name: "description", content: "Acesse sua conta CLINA com segurança." },
  ] }),
  component: Login,
});

type Mode = "login" | "signup" | "reset" | "new-password";

function Login() {
  const { user, profile, loading: authLoading, configured, signIn, signUp, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redefinir") === "1") setMode("new-password");
  }, []);

  useEffect(() => {
    if (!user || authLoading || !profile || mode === "new-password" || (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("redefinir") === "1")) return;
    if (profile.role === "admin") void navigate({ to: "/admin" });
    else if (profile.role === "professional") void navigate({ to: "/profissional" });
    else void navigate({ to: "/paciente" });
  }, [user, authLoading, profile, navigate, mode]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) { toast.error("A conexão de autenticação ainda não está configurada no deploy."); return; }
    setBusy(true);
    try {
      if (mode === "new-password") {
        if (password !== confirmPassword) throw new Error("As senhas não coincidem.");
        await updatePassword(password);
        toast.success("Senha atualizada com sucesso.");
        setPassword(""); setConfirmPassword(""); setMode("login");
      } else if (mode === "login") {
        await signIn(email, password);
        toast.success("Login realizado.");
      } else if (mode === "signup") {
        const hasSession = await signUp({ fullName, phone, email, password });
        if (hasSession) toast.success("Conta criada com sucesso.");
        else toast.success("Cadastro recebido. Confira seu e-mail para confirmar a conta antes de entrar.");
        setMode("login");
      } else {
        await resetPassword(email);
        toast.success("Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.");
        setMode("login");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível concluir a solicitação.");
    } finally { setBusy(false); }
  }

  if (user && !authLoading) return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Abrindo seu portal seguro…</div>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center"><Logo className="h-14" /></Link>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-soft sm:p-9">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"><ArrowLeft className="h-3.5 w-3.5" /> Voltar ao site</Link>
          <h1 className="mt-5 text-3xl text-primary">{mode === "login" ? "Bem-vindo de volta" : mode === "signup" ? "Crie sua conta" : mode === "new-password" ? "Defina uma nova senha" : "Recuperar senha"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{mode === "login" ? "Entre para acessar seu espaço de cuidado." : mode === "signup" ? "Cadastre-se como paciente para começar." : mode === "new-password" ? "Escolha uma nova senha com pelo menos 8 caracteres." : "Enviaremos instruções para seu e-mail."}</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {mode === "signup" && <>
              <label className="block text-sm font-medium">Nome completo</label>
              <div className="relative"><UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input required minLength={3} autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Seu nome" className="pl-10" /></div>
              <label className="block text-sm font-medium">Telefone (opcional)</label>
              <Input autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </>}
            {mode !== "new-password" && <><label className="block text-sm font-medium">E-mail</label>
            <div className="relative"><Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" className="pl-10" /></div></>}
            {mode !== "reset" && <>
              <label className="block text-sm font-medium">Senha</label>
              <div className="relative"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input required type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" className="pl-10" /></div>
            </>}
            {mode === "new-password" && <><label className="block text-sm font-medium">Confirme a nova senha</label><Input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repita a nova senha" /></>}
            <Button type="submit" disabled={busy || !configured} className="w-full rounded-full">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "login" ? "Entrar com segurança" : mode === "signup" ? "Criar conta de paciente" : mode === "new-password" ? "Salvar nova senha" : "Enviar instruções"}
            </Button>
          </form>
          <div className="mt-5 flex flex-col gap-3 text-center text-sm">
            {mode === "login" && <><button onClick={() => setMode("reset")} className="text-muted-foreground underline">Esqueci minha senha</button><button onClick={() => setMode("signup")} className="font-semibold text-primary">Ainda não tenho conta · Criar cadastro</button></> }
            {mode !== "login" && <button onClick={() => setMode("login")} className="text-primary underline">Voltar para entrar</button>}
          </div>
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">Seus dados de acesso são protegidos. Nunca compartilhe sua senha.</p>
      </div>
    </div>
  );
}
