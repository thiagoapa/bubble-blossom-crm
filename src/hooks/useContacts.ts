import { useState, useEffect, useCallback } from "react";

export type Phase = "novos" | "primeira" | "segunda" | "followup" | "comprador";

export interface Contact {
  id: string;
  nombre: string;
  telefono?: string;
  fase: Phase;
  fechaCreacion: string; // ISO date string
  trelloUrl?: string;
}

export interface ManualGroup {
  id: string;
  nombre: string;
  contactIds: string[];
}

interface Store {
  metaSemanal: number;
  contactos: Contact[];
  agrupacionesManuales: ManualGroup[];
  weekStart: string; // ISO date of the Monday this week
}

// Get the Monday of the current week as ISO string
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay(); // 0 = Sun
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

const STORAGE_KEY = "bubble-crm-v1";

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Store = JSON.parse(raw);
      // If week has rolled over, keep contacts but note new week
      return { ...parsed, weekStart: parsed.weekStart || getWeekStart() };
    }
  } catch {
    // ignore
  }
  return {
    metaSemanal: 30,
    contactos: [],
    agrupacionesManuales: [],
    weekStart: getWeekStart(),
  };
}

function saveStore(store: Store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function useContacts() {
  const [store, setStore] = useState<Store>(loadStore);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  // Weekly contacts: contacts created this week
  const currentWeekStart = getWeekStart();
  const weeklyContacts = store.contactos.filter(
    (c) => c.fechaCreacion >= currentWeekStart
  );
  const weeklyCount = weeklyContacts.length;
  const metaSemanal = store.metaSemanal;
  const weekProgress = Math.min((weeklyCount / metaSemanal) * 100, 100);

  // Today's count
  const today = new Date().toISOString().split("T")[0];
  const todayCount = store.contactos.filter((c) => c.fechaCreacion === today).length;

  // This month's count
  const monthPrefix = today.slice(0, 7);
  const monthCount = store.contactos.filter((c) =>
    c.fechaCreacion.startsWith(monthPrefix)
  ).length;

  // Heatmap: last 30 days
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const count = store.contactos.filter((c) => c.fechaCreacion === dateStr).length;
    return { date: dateStr, count };
  });

  const addContact = useCallback((nombre: string, telefono?: string) => {
    const newContact: Contact = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      telefono: telefono?.trim() || undefined,
      fase: "novos",
      fechaCreacion: new Date().toISOString().split("T")[0],
      trelloUrl: undefined,
    };
    setStore((prev) => ({
      ...prev,
      contactos: [...prev.contactos, newContact],
    }));
    return newContact;
  }, []);

  const changePhase = useCallback((id: string, newFase: Phase) => {
    setStore((prev) => ({
      ...prev,
      contactos: prev.contactos.map((c) =>
        c.id === id ? { ...c, fase: newFase } : c
      ),
    }));
  }, []);

  const deleteContact = useCallback((id: string) => {
    setStore((prev) => ({
      ...prev,
      contactos: prev.contactos.filter((c) => c.id !== id),
      agrupacionesManuales: prev.agrupacionesManuales.map((g) => ({
        ...g,
        contactIds: g.contactIds.filter((cid) => cid !== id),
      })),
    }));
  }, []);

  const addGroup = useCallback((nombre: string) => {
    setStore((prev) => ({
      ...prev,
      agrupacionesManuales: [
        ...prev.agrupacionesManuales,
        { id: crypto.randomUUID(), nombre, contactIds: [] },
      ],
    }));
  }, []);

  const addContactToGroup = useCallback((groupId: string, contactId: string) => {
    setStore((prev) => ({
      ...prev,
      agrupacionesManuales: prev.agrupacionesManuales.map((g) =>
        g.id === groupId && !g.contactIds.includes(contactId)
          ? { ...g, contactIds: [...g.contactIds, contactId] }
          : g
      ),
    }));
  }, []);

  const removeContactFromGroup = useCallback((groupId: string, contactId: string) => {
    setStore((prev) => ({
      ...prev,
      agrupacionesManuales: prev.agrupacionesManuales.map((g) =>
        g.id === groupId
          ? { ...g, contactIds: g.contactIds.filter((id) => id !== contactId) }
          : g
      ),
    }));
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setStore((prev) => ({
      ...prev,
      agrupacionesManuales: prev.agrupacionesManuales.filter((g) => g.id !== groupId),
    }));
  }, []);

  const contactsByPhase = (fase: Phase) =>
    store.contactos.filter((c) => c.fase === fase);

  return {
    contacts: store.contactos,
    groups: store.agrupacionesManuales,
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
  };
}
