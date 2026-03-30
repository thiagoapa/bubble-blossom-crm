import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Sparkles, FileText, ChevronRight } from "lucide-react";

interface ContactInputProps {
  onAdd: (nombre: string, telefono?: string, createdAt?: string, notes?: string) => void;
}

type Step = "idle" | "date" | "note";

export function ContactInput({ onAdd }: ContactInputProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [createdAt, setCreatedAt] = useState<string | undefined>(undefined);
  const [note, setNote] = useState("");

  const reset = () => {
    setValue("");
    setCreatedAt(undefined);
    setNote("");
    setStep("idle");
  };

  const doAdd = (trimmed: string) => {
    const phoneMatch = trimmed.match(/(\+?\d[\d\s\-().]{7,}\d)/);
    let nombre = trimmed;
    let telefono: string | undefined;

    if (phoneMatch) {
      telefono = phoneMatch[1].replace(/\s+/g, "");
      nombre = trimmed.replace(phoneMatch[0], "").trim();
    }
    if (!nombre) nombre = telefono ?? "Sin nombre";

    setLoading(true);
    setTimeout(() => {
      onAdd(nombre, telefono, createdAt, note.trim() || undefined);
      reset();
      setLoading(false);
    }, 380);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

    if (step === "idle") { setStep("date"); return; }
    if (step === "date") { setStep("note"); return; }
    if (step === "note") { doAdd(trimmed); }
  };

  const skipNote = () => {
    const trimmed = value.trim();
    if (trimmed) doAdd(trimmed);
  };

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.12, type: "spring", stiffness: 280, damping: 24 }}
      className="relative glass flex items-start gap-3 px-4 py-3 rounded-2xl shadow-column w-full max-w-2xl mx-auto group focus-within:ring-2 focus-within:ring-primary/40 transition-all duration-200"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
            value.trim() ? "pill-gradient shadow-md" : "bg-primary/10"
          }`}
        >
          <Sparkles
            className={`w-4 h-4 transition-colors duration-200 ${
              value.trim() ? "text-white" : "text-primary/50"
            }`}
          />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-1 min-w-0 space-y-2">
        <input
          type="text"
          value={value}
          onChange={(e) => { setValue(e.target.value); if (step !== "idle") setStep("idle"); }}
          placeholder="Nome + telefone opcional... ex: Carlos Pérez +55 11 99999-9999"
          className="bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm font-medium outline-none w-full"
          disabled={loading}
        />

        <AnimatePresence mode="wait">
          {step === "idle" && (
            <motion.p
              key="hint"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-[10px] text-muted-foreground/70 font-medium"
            >
              → Cria bolha em <span className="font-semibold text-foreground">Novos Contatos</span>
            </motion.p>
          )}

          {step === "date" && (
            <motion.div
              key="date"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-[10px] font-medium text-muted-foreground">
                📅 Quando você adicionou este contato?
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCreatedAt(todayStr)}
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                    createdAt === todayStr
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-background text-foreground hover:border-primary/60"
                  }`}
                >
                  Hoje
                </button>
                <input
                  type="date"
                  value={createdAt || ""}
                  onChange={(e) => setCreatedAt(e.target.value || undefined)}
                  className="h-7 rounded-md border border-border bg-background px-2 text-[10px] font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>
            </motion.div>
          )}

          {step === "note" && (
            <motion.div
              key="note"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="space-y-1.5"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] font-medium text-muted-foreground">
                  Quer deixar uma anotação? <span className="opacity-60">(opcional)</span>
                </span>
              </div>
              <textarea
                autoFocus
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ex: Veio pelo Instagram, interessado em ap. de 2 quartos..."
                className="w-full text-xs px-3 py-2 rounded-xl border border-border bg-background/80 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
              />
              <button
                type="button"
                onClick={skipNote}
                className="text-[10px] text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Pular, adicionar sem nota
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button */}
      <motion.button
        type="submit"
        disabled={!value.trim() || loading}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="
          flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold mt-0.5
          pill-gradient text-white shadow-bubble
          disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none
          transition-all duration-200
        "
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : step === "note" ? (
          <Plus className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {loading ? "Criando..." : step === "note" ? "Adicionar" : "Próximo"}
        </span>
      </motion.button>
    </motion.form>
  );
}
