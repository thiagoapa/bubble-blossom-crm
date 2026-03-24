import { useState } from "react";
import { motion } from "framer-motion";

const API_BASE = "https://crm.project28.cloud/api";
const TOKEN_KEY = "crm-token";

export function useAuth() {
  const [authed, setAuthed] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;
      const { token } = await res.json();
      localStorage.setItem(TOKEN_KEY, token);
      setAuthed(true);
      return true;
    } catch {
      return false;
    }
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAuthed(false);
  }

  return { authed, login, logout };
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const ok = await onLogin(username, password);
    setLoading(false);
    if (!ok) {
      setError(true);
      setShake(true);
      setPassword("");
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="pointer-events-none fixed inset-0 opacity-30" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(139,92,246,0.18) 0%, transparent 70%)" }} />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} className="relative z-10 w-full max-w-sm mx-4">
        <div className="rounded-3xl border border-border/70 bg-background/95 shadow-xl p-8 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-md">
              <span className="text-2xl">🫧</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Bubble CRM · Remax</p>
              <h1 className="text-lg font-semibold tracking-tight mt-0.5">Acesso restrito</h1>
            </div>
          </div>
          <motion.form onSubmit={handleSubmit} animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}} transition={{ duration: 0.4 }} className="w-full flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Usuário</label>
              <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setError(false); }} placeholder="thiago" autoFocus className="w-full rounded-xl border border-border px-4 py-2.5 text-sm bg-background outline-none transition-all focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Senha</label>
              <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(false); }} placeholder="••••••••" className={`w-full rounded-xl border px-4 py-2.5 text-sm bg-background outline-none transition-all ${error ? "border-red-400 ring-2 ring-red-400/20" : "border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"}`} />
              {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[11px] text-red-500">Usuário ou senha incorretos.</motion.p>}
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-xl bg-neutral-900 text-white text-sm font-medium py-2.5 mt-1 hover:bg-neutral-700 active:scale-95 transition-all disabled:opacity-50">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
