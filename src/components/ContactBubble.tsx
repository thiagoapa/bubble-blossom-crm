import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Phase } from "@/hooks/useContacts";
import { PHASE_MAP } from "@/lib/phases";

interface ContactBubbleProps {
  id: string;
  nombre: string;
  fase: Phase;
  onClick: () => void;
  onDragStart?: (e: React.DragEvent<HTMLButtonElement>) => void;
  isNew?: boolean;
}

export function ContactBubble({
  id,
  nombre,
  fase,
  onClick,
  onDragStart,
  isNew = false,
}: ContactBubbleProps) {
  const config = PHASE_MAP[fase];
  const initials = nombre
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          layout
          key={id}
          initial={isNew ? { scale: 0, opacity: 0 } : false}
          animate={{ scale: 1, opacity: 1 }}
          transition={isNew ? { type: "spring", stiffness: 380, damping: 14 } : undefined}
          onClick={onClick}
          draggable
          onDragStart={onDragStart as unknown as React.DragEventHandler<HTMLButtonElement>}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${config.colorClass} ${config.textClass}
            text-xs font-bold cursor-grab active:cursor-grabbing
            select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
            shadow-bubble hover:shadow-bubble-hover hover:scale-110 hover:-translate-y-1
            transition-all duration-150
          `}
          aria-label={nombre}
          style={{ touchAction: "none" }}
        >
          {initials || "?"}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs font-medium px-2 py-1 rounded-lg">
        {nombre}
      </TooltipContent>
    </Tooltip>
  );
}
