import { useState } from "react";
import { motion } from "framer-motion";

// ─── CHANGE THIS PASSWORD ──────────────────────────────────────────────────
const CRM_PASSWORD = "blossom2026";
// ──────────────────────────────────────────────────────────────────────────

const SESSION_KEY = "crm-auth";

export function useAuth() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === "ok");

  function login(pw: string): boolean {
    if (pw === CRM_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "ok");
      setAuthed(true);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  }

  return { authed, login, logout };
}

interface LoginScreenProps {
  onLogin: (pw: string) => boolean;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = onLogin(pw);
    if (!ok) {
      setError(true);
      setShake(true);
      setPw("");
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Soft background blob */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(139,92,246,0.18) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div className="rounded-3xl border border-border/70 bg-background/95 shadow-xl p-8 flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-md">
              <span className="text-2xl">🫧</span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Bubble CRM · Remax
              </p>
              <h1 className="text-lg font-semibold tracking-tight mt-0.5">
                Acesso restrito
              </h1>
            </div>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col gap-3"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Senha
              </label>
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                placeholder="••••••••"
                autoFocus
                className={`
                  w-full rounded-xl border px-4 py-2.5 text-sm bg-background
                  outline-none transition-all
                  ${error
                    ? "border-red-400 ring-2 ring-red-400/20"
                    : "border-border focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                  }
                `}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-red-500"
                >
                  Senha incorreta. Tente novamente.
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-neutral-900 text-white text-sm font-medium py-2.5 mt-1 hover:bg-neutral-700 active:scale-95 transition-all"
            >
              Entrar
            </button>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}
