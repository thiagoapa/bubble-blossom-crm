import { useState, useCallback } from "react";
import { motion } from "framer-motion";
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
      // Clear the "new" flag after animation
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
      {/* App header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 glass border-b border-border px-6 py-3 flex items-center gap-3"
      >
        <span className="text-2xl">🫧</span>
        <div>
          <h1 className="font-extrabold text-base text-foreground leading-none">
            Bubble CRM
          </h1>
          <p className="text-[10px] text-muted-foreground font-medium">
            Columnas Visuales — Remax Edition
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {contacts.length} contacto{contacts.length !== 1 ? "s" : ""} en total
          </span>
        </div>
      </motion.header>

      <main className="flex-1 flex flex-col gap-5 p-4 md:p-6 max-w-[1600px] w-full mx-auto">
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
          transition={{ delay: 0.6 }}
          className="text-center text-[10px] text-muted-foreground pb-4"
        >
          💡 Arrastra burbujas entre columnas para cambiar de fase · Haz clic en una burbuja para ver detalles
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
