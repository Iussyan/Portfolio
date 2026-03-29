"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { BookOpen, Briefcase, Calendar, Heart, MapPin, Star, User, ShieldCheck } from "lucide-react";
import { fadeUp, stagger, item } from "@v2/lib/animations";
import { tacticalAudio } from "@v2/lib/sounds";
import { cn } from "@v2/lib/utils";
import { useTheme } from "@v2/components/providers/ThemeProvider";
import { TacticalModal } from "@v2/components/ui/TacticalModal";

const experience = [
  {
    company: "SEEGLA",
    role: "Software Engineer",
    period: "2025 — Present",
    description: "Building production-grade systems. Collaborating on scalable architecture decisions for the team.",
    details: "Focusing on enterprise-level scalability and high-performance backend systems. Leading the transition to a unified microservices architecture and mentoring junior developers on clean code practices.",
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL"],
  },
  {
    company: "LUNA Health Platform",
    role: "Lead Developer",
    period: "2025 — Present",
    description: "Architected and shipped a menstrual health platform serving a growing user base.",
    details: "Responsible for the entire technical roadmap of the LUNA platform. Implemented advanced tracking algorithms and secured sensitive medical data with industry-standard encryption protocols.",
    stack: ["Flutter", "Firebase", "Dart", "Clean Architecture"],
  },
  {
    company: "IussDevs",
    role: "Founder / Game Developer (Self-Employed)",
    period: "2024 — Present",
    description: "Developing original game concepts using Unity and Godot as creative side projects.",
    details: "Exploring the intersection of storytelling and interactive mechanics. Developed multiple prototypes focusing on immersive world-building and emergent gameplay systems.",
    stack: ["Unity", "C#", "Godot", "HLSL"],
  },
];

const education = [
  {
    institution: "Quezon City University (College)",
    degree: "BS Information Technology",
    period: "2024 — Present",
    note: "BSIT Program",
    details: "Focusing on Software Engineering and Database Administration. Consistently maintaining a high GWA while balancing multiple professional projects.",
  },
  {
    institution: "San Francisco High School (Senior High)",
    degree: "Information and Communications Technology",
    period: "2022 — 2024",
    note: "Information and Communications Technology Program",
    details: "Graduated with honors. Developed a strong foundation in programming logic, hardware diagnostics, and web development fundamentals.",
  },
];

const values = [
  { icon: <Star size={14} />, label: "Quality over Quantity", desc: "I'd rather ship one great thing than ten mediocre ones." },
  { icon: <Heart size={14} />, label: "User First", desc: "Real impact comes from real people using your work." },
  { icon: <BookOpen size={14} />, label: "Always Learning", desc: "The best developers are permanent students." },
];

export default function About() {
  const { theme, setTheme } = useTheme();
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: ReactNode } | null>(null);

  const openProfileModal = () => {
    setActiveModal({
      title: "Julius Silvano",
      subtitle: "Software Engineer · Editorial Profile",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col gap-6">
            <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-surface-medium border border-outline relative">
              <img src="/assets/profile/operator.jpeg" alt="Julius Silvano" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-4 bg-linear-to-t from-black/80 to-transparent">
                <span className="section-label text-white/90">Verified Professional</span>
              </div>
            </div>
            <div className="bento-card bg-surface-low border-primary/20 flex flex-col gap-1">
              <span className="text-[10px] text-primary font-black tracking-widest uppercase">System Role</span>
              <p className="text-sm font-display font-bold text-on-surface italic">Software Engineer</p>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <div>
              <span className="section-label block mb-3 text-primary/60">Executive Summary</span>
              <p className="text-sm text-on-surface-muted leading-relaxed font-sans">
                A software engineer dedicated to building high-fidelity digital experiences. Specializing in bridging the gap between rigorous technical architecture and expressive user interfaces.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Availability", val: "Available for Projects", color: "text-secondary" },
                { label: "Location", val: "Quezon City, PH (Remote Ready)", color: "text-on-surface" },
                { label: "Timezone", val: "GMT+8 (Manila)", color: "text-on-surface-muted" },
              ].map(info => (
                <div key={info.label} className="border-l-2 border-outline pl-4 py-1">
                  <span className="text-[10px] uppercase font-bold text-on-surface-muted block mb-0.5">{info.label}</span>
                  <p className={cn("text-sm font-semibold", info.color)}>{info.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 border border-outline bg-surface-low rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">Digital Signature</span>
              </div>
              <p className="text-[10px] font-mono text-on-surface-muted break-all opacity-40">
                SHA256: 8f4e2c...d9a1b0
              </p>
            </div>
          </div>
        </div>
      )
    });
  };

  const openExperienceModal = (exp: any) => {
    setActiveModal({
      title: exp.company,
      subtitle: `${exp.role} · ${exp.period}`,
      content: (
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-surface-low border border-outline rounded-xl">
            <span className="section-label block mb-4 text-primary/60">Role Objective</span>
            <p className="text-base text-on-surface-muted leading-relaxed">{exp.details}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <span className="section-label text-secondary/60">Tech Stack</span>
              <div className="flex flex-wrap gap-2">
                {exp.stack.map((s: string) => (
                  <span key={s} className="tag tag-cyan">{s}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <span className="section-label text-on-surface-muted">Operational Context</span>
              <p className="text-xs text-on-surface-muted italic leading-relaxed">
                Project delivery focused on maintainable architecture and performance optimization within the {exp.company} ecosystem.
              </p>
            </div>
          </div>
        </div>
      )
    });
  };

  const openEducationModal = (edu: any) => {
    setActiveModal({
      title: edu.institution,
      subtitle: edu.degree,
      content: (
        <div className="flex flex-col gap-6">
          <div className="p-6 bg-surface-low border border-outline rounded-xl">
            <span className="section-label block mb-4 text-secondary/60">Focus Areas</span>
            <p className="text-base text-on-surface-muted leading-relaxed">{edu.details}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bento-card border-outline/10 p-4">
              <Calendar size={18} className="text-primary/40 mb-2" />
              <span className="text-[10px] font-bold text-on-surface-muted uppercase">Duration</span>
              <p className="text-sm font-bold text-on-surface mt-1">{edu.period}</p>
            </div>
            <div className="bento-card border-outline/10 p-4">
              <BookOpen size={18} className="text-secondary/40 mb-2" />
              <span className="text-[10px] font-bold text-on-surface-muted uppercase">Certificate</span>
              <p className="text-sm font-bold text-on-surface mt-1">{edu.note}</p>
            </div>
          </div>
        </div>
      )
    });
  };

  const openValueModal = (val: any) => {
    setActiveModal({
      title: val.label,
      subtitle: "Engineering Philosophy",
      content: (
        <div className="flex flex-col gap-6 text-center py-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto mb-2">
            {val.icon}
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-xl font-display font-extrabold text-on-surface mb-3">{val.label}</h4>
            <p className="text-base text-on-surface-muted leading-relaxed">{val.desc}</p>
            <div className="mt-8 pt-8 border-t border-outline/10">
              <p className="text-xs italic text-on-surface-muted">
                "I believe that the best software is built with intention, empathy, and a relentless focus on the end-user experience."
              </p>
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Page Header ─────────────────────────────────── */}
        <motion.div {...fadeUp(0)} className="mb-12 flex flex-col gap-3">
          <span className="section-label text-primary/60">01 — About</span>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold tracking-normal text-on-surface leading-tight">
            The person<br />
            <span className="text-primary">behind the code.</span>
          </h1>
        </motion.div>

        {/* ── Main Grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left Column ────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            <motion.div
              {...fadeUp(0.05)}
              onClick={() => { openProfileModal(); tacticalAudio?.hum(); }}
              className="glow-card overflow-hidden relative cursor-pointer group"
            >
              <div className="h-72 bg-surface-medium relative overflow-hidden">
                <img
                  src="/assets/profile/operator.jpeg"
                  alt="Julius Silvano"
                  className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent" />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <User size={14} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h2 className="font-display font-extrabold text-xl text-on-surface group-hover:text-primary transition-colors">Julius Silvano</h2>
                <p className="text-sm font-mono text-on-surface-muted mt-1">Software Engineer · QC, PH</p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-xs font-mono text-secondary/70">Open to opportunities</span>
                </div>
              </div>
            </motion.div>

            {/* Quick stats */}
            <motion.div {...fadeUp(0.1)} className="bento-card grid grid-cols-2 gap-4">
              {[
                { label: "Projects", val: "2+" },
                { label: "Years", val: "2+" },
                { label: "Stack", val: "12+" },
                { label: "Events", val: "6+" },
              ].map(s => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-display font-extrabold text-2xl text-primary">{s.val}</span>
                  <span className="text-xs font-mono text-on-surface-muted mt-0.5">{s.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Location */}
            <motion.div {...fadeUp(0.15)} className="bento-card flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MapPin size={15} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-display font-semibold text-on-surface">Quezon City</p>
                <p className="text-xs font-mono text-on-surface-muted">Philippines · UTC+8</p>
              </div>
            </motion.div>

            {/* Theme toggle */}
            <motion.div {...fadeUp(0.2)} className="bento-card flex items-center justify-between">
              <div>
                <p className="text-sm font-display font-semibold text-on-surface">Appearance</p>
                <p className="text-xs font-mono text-on-surface-muted mt-0.5">
                  {theme === "light" ? "Light Mode" : "Dark Mode"}
                </p>
              </div>
              <button
                onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); tacticalAudio?.click(); }}
                className={`w-12 h-6 rounded-full border transition-all duration-300 relative ${theme === "light"
                  ? "bg-primary/20 border-primary/30"
                  : "bg-surface-high border-outline"
                  }`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300 ${theme === "light"
                  ? "left-[calc(100%-22px)] bg-primary"
                  : "left-0.5 bg-on-surface-muted"
                  }`} />
              </button>
            </motion.div>

          </div>

          {/* ── Right Column ───────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-6">

            {/* Bio */}
            <motion.div {...fadeUp(0.05)} className="bento-card">
              <h3 className="section-label mb-4">Background</h3>
              <p className="text-sm text-on-surface-muted leading-relaxed">
                I'm a full-stack developer based in Quezon City, Philippines. I specialize in <span className="text-on-surface font-medium">Next.js, Java, and Flutter</span> — building systems that are fast, maintainable, and used by real people.
              </p>
              <p className="text-sm text-on-surface-muted leading-relaxed mt-3">
                I'm currently a BSIT student at Quezon City University while working as a lead developer on multiple active projects. I care about clean architecture, honest UX, and writing code that communicates clearly.
              </p>
            </motion.div>

            {/* Experience */}
            <motion.div {...fadeUp(0.1)} className="bento-card flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <Briefcase size={14} className="text-primary/60" />
                <h3 className="section-label">Experiences</h3>
              </div>
              <div className="flex flex-col gap-1">
                {experience.map((exp, i) => (
                  <div
                    key={exp.company}
                    onClick={() => { openExperienceModal(exp); tacticalAudio?.blip(); }}
                    className="relative pl-4 pb-6 last:pb-0 border-l border-outline hover:border-primary/30 transition-colors group cursor-pointer"
                  >
                    <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-surface border-2 border-primary/40 group-hover:border-primary transition-colors" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div>
                        <h4 className="font-display font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">{exp.role}</h4>
                        <p className="text-xs font-mono text-primary">{exp.company}</p>
                      </div>
                      <span className="text-xs font-mono text-on-surface-muted flex items-center gap-1 shrink-0">
                        <Calendar size={10} />{exp.period}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-muted leading-relaxed">{exp.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Education */}
            <motion.div {...fadeUp(0.15)} className="bento-card flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <BookOpen size={14} className="text-secondary/60" />
                <h3 className="section-label">Education</h3>
              </div>
              {education.map(edu => (
                <div
                  key={edu.institution}
                  onClick={() => { openEducationModal(edu); tacticalAudio?.blip(); }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 -mx-3 rounded-lg hover:bg-surface-low transition-colors cursor-pointer group"
                >
                  <div>
                    <h4 className="font-display font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">{edu.degree}</h4>
                    <p className="text-xs font-mono text-secondary mt-0.5">{edu.institution}</p>
                  </div>
                  <span className="text-xs font-mono text-on-surface-muted">{edu.period}</span>
                </div>
              ))}
            </motion.div>

            {/* Values */}
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {values.map((v) => (
                <motion.div
                  key={v.label}
                  variants={item}
                  onClick={() => { openValueModal(v); tacticalAudio?.blip(); }}
                  className="bento-card flex flex-col gap-3 cursor-pointer group hover:border-primary/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {v.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">{v.label}</h4>
                    <p className="text-xs text-on-surface-muted mt-1 leading-relaxed">{v.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
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
