import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import type { Contact, Phase } from "@/hooks/useContacts";
import { PHASES } from "@/lib/phases";
import { ProgressHeader } from "@/components/ProgressHeader";
import { ContactInput } from "@/components/ContactInput";
import { ContactColumn } from "@/components/ContactColumn";
import { BubbleDetailPanel } from "@/components/BubbleDetailPanel";
import { ManualGroupArea } from "@/components/ManualGroupArea";
import { ActivityCalendar } from "@/components/dashboard/ActivityCalendar";
import { PipelineFunnel } from "@/components/PipelineFunnel";
import { LoginScreen, useAuth } from "@/components/LoginScreen";

const Index = () => {
  const { authed, login, logout } = useAuth();

  const {
    contacts, groups, metaSemanal, weeklyCount, weekProgress,
    todayCount, monthCount, heatmapDays, contactsByPhase,
    addContact, changePhase, deleteContact,
    addGroup, addContactToGroup, removeContactFromGroup, deleteGroup,
  } = useContacts();

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContactId, setNewContactId] = useState<string | null>(null);

  const handleAddContact = useCallback((nombre: string, telefono?: string, createdAt?: string) => {
    const c = addContact(nombre, telefono, createdAt);
    Promise.resolve(c).then((contact) => {
      setNewContactId(contact.id);
      setTimeout(() => setNewContactId(null), 2000);
    });
  }, [addContact]);

  const handleDrop = useCallback((fase: Phase, contactId: string) => {
    changePhase(contactId, fase);
  }, [changePhase]);

  if (!authed) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="min-h-screen flex flex-col text-foreground">
      <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 28 }} className="border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-sm">
              <span className="text-base leading-none">🫧</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Bubble CRM · Remax Edition</span>
              <h1 className="text-sm font-semibold tracking-tight md:text-base">Convierte tus chats en un pipeline vivo</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-[11px] text-muted-foreground sm:flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-emerald-400/80" />
              <span>{contacts.length} contacto{contacts.length !== 1 ? "s" : ""} en tu pipeline</span>
            </div>
            <button onClick={logout} title="Sair" className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted">
              <LogOut size={13} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </motion.header>

      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-10 pt-6 md:px-6 lg:px-8">

          <ActivityCalendar contacts={contacts} onDeleteContact={deleteContact} onChangePhase={(id, fase) => changePhase(id, fase)} />

          <section aria-label="Pipeline principal de contactos" className="rounded-2xl border border-border/70 bg-background/90 p-4 shadow-sm md:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Pipeline en vivo</p>
                <p className="text-xs text-muted-foreground">Crea un contacto y arrástralo entre columnas para reflejar el estado real de tus conversaciones.</p>
              </div>
              <div className="w-full md:max-w-md">
                <ContactInput onAdd={handleAddContact} />
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
              {PHASES.map((phase) => (
                <ContactColumn key={phase.key} config={phase} contacts={contactsByPhase(phase.key)} onBubbleClick={setSelectedContact} onDrop={handleDrop} newContactId={newContactId} />
              ))}
            </div>
          </section>

          <PipelineFunnel contactsByPhase={contactsByPhase} />

          <section aria-label="Estadísticas" className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">Progreso semanal y heatmap</p>
              <ProgressHeader weeklyCount={weeklyCount} metaSemanal={metaSemanal} weekProgress={weekProgress} todayCount={todayCount} monthCount={monthCount} heatmapDays={heatmapDays} />
            </div>
            <div className="grid gap-3">
              <div className="rounded-2xl border border-border/70 bg-background/95 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Esta semana</p>
                <p className="mt-1 text-xl font-semibold">{weeklyCount}/{metaSemanal}</p>
                <p className="text-[11px] text-muted-foreground">Contactos hacia tu meta semanal.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/95 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Hoy</p>
                <p className="mt-1 text-xl font-semibold">{todayCount}</p>
                <p className="text-[11px] text-muted-foreground">Nuevas conversaciones registradas.</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/95 px-4 py-3">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Este mes</p>
                <p className="mt-1 text-xl font-semibold">{monthCount}</p>
                <p className="text-[11px] text-muted-foreground">Contactos tocados a lo largo del mes.</p>
              </div>
            </div>
          </section>

          <section aria-label="Mapa mental">
            <ManualGroupArea contacts={contacts} groups={groups} onAddGroup={addGroup} onDeleteGroup={deleteGroup} onAddContactToGroup={addContactToGroup} onRemoveContactFromGroup={removeContactFromGroup} />
          </section>

          <motion.footer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center justify-center gap-2 pb-4 text-[10px] text-muted-foreground">
            <span className="inline-block h-1 w-1 rounded-full bg-primary/40" />
            Arrastra burbujas entre columnas para cambiar de fase
            <span className="inline-block h-1 w-1 rounded-full bg-primary/40" />
            Haz clic en una burbuja para ver detalles
            <span className="inline-block h-1 w-1 rounded-full bg-primary/40" />
          </motion.footer>
        </div>
      </main>

      <BubbleDetailPanel contact={selectedContact} onClose={() => setSelectedContact(null)} onPhaseChange={(id, fase) => { changePhase(id, fase); setSelectedContact(null); }} onDelete={deleteContact} />
    </div>
  );
};

export default Index;
