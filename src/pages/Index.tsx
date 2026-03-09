import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import type { Contact, Phase } from "@/hooks/useContacts";
import { PHASES } from "@/lib/phases";
import { ProgressHeader } from "@/components/ProgressHeader";
import { ContactInput } from "@/components/ContactInput";
import { ContactColumn } from "@/components/ContactColumn";
import { BubbleDetailPanel } from "@/components/BubbleDetailPanel";
import { ManualGroupArea } from "@/components/ManualGroupArea";

const Index = () => {
  const {
    contacts,
    groups,
    metaSemanal,
    weeklyCount,
    weekProgress,
    todayCount,
    monthCount,
    heatmapDays,
    contactsByPhase,
    addContact,
    changePhase,
    deleteContact,
    addGroup,
    addContactToGroup,
    removeContactFromGroup,
    deleteGroup,
  } = useContacts();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContactId, setNewContactId] = useState<string | null>(null);

  const handleAddContact = useCallback(
    (nombre: string, telefono?: string) => {
      const c = addContact(nombre, telefono);
      setNewContactId(c.id);
      setTimeout(() => setNewContactId(null), 2000);
    },
    [addContact]
  );

  const handleDrop = useCallback(
    (fase: Phase, contactId: string) => {
      changePhase(contactId, fase);
    },
    [changePhase]
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── App header ─── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="sticky top-0 z-30 glass border-b border-border/50 px-6 py-3.5 flex items-center gap-3"
      >
        {/* Logo mark */}
        <div className="relative">
          <div className="w-9 h-9 rounded-xl pill-gradient flex items-center justify-center shadow-md">
            <span className="text-lg leading-none">🫧</span>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary-glow border-2 border-white animate-pulse-ring" />
        </div>

        <div>
          <h1 className="font-black text-base leading-none gradient-text tracking-tight">
            Bubble CRM
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium tracking-wide mt-0.5">
            Columnas Visuales · Remax Edition
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/8 border border-primary/20">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs font-semibold text-primary">
              {contacts.length} contacto{contacts.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 flex flex-col gap-6 p-4 md:p-6 max-w-[1680px] w-full mx-auto">
        {/* Progress + heatmap */}
        <ProgressHeader
          weeklyCount={weeklyCount}
          metaSemanal={metaSemanal}
          weekProgress={weekProgress}
          todayCount={todayCount}
          monthCount={monthCount}
          heatmapDays={heatmapDays}
        />

        {/* Input */}
        <ContactInput onAdd={handleAddContact} />

        {/* Columns */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {PHASES.map((phase) => (
            <ContactColumn
              key={phase.key}
              config={phase}
              contacts={contactsByPhase(phase.key)}
              onBubbleClick={setSelectedContact}
              onDrop={handleDrop}
              newContactId={newContactId}
            />
          ))}
        </div>

        {/* Manual grouping area */}
        <ManualGroupArea
          contacts={contacts}
          groups={groups}
          onAddGroup={addGroup}
          onDeleteGroup={deleteGroup}
          onAddContactToGroup={addContactToGroup}
          onRemoveContactFromGroup={removeContactFromGroup}
        />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-[10px] text-muted-foreground pb-4 flex items-center justify-center gap-2"
        >
          <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
          Arrastra burbujas entre columnas para cambiar de fase
          <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
          Haz clic en una burbuja para ver detalles
          <span className="w-1 h-1 rounded-full bg-primary/40 inline-block" />
        </motion.footer>
      </main>

      {/* Detail panel */}
      <BubbleDetailPanel
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onPhaseChange={(id, fase) => {
          changePhase(id, fase);
          setSelectedContact(null);
        }}
        onDelete={deleteContact}
      />
    </div>
  );
};

export default Index;
