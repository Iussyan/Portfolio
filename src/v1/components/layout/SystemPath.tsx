"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export function SystemPath() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-6 py-2 flex items-center gap-2 text-xs font-mono font-bold tracking-[0.2em] text-on-surface-muted/80 overflow-x-auto no-scrollbar whitespace-nowrap uppercase"
    >
      <Link href="/" className="hover:text-primary transition-colors">ROOT</Link>
      <span>/</span>
      <Link href="/" className="hover:text-primary transition-colors">PORTAL</Link>
      {paths.length > 0 && (
        <>
          <span>/</span>
          {paths.map((p, i) => (
            <span key={p} className="flex items-center gap-2">
              <span className="text-primary font-bold uppercase">{p}</span>
              {i < paths.length - 1 && <span>/</span>}
            </span>
          ))}
        </>
      )}
      {!paths.length && <span className="text-primary font-bold uppercase">TERMINAL</span>}
      <div className="ms-auto hidden sm:flex items-center gap-4">
        <span className="animate-pulse">LATENCY: 8ms</span>
        <span>AUTH: LVL_05</span>
      </div>
    </motion.div>
  );
}
