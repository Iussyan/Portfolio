"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@v2/lib/utils";

export type NotificationType = "SUCCESS" | "ERROR" | "INFO" | "WARNING";

interface TacticalNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  message: string;
  className?: string;
  duration?: number;
}

const CONFIG = {
  SUCCESS: {
    icon: CheckCircle2,
    accent: "bg-secondary",
    iconColor: "text-secondary",
    bg: "bg-surface border-secondary/20",
  },
  ERROR: {
    icon: AlertCircle,
    accent: "bg-tertiary",
    iconColor: "text-tertiary",
    bg: "bg-surface border-tertiary/20",
  },
  WARNING: {
    icon: AlertCircle,
    accent: "bg-primary",
    iconColor: "text-primary",
    bg: "bg-surface border-primary/20",
  },
  INFO: {
    icon: Info,
    accent: "bg-primary",
    iconColor: "text-primary",
    bg: "bg-surface border-primary/20",
  },
};

export function TacticalNotification({
  isOpen,
  onClose,
  type,
  title,
  message,
  className,
  duration = 4000,
}: TacticalNotificationProps) {
  const cfg = CONFIG[type];
  const Icon = cfg.icon;

  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
          className={cn(
            "flex items-start gap-3 w-80 rounded-xl border shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden pointer-events-auto",
            cfg.bg,
            className
          )}
        >
          {/* Accent bar */}
          <div className={cn("w-1 self-stretch shrink-0", cfg.accent)} />

          <div className="flex items-start gap-3 flex-1 py-3 pr-3">
            <Icon size={16} className={cn("shrink-0 mt-0.5", cfg.iconColor)} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-display font-semibold text-on-surface leading-tight">{title}</p>
              <p className="text-xs text-on-surface-muted mt-0.5 leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-on-surface-muted hover:text-on-surface transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
