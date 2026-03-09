import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";

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

    // Try to detect a phone number in the input
    const phoneMatch = trimmed.match(
      /(\+?\d[\d\s\-().]{7,}\d)/
    );
    let nombre = trimmed;
    let telefono: string | undefined;

    if (phoneMatch) {
      telefono = phoneMatch[1].replace(/\s+/g, "");
      nombre = trimmed.replace(phoneMatch[0], "").trim();
    }

    if (!nombre) nombre = telefono ?? "Sin nombre";

    setLoading(true);
    // Simulate a brief "magic" moment
    setTimeout(() => {
      onAdd(nombre, telefono);
      setValue("");
      setLoading(false);
    }, 350);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 24 }}
      className="glass flex items-center gap-3 p-3 rounded-2xl shadow-column w-full max-w-2xl mx-auto"
    >
      <div className="flex-1 flex flex-col gap-0.5">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder='✏️  "Carlos Pérez +55 11 99999-9999" o solo el nombre...'
          className="bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium outline-none w-full"
          disabled={loading}
        />
        <p className="text-[10px] text-muted-foreground pl-0.5">
          Nombre + teléfono opcional → crea burbuja morada en Novos Contatos
        </p>
      </div>
      <motion.button
        type="submit"
        disabled={!value.trim() || loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="
          flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
          bg-primary text-primary-foreground shadow-bubble
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-opacity
        "
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        {loading ? "Creando..." : "Agregar"}
      </motion.button>
    </motion.form>
  );
}
