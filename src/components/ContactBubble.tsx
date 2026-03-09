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
          initial={isNew ? { scale: 0, rotate: -8, opacity: 0 } : false}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={
            isNew
              ? { type: "spring", stiffness: 400, damping: 15 }
              : undefined
          }
          whileHover={{ scale: 1.12, y: -3 }}
          whileTap={{ scale: 0.93 }}
          draggable
          onDragStart={onDragStart as React.DragEventHandler<HTMLButtonElement>}
          onClick={onClick}
          className={`
            w-12 h-12 rounded-full flex items-center justify-center
            ${config.colorClass} ${config.textClass}
            text-xs font-bold shadow-bubble cursor-grab active:cursor-grabbing
            select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary
            transition-shadow hover:shadow-bubble-hover
          `}
          aria-label={nombre}
          key={id}
        >
          {initials || "?"}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="text-xs font-medium px-2 py-1 rounded-lg"
      >
        {nombre}
      </TooltipContent>
    </Tooltip>
  );
}
