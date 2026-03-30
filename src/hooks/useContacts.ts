import { useState, useEffect, useCallback } from "react";
import { getToken } from "@/components/LoginScreen";

const API_BASE = "https://crm.project28.cloud/api";

export type Phase = "novos" | "primeira" | "segunda" | "followup" |
  "captacao" | "comprador" | "enviei_imoveis" | "visita_imovel" | "comprou";

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
  aguardandoResposta?: boolean;
  notes?: string;
}

export interface ManualGroup {
  id: string;
  nombre: string;
  contactIds: string[];
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

function authHeaders() {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function mapFromApi(c: {
  id: number | string;
  nombre: string;
  telefono?: string;
  etapa?: string;
  fase?: string;
  fecha?: string;
  createdAt?: string;
  fechaCreacion?: string;
  // camelCase from server
  firstMeetingDate?: string;
  secondMeetingDate?: string;
  aguardandoResposta?: boolean;
  // snake_case fallback (direct DB)
  first_meeting_date?: string;
  second_meeting_date?: string;
  aguardando_resposta?: boolean;
  trelloUrl?: string;
  notes?: string;
}): Contact {
  const dateStr =
    c.fecha ? c.fecha.split("T")[0]
    : c.createdAt ? c.createdAt.split("T")[0]
    : c.fechaCreacion ? c.fechaCreacion.split("T")[0]
    : new Date().toISOString().split("T")[0];

  const firstMeeting = c.firstMeetingDate ?? c.first_meeting_date ?? undefined;
  const secondMeeting = c.secondMeetingDate ?? c.second_meeting_date ?? undefined;

  return {
    id: String(c.id),
    nombre: c.nombre,
    telefono: c.telefono,
    fase: (c.etapa ?? c.fase ?? "novos") as Phase,
    fechaCreacion: dateStr,
    createdAt: dateStr,
    firstMeetingDate: firstMeeting ? firstMeeting.split("T")[0] : undefined,
    secondMeetingDate: secondMeeting ? secondMeeting.split("T")[0] : undefined,
    trelloUrl: c.trelloUrl,
    aguardandoResposta: c.aguardandoResposta ?? c.aguardando_resposta ?? false,
    notes: c.notes ?? undefined,
  };
}

const GROUPS_KEY = "bubble-crm-groups-v1";
function loadGroups(): ManualGroup[] {
  try { const r = localStorage.getItem(GROUPS_KEY); if (r) return JSON.parse(r); } catch {}
  return [];
}
function saveGroups(g: ManualGroup[]) { localStorage.setItem(GROUPS_KEY, JSON.stringify(g)); }

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<ManualGroup[]>(loadGroups);
  const [loading, setLoading] = useState(true);
  const metaSemanal = 30;

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch(`${API_BASE}/contacts`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setContacts(data.map(mapFromApi));
      } catch (err) {
        console.error("Error loading contacts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchContacts();
  }, []);

  useEffect(() => { saveGroups(groups); }, [groups]);

  const contactosNormalizados = contacts.map((c) => ({ ...c, createdAt: c.createdAt ?? c.fechaCreacion }));
  const currentWeekStart = getWeekStart();
  const weeklyCount = contactosNormalizados.filter((c) => (c.createdAt ?? c.fechaCreacion) >= currentWeekStart).length;
  const weekProgress = Math.min((weeklyCount / metaSemanal) * 100, 100);
  const today = new Date().toISOString().split("T")[0];
  const todayCount = contactosNormalizados.filter((c) => (c.createdAt ?? c.fechaCreacion) === today).length;
  const monthPrefix = today.slice(0, 7);
  const monthCount = contactosNormalizados.filter((c) => (c.createdAt ?? c.fechaCreacion).startsWith(monthPrefix)).length;
  const heatmapDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split("T")[0];
    return { date: dateStr, count: contactosNormalizados.filter((c) => (c.createdAt ?? c.fechaCreacion) === dateStr).length };
  });

  const addContact = useCallback(async (nombre: string, telefono?: string, createdDate?: string) => {
    const baseDate = createdDate || new Date().toISOString().split("T")[0];
    try {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ nombre: nombre.trim(), telefono: telefono?.trim() || null, etapa: "novos", fecha: baseDate }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      const newContact = mapFromApi(saved);
      setContacts((prev) => [...prev, newContact]);
      return newContact;
    } catch (err) {
      console.error("Error saving contact:", err);
      const fallback: Contact = { id: crypto.randomUUID(), nombre: nombre.trim(), telefono: telefono?.trim() || undefined, fase: "novos", fechaCreacion: baseDate, createdAt: baseDate };
      setContacts((prev) => [...prev, fallback]);
      return fallback;
    }
  }, []);

  const changePhase = useCallback(async (id: string, newFase: Phase, phaseDate?: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const effectiveDate = phaseDate || todayStr;

    // Update local state first
    let firstMeetingToSave: string | undefined;
    let secondMeetingToSave: string | undefined;

    setContacts((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const next: Contact = { ...c, fase: newFase };
      if (newFase === "primeira" && !next.firstMeetingDate) {
        next.firstMeetingDate = effectiveDate;
        firstMeetingToSave = effectiveDate;
      }
      if (newFase === "segunda" && !next.secondMeetingDate) {
        next.secondMeetingDate = effectiveDate;
        secondMeetingToSave = effectiveDate;
      }
      return next;
    }));

    // Build PATCH payload — always send etapa, plus dates if they were just set
    const payload: Record<string, unknown> = { etapa: newFase };
    if (firstMeetingToSave)  payload.firstMeetingDate  = firstMeetingToSave;
    if (secondMeetingToSave) payload.secondMeetingDate = secondMeetingToSave;

    try {
      await fetch(`${API_BASE}/contacts/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });
    } catch (err) { console.error("Error updating phase:", err); }
  }, []);

  const updateMeetingDate = useCallback(async (id: string, field: "firstMeetingDate" | "secondMeetingDate", date: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: date } : c))
    );
    try {
      await fetch(`${API_BASE}/contacts/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ [field]: date }),
      });
    } catch (err) { console.error("Error updating meeting date:", err); }
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    setGroups((prev) => prev.map((g) => ({ ...g, contactIds: g.contactIds.filter((cid) => cid !== id) })));
    try {
      await fetch(`${API_BASE}/contacts/${id}`, { method: "DELETE", headers: authHeaders() });
    } catch (err) { console.error("Error deleting contact:", err); }
  }, []);

  const toggleAguardando = useCallback(async (id: string, value: boolean) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, aguardandoResposta: value } : c))
    );
    try {
      await fetch(`${API_BASE}/contacts/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ aguardandoResposta: value }),
      });
    } catch (err) { console.error("Error toggling aguardando:", err); }
  }, []);

  const updateNote = useCallback(async (id: string, notes: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, notes } : c))
    );
    try {
      await fetch(`${API_BASE}/contacts/${id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ notes }),
      });
    } catch (err) { console.error("Error updating note:", err); }
  }, []);

  const addGroup = useCallback((nombre: string) => {
    setGroups((prev) => [...prev, { id: crypto.randomUUID(), nombre, contactIds: [] }]);
  }, []);

  const addContactToGroup = useCallback((groupId: string, contactId: string) => {
    setGroups((prev) => prev.map((g) => g.id === groupId && !g.contactIds.includes(contactId) ? { ...g, contactIds: [...g.contactIds, contactId] } : g));
  }, []);

  const removeContactFromGroup = useCallback((groupId: string, contactId: string) => {
    setGroups((prev) => prev.map((g) => g.id === groupId ? { ...g, contactIds: g.contactIds.filter((id) => id !== contactId) } : g));
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }, []);

  const contactsByPhase = (fase: Phase) => contacts.filter((c) => c.fase === fase);

  return {
    contacts: contactosNormalizados, groups, loading, metaSemanal, weeklyCount, weekProgress,
    todayCount, monthCount, heatmapDays, contactsByPhase, addContact, changePhase,
    deleteContact, updateMeetingDate, updateNote, addGroup, addContactToGroup, removeContactFromGroup, deleteGroup,
    toggleAguardando,
  };
}
