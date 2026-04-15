import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Phase } from "@/hooks/useContacts";
import { PHASE_MAP } from "@/lib/phases";

interface ContactBubbleProps {
  id: string;
  nombre: string;
  telefono?: string;
  fase: Phase;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
  isNew?: boolean;
}

export function ContactBubble({
  id,
  nombre,
  telefono,
  fase,
  onClick,
  onDragStart,
  isNew = false,
}: ContactBubbleProps) {
  const config = PHASE_MAP[fase];
  const noPhone = !telefono;
  const initials = nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <AnimatePresence>
      <motion.div
        key={id}
        initial={isNew ? { scale: 0, opacity: 0, rotate: -10 } : false}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={
          isNew
            ? { type: "spring", stiffness: 400, damping: 14 }
            : undefined
        }
        className="flex-shrink-0"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              draggable
              onDragStart={onDragStart}
              className={`
                w-11 h-11 rounded-full flex items-center justify-center
                ${noPhone ? "bg-emerald-500 text-white" : `${config.colorClass} ${config.textClass}`}
                text-[11px] font-black cursor-grab active:cursor-grabbing
                select-none outline-none
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
                transition-all duration-150
                hover:scale-115 hover:-translate-y-1.5
              `}
              style={{
                boxShadow: noPhone
                  ? "0 4px 14px #10b98155, 0 1px 4px #10b98133, inset 0 1px 0 rgba(255,255,255,0.25)"
                  : `0 4px 14px ${config.headerColor}55, 0 1px 4px ${config.headerColor}33, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
              aria-label={noPhone ? `${nombre} (sem telefone)` : nombre}
            >
              {initials || "?"}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            className="text-xs font-semibold px-2.5 py-1 rounded-lg shadow-md"
          >
            {nombre}
            {noPhone && (
              <span className="block text-[10px] font-normal text-emerald-300 mt-0.5">
                📵 Sem telefone
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </motion.div>
    </AnimatePresence>
  );
}
