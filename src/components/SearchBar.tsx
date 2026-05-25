import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClear();
      // Atalho: Ctrl+K ou Cmd+K abre a busca
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!open) handleOpen();
        else handleClear();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence>
        {open && (
          <motion.div
            key="input"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Nome ou telefone…"
                className="w-full bg-muted/60 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {open && value ? (
        <motion.button
          key="clear"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={handleClear}
          title="Limpar busca (Esc)"
          className="flex items-center justify-center w-7 h-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={14} />
        </motion.button>
      ) : (
        <button
          onClick={open ? handleClear : handleOpen}
          title={open ? "Fechar busca (Esc)" : "Buscar contato (Ctrl+K)"}
          className={`flex items-center justify-center w-7 h-7 rounded-xl transition-colors ${
            open
              ? "text-muted-foreground hover:text-foreground hover:bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Search size={15} />
        </button>
      )}
    </div>
  );
}
