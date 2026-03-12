import { useState } from "react";
import type { Contact, Phase } from "@/hooks/useContacts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { PHASES } from "@/lib/phases";

interface DayDetailsModalProps {
  date: string | null;
  contacts: Contact[];
  onOpenChange: (open: boolean) => void;
  onDeleteContact: (id: string) => void;
  onChangePhase: (id: string, fase: Phase) => void;
}

export function DayDetailsModal({
  date,
  contacts,
  onOpenChange,
  onDeleteContact,
  onChangePhase,
}: DayDetailsModalProps) {
  const open = !!date;
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [selectedForActions, setSelectedForActions] = useState<Contact | null>(null);

  if (!date) {
    return (
      <Dialog open={false} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const created = contacts.filter(
    (c) => (c.createdAt ?? c.fechaCreacion) === date,
  );
  const firstMeetings = contacts.filter((c) => c.firstMeetingDate === date);
  const secondMeetings = contacts.filter((c) => c.secondMeetingDate === date);

  const formatDateLabel = (d: string) => d;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actividad del día</DialogTitle>
            <DialogDescription>{formatDateLabel(date)}</DialogDescription>
          </DialogHeader>
          <div className="mt-2 space-y-4 text-sm">
            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Contactos creados
              </h3>
              {created.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin contactos creados.</p>
              ) : (
                <ul className="space-y-1.5">
                  {created.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5"
                    >
                      <button
                        type="button"
                        className="flex-1 text-left"
                        onClick={() => setSelectedForActions(c)}
                      >
                        <span className="block truncate text-xs font-medium">
                          {c.nombre}
                        </span>
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          Nuevo contacto
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactToDelete(c);
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                1ª reuniones (1R)
              </h3>
              {firstMeetings.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin primeras reuniones.</p>
              ) : (
                <ul className="space-y-1.5">
                  {firstMeetings.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5"
                    >
                      <button
                        type="button"
                        className="flex-1 text-left"
                        onClick={() => setSelectedForActions(c)}
                      >
                        <span className="block truncate text-xs font-medium">
                          {c.nombre}
                        </span>
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          1R registrada
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactToDelete(c);
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                2ª reuniones (2R)
              </h3>
              {secondMeetings.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin segundas reuniones.</p>
              ) : (
                <ul className="space-y-1.5">
                  {secondMeetings.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between rounded-md border border-border bg-background px-2.5 py-1.5"
                    >
                      <button
                        type="button"
                        className="flex-1 text-left"
                        onClick={() => setSelectedForActions(c)}
                      >
                        <span className="block truncate text-xs font-medium">
                          {c.nombre}
                        </span>
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          2R registrada
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setContactToDelete(c);
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {selectedForActions && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4 sm:inset-0 sm:items-center sm:justify-center sm:px-0">
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-background p-4 shadow-lg">
            <div className="mb-3">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Acciones rápidas
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {selectedForActions.nombre}
              </p>
              {selectedForActions.telefono && (
                <p className="text-xs text-muted-foreground">
                  {selectedForActions.telefono}
                </p>
              )}
            </div>

            <div className="mb-3 grid gap-2 text-xs sm:grid-cols-2">
              <button
                type="button"
                className="rounded-lg border border-border bg-background px-3 py-2 text-left hover:border-neutral-900/70"
                onClick={() => onChangePhase(selectedForActions.id, "primeira")}
              >
                Marcar como 1R
              </button>
              <button
                type="button"
                className="rounded-lg border border-border bg-background px-3 py-2 text-left hover:border-neutral-900/70"
                onClick={() => onChangePhase(selectedForActions.id, "segunda")}
              >
                Marcar como 2R
              </button>
            </div>

            <div className="mb-3">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Mover fase en el pipeline
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PHASES.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => onChangePhase(selectedForActions.id, p.key)}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                      selectedForActions.fase === p.key
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-border bg-background text-foreground hover:border-neutral-900/60"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:border-neutral-900/40"
                onClick={() => setSelectedForActions(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/15"
                onClick={() => {
                  setContactToDelete(selectedForActions);
                  setSelectedForActions(null);
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar contacto
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertDialog
        open={!!contactToDelete}
        onOpenChange={(open) => {
          if (!open) setContactToDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar contacto</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Eliminar este contacto definitivamente?
              <br />
              <span className="mt-1 block text-foreground">
                {contactToDelete?.nombre ?? ""}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (contactToDelete) {
                  onDeleteContact(contactToDelete.id);
                }
                setContactToDelete(null);
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

