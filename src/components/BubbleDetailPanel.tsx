import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Calendar, ExternalLink, Trash2, ArrowRight, Zap } from "lucide-react";
import type { Contact, Phase } from "@/hooks/useContacts";
import { PHASES, PHASE_MAP } from "@/lib/phases";

interface BubbleDetailPanelProps {
  contact: Contact | null;
  onClose: () => void;
  onPhaseChange: (id: string, fase: Phase) => void;
  onDelete: (id: string) => void;
  onToggleAguardando?: (id: string, value: boolean) => void;
  onUpdateMeetingDate?: (id: string, field: "firstMeetingDate" | "secondMeetingDate", date: string) => void;
}

export function BubbleDetailPanel({
  contact,
  onClose,
  onPhaseChange,
  onDelete,
  onToggleAguardando,
  onUpdateMeetingDate,
}: BubbleDetailPanelProps) {
  const [editingFirst, setEditingFirst] = useState(false);
  const [editingSecond, setEditingSecond] = useState(false);

  if (!contact) return null;
  const config = PHASE_MAP[contact.fase];

  const handleDelete = () => {
    onDelete(contact.id);
    onClose();
  };

  const initials = contact.nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const showMeetingDates =
    contact.fase === "primeira" ||
    contact.fase === "segunda" ||
    contact.fase === "followup" ||
    contact.fase === "captacao" ||
    contact.fase === "comprador" ||
    contact.fase === "enviei_imoveis" ||
    contact.fase === "visita_imovel" ||
    contact.fase === "comprou" ||
    contact.firstMeetingDate ||
    contact.secondMeetingDate;

  return (
    <AnimatePresence>
      {contact && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm z-40"
            style={{ background: "hsl(var(--foreground) / 0.08)" }}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.80, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.80, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="glass rounded-2xl shadow-panel w-full max-w-sm pointer-events-auto relative overflow-hidden"
              style={{ border: `1px solid ${config.headerColor}40` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ background: `linear-gradient(90deg, ${config.headerColor}, ${config.headerColor}88)` }}
              />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-accent transition-colors z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="p-6 pt-7">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}bb)`,
                      boxShadow: `0 6px 20px ${config.headerColor}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    }}
                  >
                    {initials || "?"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground leading-tight truncate">
                      {contact.nombre}
                    </h3>
                    <span
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                      style={{
                        background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}cc)`,
                        boxShadow: `0 2px 8px ${config.headerColor}44`,
                      }}
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
                      className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-semibold">{contact.telefono}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">{contact.fechaCreacion}</span>
                  </div>
                </div>

                {/* Meeting dates */}
                {showMeetingDates && onUpdateMeetingDate && (
                  <>
                    <div className="h-px bg-border/60 mb-4" />
                    <div className="mb-4 space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Datas de reunião
                      </p>

                      {/* 1R */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-6">1R</span>
                        {editingFirst ? (
                          <input
                            type="date"
                            autoFocus
                            defaultValue={contact.firstMeetingDate || new Date().toISOString().split("T")[0]}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            onChange={(e) => {
                              if (e.target.value) {
                                onUpdateMeetingDate(contact.id, "firstMeetingDate", e.target.value);
                              }
                            }}
                            onBlur={() => setEditingFirst(false)}
                          />
                        ) : (
                          <button
                            onClick={() => setEditingFirst(true)}
                            className={`flex-1 text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                              contact.firstMeetingDate
                                ? "border-border text-foreground font-medium hover:border-primary/50 hover:bg-primary/5"
                                : "border-dashed border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                            }`}
                          >
                            {contact.firstMeetingDate || "— sem data —"}
                          </button>
                        )}
                      </div>

                      {/* 2R */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground w-6">2R</span>
                        {editingSecond ? (
                          <input
                            type="date"
                            autoFocus
                            defaultValue={contact.secondMeetingDate || new Date().toISOString().split("T")[0]}
                            className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            onChange={(e) => {
                              if (e.target.value) {
                                onUpdateMeetingDate(contact.id, "secondMeetingDate", e.target.value);
                              }
                            }}
                            onBlur={() => setEditingSecond(false)}
                          />
                        ) : (
                          <button
                            onClick={() => setEditingSecond(true)}
                            className={`flex-1 text-left text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                              contact.secondMeetingDate
                                ? "border-border text-foreground font-medium hover:border-primary/50 hover:bg-primary/5"
                                : "border-dashed border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"
                            }`}
                          >
                            {contact.secondMeetingDate || "— sem data —"}
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="h-px bg-border/60 mb-4" />

                {/* Phase change */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Cambiar fase
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PHASES.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => { onPhaseChange(contact.id, p.key); onClose(); }}
                        className={`
                          flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full font-bold
                          transition-all duration-150
                          ${contact.fase === p.key
                            ? "text-white scale-105 shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                          }
                        `}
                        style={
                          contact.fase === p.key
                            ? {
                                background: `linear-gradient(135deg, ${p.headerColor}, ${p.headerColor}cc)`,
                                boxShadow: `0 2px 10px ${p.headerColor}44`,
                              }
                            : {}
                        }
                      >
                        {p.emoji} {p.label}
                        {contact.fase === p.key && <ArrowRight className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aguardando Resposta toggle */}
                {onToggleAguardando && (
                  <button
                    onClick={() => onToggleAguardando(contact.id, !contact.aguardandoResposta)}
                    className={`w-full mb-3 text-xs px-3 py-2 rounded-xl border font-semibold transition-colors ${
                      contact.aguardandoResposta
                        ? "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800"
                        : "border-border text-muted-foreground hover:border-rose-300 hover:text-rose-500"
                    }`}
                  >
                    {contact.aguardandoResposta ? "💓 Aguardando Resposta" : "⏳ Marcar como Aguardando Resposta"}
                  </button>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {contact.trelloUrl ? (
                    <a
                      href={contact.trelloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl pill-gradient text-white text-xs font-bold shadow-bubble hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver en Trello
                    </a>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Trello (pendiente)
                    </div>
                  )}
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-destructive/8 text-destructive text-xs font-semibold hover:bg-destructive hover:text-white transition-all duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

  const config = PHASE_MAP[contact.fase];

  const handleDelete = () => {
    onDelete(contact.id);
    onClose();
  };

  const initials = contact.nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  return (
    <AnimatePresence>
      {contact && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 backdrop-blur-sm z-40"
            style={{ background: "hsl(var(--foreground) / 0.08)" }}
          />

          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.80, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.80, y: 24 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none p-4"
          >
            <div
              className="glass rounded-2xl shadow-panel w-full max-w-sm pointer-events-auto relative overflow-hidden"
              style={{ border: `1px solid ${config.headerColor}40` }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ background: `linear-gradient(90deg, ${config.headerColor}, ${config.headerColor}88)` }}
              />

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-accent transition-colors z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>

              <div className="p-6 pt-7">
                {/* Avatar + Name */}
                <div className="flex items-center gap-3.5 mb-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}bb)`,
                      boxShadow: `0 6px 20px ${config.headerColor}55, inset 0 1px 0 rgba(255,255,255,0.25)`,
                    }}
                  >
                    {initials || "?"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground leading-tight truncate">
                      {contact.nombre}
                    </h3>
                    <span
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                      style={{
                        background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}cc)`,
                        boxShadow: `0 2px 8px ${config.headerColor}44`,
                      }}
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
                      className="flex items-center gap-2.5 text-sm text-foreground hover:text-primary transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-semibold">{contact.telefono}</span>
                    </a>
                  )}
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-medium">{contact.fechaCreacion}</span>
                  </div>
                </div>

                <div className="h-px bg-border/60 mb-4" />

                {/* Phase change */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Cambiar fase
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PHASES.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => { onPhaseChange(contact.id, p.key); onClose(); }}
                        className={`
                          flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-full font-bold
                          transition-all duration-150
                          ${contact.fase === p.key
                            ? "text-white scale-105 shadow-sm"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                          }
                        `}
                        style={
                          contact.fase === p.key
                            ? {
                                background: `linear-gradient(135deg, ${p.headerColor}, ${p.headerColor}cc)`,
                                boxShadow: `0 2px 10px ${p.headerColor}44`,
                              }
                            : {}
                        }
                      >
                        {p.emoji} {p.label}
                        {contact.fase === p.key && <ArrowRight className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aguardando Resposta toggle */}
                {onToggleAguardando && (
                  <button
                    onClick={() => onToggleAguardando(contact.id, !contact.aguardandoResposta)}
                    className={`w-full mb-3 text-xs px-3 py-2 rounded-xl border font-semibold transition-colors ${
                      contact.aguardandoResposta
                        ? "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-900/30 dark:border-rose-800"
                        : "border-border text-muted-foreground hover:border-rose-300 hover:text-rose-500"
                    }`}
                  >
                    {contact.aguardandoResposta ? "💓 Aguardando Resposta" : "⏳ Marcar como Aguardando Resposta"}
                  </button>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {contact.trelloUrl ? (
                    <a
                      href={contact.trelloUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl pill-gradient text-white text-xs font-bold shadow-bubble hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver en Trello
                    </a>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Trello (pendiente)
                    </div>
                  )}
                  <button
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-destructive/8 text-destructive text-xs font-semibold hover:bg-destructive hover:text-white transition-all duration-150"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
