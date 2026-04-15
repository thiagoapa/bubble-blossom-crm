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

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClear();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="flex items-center gap-1">
      <AnimatePresence>
        {open && (
          <motion.div
            key="input"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 180, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="overflow-hidden"
          >
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Buscar contato..."
              className="w-full bg-muted/60 border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
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
          title="Limpar busca"
          className="flex items-center justify-center w-7 h-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={14} />
        </motion.button>
      ) : (
        <button
          onClick={open ? handleClear : handleOpen}
          title={open ? "Fechar busca" : "Buscar contato"}
          className="flex items-center justify-center w-7 h-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Search size={15} />
        </button>
      )}
    </div>
  );
}
