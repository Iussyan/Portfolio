"use client";

import { ShieldAlert } from "lucide-react";
import { useVisitorCount } from "@v1/lib/useVisitorCount";

export function Footer() {
  const year = new Date().getFullYear();
  const visitorCount = useVisitorCount();

  return (
    <footer className="bg-surface border-t border-outline/10 py-3 px-6 h-10 flex items-center justify-between font-mono text-[10px] text-on-surface-muted tracking-tighter uppercase">
      <div className="flex items-center gap-4">
        <span>© {year}_SILVANO, JULIUS JR. K. // DIAGNOSTIC_MODE_ACTIVE</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>UPLINK_STABLE</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-primary/5 px-3 py-1 border border-primary/20">
            <span className="text-[8px] text-primary/60 font-black tracking-widest uppercase">LIVE_VISITORS</span>
            <div className="w-px h-2 bg-primary/20 mx-1" />
            <span className="text-[10px] text-primary font-black tabular-nums tracking-normal">
              {String(visitorCount).padStart(5, '0')}
            </span>
            <div className="w-1.5 h-1.5 shrink-0 ml-1 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(255,100,100,0.5)]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span>LATENCY_CHECK</span>
          <span className="text-secondary">04ms</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert size={10} className="text-tertiary" />
          <span>SYS_VER 2.0.4</span>
        </div>
      </div>
    </footer>
  );
}
