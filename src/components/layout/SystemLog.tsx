"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const LOG_MESSAGES = [
  "Handshake established // CORE_NODE_01",
  "Fetching project_metadata.json...",
  "Biometric scan complete: ACCESS_GRANTED",
  "Uplink synchronized with sector_04",
  "Compiling technical proficiency assets...",
  "Scanning for legacy data fragments...",
  "Handshake established // REMOTE_ARCHIVE",
  "Optimizing interface latency: 12ms",
  "Deploying security protocols: STABLE",
  "Neural link established: OPERATOR_01",
];

type LogEntry = { message: string; timestamp: string };

export function SystemLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const initialLogs = LOG_MESSAGES.slice(0, 4).map(msg => ({
      message: msg,
      timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }));
    setLogs(initialLogs);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextMessage = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setLogs((prev) => {
        const newLogs = [...prev, { message: nextMessage, timestamp }];
        return newLogs.slice(-10);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="surface-low p-6 h-48 sm:h-64 border-l-2 border-secondary/30 flex flex-col gap-3 relative overflow-hidden group hover:border-secondary transition-colors">
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-secondary/40" />
      <h3 className="text-sm font-bold tracking-widest text-secondary uppercase mb-2">SYSTEM_FEED</h3>
      <div
        ref={scrollRef}
        className="flex flex-col gap-2 overflow-y-auto scrollbar-tactical pr-2"
      >
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={`${log.message}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs font-mono text-on-surface-muted leading-relaxed font-bold tracking-tight"
            >
              <span className="text-secondary/60 font-mono">[{log.timestamp}]</span> {log.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
