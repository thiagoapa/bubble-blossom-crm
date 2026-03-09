import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users } from "lucide-react";
import type { Contact } from "@/hooks/useContacts";
import type { ManualGroup } from "@/hooks/useContacts";
import { PHASE_MAP } from "@/lib/phases";

interface ManualGroupAreaProps {
  contacts: Contact[];
  groups: ManualGroup[];
  onAddGroup: (name: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onAddContactToGroup: (groupId: string, contactId: string) => void;
  onRemoveContactFromGroup: (groupId: string, contactId: string) => void;
}

export function ManualGroupArea({
  contacts,
  groups,
  onAddGroup,
  onDeleteGroup,
  onAddContactToGroup,
  onRemoveContactFromGroup,
}: ManualGroupAreaProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [dragOverGroupId, setDragOverGroupId] = useState<string | null>(null);
  const [dragCounters, setDragCounters] = useState<Record<string, number>>({});

  const handleAddGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      onAddGroup(newGroupName.trim());
      setNewGroupName("");
    }
  };

  const handleDrop = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    const contactId = e.dataTransfer.getData("text/plain");
    if (contactId) onAddContactToGroup(groupId, contactId);
    setDragOverGroupId(null);
    setDragCounters((prev) => ({ ...prev, [groupId]: 0 }));
  };

  const handleDragEnter = (e: React.DragEvent, groupId: string) => {
    e.preventDefault();
    setDragCounters((prev) => {
      const next = { ...prev, [groupId]: (prev[groupId] || 0) + 1 };
      setDragOverGroupId(groupId);
      return next;
    });
  };

  const handleDragLeave = (groupId: string) => {
    setDragCounters((prev) => {
      const next = { ...prev, [groupId]: Math.max((prev[groupId] || 0) - 1, 0) };
      if (next[groupId] === 0) setDragOverGroupId(null);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 280, damping: 28 }}
      className="glass rounded-2xl shadow-column w-full overflow-hidden"
    >
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">
            🗺️ Mapa Mental — Agrupaciones personales
          </span>
          <span className="text-xs text-muted-foreground">
            (solo visual, no afecta Trello)
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? "▲ ocultar" : "▼ expandir"}
        </span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Add group form */}
              <form onSubmit={handleAddGroup} className="flex gap-2">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder='Ej: "Zona Norte", "Referidos de Juan"...'
                  className="flex-1 bg-secondary text-foreground placeholder:text-muted-foreground text-sm font-medium outline-none px-3 py-2 rounded-xl focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!newGroupName.trim()}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Crear grupo
                </button>
              </form>

              {/* Groups */}
              {groups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Crea un grupo y arrastra burbujas aquí para organizar visualmente 🫧
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groups.map((group) => {
                    const groupContacts = contacts.filter((c) =>
                      group.contactIds.includes(c.id)
                    );
                    return (
                      <div
                        key={group.id}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={(e) => handleDragEnter(e, group.id)}
                        onDragLeave={() => handleDragLeave(group.id)}
                        onDrop={(e) => handleDrop(e, group.id)}
                        className={`
                          rounded-xl p-3 border-2 border-dashed transition-all duration-200
                          ${dragOverGroupId === group.id
                            ? "border-primary bg-primary/10 scale-[1.02]"
                            : "border-border bg-muted/40 hover:border-primary/50"
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-foreground truncate">
                            {group.nombre}
                          </span>
                          <button
                            onClick={() => onDeleteGroup(group.id)}
                            className="p-0.5 rounded-lg hover:bg-destructive/20 hover:text-destructive transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 min-h-10">
                          {groupContacts.length === 0 ? (
                            <p className="text-[10px] text-muted-foreground self-center">
                              Arrastra burbujas aquí
                            </p>
                          ) : (
                            groupContacts.map((c) => {
                              const cfg = PHASE_MAP[c.fase];
                              return (
                                <div key={c.id} className="relative group/bubble">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${cfg.colorClass} shadow-sm`}
                                    title={c.nombre}
                                  >
                                    {c.nombre
                                      .split(" ")
                                      .slice(0, 2)
                                      .map((w) => w[0]?.toUpperCase())
                                      .join("")}
                                  </div>
                                  <button
                                    onClick={() => onRemoveContactFromGroup(group.id, c.id)}
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive text-white rounded-full hidden group-hover/bubble:flex items-center justify-center text-[8px]"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1.5">
                          {groupContacts.length} contacto{groupContacts.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
