import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type AppRole = "patient" | "professional" | "admin";
type Profile = { id: string; full_name: string; role: AppRole };
type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { fullName: string; phone?: string; email: string; password: string }) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!supabase) { setProfile(null); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setProfile(null); return; }
    const { data, error } = await supabase.from("profiles").select("id, full_name, role").eq("id", user.id).maybeSingle();
    if (error) throw error;
    setProfile(data as Profile | null);
  }, []);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!alive) return;
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setLoading(false);
        return;
      }
      // Defer Supabase queries until after the auth callback releases its internal lock.
      window.setTimeout(() => {
        void refreshProfile().catch((error) => console.error("CLINA profile load failed", error)).finally(() => {
          if (alive) setLoading(false);
        });
      }, 0);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      if (alive) setSession(data.session);
      if (!data.session) {
        if (alive) setLoading(false);
      } else {
        void refreshProfile().catch((err) => console.error("CLINA profile load failed", err)).finally(() => {
          if (alive) setLoading(false);
        });
      }
    }).catch((error) => {
      console.error("CLINA session restore failed", error);
      if (alive) setLoading(false);
    });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error("A autenticação ainda não foi configurada neste ambiente.");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async ({ fullName, phone, email, password }: { fullName: string; phone?: string; email: string; password: string }) => {
    if (!supabase) throw new Error("A autenticação ainda não foi configurada neste ambiente.");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), ...(phone?.trim() ? { phone: phone.trim() } : {}) },
        emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/entrar` : undefined,
      },
    });
    if (error) throw error;
    return Boolean(data.session);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error("A autenticação ainda não foi configurada neste ambiente.");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/redefinir-senha` : undefined,
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session, user: session?.user ?? null, profile, loading, configured: isSupabaseConfigured,
    signIn, signUp, resetPassword, signOut, refreshProfile,
  }), [session, profile, loading, signIn, signUp, resetPassword, signOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
