import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://crm.project28.cloud/api";

export type Phase = "novos" | "primeira" | "segunda" | "followup" | "comprador";

export interface Contact {
  id: string;
  nombre: string;
  telefono?: string;
  fase: Phase;
  fechaCreacion: string;
  createdAt?: string;
  firstMeetingDate?: string;
  secondMeetingDate?: string;
  trelloUrl?: string;
}

export interface ManualGroup {
  id: string;
  nombre: string;
  contactIds: string[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

// Map API contact (etapa) → frontend contact (fase)
function mapFromApi(c: {
  id: number | string;
  nombre: string;
  telefono?: string;
  etapa?: string;
  fase?: string;
  fecha?: string;
  createdAt?: string;
  fechaCreacion?: string;
  firstMeetingDate?: string;
  secondMeetingDate?: string;
  trelloUrl?: string;
}): Contact {
  const dateStr =
    c.fecha
      ? c.fecha.split("T")[0]
      : c.createdAt
      ? c.createdAt.split("T")[0]
      : c.fechaCreacion
      ? c.fechaCreacion.split("T")[0]
      : new Date().toISOString().split("T")[0];

  return {
    id: String(c.id),
    nombre: c.nombre,
    telefono: c.telefono,
    fase: (c.etapa ?? c.fase ?? "novos") as Phase,
    fechaCreacion: dateStr,
    createdAt: dateStr,
    firstMeetingDate: c.firstMeetingDate,
    secondMeetingDate: c.secondMeetingDate,
    trelloUrl: c.trelloUrl,
  };
}

// ─── Groups: still in localStorage (not in your API yet) ──────────────────

const GROUPS_KEY = "bubble-crm-groups-v1";

function loadGroups(): ManualGroup[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveGroups(groups: ManualGroup[]) {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
}

// ──────────────────────────────────────────────────────────────────────────

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ManualGroup[]>(loadGroups);
  const [loading, setLoading] = useState(true);
  const metaSemanal = 30;

  // ── Load contacts from API on mount ───────────────────────────────────
  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch(`${API_BASE}/contacts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setContacts(data.map(mapFromApi));
      } catch (err) {
        console.error("Error loading contacts from API:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  // ── Persist groups to localStorage whenever they change ───────────────
  useEffect(() => {
    saveGroups(groups);
  }, [groups]);

  // ── Derived stats ─────────────────────────────────────────────────────
  const contactosNormalizados = contacts.map((c) => ({
    ...c,
    createdAt: c.createdAt ?? c.fechaCreacion,
  }));

  const currentWeekStart = getWeekStart();
  const weeklyContacts = contactosNormalizados.filter(
    (c) => (c.createdAt ?? c.fechaCreacion) >= currentWeekStart
  );
  const weeklyCount = weeklyContacts.length;
  const weekProgress = Math.min((weeklyCount / metaSemanal) * 100, 100);

  const today = new Date().toISOString().split("T")[0];
  const todayCount = contactosNormalizados.filter(
    (c) => (c.createdAt ?? c.fechaCreacion) === today
  ).length;

  const monthPrefix = today.slice(0, 7);
  const monthCount = contactosNormalizados.filter((c) =>
    (c.createdAt ?? c.fechaCreacion).startsWith(monthPrefix)
  ).length;

  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    const count = contactosNormalizados.filter(
      (c) => (c.createdAt ?? c.fechaCreacion) === dateStr
    ).length;
    return { date: dateStr, count };
  });

  // ── addContact: POST to API ────────────────────────────────────────────
  const addContact = useCallback(
    async (nombre: string, telefono?: string, createdDate?: string) => {
      const baseDate = createdDate || new Date().toISOString().split("T")[0];

      try {
        const res = await fetch(`${API_BASE}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nombre.trim(),
            telefono: telefono?.trim() || null,
            etapa: "novos",
            fecha: baseDate,
          }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const saved = await res.json();
        const newContact = mapFromApi(saved);
        setContacts((prev) => [...prev, newContact]);
        return newContact;
      } catch (err) {
        console.error("Error saving contact to API:", err);
        // Fallback: add locally so the UI doesn't break
        const fallback: Contact = {
          id: crypto.randomUUID(),
          nombre: nombre.trim(),
          telefono: telefono?.trim() || undefined,
          fase: "novos",
          fechaCreacion: baseDate,
          createdAt: baseDate,
        };
        setContacts((prev) => [...prev, fallback]);
        return fallback;
      }
    },
    []
  );

  // ── changePhase: PATCH to API ─────────────────────────────────────────
  const changePhase = useCallback(
    async (id: string, newFase: Phase, phaseDate?: string) => {
      const todayStr = new Date().toISOString().split("T")[0];

      // Optimistic update
      setContacts((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const next: Contact = { ...c, fase: newFase };
          const effectiveDate = phaseDate || todayStr;
          if (newFase === "primeira" && !next.firstMeetingDate) {
            next.firstMeetingDate = effectiveDate;
          }
          if (newFase === "segunda" && !next.secondMeetingDate) {
            next.secondMeetingDate = effectiveDate;
          }
          return next;
        })
      );

      try {
        await fetch(`${API_BASE}/contacts/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ etapa: newFase }),
        });
      } catch (err) {
        console.error("Error updating phase in API:", err);
      }
    },
    []
  );

  // ── deleteContact: DELETE to API ──────────────────────────────────────
  const deleteContact = useCallback(async (id: string) => {
    // Optimistic update
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        contactIds: g.contactIds.filter((cid) => cid !== id),
      }))
    );

    try {
      await fetch(`${API_BASE}/contacts/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting contact from API:", err);
    }
  }, []);

  // ── Groups (local only for now) ───────────────────────────────────────
  const addGroup = useCallback((nombre: string) => {
    setGroups((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nombre, contactIds: [] },
    ]);
  }, []);

  const addContactToGroup = useCallback((groupId: string, contactId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId && !g.contactIds.includes(contactId)
          ? { ...g, contactIds: [...g.contactIds, contactId] }
          : g
      )
    );
  }, []);

  const removeContactFromGroup = useCallback(
    (groupId: string, contactId: string) => {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, contactIds: g.contactIds.filter((id) => id !== contactId) }
            : g
        )
      );
    },
    []
  );

  const deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  const contactsByPhase = (fase: Phase) =>
    contacts.filter((c) => c.fase === fase);

  return {
    contacts: contactosNormalizados,
    groups,
    loading,
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
