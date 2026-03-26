"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Shield, Radio, Menu, X as CloseIcon, Terminal, User, Folder, MessageSquare, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "Operator", path: "/about", label: "ABOUT", icon: <User size={14} /> },
  { name: "Missions", path: "/projects", label: "PROJECTS", icon: <Folder size={14} /> },
  { name: "Expeditions", path: "/expeditions", label: "CERTIFICATES", icon: <Award size={14} /> },
  { name: "Comms", path: "/contact", label: "CONTACT", icon: <MessageSquare size={14} /> },
];

export function Navbar() {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Close menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 w-full z-100 bg-surface/80 backdrop-blur-md border-b border-outline/10 h-14">
      <div className="container mx-auto px-4 h-full flex items-center justify-between font-mono">

        {/* Logo / System ID */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="text-primary font-extrabold text-xl tracking-tighter hover:flicker flex items-center gap-2">
            <div className="w-7 h-7 bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Terminal size={14} className="text-primary" />
            </div>
            <span>OPERATOR<span className="text-on-surface-muted">_</span>01</span>
          </div>
          <div className="hidden md:flex flex-col text-[11px] text-on-surface-muted leading-tight border-l border-outline/20 pl-3 uppercase font-bold">
            <span>SECURE_NODE: 0x8F4</span>
            <span className="text-secondary/80">STATUS: STABLE</span>
          </div>
        </Link>

        {/* Tactical Nav (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "relative px-4 py-1.5 text-xs font-bold tracking-[0.2em] transition-all duration-200 uppercase flex items-center gap-2",
                  isActive ? "text-primary bg-primary/5" : "text-on-surface-muted hover:text-on-surface hover:bg-surface-high"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-[-17px] inset-x-0 h-[2px] bg-primary shadow-[0_0_8px_var(--color-primary-glow)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="opacity-60">{item.icon}</span>
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Global Telemetry */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-6 text-[11px] text-on-surface-muted font-mono font-bold">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-primary/60" />
              <span className="tracking-tighter">ENCRYPT_ACTIVE</span>
            </div>
            <div className="flex items-center gap-2 border-l border-outline/10 pl-6">
              <Radio size={14} className="text-secondary animate-pulse" />
              {mounted ? (
                <span className="tracking-tighter">[{time}]</span>
              ) : (
                <span className="tracking-tighter">[--:--:--]</span>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 text-primary hover:bg-surface-high transition-colors border border-outline/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <CloseIcon size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-surface-low border-b border-outline/10 overflow-hidden font-mono shadow-2xl"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "px-6 py-5 text-xs font-extrabold tracking-[0.3em] transition-all flex items-center justify-between border uppercase",
                    pathname === item.path
                      ? "text-primary bg-primary/10 border-primary/20"
                      : "text-on-surface-muted border-transparent hover:bg-surface-high"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="opacity-80 font-bold">{item.icon}</span>
                    {item.name}
                  </div>
                  {pathname === item.path && <div className="w-1.5 h-1.5 bg-primary animate-pulse" />}
                </Link>
              ))}

              {/* Mobile Telemetry */}
              <div className="mt-4 pt-4 border-t border-outline/10 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-on-surface-muted uppercase font-bold">Latency</span>
                  <span className="text-sm text-primary font-mono font-bold">0.12ms</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[10px] text-on-surface-muted uppercase font-bold">Session</span>
                  <span className="text-sm text-secondary font-mono font-bold">
                    [{mounted ? time : "--:--:--"}]
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
