import { ShieldAlert } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

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
          <span>ENCRYPTED_FEED</span>
          <div className="w-8 h-[2px] bg-surface-high relative">
            <div className="absolute inset-0 bg-secondary w-2/3 animate-[pulse_2s_infinite]"></div>
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
