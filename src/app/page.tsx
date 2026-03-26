"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Terminal, Activity, Shield } from "lucide-react";
import { SystemLog } from "@/components/layout/SystemLog";
import { TacticalModal } from "@/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@/lib/animations";
import { tacticalAudio } from "@/lib/sounds";
import { TargetScannerGame } from "@/components/ui/TargetScannerGame";

const RecentActivity = [
  { id: "01", date: "2024-05-12", title: "SEEGLA // SOFTWARE ENGINEER", status: "ACTIVE" },
  { id: "02", date: "2024-05-08", title: "LUNA // HEALTH-TECH SYNC", status: "ACTIVE" },
  { id: "03", date: "2024-04-30", title: "DIGITAL LAB // INDIE GAME DEV", status: "ACTIVE" },
];

const Skills = [
  { name: "JAVA", level: 90, rarity: "ADVANCED // CORE" },
  { name: "NEXT.JS / REACT", level: 80, rarity: "ADVANCED" },
  { name: "TYPESCRIPT / JS", level: 80, rarity: "ADVANCED" },
  { name: "FLUTTER / DART", level: 80, rarity: "ADVANCED" },
  { name: "NODE.JS / .NET", level: 75, rarity: "INTERMEDIATE" },
  { name: "PYTHON / SQL", level: 75, rarity: "INTERMEDIATE" },
];

const TITLES = [
  "Full-Stack Developer",
  "Next.js Specialist",
  "Lead Developer @ LUNA",
  "Team SEEGLA Software Engineer"
];

export default function Home() {
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: React.ReactNode } | null>(null);
  const [isBooted, setIsBooted] = useState(false);
  const [bootLogs, setBootLogs] = useState<string[]>([]);
  const [titleIndex, setTitleIndex] = useState(0);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const logs = [
      "SEARCHING_FOR_SATELLITE_UPLINK...",
      "ESTABLISHING_SECURE_CONNECTION [0x8F4]...",
      "LOADING_OPERATOR_DOSSIER...",
      "VERIFYING_BIO_METRIC_DATA...",
      "HUD_STABILITY_CHECK: OK",
      "SYSTEM_READY."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < logs.length) {
        setBootLogs(prev => [...prev, logs[current]]);
        tacticalAudio?.blip();
        current++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsBooted(true);
          tacticalAudio?.comms();
        }, 800);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isBooted) return;

    const timeout = setTimeout(() => {
      const fullText = TITLES[titleIndex];

      if (!isDeleting) {
        setCurrentTitle(fullText.substring(0, currentTitle.length + 1));

        if (currentTitle === fullText) {
          // Pause before deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setCurrentTitle(fullText.substring(0, currentTitle.length - 1));

        if (currentTitle === "") {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % TITLES.length);
        }
      }
    }, isDeleting ? 30 : 80);

    return () => clearTimeout(timeout);
  }, [currentTitle, isDeleting, titleIndex, isBooted]);

  const openSkillModal = (skill: typeof Skills[0]) => {
    setActiveModal({
      title: skill.name,
      subtitle: `TECHNICAL_CLASS: ${skill.rarity}`,
      content: (
        <div className="flex flex-col gap-6 font-mono text-base uppercase">
          <div className="flex flex-col gap-2">
            <span className="text-primary/60 text-[11px] font-bold">CURRENT_PROFICIENCY</span>
            <div className="h-4 bg-surface-high relative overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} className="absolute inset-0 bg-primary" />
              <div className="absolute inset-x-0 bottom-0 top-0 flex justify-end items-center pr-2 text-xs text-surface font-black">{skill.level}%</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-outline/10 p-4">
              <span className="text-secondary/60 text-[11px] font-bold block mb-1">STABILITY_RATING</span>
              <span className="text-2xl font-bold">ALPHA_96</span>
            </div>
            <div className="border border-outline/10 p-4">
              <span className="text-secondary/60 text-[11px] font-bold block mb-1">MODULE_COMPLIANCE</span>
              <span className="text-2xl font-bold">HIGH_RES</span>
            </div>
          </div>
          <p className="text-sm text-on-surface-muted leading-relaxed font-sans normal-case">
            Extended telemetry for {skill.name} indicates high proficiency in modern architectural patterns.
            All modules are verified and optimized for high-throughput production environments.
          </p>
        </div>
      )
    });
  };

  const openLogModal = (log: typeof RecentActivity[0]) => {
    setActiveModal({
      title: log.title,
      subtitle: `LOG_ID: ${log.id} // ${log.date}`,
      content: (
        <div className="flex flex-col gap-6 font-mono text-xs uppercase">
          <div className="border-l-2 border-primary pl-4 py-2 bg-primary/5">
            <span className="text-primary font-bold">STATUS: {log.status}</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-on-surface-muted text-[11px] font-bold">TRANSMISSION_SUMMARY</span>
            <p className="text-base font-bold text-on-surface italic tracking-tight">
              Executing deployment sequence for {log.title}...
            </p>
          </div>
          <div className="bg-surface-high p-4 text-sm text-primary/80 overflow-hidden relative font-mono">
            <div className="absolute top-1 right-2 animate-pulse text-[10px] font-bold">LIVE_FEED</div>
            <code>
              {">"} INITIALIZING_SYSCALL...<br />
              {">"} ALLOCATING_BUFFERS...<br />
              {">"} PARSING_METADATA...<br />
              {">"} CONNECTION_ESTABLISHED.<br />
              {">"} SUCCESS_CODE: 0x00
            </code>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="min-h-screen pt-4 pb-12 px-6 scanlines relative">
      <AnimatePresence>
        {!isBooted && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 bg-surface flex flex-col items-center justify-center p-8 font-mono"
          >
            <div className="max-w-md w-full flex flex-col gap-2">
              <div className="flex items-center gap-3 text-primary mb-4">
                <Terminal className="animate-pulse" />
                <span className="text-sm font-bold tracking-[0.3em]">IUSSYAN_BIOS_V1.0</span>
              </div>
              {bootLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs text-on-surface-muted italic"
                >
                  {">"} {log}
                </motion.div>
              ))}
              <div className="mt-8 h-1 bg-surface-high relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isBooted ? 1 : 0 }}
        className="container mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-14 lg:mt-0"
      >

        {/* Left Col: Sidebar HUD */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="order-3 lg:order-1 lg:col-span-3 flex flex-col gap-8"
        >
          {/* Profile ID */}
          <motion.div variants={item} className="surface-low p-6 relative border-l-2 border-primary">
            <div className="hud-marker" />
            <h2 className="text-xs text-on-surface-muted mb-2 font-bold tracking-widest">OPERATOR_CODE // IUSSYAN</h2>
            <h1 className="text-2xl font-bold tracking-tighter text-on-surface hover:glitch-text" data-text="SILVANO, JULIUS JR. K.">SILVANO, JULIUS JR. K.</h1>
            <p className="text-xs text-primary/60 mt-2 font-mono font-bold tracking-widest uppercase">OPERATOR_01 // TERMINAL</p>
          </motion.div>

          {/* Activity Log */}
          <motion.div variants={item} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2">
              <Terminal size={14} className="text-secondary" />
              <h3 className="text-xs font-bold tracking-widest uppercase">LATEST UPDATES</h3>
            </div>
            <div className="flex flex-col gap-2">
              {RecentActivity.map((log) => (
                <div
                  key={log.id}
                  onClick={() => openLogModal(log)}
                  className="surface-low p-4 relative group hover:bg-surface-high transition-colors cursor-pointer"
                >
                  <div className={log.status === "COMPLETED" ? "absolute top-0 right-0 w-1 h-1 bg-primary" : "absolute top-0 right-0 w-1 h-1 bg-on-surface-muted"} />
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="text-[11px] text-primary font-mono font-bold">{log.id} {"//"} {log.date}</span>
                    <span className="text-[11px] text-on-surface-muted italic font-bold">{log.status}</span>
                  </div>
                  <h4 className="text-sm font-bold tracking-tight uppercase">{log.title}</h4>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Telemetry Chart Placeholder */}
          <motion.div variants={item} className="surface-low p-4 aspect-video flex flex-col justify-end gap-2 overflow-hidden relative h-76 ">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 200 100">
                <path d="M0 80 Q 25 20, 50 80 T 100 80 T 150 20 T 200 80" fill="none" stroke="currentColor" strokeWidth="1" className="text-secondary" />
              </svg>
            </div>
            <div className="flex items-end gap-1 h-12">
              {[40, 70, 45, 90, 65, 30, 85, 50, 75, 40].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 + (i % 5) * 0.2 }}
                  className="flex-1 bg-secondary/40"
                />
              ))}
            </div>
            <SystemLog />
          </motion.div>
        </motion.div>

        {/* Center: Command Profile */}
        <motion.div
          variants={fadeUp(0.1)}
          initial="initial"
          animate="animate"
          className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center justify-center text-center gap-12 border-x border-outline/5 px-8 lg:pb-15"
        >
          {/* Avatar Area */}
          <div className="relative">
            <div className="absolute -inset-8 border border-primary/20 animate-[spin_20s_linear_infinite]" />
            <div className="absolute -inset-4 border border-secondary/20 animate-[spin_15s_linear_infinite_reverse]" />
            <div className="w-59 h-59 surface-high relative overflow-hidden flex items-center justify-center group/avatar">
              <motion.img
                src="/assets/profile/operator.jfif"
                alt="Operator Profile"
                className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 group-hover/avatar:scale-105 transition-all duration-500"
              />
              {/* Pulse Scanner Line */}
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-primary/40 shadow-[0_0_15px_var(--color-primary)] z-10 pointer-events-none"
              />
            </div>
            <div className="absolute -top-2 -right-2 bg-primary text-surface text-[11px] font-extrabold px-3 py-1 uppercase tracking-tighter">ACTIVE_LINK</div>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none hover:flicker">
              IUSSYAN<span className="text-primary">.</span>TECH
            </h1>
            <p className="text-xs md:text-sm text-secondary tracking-[0.2em] font-mono font-bold uppercase min-h-5">
              {currentTitle}<span className="animate-pulse">_</span>
            </p>
          </div>

          <p className="max-w-md text-base text-on-surface-muted leading-relaxed font-sans">
            3rd Year BS Information Technology Student specialized in Software Engineering & Modern Web Architectures.
            Passionate about games, health-tech, and building scalable digital solutions.
          </p>

          <Link
            href="/about"
            onClick={() => tacticalAudio?.blip()}
            className="btn-tactical btn-tactical-primary group text-lg py-4 px-12 -mb-8"
          >
            OPERATOR FILES {">>"}
          </Link>

          <Link
            href="/contact"
            onClick={() => tacticalAudio?.blip()}
            className="btn-tactical btn-tactical-primary group text-lg py-4 px-12"
          >
            CONTACT OPERATOR {">>"}
          </Link>
        </motion.div>

        {/* Right Col: System Loadout */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="order-2 lg:order-3 lg:col-span-3 flex flex-col gap-8"
        >
          {/* Tech Stack Section */}
          <motion.div variants={item} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 px-2 border-l-2 border-tertiary">
              <Activity size={14} className="text-tertiary" />
              <h3 className="text-xs font-bold tracking-widest uppercase">CORE TECH STACK</h3>
            </div>
            <div className="flex flex-col gap-4">
              {Skills.map((skill) => (
                <div
                  key={skill.name}
                  onClick={() => openSkillModal(skill)}
                  className="flex flex-col gap-2 group cursor-pointer"
                >
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">{skill.name}</span>
                    <span className="text-[11px] bg-tertiary/10 text-tertiary px-2 py-1 font-bold">{skill.rarity}</span>
                  </div>
                  <div className="h-2 bg-surface-high relative overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.level}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-primary group-hover:bg-primary-dim"
                    />
                    <div className="absolute inset-0 flex">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-1 border-r border-surface/40" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Target Scanner UI Widget (Game) */}
          <motion.div variants={item} className="flex flex-col gap-2">
            <TargetScannerGame />
          </motion.div>
        </motion.div>

      </motion.div>

      {/* Global Modal */}
      <TacticalModal
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        title={activeModal?.title || ""}
        subtitle={activeModal?.subtitle}
      >
        {activeModal?.content}
      </TacticalModal>
    </div>
  );
}
