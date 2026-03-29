"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@v2/lib/utils";
import { Menu, X } from "lucide-react";
import { tacticalAudio } from "@v2/lib/sounds";

const NAV_LINKS = [
  { href: "/about",       label: "About" },
  { href: "/projects",    label: "Projects" },
  { href: "/expeditions", label: "Expeditions" },
  { href: "/contact",     label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const openTerminal = () => {
    window.dispatchEvent(new CustomEvent("toggle-terminal"));
    tacticalAudio?.hum();
  };

  return (
    <>
      {/* ── Desktop floating pill ─────────────────────────── */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-100 hidden md:flex items-center gap-1 nav-pill px-2 py-1.5 transition-all duration-300">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-display font-bold text-sm transition-all mr-2"
        >
          JS
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3.5 py-1.5 text-sm font-medium transition-all duration-200 rounded-full",
                  isActive
                    ? "text-primary"
                    : "text-on-surface-muted hover:text-on-surface"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-full border border-primary/20"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="w-px h-4 bg-on-surface-muted/10 mx-1" />

        {/* Clock */}
        <span className="font-mono text-xs text-on-surface-muted/50 tabular-nums w-16 text-center">
          {time}
        </span>

        {/* Terminal toggle */}
        <button
          onClick={openTerminal}
          title="Open Terminal (⌘)"
          className="flex items-center gap-1.5 ml-1 px-2.5 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary hover:bg-secondary/20 transition-all text-xs font-mono font-medium"
        >
          <span className="text-secondary/60">⌘</span>
          <span className="hidden lg:inline">Terminal</span>
        </button>
      </header>

      {/* ── Mobile header ───────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-100 md:hidden">
        <div className={cn(
          "flex items-center justify-between px-4 py-3 transition-all duration-300",
          scrolled ? "bg-void/90 backdrop-blur-xl border-b border-outline" : "bg-transparent"
        )}>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary font-display font-bold text-xs">JS</span>
            </div>
            <span className="font-display font-semibold text-sm text-on-surface">Julius Silvano</span>
          </Link>

          <button
            onClick={() => { setMobileOpen(v => !v); tacticalAudio?.click(); }}
            className="p-2 text-on-surface-muted hover:text-primary transition-colors"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-void/95 backdrop-blur-2xl border-b border-outline p-4 flex flex-col gap-1"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-on-surface-muted hover:bg-surface hover:text-on-surface"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <button
                onClick={() => { openTerminal(); setMobileOpen(false); }}
                className="mt-2 px-4 py-3 rounded-lg text-sm font-mono font-medium text-secondary bg-secondary/10 border border-secondary/20 text-left"
              >
                ⌘ Terminal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
