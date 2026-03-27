"use client";

import { motion } from "framer-motion";
import { Award, Calendar, ExternalLink, Globe, Milestone, Terminal } from "lucide-react";
import { useState, useEffect } from "react";
import { TacticalModal } from "@/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@/lib/animations";
import { tacticalAudio } from "@/lib/sounds";
import { PhotoCarousel } from "@/components/ui/PhotoCarousel";

const certificates = [
  {
    id: "CERT_01",
    title: "-- PENDING --",
    issuer: "-- PENDING --",
    date: "-- PENDING --",
    skills: ["-- PENDING --", "-- PENDING --", "-- PENDING --"],
    credentialId: "-- PENDING --",
    type: "-- PENDING --"
  },
  {
    id: "CERT_02",
    title: "-- PENDING --",
    issuer: "-- PENDING --",
    date: "-- PENDING --",
    skills: ["-- PENDING --", "-- PENDING --", "-- PENDING --"],
    credentialId: "-- PENDING --",
    type: "-- PENDING --"
  },
  {
    id: "CERT_03",
    title: "-- PENDING --",
    issuer: "-- PENDING --",
    date: "-- PENDING --",
    skills: ["-- PENDING --", "-- PENDING --", "-- PENDING --"],
    credentialId: "-- PENDING --",
    type: "-- PENDING --"
  }
];

const events = [
  {
    id: "RAW_01",
    name: "Agent Camp (With Ziggy Zulueta)",
    type: "WORKSHOP",
    date: "2026.02.20",
    location: "BGC Makati, PH",
    images: [
      "/assets/expeditions/agent_camp_1.jpeg",
      "/assets/expeditions/agent_camp_2.jpeg",
      "/assets/expeditions/agent_camp_3.jpeg",
      "/assets/expeditions/agent_camp_4.jpeg"
    ],
    desc: "Intensive training on AI agents and automation. Explored various frameworks for deploying agentic systems in enterprise environments."
  },
  {
    id: "RAW_02",
    name: "Built with AI (GDG)",
    type: "WORKSHOP",
    date: "2026.03.21",
    location: "BGC Makati, PH",
    images: [
      "/assets/expeditions/bwai_gdg_1.jpeg",
      "/assets/expeditions/bwai_gdg_2.jpeg",
      "/assets/expeditions/bwai_gdg_3.jpeg",
      "/assets/expeditions/bwai_gdg_4.jpeg"
    ],
    desc: "Collaborated with Google Developer Group members to explore generative AI capabilities and practical implementations using Gemini and Vertex AI."
  },
  {
    id: "RAW_03",
    name: "Developer Camp 2026",
    type: "HACKATHON",
    date: "2026.03.06 - 2026.03.08",
    location: "Poblacion Makati, PH // Global Remote",
    images: [
      "/assets/expeditions/devcamp_2026_1.jpeg",
      "/assets/expeditions/devcamp_2026_2.jpeg",
      "/assets/expeditions/devcamp_2026_3.jpeg",
      "/assets/expeditions/devcamp_2026_4.jpeg",
      "/assets/expeditions/devcamp_2026_5.jpeg",
      "/assets/expeditions/devcamp_2026_6.jpeg"
    ],
    desc: "ACHIEVED TOP 15 FINALISTS REPRESENTING SEEGLA // Future-tech hackathon focused on decentralized ecosystems, advanced full-stack architectures, and the evolution of AI-integrated development environments."
  },
  {
    id: "RAW_04",
    name: "Gen Z: AI to Z",
    type: "SEMINAR",
    date: "2026.03.17",
    location: "UP Diliman Quezon City, PH",
    images: [
      "/assets/expeditions/genz_aitoz_1.jpeg",
      "/assets/expeditions/genz_aitoz_2.jpeg",
      "/assets/expeditions/genz_aitoz_3.jpeg",
      "/assets/expeditions/genz_aitoz_4.jpeg"
    ],
    desc: "Exploring the impact of artificial intelligence on the new generation of developers and professionals. Discussed ethical AI and the future of work."
  },
  {
    id: "RAW_05",
    name: "Software Freedom Day",
    type: "CONVENTION",
    date: "2025.09.20",
    location: "BGC Makati, PH",
    images: [
      "/assets/expeditions/software_freedom_day_1.jpeg",
      "/assets/expeditions/software_freedom_day_2.jpeg",
      "/assets/expeditions/software_freedom_day_3.jpeg",
      "/assets/expeditions/software_freedom_day_4.jpeg"
    ],
    desc: "Global celebration of Free and Open Source Software (FOSS). Participated in workshops promoting software freedom and digital sovereignty."
  },
  {
    id: "RAW_06",
    name: "WordPress DevCon",
    type: "CONVENTION",
    date: "2025.08.23",
    location: "Quezon City, PH",
    images: [
      "/assets/expeditions/wordpress_devcon_1.jpeg",
      "/assets/expeditions/wordpress_devcon_2.jpeg",
      "/assets/expeditions/wordpress_devcon_3.jpeg",
      "/assets/expeditions/wordpress_devcon_4.jpeg"
    ],
    desc: "Deep-dive into WordPress core development, theme architecture, and high-performance hosting solutions for enterprise-grade sites."
  },
  {
    id: "RAW_07",
    name: "WordPress Manila Meetup",
    type: "MEETUP",
    date: "2025.02.21",
    location: "BGC Makati, PH",
    images: [
      "/assets/expeditions/wordpress_manila_meetup_1.jpeg",
      "/assets/expeditions/wordpress_manila_meetup_2.jpeg",
      "/assets/expeditions/wordpress_manila_meetup_3.jpeg",
      "/assets/expeditions/wordpress_manila_meetup_4.jpeg"
    ],
    desc: "Monthly gathering of WordPress enthusiasts to share best practices, troubleshooting tips, and the latest news from the global community."
  }
];

// Date normalization helper
const getSortDate = (dateStr: string) => {
  // Extract first date from range "YYYY.MM.DD - YYYY.MM.DD"
  const start = dateStr.includes("-") ? dateStr.split("-")[0].trim() : dateStr;
  return start.replace(/\./g, "-");
};

export default function Expeditions() {
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: React.ReactNode } | null>(null);
  const [sortOrder, setSortOrder] = useState<'OLDEST_FIRST' | 'LATEST_FIRST'>('OLDEST_FIRST');
  const [syncDate, setSyncDate] = useState<string | number>("AWAITING_SYNC...");

  // Sorted events computation
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(getSortDate(a.date)).getTime();
    const dateB = new Date(getSortDate(b.date)).getTime();
    return sortOrder === 'OLDEST_FIRST' ? dateA - dateB : dateB - dateA;
  });

  useEffect(() => {
    const date = new Date();
    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    setSyncDate(formattedDate);
    tacticalAudio?.comms();
  }, []);

  const openCertModal = (cert: typeof certificates[0]) => {
    setActiveModal({
      title: cert.title,
      subtitle: `ISSUER: ${cert.issuer} // ${cert.date}`,
      content: (
        <div className="flex flex-col gap-6 font-mono text-base uppercase">
          <div className="border-l-2 border-primary pl-4 py-2 bg-primary/5">
            <span className="text-primary font-extrabold text-sm tracking-widest">CERTIFICATE_ID: {cert.credentialId}</span>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-secondary font-bold text-xs tracking-widest uppercase">VERIFIED_COMPETENCIES</h4>
            <div className="flex flex-wrap gap-2">
              {cert.skills.map((s, index) => (
                <span key={`${s}-${index}`} className="px-3 py-1 bg-surface-high border border-outline/20 text-xs font-bold text-on-surface-muted">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-surface-high p-5 border border-outline/10 text-xs text-on-surface-muted italic normal-case font-sans leading-relaxed">
            This credential verifies the individual's proficiency in {cert.skills.join(", ")} as per the standards set by {cert.issuer}.
          </div>
          <button className="btn-tactical btn-tactical-primary text-center py-4 text-sm font-black uppercase flex items-center justify-center gap-2">
            <ExternalLink size={16} /> VERIFY_CREDENTIAL {">>"}
          </button>
        </div>
      )
    });
  };

  const openEventModal = (evt: typeof events[0]) => {
    setActiveModal({
      title: evt.name,
      subtitle: `TYPE: ${evt.type} // ${evt.date}`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-base uppercase">
          {/* Left Column: Intelligence Asset */}
          <div className="flex flex-col gap-4">
            <PhotoCarousel images={evt.images} />
            <div className="border-l-2 border-secondary pl-4 py-3 bg-secondary/5 mt-auto">
              <span className="text-secondary font-extrabold text-[11px] tracking-widest block uppercase mb-1">COORDINATES</span>
              <span className="text-on-surface font-black text-sm">{evt.location}</span>
            </div>
          </div>

          {/* Right Column: Mission Telemetry */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                <Globe size={14} className="text-primary animate-pulse" />
                <h4 className="text-primary font-bold text-xs tracking-widest uppercase">MISSION_DEBRIEF</h4>
              </div>
              <p className="text-sm font-medium text-on-surface-muted leading-relaxed normal-case font-sans">
                {evt.desc}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto">
              <div className="bg-surface-high p-4 border border-outline/10 flex flex-col justify-center">
                <span className="text-primary/60 text-[10px] font-bold mb-1 uppercase tracking-[0.2em]">PARTICIPATION</span>
                <span className="text-lg font-black tracking-tighter text-primary">ACTIVE</span>
              </div>
              <div className="bg-surface-high p-4 border border-outline/10 flex flex-col justify-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-8 h-8 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,var(--color-outline)_2px,var(--color-outline)_4px)] opacity-20 group-hover:opacity-40 transition-opacity" />
                <span className="text-primary/60 text-[10px] font-bold mb-1 uppercase tracking-[0.2em]">DOC_STATUS</span>
                <span className="text-lg font-black tracking-tighter text-secondary">ARCHIVED</span>
              </div>
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="min-h-screen pt-4 pb-12 px-6 scanlines bg-surface">
      <div className="container mx-auto max-w-6xl flex flex-col gap-12">

        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline/10 pb-12 gap-1">
          <div className="flex flex-col gap-4">
            <motion.div {...fadeUp(0)} className="flex items-center gap-2">
              <Milestone size={14} className="text-secondary" />
              <span className="text-xs tracking-[0.3em] font-mono text-secondary uppercase">OPERATOR ACHIEVEMENTS</span>
            </motion.div>
            <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-6xl font-bold tracking-tighter leading-none hover:flicker">
              EXPEDITION_LOGS
            </motion.h1>
          </div>
          <motion.div {...fadeUp(0.2)} className="flex flex-col text-xs font-mono text-on-surface-muted italic">
            <span>SYNC_DATE: {syncDate}</span>
            <span>DATA_INTEGRITY: 100%</span>
          </motion.div>
        </section>

        {/* Certificates Grid */}
        <section className="flex flex-col gap-6">
          <div className="flex items-center gap-2 px-2 border-l-2 border-primary/60">
            <Award size={14} className="text-primary" />
            <h2 className="text-sm font-bold tracking-[0.2em] uppercase">VERIFIED CREDENTIALS</h2>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline/5 border border-outline/10"
          >
            {certificates.map((cert) => (
              <motion.div
                key={cert.id}
                variants={item}
                onClick={() => openCertModal(cert)}
                className="bg-surface-low p-6 flex flex-col gap-6 group hover:bg-surface-high transition-all relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/30 group-hover:border-primary transition-colors" />
                <div className="hud-marker bg-secondary/30 group-hover:bg-secondary transition-colors" />

                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-primary/60 tracking-widest">{cert.date}</span>
                    <h3 className="text-lg font-bold tracking-tight text-on-surface group-hover:glitch-text" data-text={cert.title}>{cert.title}</h3>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-xs text-on-surface-muted font-bold tracking-tight uppercase">ISSUER: {cert.issuer}</span>
                  <div className="flex flex-wrap gap-2">
                    {cert.skills.slice(0, 3).map((s, index) => (
                      <span key={`${s}-${index}`} className="text-xs font-mono border border-outline/20 px-2 py-0.5 text-on-surface-muted group-hover:border-secondary/40 group-hover:text-secondary transition-colors uppercase">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-6 border-t border-outline/5">
                  <span className="text-[10px] text-emerald-400 font-mono border border-emerald-400 bg-emerald-500/5 px-2 py-0.5 tracking-widest rounded-full">{cert.type}</span>
                  <Terminal size={14} className="text-on-surface-muted opacity-20 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Events Section */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 border-l-2 border-secondary/60">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-secondary" />
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase">FIELD_OPERATIONS // EVENTS</h2>
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-2 bg-surface-high/50 p-1 border border-outline/10">
              <button
                onClick={() => { setSortOrder('OLDEST_FIRST'); tacticalAudio?.blip(); }}
                className={`text-[9px] font-mono px-3 py-1 transition-all ${sortOrder === 'OLDEST_FIRST' ? 'bg-secondary text-surface font-black' : 'text-on-surface-muted hover:text-on-surface'}`}
              >
                OLDEST_FIRST
              </button>
              <button
                onClick={() => { setSortOrder('LATEST_FIRST'); tacticalAudio?.blip(); }}
                className={`text-[9px] font-mono px-3 py-1 transition-all ${sortOrder === 'LATEST_FIRST' ? 'bg-secondary text-surface font-black' : 'text-on-surface-muted hover:text-on-surface'}`}
              >
                LATEST_FIRST
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-px bg-outline/5">
            {sortedEvents.map((evt, idx) => (
              <motion.div
                key={evt.id}
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                onClick={() => openEventModal({ ...evt, id: `EVT_${String(idx + 1).padStart(2, '0')}` })}
                className="bg-surface-low p-4 sm:p-6 flex flex-col md:flex-row gap-6 group hover:bg-surface-high cursor-pointer border-b border-outline/5 md:border-b-0"
              >
                {/* Thumbnail Section */}
                <div className="w-full md:w-32 h-32 bg-surface-high border border-outline/10 shrink-0 relative overflow-hidden">
                  {evt.images && evt.images.length > 0 ? (
                    <img
                      src={evt.images[0]}
                      alt=""
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-surface-medium text-primary/20">
                      <Globe size={24} />
                    </div>
                  )}
                  <div className="absolute inset-0 scanlines opacity-30" />
                  <div className="absolute top-0 left-0 w-1 h-1 bg-primary" />
                </div>

                <div className="flex-1 flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col gap-1 min-w-[120px]">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-primary/60 font-mono font-bold tracking-tighter">EVT_{String(idx + 1).padStart(2, '0')}</span>
                      <span className="text-xs text-secondary font-mono tracking-widest font-bold uppercase">{evt.date}</span>
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-muted tracking-tight underline decoration-secondary/30">LOC: {evt.location}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <h3 className="text-base font-extrabold tracking-tight text-on-surface group-hover:text-secondary transition-colors italic">[{evt.name}]</h3>
                    <p className="text-sm text-on-surface-muted leading-relaxed font-sans font-medium line-clamp-1">{evt.desc}</p>
                  </div>
                  <div className="flex justify-end items-start">
                    <span className="text-xs font-mono border border-outline/20 px-2 py-0.5 text-on-surface-muted group-hover:border-secondary/40 group-hover:text-secondary transition-colors uppercase">TYPE: {evt.type}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* System Message */}
        <section className="bg-surface-high p-6 border border-secondary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Globe size={32} className="text-secondary opacity-20" />
            <p className="text-[11px] font-mono text-secondary leading-tight max-w-xl uppercase">
              [TRANSCEIVER_ACTIVE] Global event attendance and professional certifications are synchronized with the operator's biometric core. Data is immutable.
            </p>
          </div>
          <button className="btn-tactical btn-tactical-secondary text-xs" onClick={() => tacticalAudio?.blip()}>
            REFRESH_TELEMETRY
          </button>
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
