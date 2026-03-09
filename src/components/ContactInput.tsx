import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Sparkles } from "lucide-react";

interface ContactInputProps {
  onAdd: (nombre: string, telefono?: string) => void;
}

export function ContactInput({ onAdd }: ContactInputProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;

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
      onAdd(nombre, telefono);
      setValue("");
      setLoading(false);
    }, 380);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.12, type: "spring", stiffness: 280, damping: 24 }}
      className="relative glass flex items-center gap-3 px-4 py-3 rounded-2xl shadow-column w-full max-w-2xl mx-auto group focus-within:ring-2 focus-within:ring-primary/40 transition-all duration-200"
    >
      {/* Icon */}
      <div className="flex-shrink-0">
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

      {/* Input */}
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Nombre + teléfono opcional... ej: Carlos Pérez +55 11 99999-9999"
          className="bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm font-medium outline-none w-full"
          disabled={loading}
        />
        <p className="text-[10px] text-muted-foreground/70 mt-0.5 font-medium">
          → Crea burbuja morada en <span className="text-primary font-semibold">Novos Contatos</span>
        </p>
      </div>

      {/* Button */}
      <motion.button
        type="submit"
        disabled={!value.trim() || loading}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="
          flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold
          pill-gradient text-white shadow-bubble
          disabled:opacity-35 disabled:cursor-not-allowed disabled:shadow-none
          transition-all duration-200
        "
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">{loading ? "Creando..." : "Agregar"}</span>
      </motion.button>
    </motion.form>
  );
}
