"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Activity, ArrowUpRight, Code2, Globe, Layers, MapPin, Sparkles, Tag, Zap } from "lucide-react";
import { TacticalModal } from "@v2/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@v2/lib/animations";
import { tacticalAudio } from "@v2/lib/sounds";
import { TargetScannerGame } from "@v2/components/ui/TargetScannerGame";
import { supabase } from "@v2/lib/supabase";
import { useMetadata } from "@v2/lib/useMetadata";
import { useAchievement } from "@v2/components/providers/AchievementProvider";

const RecentActivity = [
  { id: "01", date: "2024-05-12", title: "SEEGLA — Software Engineer", status: "Active" },
  { id: "02", date: "2024-05-08", title: "LUNA — Health-Tech Lead Dev", status: "Active" },
  { id: "03", date: "2024-04-30", title: "Digital Lab — Indie Game Dev", status: "Active" },
];

const Skills = [
  { name: "Java", level: 90, color: "from-primary to-primary-dim" },
  { name: "Next.js", level: 80, color: "from-primary to-primary-dim" },
  { name: "TypeScript", level: 80, color: "from-secondary to-secondary-dim" },
  { name: "Flutter", level: 80, color: "from-secondary to-secondary-dim" },
  { name: "Node.js", level: 75, color: "from-tertiary to-pink-600" },
  { name: "Python", level: 75, color: "from-tertiary to-pink-600" },
];

const TITLES = [
  "Full-Stack Developer",
  "Next.js Specialist",
  "Lead Developer @ LUNA",
  "Software Engineer @ SEEGLA",
];

export default function Home() {
  const { metadata } = useMetadata();
  const [logs, setLogs] = useState<any[]>([]);
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
    const fetchLatestLogs = async () => {
      if (!supabase) return;
      try {
        const { data } = await supabase
          .from("logs").select("*").order("created_at", { ascending: false }).limit(4);
        if (data) setLogs(data);
      } catch (err) { console.error(err); }
    };
    fetchLatestLogs();
    if (!supabase) return;
    let channel: any;
    try {
      channel = supabase.channel("public:home_logs")
        .on("postgres_changes", { event: "*", schema: "public", table: "logs" }, () => fetchLatestLogs())
        .subscribe();
    } catch (err) { console.error(err); }
    return () => { if (channel && supabase) supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timeout = setTimeout(() => {
      const fullText = TITLES[titleIndex];
      if (!isDeleting) {
        setCurrentTitle(fullText.substring(0, currentTitle.length + 1));
        if (currentTitle.length + 1 === fullText.length) {
          setTimeout(() => setIsDeleting(true), 1200);
        }
      } else {
        setCurrentTitle(fullText.substring(0, currentTitle.length - 1));
        if (currentTitle.length === 1) {
          setIsDeleting(false);
          setTitleIndex(prev => (prev + 1) % TITLES.length);
        }
      }
    }, isDeleting ? 40 : 80);
    return () => clearTimeout(timeout);
  }, [mounted, currentTitle, isDeleting, titleIndex]);

  const openSkillModal = (skill: typeof Skills[0]) => {
    setActiveModal({
      title: skill.name,
      subtitle: "Technical Proficiency",
      content: (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-secondary">Expertise Level: {skill.level}%</span>
            <span className="text-on-surface-muted italic">Core Stack — Active</span>
          </div>
          <div className="h-1.5 w-full bg-surface-high rounded-full overflow-hidden border border-outline/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${skill.level}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full bg-linear-to-r ${skill.color} rounded-full`}
            />
          </div>
          <p className="text-sm text-on-surface-muted leading-relaxed">
            Extensive experience applying this technology to production-grade systems and scalable architectures. Deeply familiar with the ecosystem and best practices.
          </p>
        </div>
      ),
    });
  };

  const openStatusModal = () => {
    setActiveModal({
      title: "Availability & Status",
      subtitle: "Current Workload Status",
      content: (
        <div className="flex flex-col gap-5">
          <div className="p-4 bg-surface-low border border-outline rounded-xl flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
            <div className="flex flex-col">
              <span className="text-xs font-mono text-secondary uppercase tracking-widest">Active Status</span>
              <span className="text-sm text-on-surface mt-0.5 font-medium">Open to Selective Projects</span>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-on-surface-muted uppercase">Primary Focus Areas</h4>
            <div className="flex flex-wrap gap-2">
              {["Full-Stack Development", "Health-Tech", "Digital Product Design", "System Architecture"].map(s => (
                <span key={s} className="tag tag-cyan text-[10px]!">{s}</span>
              ))}
            </div>
          </div>
          <p className="text-sm text-on-surface-muted leading-relaxed italic">
            "Currently optimizing core platforms while exploring high-impact collaboration opportunities."
          </p>
        </div>
      )
    });
  };

  const openProfileModal = () => {
    setActiveModal({
      title: "Profile Overview",
      subtitle: "Software Engineer · Designer",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Vertical Portrait */}
          <div className="md:col-span-5 h-[360px] md:h-full rounded-2xl overflow-hidden border border-outline relative group">
            <img
              src="/assets/profile/operator.jpeg"
              alt="Julius Silvano"
              className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent" />
          </div>

          {/* Right: Details */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <div>
              <span className="section-label block mb-2">Professional Summary</span>
              <p className="text-sm text-on-surface-muted leading-relaxed">
                I am a full-stack engineer dedicated to building seamless digital experiences. With a focus on performance and clean architecture, I specialize in bridging complex engineering with intuitive product design.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Location", val: "Quezon City, PH" },
                { label: "Experience", val: "2+ Years" },
                { label: "Timezone", val: "UTC+8 (PST)" },
                { label: "Focus", val: "Next.js & Java" },
              ].map(i => (
                <div key={i.label} className="p-3 bg-surface-medium border border-outline rounded-xl">
                  <span className="text-[10px] font-mono text-on-surface-muted block mb-1 uppercase">{i.label}</span>
                  <span className="text-xs font-bold text-on-surface">{i.val}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-outline flex items-center justify-between">
              <Link href="/about" className="btn-primary px-4 py-2 text-xs">Learn More</Link>
              <div className="flex gap-4">
                <Link href="/contact" className="text-xs font-mono text-on-surface-muted hover:text-primary transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
      )
    });
  };

  const openLogModal = (log: any) => {
    setActiveModal({
      title: "Activity Analysis",
      subtitle: `Event Reference: ${log.id || "GEN_EVT"}`,
      content: (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-primary/60" />
            <h4 className="text-sm font-bold text-on-surface">{log.title}</h4>
          </div>
          <div className="p-4 bg-surface-low border border-outline rounded-xl font-mono text-[11px] leading-relaxed text-secondary/80">
            [ANALYSIS START]<br />
            • Status: Successful Deployment<br />
            • Occurred: {log.date || log.created_at}<br />
            • Domain: {log.sector || "System General"}<br />
            [ANALYSIS COMPLETE]
          </div>
          <p className="text-sm text-on-surface-muted leading-relaxed">
            This log entry details a key milestone in the system's development lifecycle. It signifies a completed iteration in product functionality and performance testing.
          </p>
        </div>
      )
    });
  };

  const openTechModal = (tech: string) => {
    setActiveModal({
      title: "Technical Expertise",
      subtitle: `Stack Module: ${tech}`,
      content: (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={20} />
            </div>
            <div>
              <span className="text-xs font-mono text-primary uppercase">Integration Utility</span>
              <p className="text-sm font-semibold text-on-surface">Major Infrastructure</p>
            </div>
          </div>
          <p className="text-sm text-on-surface-muted leading-relaxed">
            Expertly leveraged to architect high-fidelity systems and performant data layers. This technology is a core pillar of my development methodology.
          </p>
          <div className="flex items-center justify-between mt-2 pt-4 border-t border-outline/50">
            <span className="text-[10px] font-mono text-on-surface-muted italic uppercase">Proficiency Rank</span>
            <span className="text-xs font-bold text-secondary">Advanced Application</span>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* ── Bento Grid ─────────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-min"
        >

          {/* ── HERO CARD (col 1-8) ──────────────────────────── */}
          <motion.div
            variants={item}
            className="md:col-span-8 glow-card p-8 sm:p-10 flex flex-col justify-between min-h-[340px] bg-surface"
          >
            {/* Top row */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => { openStatusModal(); tacticalAudio?.click(); }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity group px-0 border-none bg-transparent cursor-pointer"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="section-label text-secondary/70 group-hover:text-secondary transition-colors">Available for work</span>
              </button>
              <span className="tag tag-cyan font-mono text-[10px]">{metadata.AVAILABILITY || "Open"}</span>
            </div>

            {/* Name */}
            <div className="flex-1">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-on-surface tracking-normal leading-tight mb-4">
                iussyan<span className="text-primary">.tech</span>
              </h1>
              <div className="flex items-center gap-2 h-8">
                <span className="font-mono text-base sm:text-lg text-on-surface-muted">
                  {currentTitle}
                </span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-0.5 h-5 bg-primary"
                />
              </div>

              <p className="mt-6 text-sm text-on-surface-muted leading-relaxed max-w-lg">
                Designer of scalable systems. I build full-stack applications that are fast, user-focused, and built to last. Based in Quezon City, Philippines.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/about"
                className="btn-primary px-5 py-2.5 text-sm gap-2"
              >
                About Me <ArrowUpRight size={15} />
              </Link>
              <Link
                href="/contact"
                className="btn-ghost px-5 py-2.5 text-sm"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>

          {/* ── PROFILE CARD (col 9-12) ─────────────────────── */}
          <motion.div
            variants={item}
            onClick={() => { openProfileModal(); tacticalAudio?.click(); }}
            className="md:col-span-4 glow-card bg-surface overflow-hidden flex flex-col cursor-pointer group hover:border-primary/30 transition-colors"
          >
            {/* Photo */}
            <div className="relative h-52 bg-surface-medium overflow-hidden">
              <img
                src="/assets/profile/operator.jpeg"
                alt="Julius Silvano"
                className="w-full h-full object-cover object-center transition-all duration-700 scale-110 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-surface via-surface/20 to-transparent" />
            </div>
            {/* Info */}
            <div className="p-5 flex flex-col gap-3 flex-1">
              <div>
                <h2 className="font-display font-bold text-base text-on-surface">Julius Silvano</h2>
                <p className="text-xs font-mono text-on-surface-muted mt-0.5">silvano.julius.kadusale@gmail.com</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { icon: <MapPin size={11} />, label: "Quezon City, Philippines" },
                  { icon: <Code2 size={11} />, label: "2+ Projects Shipped" },
                  { icon: <Globe size={11} />, label: "Open to Remote / Onsite" },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-2 text-on-surface-muted">
                    <span className="text-primary/60">{r.icon}</span>
                    <span className="text-xs">{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── SKILLS CARD (col 1-4) ────────────────────────── */}
          <motion.div
            variants={item}
            className="md:col-span-4 bento-card flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-primary/60" />
              <span className="section-label">Core Skills</span>
            </div>
            <div className="flex flex-col gap-3">
              {Skills.map((skill) => (
                <button
                  key={skill.name}
                  onClick={() => { openSkillModal(skill); tacticalAudio?.blip(); }}
                  className="group flex flex-col gap-1.5 text-left cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-on-surface group-hover:text-primary transition-colors">{skill.name}</span>
                    <span className="text-xs font-mono text-on-surface-muted">{skill.level}%</span>
                  </div>
                  <div className="h-1 w-full bg-surface-high rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${skill.level}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                      className={`h-full bg-linear-to-r ${skill.color} rounded-full group-hover:opacity-100`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── ACTIVITY FEED (col 5-8) ──────────────────────── */}
          <motion.div
            variants={item}
            className="md:col-span-4 bento-card flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-secondary/60" />
                <span className="section-label">Activity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono text-secondary/60">Live</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {(logs.length > 0 ? logs : RecentActivity).map((entry: any, idx: number) => (
                <motion.div
                  key={entry.id || idx}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => { openLogModal(entry); tacticalAudio?.click(); }}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-surface-medium transition-colors group cursor-pointer"
                >
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-on-surface truncate font-medium">
                      {entry.title}
                    </p>
                    <p className="text-xs font-mono text-on-surface-muted mt-0.5">
                      {entry.sector ? <span className="tag tag-cyan">{entry.sector}</span> : entry.date}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link href="/logbook" className="flex items-center gap-1.5 text-xs font-mono text-primary/60 hover:text-primary transition-colors mt-auto">
              View all activity <ArrowUpRight size={12} />
            </Link>
          </motion.div>

          {/* ── SCANNER GAME (col 9-12) ──────────────────────── */}
          <motion.div
            variants={item}
            className="md:col-span-4 bento-card flex flex-col gap-4 overflow-hidden min-h-[240px]"
          >
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-tertiary/60" />
              <span className="section-label">Target Scanner</span>
              <span className="ml-auto tag tag-pink text-[10px]">Interactive</span>
            </div>
            <div className="flex-1 rounded-lg overflow-hidden bg-surface-medium border border-outline">
              <TargetScannerGame />
            </div>
          </motion.div>

          {/* ── STACK TAGS (col 1-6) ──────────────────────────── */}
          <motion.div
            variants={item}
            className="md:col-span-6 bento-card flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-on-surface-muted/60" />
              <span className="section-label">Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js", "React", "TypeScript", "Java", "Flutter", "Dart",
                "Node.js", "Python", "Supabase", "PostgreSQL", ".NET", "Tailwind"
              ].map((tech) => (
                <button
                  key={tech}
                  onClick={() => { openTechModal(tech); tacticalAudio?.blip(); }}
                  className="tag font-mono text-xs hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
                >
                  {tech}
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── QUICK LINKS (col 7-12) ──────────────────────── */}
          <motion.div
            variants={item}
            className="md:col-span-6 bento-card grid grid-cols-2 gap-3"
          >
            {[
              { href: "/projects", label: "Projects", sub: "2+ shipped", icon: <Code2 size={20} />, color: "text-primary" },
              { href: "/expeditions", label: "Expeditions", sub: "Certs & events", icon: <Sparkles size={20} />, color: "text-secondary" },
              { href: "/contact", label: "Contact", sub: "Let's talk", icon: <Globe size={20} />, color: "text-tertiary" },
              { href: "/about", label: "About", sub: "My story", icon: <Layers size={20} />, color: "text-on-surface-muted" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col justify-between p-4 rounded-xl bg-surface-low hover:bg-surface-medium border border-outline hover:border-primary/20 transition-all"
              >
                <span className={`${link.color} inline-block`}>{link.icon}</span>
                <div className="mt-4">
                  <p className="text-sm font-display font-semibold text-on-surface group-hover:text-primary transition-colors">{link.label}</p>
                  <p className="text-xs font-mono text-on-surface-muted mt-0.5">{link.sub}</p>
                </div>
              </Link>
            ))}
          </motion.div>

        </motion.div>
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
