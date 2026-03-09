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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const contactId = e.dataTransfer.getData("text/plain");
    if (contactId) onDrop(config.key, contactId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        flex flex-col rounded-2xl shadow-column min-w-[180px] flex-1 transition-all duration-200
        ${config.bgClass}
        ${isDragOver ? "ring-2 ring-primary ring-offset-2 scale-[1.02]" : ""}
      `}
      style={{ minHeight: 320 }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
        style={{ backgroundColor: config.headerColor + "22", borderBottom: `2px solid ${config.headerColor}44` }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.emoji}</span>
          <span className="text-sm font-bold" style={{ color: config.headerColor }}>
            {config.label}
          </span>
        </div>
        <motion.span
          key={contacts.length}
          initial={{ scale: 1.4 }}
          animate={{ scale: 1 }}
          className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: config.headerColor }}
        >
          {contacts.length}
        </motion.span>
      </div>

      {/* Bubbles grid */}
      <div className="flex-1 p-4">
        <AnimatePresence>
          {contacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-24 gap-2"
            >
              <span className="text-3xl opacity-30">{config.emoji}</span>
              <p className="text-xs text-muted-foreground text-center">
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
