import { useRef, useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Phone } from "lucide-react";
import type { Contact } from "@/hooks/useContacts";
import { PHASE_MAP } from "@/lib/phases";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
}

export function SearchBar({ value, onChange, contacts, onSelectContact }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    setOpen(true);
    setShowResults(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleClear = () => {
    onChange("");
    setOpen(false);
    setShowResults(false);
  };

  // Fechar ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClear();
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

  const query = value.trim().toLowerCase();

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    return contacts
      .filter(
        (c) =>
          c.nombre.toLowerCase().includes(query) ||
          (c.telefono ?? "").replace(/\D/g, "").includes(query.replace(/\D/g, ""))
      )
      .slice(0, 8); // máximo 8 resultados
  }, [contacts, query]);

  const handleSelect = (contact: Contact) => {
    onSelectContact(contact);
    handleClear();
  };

  return (
    <div ref={containerRef} className="relative flex items-center gap-1">
      <AnimatePresence>
        {open && (
          <motion.div
            key="input"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="overflow-visible"
          >
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => { onChange(e.target.value); setShowResults(true); }}
                onFocus={() => setShowResults(true)}
                placeholder="Buscar contato..."
                className="w-full bg-muted/60 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            {/* Dropdown de resultados */}
            <AnimatePresence>
              {showResults && query.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-border bg-background shadow-xl overflow-hidden"
                  style={{ minWidth: 260 }}
                >
                  {results.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-muted-foreground text-center">
                      Nenhum contato encontrado
                    </div>
                  ) : (
                    <ul>
                      {results.map((c, i) => {
                        const phase = PHASE_MAP[c.fase];
                        const initials = c.nombre
                          .split(" ")
                          .slice(0, 2)
                          .map((w) => w[0]?.toUpperCase() ?? "")
                          .join("");
                        return (
                          <li key={c.id}>
                            <button
                              onMouseDown={(e) => { e.preventDefault(); handleSelect(c); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                            >
                              {/* Avatar */}
                              <div
                                className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-black text-white"
                                style={{
                                  background: `linear-gradient(135deg, ${phase.headerColor}, ${phase.headerColor}bb)`,
                                  boxShadow: `0 2px 8px ${phase.headerColor}44`,
                                }}
                              >
                                {initials || "?"}
                              </div>

                              {/* Info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">
                                  {c.nombre}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span
                                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                    style={{
                                      color: phase.headerColor,
                                      background: `${phase.headerColor}18`,
                                    }}
                                  >
                                    {phase.emoji} {phase.label}
                                  </span>
                                  {c.telefono && (
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                      <Phone size={9} />
                                      {c.telefono}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                            {i < results.length - 1 && (
                              <div className="h-px bg-border/50 mx-3" />
                            )}
                          </li>
                        );
                      })}
                      <div className="px-3 py-1.5 border-t border-border/50 bg-muted/30">
                        <p className="text-[10px] text-muted-foreground text-center">
                          {results.length} resultado{results.length !== 1 ? "s" : ""} — clique para abrir
                        </p>
                      </div>
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {open && value ? (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={handleClear}
          title="Limpar busca (Esc)"
          className="flex items-center justify-center w-7 h-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          <X size={14} />
        </motion.button>
      ) : (
        <button
          onClick={open ? handleClear : handleOpen}
          title={open ? "Fechar busca (Esc)" : "Buscar contato (Ctrl+K)"}
          className="flex items-center justify-center w-7 h-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          <Search size={15} />
        </button>
      )}
    </div>
  );
}
