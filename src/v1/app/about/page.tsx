"use client";

import { motion } from "framer-motion";
import { Shield, Cpu, Zap, Info, Layers, RefreshCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { TacticalModal } from "@v1/components/ui/TacticalModal";
import { fadeUp, item } from "@v1/lib/animations";
import { tacticalAudio } from "@v1/lib/sounds";
import { useTheme } from "@v1/components/providers/ThemeProvider";
import { useMetadata } from "@v1/lib/useMetadata";
import { useAchievement } from "@v1/components/providers/AchievementProvider";

const experiences = [
  { id: "EXP_01", role: "Software Engineer", sector: "SEEGLA (Collective)", period: "2026 — Present", task: "Engineering modular, high-performance architectures for a premier developer collective. Optimized frontend delivery pipelines and integrated robust state management systems using React and Next.js." },
  { id: "EXP_02", role: "Lead Developer", sector: "LUNA App (Health-Tech)", period: "2026 — Present", task: "Spearheading the technical development of a privacy-first health-tech platform. Implemented end-to-end encryption within a high-performance Flutter mobile environment to secure sensitive biometric data." },
  { id: "EXP_03", role: "Indie Game Developer", sector: "Digital Lab", period: "2025 — Present", task: "Pioneering interactive storytelling through cross-platform game development. Leveraging Unity and C# to deploy high-fidelity digital experiences that bridge educational objectives with immersive gameplay." },
];

const loadoutItems = [
  { category: "Web & Mobile", tools: ["React", "Next.js", "TypeScript", "Flutter", "Tailwind"] },
  { category: "Engine & Core", tools: ["Node.js", ".NET", "C#", "C++", "Python", "Unity"] },
  { category: "Data & Cloud", tools: ["Supabase", "PostgreSQL", "MySQL", "Vercel", "Git"] },
];

export default function About() {
  const { metadata } = useMetadata();
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: React.ReactNode } | null>(null);
  const { theme, toggleTheme } = useTheme();

  const { unlockAchievement } = useAchievement();

  // Play comms sound on load
  useEffect(() => {
    tacticalAudio?.comms();
    unlockAchievement("INTEL_RECON");
  }, [unlockAchievement]);

  const handleThemeToggle = () => {
    tacticalAudio?.glitch();
    toggleTheme();
    unlockAchievement("THEME_OVERRIDE");
  };

  const openExperienceModal = (exp: typeof experiences[0]) => {
    setActiveModal({
      title: exp.role,
      subtitle: `SECTOR: ${exp.sector} // ${exp.period}`,
      content: (
        <div className="flex flex-col gap-6 font-mono text-base uppercase">
          <div className="border-l-2 border-primary pl-4 py-2 bg-primary/5">
            <span className="text-primary font-extrabold text-sm tracking-widest">MISSION_ID: {exp.id}</span>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-secondary font-bold text-xs tracking-widest">OBJECTIVE_SUMMARY</h4>
            <p className="text-base font-bold text-on-surface leading-snug normal-case font-sans">
              {exp.task}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-high p-5 border border-outline/10">
              <span className="text-primary/60 text-[11px] font-bold block mb-1 uppercase tracking-widest">UNIT_COMPLIANCE</span>
              <span className="text-xl font-bold tracking-tight text-primary">STABLE</span>
            </div>
            <div className="bg-surface-high p-5 border border-outline/10">
              <span className="text-primary/60 text-[11px] font-bold block mb-1 uppercase tracking-widest">IMPACT_METRIC</span>
              <span className="text-xl font-bold tracking-tight text-secondary">+42% EFF</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-on-surface-muted text-[11px] font-bold tracking-widest">DEBRIEF_STREAM</span>
            <p className="text-xs text-on-surface-muted leading-relaxed font-sans normal-case italic">
              Detailed analysis of the {exp.role} phase confirms significant architectural improvements in the {exp.sector} sector.
              Deployment was executed with 100% uptime and met all strategic benchmarks.
            </p>
          </div>
        </div>
      )
    });
  };

  const openValueModal = (val: { title: string; desc: string }) => {
    setActiveModal({
      title: val.title,
      subtitle: "CORE_OPERATING_PRINCIPLE",
      content: (
        <div className="flex flex-col gap-6 font-mono text-base uppercase">
          <div className="border-l-2 border-secondary pl-4 py-2 bg-secondary/5">
            <span className="text-secondary font-extrabold text-sm tracking-widest">STATUS: AUTHENTICATED</span>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-primary font-bold text-xs tracking-widest">PHILOSOPHY_DEEP_DIVE</h4>
            <p className="text-base font-bold text-on-surface leading-snug normal-case font-sans">
              {val.desc}
            </p>
          </div>
          <div className="bg-surface-high p-5 border border-outline/10 text-xs text-on-surface-muted italic normal-case font-sans leading-relaxed">
            "We believe that technical excellence is not just about code, but about the resilience and integrity of the entire system architecture."
          </div>
        </div>
      )
    });
  };

  const openEducationModal = (edu: { title: string; org: string; date: string; status: string; desc: string }) => {
    setActiveModal({
      title: edu.title,
      subtitle: `${edu.org} // ${edu.date}`,
      content: (
        <div className="flex flex-col gap-6 font-mono text-base uppercase">
          <div className="border-l-2 border-secondary pl-4 py-2 bg-secondary/5">
            <span className="text-secondary font-extrabold text-sm tracking-widest">STATUS: {edu.status}</span>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-primary font-bold text-xs tracking-widest uppercase">ACADEMIC_RECORD_SUMMARY</h4>
            <p className="text-base font-bold text-on-surface leading-snug normal-case font-sans">
              {edu.desc}
            </p>
          </div>
          <div className="bg-surface-high p-5 border border-outline/10 grid grid-cols-2 gap-4">
            <div>
              <span className="text-on-surface-muted text-[10px] block mb-1">GPA_SYNC</span>
              <span className="text-primary font-bold font-mono uppercase tracking-tighter">STABLE // HIGH</span>
            </div>
            <div>
              <span className="text-on-surface-muted text-[10px] block mb-1">CREDITS_VERIFIED</span>
              <span className="text-primary font-bold font-mono uppercase tracking-tighter">100%_SYNC</span>
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="min-h-screen pt-4 pb-12 px-6 scanlines bg-surface">
      <div className="container mx-auto max-w-6xl flex flex-col gap-12">

        {/* Dossier Header */}
        <section className="relative border-l-4 border-primary bg-surface-low p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="hud-marker" />
          <div className="w-40 h-40 bg-surface-high border border-outline relative overflow-hidden shrink-0 group/dossier">
            <img
              src="/assets/profile/operator.jpeg"
              alt="Operator Profile"
              className="w-full h-full object-cover grayscale group-hover/dossier:grayscale-0 transition-all duration-500"
            />
            <div className="absolute inset-0 border-[0.5px] border-primary/20 pointer-events-none" />
          </div>
          <div className="flex flex-col gap-4">
            <motion.div {...fadeUp(0)} className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-secondary" />
                <span className="text-xs tracking-[0.2em] font-mono text-secondary uppercase font-bold shrink-0">PROFESSIONAL PROFILE</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-0.5 bg-primary/5 border-l border-primary/20">
                <div className="w-1 h-1 bg-secondary animate-pulse" />
                <span className="text-[10px] text-primary/60 font-mono font-bold tracking-tighter uppercase truncate">MISSION: {metadata.CURRENT_MISSION}</span>
              </div>
            </motion.div>
            <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-6xl font-bold tracking-tighter leading-none hover:glitch-text" data-text="SILVANO // ENGINEER">
              SILVANO, JULIUS JR. K.
            </motion.h1>
            <motion.p {...fadeUp(0.25)} className="text-on-surface-muted text-base leading-relaxed max-w-2xl font-sans mt-2">
              Strategic software engineer and 3rd-year IT scholar focused on architecting resilient, high-impact digital systems.
              Leveraging the intersection of React, Flutter, and Game Engine technology to deploy tactical solutions for complex problems across the web and mobile landscape.
            </motion.p>
          </div>
          <div className="ms-auto flex flex-col items-end gap-3 text-right">
            <button
              onClick={handleThemeToggle}
              className="flex items-center gap-2 px-3 py-1.5 border border-primary/20 bg-primary/5 hover:bg-primary/20 text-primary transition-all group/toggle"
              title="SYSTEM_OVERRIDE // TOGGLE_THEME"
            >
              <RefreshCcw size={14} className="group-hover/toggle:rotate-180 transition-transform duration-500" />
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
                {theme === "tactical" ? "OVERRIDE_TACTICAL" : "RESTORE_TACTICAL"}
              </span>
            </button>
            <div className="flex flex-col text-xs font-mono text-primary/40 lg:flex font-bold tracking-widest italic">
              <span>SYS_AUTH: LEVEL_05</span>
              <span>UPTIME: {metadata.DATA_INTEGRITY}_STABLE</span>
              <span>REGION: ASIA_PH</span>
            </div>
          </div>
        </section>

        {/* Operating Values Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {[
            { icon: <Cpu />, title: "TECHNICAL EXCELLENCE", desc: "Every module is engineered for maximum stability and performance. Focus on clean, efficient code." },
            { icon: <Zap />, title: "EFFICIENT DEPLOYMENT", desc: "Optimizing the path from conceptualization to full production deployment without friction." },
            { icon: <Layers />, title: "MODULAR ARCHITECTURE", desc: "Architecting systems that are resilient, scalable, and inherently maintainable." }
          ].map((val) => (
            <motion.div
              key={val.title}
              variants={item}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              onClick={() => openValueModal(val)}
              className="bg-surface-low p-6 flex flex-col gap-4 border-t border-outline/10 hover:bg-surface-high transition-colors group cursor-pointer"
            >
              <div className="text-secondary group-hover:flicker"><val.icon.type {...val.icon.props} size={24} /></div>
              <h3 className="text-base font-bold tracking-widest uppercase">{val.title}</h3>
              <p className="text-sm text-on-surface-muted leading-relaxed font-sans">{val.desc}</p>
            </motion.div>
          ))}
        </section>

        {/* Mission History (Experience) */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 px-2 border-l-2 border-primary/60">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase">WORK EXPERIENCE</h2>
          </div>
          <div className="flex flex-col gap-px bg-outline/5">
            {experiences.map((exp) => (
              <motion.div
                key={exp.id}
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                onClick={() => openExperienceModal(exp)}
                className="bg-surface-low p-6 grid grid-cols-1 md:grid-cols-4 gap-6 group hover:bg-surface-high cursor-pointer"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-primary/60 font-mono tracking-widest font-bold uppercase">{exp.period}</span>
                  <span className="text-xs font-bold text-on-surface-muted tracking-tight">SECTOR: {exp.sector}</span>
                </div>
                <div className="md:col-span-2 flex flex-col gap-2">
                  <h3 className="text-base font-extrabold tracking-tight text-on-surface group-hover:text-primary transition-colors italic">[{exp.role}]</h3>
                  <p className="text-sm text-on-surface-muted leading-relaxed font-sans font-medium">{exp.task}</p>
                </div>
                <div className="flex justify-end items-start text-xs font-mono text-outline/40 font-bold uppercase italic">
                  ID: {exp.id} {"//"} STAT: STABLE
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* System Loadout (Skills) */}
        <section className="bg-surface-high p-8 flex flex-col gap-8 relative border-y border-outline/10">
          <div className="hud-marker bg-tertiary" />
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase">TECHNICAL PROFICIENCY</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {loadoutItems.map((group) => (
              <div key={group.category} className="flex flex-col gap-4">
                <h3 className="text-xs font-bold text-secondary tracking-widest border-b border-secondary/20 pb-2 uppercase">{group.category}</h3>
                <ul className="flex flex-col gap-2">
                  {group.tools.map((tool) => (
                    <li key={tool} className="text-sm font-mono flex items-center justify-between group cursor-default font-bold">
                      <span className="text-on-surface-muted group-hover:text-on-surface transition-colors">{tool}</span>
                      <span className="text-primary/20 group-hover:text-primary transition-colors uppercase tracking-widest">READY</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Credentials & Academy */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 px-2 border-l-2 border-primary/60">
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase">CREDENTIALS & ACADEMY</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-outline/5">
            {[
              {
                title: "B.S. Information Technology",
                org: "Quezon City University",
                date: "2023 — 2027",
                status: "IN_PROGRESS",
                desc: "Currently pursuing deep technical knowledge in Information Technology. Focusing on software engineering principles, system architecture, and modern full-stack development."
              },
              {
                title: "High School // Senior High School (ICT)",
                org: "San Francisco High School",
                date: "2016 — 2023",
                status: "GRADUATED",
                desc: "Technically specialized in Information and Communications Technology. Developed a strong foundation in logic, basic programming, and digital systems during the graduation phase."
              },
            ].map((edu) => (
              <div
                key={edu.title}
                className="bg-surface-low p-6 flex flex-col gap-2 border border-outline/5 relative group cursor-pointer hover:bg-surface-high transition-colors"
                onClick={() => openEducationModal(edu)}
              >
                <div className="absolute top-0 right-0 w-1 h-1 bg-secondary opacity-40 group-hover:bg-primary transition-colors" />
                <span className="text-[10px] font-mono text-secondary font-bold tracking-widest uppercase group-hover:text-primary transition-colors">{edu.date}</span>
                <h3 className="text-base font-bold text-on-surface group-hover:glitch-text" data-text={edu.title}>{edu.title}</h3>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-on-surface-muted font-bold tracking-tight uppercase">{edu.org}</span>
                  <span className="text-[10px] font-mono text-primary/40 font-black italic">{edu.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

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
