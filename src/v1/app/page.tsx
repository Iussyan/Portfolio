"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, ArrowDown, ArrowUpRight, ChevronRight, Mail, Shield, Terminal, User } from "lucide-react";
import { TacticalModal } from "@v1/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@v1/lib/animations";
import { tacticalAudio } from "@v1/lib/sounds";
import { TargetScannerGame } from "@v1/components/ui/TargetScannerGame";
import { supabase } from "@v1/lib/supabase";
import { useMetadata } from "@v1/lib/useMetadata";
import { useAchievement } from "@v1/components/providers/AchievementProvider";
import { cn } from "@v1/lib/utils";

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
  const { metadata } = useMetadata();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatestLogs = async () => {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from('logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        if (data) setLogs(data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };

    fetchLatestLogs();

    if (!supabase) return;

    let channel: any;
    try {
      channel = supabase
        .channel('public:home_logs')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, () => {
          fetchLatestLogs();
        })
        .subscribe();
    } catch (err) {
      console.error("Error setting up logs subscription:", err);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: React.ReactNode } | null>(null);
  const [titleIndex, setTitleIndex] = useState(0);
  const [currentTitle, setCurrentTitle] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { unlockAchievement } = useAchievement();

  useEffect(() => {
    setMounted(true);
    unlockAchievement("SYSTEM_ONLINE");
  }, [unlockAchievement]);


  useEffect(() => {
    if (!mounted) return;

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
  }, [currentTitle, isDeleting, titleIndex, mounted]);

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

  const openProfileModal = () => {
    setActiveModal({
      title: "OPERATOR_DOSSIER",
      subtitle: `ID_REF: ${metadata.OPERATOR_ID || 'IUSSYAN-01'}`,
      content: (
        <div className="flex flex-col gap-8 font-mono">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-6">
              <div className="relative w-full aspect-square surface-high border border-primary/20 overflow-hidden">
                <img src="/assets/profile/operator.jpeg" alt="Operator" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary" />
              </div>
              <div className="flex flex-col gap-1 border-l-2 border-secondary pl-4">
                <span className="text-[10px] text-secondary font-bold uppercase tracking-widest">CLEARANCE_LEVEL</span>
                <span className="text-xl font-black">LEVEL_05 // OVERSEER</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="surface-low p-4 border-b border-primary/20">
                  <span className="text-[9px] text-on-surface-muted font-bold uppercase block mb-1">DESIGNATION</span>
                  <span className="text-sm font-bold truncate">SILVANO, J. JR.</span>
                </div>
                <div className="surface-low p-4 border-b border-primary/20">
                  <span className="text-[9px] text-on-surface-muted font-bold uppercase block mb-1">SPECIALTY</span>
                  <span className="text-sm font-bold uppercase">SOFTWARE_ENG</span>
                </div>
                <div className="surface-low p-4 border-b border-primary/20">
                  <span className="text-[9px] text-on-surface-muted font-bold uppercase block mb-1">LOCATION</span>
                  <span className="text-sm font-bold uppercase">REGION_PH</span>
                </div>
                <div className="surface-low p-4 border-b border-primary/20">
                  <span className="text-[9px] text-on-surface-muted font-bold uppercase block mb-1">AGE // SEX</span>
                  <span className="text-sm font-bold uppercase">20 // MALE</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                <h4 className="text-[10px] text-primary font-black tracking-[0.3em] uppercase">SYSTEM_OBJECTIVES</h4>
                <div className="p-4 bg-surface-high border border-outline/10 text-xs leading-relaxed text-on-surface-muted italic">
                  Currently focused on developing secure, high-performance web architectures and immersive interface designs.
                  Continuous integration of next-gen technologies for tactical software deployment.
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-outline/10 pt-6 flex flex-wrap gap-3">
            {["REACT", "NEXTJS", "JAVA", "FLUTTER", "POSTGRES"].map(tag => (
              <span key={tag} className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black tracking-widest border border-primary/20 uppercase">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )
    });
  };

  const openDetailedLogModal = (log: any) => {
    setActiveModal({
      title: log.title,
      subtitle: `SECTOR: ${log.sector} // TIMESTAMP: ${new Date(log.created_at).toLocaleString()}`,
      content: (
        <div className="flex flex-col gap-6 font-mono uppercase">
          <div className="p-6 bg-surface-high border border-primary/20 relative">
            <div className="absolute top-2 right-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-[10px] text-secondary font-bold">DECODING...</span>
            </div>
            <p className="text-base font-bold text-on-surface leading-tight tracking-tight mb-4 lowercase first-letter:uppercase italic">
              {log.content || "NO_ADDITIONAL_DATA_STORED_IN_MODULE."}
            </p>
            <div className="h-px w-full bg-outline/10 my-4" />
            <div className="grid grid-cols-2 gap-6 text-[10px]">
              <div className="flex flex-col gap-1">
                <span className="text-on-surface-muted font-bold">LOG_SEQUENCE_ID</span>
                <span className="text-primary font-bold">{log.id.substring(0, 16)}...</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-on-surface-muted font-bold">ENCRYPTION_STATUS</span>
                <span className="text-secondary font-bold">RSA_AES_256 // VERIFIED</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-primary/60 text-[11px] font-bold tracking-widest">TELEMETRY_STREAM</span>
            <div className="p-4 bg-surface text-[11px] text-on-surface-muted italic flex flex-col gap-1 opacity-70">
              <span>{`>`} RETRIEVING_REMOTE_METADATA...</span>
              <span>{`>`} SYNCING_WITH_PRIMARY_CORE...</span>
              <span>{`>`} INTEGRITY_CHECK: PASSED.</span>
            </div>
          </div>
        </div>
      )
    });
  };

  // REMOVED: Hydration bottleneck that causes blank screen if mounting hangs
  // if (!mounted) return null;

  return (
    <div className="min-h-screen pt-4 pb-12 px-6 scanlines relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
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
            <p className="text-xs text-primary/60 mt-2 font-mono font-bold tracking-widest uppercase">{metadata.OPERATOR_STATUS} // TERMINAL</p>

            {/* Dynamic Mission Status */}
            <div className="flex flex-col gap-1 mt-4 border-l border-primary/20 pl-4 py-1.5 bg-primary/5 group/mission">
              <span className="text-[9px] font-black tracking-[0.2em] text-primary/40 uppercase group-hover/mission:text-primary/60 transition-colors">CURRENT_MISSION</span>
              <span className="text-[11px] font-bold tracking-tighter text-on-surface uppercase italic flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                {metadata.CURRENT_MISSION}
              </span>
            </div>
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

          {/* Operational Logs HUD - Migrated from System Feed position */}
          <motion.div variants={item} className="surface-low p-6 relative border-l-2 border-primary flex flex-col gap-4">
            <div className="hud-marker" />
            <div className="flex items-center justify-between border-b border-primary/20 pb-2">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                <h3 className="text-sm font-bold tracking-widest text-primary uppercase">FIELD_LOGS</h3>
              </div>
              <Link href="/logbook" className="text-xs text-on-surface-muted hover:text-secondary flex items-center gap-1 transition-colors">
                ARCHIVE <ChevronRight size={12} />
              </Link>
            </div>
            <div className="flex flex-col gap-px bg-outline/5 border border-outline/10 max-h-[250px] overflow-y-auto tactical-scrollbar relative group">
              {logs.length > 0 ? logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => openDetailedLogModal(log)}
                  className="bg-surface-low/50 p-4 hover:bg-surface-medium transition-all group/log border-b border-outline/5 last:border-b-0 cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-mono text-secondary tracking-widest uppercase font-bold">[{log.sector}]</span>
                    <span className="text-[10px] text-on-surface-muted opacity-30 font-mono italic">{new Date(log.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold font-mono tracking-tight text-on-surface group-hover/log:text-primary transition-colors truncate uppercase italic leading-none">{log.title}</h4>
                </div>
              )) : (
                <div className="p-6 text-xs text-on-surface-muted italic opacity-40 uppercase text-center font-mono">
                  AWAITING_FIELD_DATA...
                </div>
              )}
            </div>
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
            <div
              onClick={openProfileModal}
              className="w-59 h-59 surface-high relative overflow-hidden flex items-center justify-center group/avatar cursor-pointer"
            >
              <motion.img
                src="/assets/profile/operator.jpeg"
                alt="Operator Profile"
                className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 group-hover/avatar:scale-105 transition-all duration-500"
              />
              {/* Pulse Scanner Line */}
              <motion.div
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-primary/40 shadow-[0_0_15px_var(--color-primary)] z-10 pointer-events-none"
              />
              {/* Subtle Click Hint */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-4 right-4 opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 translate-y-2 group-hover/avatar:translate-y-0 flex flex-col items-end gap-1">
                  <span className="text-[9px] font-black tracking-[0.3em] text-primary/60 uppercase">DOSSIER // ACCESS</span>
                  <div className="h-px w-12 bg-primary/30" />
                </div>
                <div className="absolute top-4 left-4 opacity-0 group-hover/avatar:opacity-100 transition-all duration-500 -translate-y-2 group-hover/avatar:translate-y-0">
                  <div className="w-3 h-3 border-t border-l border-primary/40" />
                </div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 bg-primary text-surface text-[11px] font-extrabold px-3 py-1 uppercase tracking-tighter">{metadata.OPERATOR_STATUS}_LINK</div>
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
          <motion.div variants={item} className="flex flex-col gap-6">
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
