"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type NotificationType = "SUCCESS" | "ERROR" | "INFO";

interface TacticalNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  className?: string; // Add className for custom positioning
}

export function TacticalNotification({
  isOpen,
  onClose,
  type,
  title,
  message,
  duration = 5000,
  className,
}: TacticalNotificationProps) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  const timestamp = new Date().toLocaleTimeString([], { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });

  const config = {
    SUCCESS: {
      icon: <CheckCircle2 size={16} />,
      color: "text-secondary",
      borderColor: "border-secondary/40",
      bgColor: "bg-secondary/5",
      accent: "bg-secondary"
    },
    ERROR: {
      icon: <AlertCircle size={16} />,
      color: "text-tertiary",
      borderColor: "border-tertiary/40",
      bgColor: "bg-tertiary/5",
      accent: "bg-tertiary"
    },
    INFO: {
      icon: <Info size={16} />,
      color: "text-primary",
      borderColor: "border-primary/40",
      bgColor: "bg-primary/5",
      accent: "bg-primary"
    }
  }[type];

  return (
    <>
      {isOpen && (
        <motion.div
          layout
          initial={{ opacity: 0, x: 20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
          className={cn(
            "z-2002 w-80 font-mono border-l-4 shadow-2xl overflow-hidden pointer-events-auto",
            config.borderColor,
            config.bgColor,
            "backdrop-blur-md border border-t-outline/10 border-b-outline/10 border-r-outline/10",
            className
          )}
        >
          {/* Progress Bar */}
          <motion.div 
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: duration / 1000, ease: "linear" }}
            className={cn("absolute bottom-0 left-0 h-0.5 opacity-50", config.accent)}
          />

          <div className="p-4 flex gap-4 items-start relative">
            <div className={cn("mt-1", config.color)}>
              {config.icon}
            </div>
            
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className={cn("text-[10px] font-black tracking-widest uppercase", config.color)}>
                  {title}
                </span>
                <span className="text-[9px] text-on-surface-muted italic">[{timestamp}]</span>
              </div>
              <p className="text-xs text-on-surface font-bold leading-relaxed uppercase tracking-tight">
                {message}
              </p>
            </div>

            <button 
              onClick={onClose}
              className="text-on-surface-muted hover:text-on-surface transition-colors p-1"
            >
              <X size={14} />
            </button>
          </div>

          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-outline/20" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-outline/20" />
        </motion.div>
      )}
    </>
  );
}
