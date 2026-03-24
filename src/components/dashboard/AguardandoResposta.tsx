import { motion } from "framer-motion";
import type { Contact, Phase } from "@/hooks/useContacts";

interface Props {
  contacts: Contact[];
  onChangePhase: (id: string, fase: Phase) => void;
  onContactClick: (c: Contact) => void;
}

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
}

export function AguardandoResposta({ contacts, onContactClick }: Props) {
  const waiting = contacts.filter((c) => c.aguardandoResposta);

  return (
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
            <button
              key={contact.id}
              onClick={() => onContactClick(contact)}
              className="flex flex-col items-center gap-1.5 group"
            >
              {/* Pulsing avatar */}
              <div className="relative">
                {/* Outer ping ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(244,63,94,0.25)" }}
                  animate={{ scale: [1, 1.55, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
                {/* Inner pulse */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ background: "rgba(244,63,94,0.18)" }}
                  animate={{ scale: [1, 1.28, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                />
                {/* Avatar */}
                <motion.div
                  className="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-base z-10"
                  style={{
                    background: "linear-gradient(135deg, #f43f5e, #fb7185)",
                    boxShadow: "0 4px 16px rgba(244,63,94,0.4)",
                  }}
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
          ))}
        </div>
      )}
    </section>
  );
}
