import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Calendar, ExternalLink, Trash2, ArrowRight } from "lucide-react";
import type { Contact, Phase } from "@/hooks/useContacts";
import { PHASES, PHASE_MAP } from "@/lib/phases";

interface BubbleDetailPanelProps {
  contact: Contact | null;
  onClose: () => void;
  onPhaseChange: (id: string, fase: Phase) => void;
  onDelete: (id: string) => void;
}

export function BubbleDetailPanel({
  contact,
  onClose,
  onPhaseChange,
  onDelete,
}: BubbleDetailPanelProps) {
  if (!contact) return null;
  const config = PHASE_MAP[contact.fase];

  const handleDelete = () => {
    onDelete(contact.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {contact && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/10 backdrop-blur-sm z-40"
          />
          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="glass rounded-2xl shadow-panel p-6 w-80 pointer-events-auto relative">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-xl hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Bubble + Name */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-bubble ${config.colorClass}`}
                >
                  {contact.nombre
                    .split(" ")
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase())
                    .join("")}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground leading-tight">
                    {contact.nombre}
                  </h3>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full text-white mt-1 inline-block"
                    style={{ backgroundColor: config.headerColor }}
                  >
                    {config.emoji} {config.label}
                  </span>
                </div>
              </div>

              {/* Info rows */}
              <div className="space-y-2 mb-5">
                {contact.telefono && (
                  <a
                    href={`tel:${contact.telefono}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors group"
                  >
                    <Phone className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{contact.telefono}</span>
                  </a>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{contact.fechaCreacion}</span>
                </div>
              </div>

              {/* Phase change */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                  Cambiar fase
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PHASES.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => {
                        onPhaseChange(contact.id, p.key);
                        onClose();
                      }}
                      className={`
                        flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold
                        transition-all duration-150
                        ${contact.fase === p.key
                          ? "text-white shadow-bubble scale-105"
                          : "bg-accent text-foreground hover:opacity-80"
                        }
                      `}
                      style={contact.fase === p.key ? { backgroundColor: p.headerColor } : {}}
                    >
                      {p.emoji} {p.label}
                      {contact.fase === p.key && <ArrowRight className="w-2.5 h-2.5" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {contact.trelloUrl ? (
                  <a
                    href={contact.trelloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver en Trello
                  </a>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Trello (pendiente)
                  </div>
                )}
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive hover:text-white transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
