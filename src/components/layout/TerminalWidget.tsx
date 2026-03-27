"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal as TerminalIcon, X, ChevronRight, Command, Maximize2, Minimize2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { tacticalAudio } from "@/lib/sounds";
import { TargetScannerGame } from "../ui/TargetScannerGame";
import { useTheme } from "../providers/ThemeProvider";
import { useAchievement } from "../providers/AchievementProvider";

type LogEntry = {
  type: "command" | "output" | "error" | "info";
  content: string | React.ReactNode;
  timestamp: string;
};

const INITIAL_BOOT_LOGS = [
  "INITIALIZING_CORE_SYSTEMS...",
  "CONNECTING_TO_REMOTE_NODE: 0x8F4",
  "DECRYPTING_BIO_METRIC_DATA...",
  "ACCESS_GRANTED: OPERATOR_01",
  "WELCOME TO IUSSYAN_TERMINAL_V1.0.4",
  "TYPE 'HELP' FOR LIST OF AVAILABLE COMMANDS."
];

export function TerminalWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHacked, setIsHacked] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [isAuthing, setIsAuthing] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const router = useRouter();
  const hasBooted = useRef(false);
  const { achievements } = useAchievement();

  const addLog = useCallback((type: LogEntry["type"], content: string | React.ReactNode) => {
    const timestamp = typeof window !== "undefined"
      ? new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : "";
    setLogs(prev => [...prev, { type, content, timestamp }].slice(-100));
  }, []);

  useEffect(() => {
    setMounted(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });

    const savedState = localStorage.getItem("terminal-state");
    if (savedState) {
      try {
        const { open, fullscreen } = JSON.parse(savedState);
        setIsOpen(open);
        setIsFullscreen(fullscreen);
      } catch (e) {
        console.error("Failed to parse terminal state", e);
      }
    }

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Persist state changes
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("terminal-state", JSON.stringify({ open: isOpen, fullscreen: isFullscreen }));
  }, [isOpen, isFullscreen, mounted]);

  // Initialize boot only once
  useEffect(() => {
    if (hasBooted.current) return;
    hasBooted.current = true;

    const boot = async () => {
      for (const msg of INITIAL_BOOT_LOGS) {
        addLog("info", msg);
        tacticalAudio?.blip();
        await new Promise(r => setTimeout(r, 150));
      }
    };
    boot();
  }, [addLog]);

  // Handle global toggle event (from Navbar or elsewhere)
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => {
        if (!prev) tacticalAudio?.hum();
        else tacticalAudio?.click();
        return !prev;
      });
    };
    window.addEventListener("toggle-terminal", handleToggle);
    return () => window.removeEventListener("toggle-terminal", handleToggle);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [logs, isOpen]);

  const handleCommand = useCallback((cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    if (!cleanCmd) return;

    setHistory(prev => [cmd, ...prev].slice(0, 50));
    setHistoryIdx(-1);
    addLog("command", `> ${cmd}`);

    switch (cleanCmd) {
      case "help":
        addLog("info", (
          <div className="grid grid-cols-1 gap-1">
            <span className="text-primary font-bold">AVAILABLE_COMMANDS:</span>
            <span className="text-secondary">- WHOAMI: OPERATOR IDENTITY</span>
            <span className="text-secondary">- LS: DIRECTORY LISTING</span>
            <span className="text-secondary">- ARCHIVES: OPERATIONAL LOGS</span>
            <span className="text-secondary">- EXPEDITIONS: ARCHIVE_METADATA</span>
            <span className="text-secondary">- ACHIEVEMENTS: VIEW_UNLOCKED_INTEL</span>
            <span className="text-secondary">- CONTACT: INITIATE_COMMS</span>
            <span className="text-secondary">- SOCIALS: EXTERNAL_UPLINKS</span>
            <span className="text-secondary">- TERMINAL: REDIRECT TO HOME</span>
            <span className="text-secondary">- CD [DIR]: NAVIGATION (OPERATOR, MISSIONS, EXPEDITIONS, COMMS)</span>
            <span className="text-secondary">- SYSINFO: SYSTEM TELEMETRY</span>
            <span className="text-secondary">- REBOOT: HARD_RESTART</span>
            <span className="text-secondary">- CLEAR: PURGE BUFFER</span>
            <span className="text-secondary">- CLOSE: MINIMIZE MODULE</span>
            <div className="mt-3 flex flex-col gap-1 border-t border-primary/20 pt-2 opacity-60">
              <span className="text-primary font-bold text-[10px] tracking-widest uppercase">[UNDOCUMENTED_DIRECTIVES]</span>
              <span className="text-secondary text-[11px] font-mono hover:opacity-100 transition-opacity">* ATTEMPT TO [OVERRIDE] THE CORE.</span>
              <span className="text-secondary text-[11px] font-mono hover:opacity-100 transition-opacity">* [HACK] THE MAINFRAME ARCHITECTURE.</span>
              <span className="text-secondary text-[11px] font-mono hover:opacity-100 transition-opacity">* ACCESS [CLASSIFIED] INTEL.</span>
              <span className="text-secondary text-[11px] font-mono hover:opacity-100 transition-opacity">* INITIATE COMBAT [GAME] SIMULATOR.</span>
            </div>
          </div>
        ));
        break;
      case "fullscreen":
        setIsFullscreen(prev => !prev);
        addLog("info", "DISPLAY_MODE_UPDATED.");
        break;
      case "clear":
        setLogs([]);
        break;
      case "admin":
        router.push("/admin");
        break;
      case "whoami":
        {
          const birthDate = new Date("2005-06-21");
          const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          
          addLog("output", "IDENTITY: SILVANO, JULIUS JR. K. // OPERATOR_01");
          addLog("output", "CODENAME: IUSSYAN // IUSSYAN.TECH");
          addLog("output", `BIRTHDAY: 2005.06.21 // AGE: ${age}`);
          addLog("output", "SEX: MALE // XY_CHROMOSOME_VERIFIED");
          addLog("output", "SECTOR: ASIA_PH // FULL_STACK_DEVELOPER");
        }
        break;
      case "ls":
        addLog("output", "DIR: /ROOT/OPERATOR\nDIR: /ROOT/MISSIONS\nDIR: /ROOT/EXPEDITIONS\nDIR: /ROOT/COMMS");
        break;
      case "sysinfo":
        addLog("output", "OS: IUSSYAN_HUD_V3\nUPTIME: 99.98%\nLATENCY: 12MS\nENCRYPTION: ACTIVE\nSIGNAL: EXCELLENT");
        break;
      case "close":
      case "exit":
        setIsOpen(false);
        break;
      case "terminal":
        router.push("/");
        addLog("info", "RE-ROUTING_TO: Terminal");
        tacticalAudio?.comms();
        break;

      // EASTER EGGS
      case "override":
      case "abort":
      case "restore":
      case "system_restore":
        toggleTheme();
        addLog("info", `INITIATING_SYSTEM_SHIFT... THEME_SHIFT_TO: ${theme === 'tactical' ? 'PROFESSIONAL' : 'TACTICAL'}`);
        break;
      case "classified":
      case "topsecret":
        addLog("output", "REDACTED DOCUMENT 404: █ ██████ is █████████ and highly ██████.");
        break;
      case "game":
      case "play":
        addLog("info", "INITIALIZING COMBAT SIMULATOR...");
        tacticalAudio?.hum();
        setTimeout(() => {
          router.push("/");
          if (isFullscreen) setIsFullscreen(false);
        }, 1200);
        break;
      case "matrix":
      case "hack":
        if (isHacked) return;
        setIsHacked(true);
        addLog("info", "INITIATING_BYPASS_PROTOCOL...");
        tacticalAudio?.type();

        let count = 0;
        const interval = setInterval(() => {
          const hex = Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16).toUpperCase()).join('');
          const bin = Array.from({ length: 8 }, () => Math.floor(Math.random() * 2).toString()).join('');
          addLog("output", `0x${hex} ${bin} DECRYPTING...`);
          count++;
          if (count > 8) {
            clearInterval(interval);
            addLog("error", "BYPASS FAILED. INSUFFICIENT CLEARANCE.");
            tacticalAudio?.error();
            setTimeout(() => setIsHacked(false), 2500);
          }
        }, 200);
        break;
      case "access_intel":
        setIsAuthing(true);
        addLog("info", "WARNING: ACCESSING_RESTRICTED_DATA_BANK...");
        addLog("info", "PLEASE_ENTER_MASTER_PASSCODE:");
        setInput("");
        break;
      case "cd operator":
        router.push("/about");
        addLog("info", "RE-ROUTING_TO: Operator");
        tacticalAudio?.comms();
        break;
      case "cd missions":
        router.push("/projects");
        addLog("info", "RE-ROUTING_TO: Missions");
        tacticalAudio?.comms();
        break;
      case "archives":
        router.push("/logbook");
        addLog("info", "RE-ROUTING_TO: Field_Logs");
        tacticalAudio?.comms();
        break;
      case "cd comms":
      case "contact":
        router.push("/contact");
        addLog("info", "RE-ROUTING_TO: Comms");
        tacticalAudio?.comms();
        break;
      case "socials":
        addLog("output", "UPLINK_ESTABLISHED // SOCIAL_NODES:");
        addLog("output", "- GITHUB: https://github.com/iussyan");
        addLog("output", "- LINKEDIN: https://linkedin.com/in/iussyan");
        addLog("output", "- X: https://x.com/iussyan");
        break;
      case "reboot":
      case "restart":
        addLog("info", "INITIATING_SYSTEM_REBOOT...");
        setTimeout(() => window.location.reload(), 1500);
        break;
      case "expeditions":
      case "cd expeditions":
        router.push("/expeditions");
        addLog("info", "RE-ROUTING_TO: Expeditions");
        tacticalAudio?.comms();
        break;
      case "achievements":
        {
          const unlockedCount = achievements.filter(a => a.unlockedAt).length;
          addLog("info", (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-primary/20 pb-1">
                <span className="text-primary font-black tracking-widest uppercase">ACHIEVEMENT_LOG</span>
                <span className="text-secondary font-bold">[{unlockedCount}/{achievements.length}]_UNLOCKED</span>
              </div>
              <div className="flex flex-col gap-3 mt-1">
                {achievements.map(a => (
                  <div key={a.id} className={cn("flex flex-col gap-0.5", a.unlockedAt ? "opacity-100" : "opacity-30")}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5", a.unlockedAt ? "bg-secondary" : "bg-outline/40")} />
                      <span className={cn("text-[11px] font-black tracking-wider uppercase", a.unlockedAt ? "text-secondary" : "text-on-surface-muted")}>
                        {a.title} {a.unlockedAt ? "✓" : ""}
                      </span>
                    </div>
                    <p className="text-[10px] text-on-surface-muted leading-tight pl-3.5 normal-case font-sans italic">
                      {a.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ));
        }
        break;
      default:
        addLog("error", `COMMAND_NOT_RECOGNIZED: '${cmd}'. TYPE 'HELP'.`);
        tacticalAudio?.error();
    }
  }, [addLog, router]);

  const onKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (isAuthing) {
        const passcode = input;
        setInput("");
        addLog("command", "********");

        try {
          const res = await fetch("/api/auth/verify", {
            method: "POST",
            body: JSON.stringify({ passcode }),
            headers: { "Content-Type": "application/json" }
          });

          const data = await res.json();
          if (data.success) {
            addLog("info", "AUTHENTICATION_SUCCESSFUL. REDIRECTING...");
            localStorage.setItem("admin-session", "active");
            tacticalAudio?.success();
            setTimeout(() => {
              setIsAuthing(false);
              router.push("/admin");
            }, 1000);
          } else {
            addLog("error", "AUTHENTICATION_FAILED. INVALID_ACCESS_CODE.");
            tacticalAudio?.error();
            setIsAuthing(false);
          }
        } catch (err) {
          addLog("error", "SYSTEM_ERROR_DURING_AUTH.");
          setIsAuthing(false);
        }
        return;
      }
      handleCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(history[nextIdx]);
      } else {
        setHistoryIdx(-1);
        setInput("");
      }
    }
  };

  const isMobile = windowSize.width < 640;
  const bubbleSize = isMobile ? 48 : 56;
  const edgeOffset = isMobile ? 12 : 20;

  if (!mounted) return null;

  // Calculate concrete pixel dimensions for motion to tween
  const getTerminalWidth = () => {
    if (isFullscreen) return windowSize.width;
    if (isMobile) return windowSize.width - 16;
    if (windowSize.width < 1024) return Math.min(windowSize.width - 32, 600);
    return 600;
  };

  const getTerminalHeight = () => {
    if (isFullscreen) return "100dvh";
    if (isMobile) return `calc(100dvh - 80px)`;
    if (windowSize.width < 1024) return Math.min(windowSize.height - 80, 500);
    return 500;
  };

  return (
    <>
      {/* Floating bubble (visible when collapsed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="terminal-bubble"
            id="terminal-bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onClick={() => {
              setIsOpen(true);
              tacticalAudio?.hum();
            }}
            className="fixed font-mono cursor-pointer border border-primary/40 bg-surface-medium hover:bg-surface-high transition-colors flex items-center justify-center text-primary group"
            style={{
              zIndex: 201,
              bottom: edgeOffset,
              right: edgeOffset,
              width: bubbleSize,
              height: bubbleSize,
            }}
            aria-label="Open terminal"
            data-terminal-widget="collapsed"
          >
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            <TerminalIcon size={isMobile ? 20 : 24} className="relative z-10 hover:flicker" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-primary animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded terminal panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="terminal-panel"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: 1,
              width: getTerminalWidth(),
              height: getTerminalHeight(),
            }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
              mass: 1,
              opacity: { duration: 0.15 },
            }}
            className={cn(
              "fixed flex flex-col font-mono selection:bg-primary selection:text-surface border shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden bg-surface",
              isFullscreen ? "border-primary/10" : "border-primary/20 scanlines"
            )}
            style={{
              zIndex: isFullscreen ? 9998 : 201,
              transformOrigin: "bottom right",
              position: "fixed",
              bottom: isFullscreen ? 0 : edgeOffset,
              right: isFullscreen ? 0 : edgeOffset,
              left: isFullscreen ? 0 : "auto",
              top: isFullscreen ? 0 : "auto",
              paddingBottom: isFullscreen ? "env(safe-area-inset-bottom)" : 0,
            }}
            data-terminal-widget="expanded"
          >
            {/* Header */}
            <div className="border-b border-primary/20 p-3 flex justify-between items-center text-[10px] font-bold tracking-widest text-primary/60 bg-surface-medium shrink-0">
              <div className="flex items-center gap-3">
                <Command size={14} className="text-secondary" />
                <span className="hidden sm:inline">IUSSYAN_CONSOLE // v1.0.4</span>
                <span className="sm:hidden text-primary animate-pulse">LIVE_SESSION</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setIsFullscreen(!isFullscreen);
                    tacticalAudio?.click();
                  }}
                  className="p-1.5 hover:bg-surface-high text-on-surface-muted hover:text-primary transition-colors"
                  title="TOGGLE_FULLSCREEN"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsFullscreen(false);
                    tacticalAudio?.click();
                  }}
                  className="p-1.5 hover:bg-surface-high text-on-surface-muted hover:text-tertiary transition-colors"
                  title="CLOSE"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div
              ref={scrollRef}
              onClick={() => inputRef.current?.focus()}
              className="flex-1 p-4 overflow-y-auto scrollbar-tactical flex flex-col gap-1.5 bg-surface/95 min-h-0"
            >
              {logs.map((log, i) => (
                <div key={i} className={cn(
                  "text-xs sm:text-sm leading-relaxed flex gap-3",
                  isHacked ? "text-emerald-500 font-bold drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" :
                    log.type === "command" ? (theme === "professional" ? "text-secondary font-bold" : "text-on-surface font-bold") :
                      log.type === "error" ? "text-tertiary" :
                        log.type === "info" ? "text-primary/60" :
                          "text-primary"
                )}>
                  <span className={cn(
                    "shrink-0 select-none hidden sm:block",
                    theme === "professional" ? "text-on-surface-muted/60 font-bold" : "opacity-20"
                  )}>[{log.timestamp}]</span>
                  <div className="flex-1 whitespace-pre-wrap">{log.content}</div>
                </div>
              ))}

              <div className="mt-2 flex items-center gap-2 text-secondary">
                <ChevronRight size={16} className="animate-pulse shrink-0" />
                <input
                  ref={inputRef}
                  type={isAuthing ? "password" : "text"}
                  className="flex-1 bg-transparent border-none outline-none text-on-surface font-mono text-sm caret-primary focus:ring-0 p-0"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    tacticalAudio?.type();
                  }}
                  onKeyDown={onKeyDown}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-primary/10 p-2 bg-surface-low text-[9px] font-bold text-cyan-400 uppercase tracking-tighter flex justify-between items-center px-4 shrink-0">
              <span>STATUS : STABLE</span>
              <div className="flex items-center gap-4">
                <span>LN: {logs.length}</span>
                <span className="text-secondary">UPLINK_ENCRYPTED</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
