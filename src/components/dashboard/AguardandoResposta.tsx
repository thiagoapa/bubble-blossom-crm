import { motion } from "framer-motion";
import type { Contact, Phase } from "@/hooks/useContacts";

interface Props {
  contacts: Contact[];
  onChangePhase: (id: string, fase: Phase) => void;
  onContactClick: (c: Contact) => void;
  onToggleAguardando?: (id: string, value: boolean) => void;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

function AvatarBubble({ contact, onClick, color }: { contact: Contact; onClick: () => void; color: { bg: string; shadow: string; ring: string } }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: color.ring }}
          animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: color.ring }}
          animate={{ scale: [1, 1.28, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.div
          className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base z-10"
          style={{ background: color.bg, boxShadow: color.shadow }}
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          {getInitials(contact.nombre) || "?"}
        </motion.div>
      </div>
      <span className="text-[10px] font-medium text-foreground/80 max-w-[64px] truncate text-center group-hover:text-foreground transition-colors">
        {contact.nombre.split(" ")[0]}
      </span>
    </button>
  );
}

const SUB_STATUS_LABELS: Record<string, string> = {
  aguardando_documentacao: "📄 Aguardando Documentação",
  aguardando_visita: "🏠 Aguardando Visita",
  aguardando_proposta: "📝 Aguardando Proposta",
  aguardando_retorno: "📞 Aguardando Retorno",
};

export function AguardandoResposta({ contacts, onContactClick }: Props) {
  const waiting = contacts.filter((c) => c.aguardandoResposta);

  // Pendente = tem subStatus definido (e não está em aguardandoResposta)
  const pendente = contacts.filter((c) => c.subStatus && !c.aguardandoResposta);

  return (
    <div className="flex flex-col gap-4">
      {/* PENDENTE */}
      {pendente.length > 0 && (
        <section className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Pendente
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contatos com ações pendentes — clique para ver detalhes
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">
              {pendente.length} pendente{pendente.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-wrap gap-6 py-2">
            {pendente.map((contact) => (
              <div key={contact.id} className="flex flex-col items-center gap-1">
                <AvatarBubble
                  contact={contact}
                  onClick={() => onContactClick(contact)}
                  color={{
                    bg: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                    shadow: "0 4px 16px rgba(245,158,11,0.4)",
                    ring: "rgba(245,158,11,0.25)",
                  }}
                />
                {contact.subStatus && (
                  <span className="text-[9px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full max-w-[72px] truncate text-center">
                    {SUB_STATUS_LABELS[contact.subStatus] ?? contact.subStatus}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AGUARDANDO RESPOSTA */}
      <section className="rounded-2xl border border-border/70 bg-background/95 p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Aguardando Resposta
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Contatos que você está esperando retorno — clique em um para ver detalhes
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-500">
            {waiting.length} aguardando
          </span>
        </div>

        {waiting.length === 0 ? (
          <p className="text-center text-xs text-muted-foreground py-6">
            Nenhum contato aguardando resposta. Marque um contato no painel de detalhes. 💤
          </p>
        ) : (
          <div className="flex flex-wrap gap-6 py-2">
            {waiting.map((contact) => (
              <AvatarBubble
                key={contact.id}
                contact={contact}
                onClick={() => onContactClick(contact)}
                color={{
                  bg: "linear-gradient(135deg, #f43f5e, #fb7185)",
                  shadow: "0 4px 16px rgba(244,63,94,0.4)",
                  ring: "rgba(244,63,94,0.25)",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
