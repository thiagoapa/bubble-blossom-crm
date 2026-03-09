import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Contact, Phase } from "@/hooks/useContacts";
import type { PhaseConfig } from "@/lib/phases";
import { ContactBubble } from "./ContactBubble";

interface ContactColumnProps {
  config: PhaseConfig;
  contacts: Contact[];
  onBubbleClick: (contact: Contact) => void;
  onDrop: (fase: Phase, contactId: string) => void;
  newContactId?: string | null;
}

export function ContactColumn({
  config,
  contacts,
  onBubbleClick,
  onDrop,
  newContactId,
}: ContactColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); dragCounter.current++; setIsDragOver(true); };
  const handleDragLeave = () => { dragCounter.current--; if (dragCounter.current === 0) setIsDragOver(false); };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const id = e.dataTransfer.getData("text/plain");
    if (id) onDrop(config.key, id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col rounded-2xl shadow-column min-w-[175px] flex-1
        transition-all duration-200 relative overflow-hidden
        ${isDragOver ? "ring-2 ring-primary ring-offset-2 scale-[1.025]" : ""}
      `}
      style={{
        minHeight: 330,
        background: isDragOver
          ? `hsl(var(--colbg-${config.key}))` 
          : "hsl(0 0% 100% / 0.60)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        border: `1.5px solid hsl(var(--border) / 0.7)`,
      }}
    >
      {/* Top color bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${config.headerColor}, ${config.headerColor}88)` }}
      />

      {/* Column header */}
      <div
        className="flex items-center justify-between px-4 pt-5 pb-3"
        style={{ borderBottom: `1px solid ${config.headerColor}28` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{config.emoji}</span>
          <span className="text-sm font-bold tracking-tight" style={{ color: config.headerColor }}>
            {config.label}
          </span>
        </div>
        <motion.span
          key={contacts.length}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs font-black px-2 py-0.5 rounded-full text-white shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${config.headerColor}, ${config.headerColor}cc)`,
            boxShadow: `0 2px 8px ${config.headerColor}55`,
          }}
        >
          {contacts.length}
        </motion.span>
      </div>

      {/* Bubbles */}
      <div className="flex-1 p-4">
        <AnimatePresence>
          {contacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-24 gap-2 select-none"
            >
              <span className="text-3xl opacity-25">{config.emoji}</span>
              <p className="text-xs text-muted-foreground text-center leading-snug">
                Arrastra aquí o<br />agrega un contacto
              </p>
            </motion.div>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {contacts.map((c) => (
                <ContactBubble
                  key={c.id}
                  id={c.id}
                  nombre={c.nombre}
                  fase={c.fase}
                  isNew={c.id === newContactId}
                  onClick={() => onBubbleClick(c)}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", c.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
