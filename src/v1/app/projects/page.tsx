"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowUpRight, Folder, Terminal, Maximize2, ExternalLink, Award, Activity } from "lucide-react";
import { TacticalModal } from "@v1/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@v1/lib/animations";
import { tacticalAudio } from "@v1/lib/sounds";
import { supabase } from "@v1/lib/supabase";
import { useAchievement } from "@v1/components/providers/AchievementProvider";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: React.ReactNode } | null>(null);
  const [archiveDate, setArchiveDate] = useState<string>("AWAITING_SYNC...");

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setProjects(data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Subscribe to changes
    const channel = supabase
      .channel('public:projects')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchProjects();
      })
      .subscribe();

    const date = new Date();
    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    setArchiveDate(formattedDate);
    tacticalAudio?.comms();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { unlockAchievement } = useAchievement();

  const openProjectModal = (p: any) => {
    unlockAchievement("MISSION_ANALYST");
    setActiveModal({
      title: p.title,
      subtitle: `SECTOR: ${p.category} // ${p.status}`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-base uppercase">
          {/* Left Column: Mission Intelligence */}
          <div className="flex flex-col gap-4">
            {p.image_url ? (
              <div className="relative w-full aspect-video border border-outline/10 bg-surface-high overflow-hidden group/modal-img">
                <img 
                  src={p.image_url} 
                  alt={p.title} 
                  className="w-full h-full object-contain grayscale group-hover/modal-img:grayscale-0 transition-all duration-700" 
                />
                <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />
                
                {/* EXPAND_SIGNAL Protocol */}
                <a
                  href={p.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 p-2 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary hover:bg-primary hover:text-white transition-all opacity-0 group-hover/modal-img:opacity-100 flex items-center gap-2 z-10"
                  title="EXPAND_MISSION_ASSET"
                >
                  <Maximize2 size={12} />
                </a>
              </div>
            ) : (
              <div className="aspect-video bg-surface-high border border-dashed border-outline/20 flex flex-col items-center justify-center gap-4 text-on-surface-muted">
                <Activity size={48} className="opacity-20 translate-y-2 animate-pulse" />
                <span className="text-[10px] font-black tracking-widest uppercase">ASSET_ENCRYPTED</span>
              </div>
            )}
            
            <div className="border-l-2 border-primary pl-4 py-3 bg-primary/5">
              <span className="text-primary font-extrabold text-[11px] tracking-widest block uppercase mb-1">MISSION_ID</span>
              <span className="text-on-surface font-black text-sm">{p.id.split('-')[0].toUpperCase()}</span>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
               <div className="flex items-center gap-2 border-b border-primary/20 pb-2">
                  <Terminal size={14} className="text-primary" />
                  <h4 className="text-primary font-bold text-xs tracking-widest uppercase">TECH_STACK</h4>
               </div>
               <div className="flex flex-wrap gap-2">
                 {p.stack.map((s: string) => (
                   <span key={s} className="px-3 py-1 bg-surface-high border border-outline/20 text-[10px] font-bold text-on-surface-muted hover:border-secondary transition-colors">
                     {s}
                   </span>
                 ))}
               </div>
            </div>
          </div>

          {/* Right Column: Tactical Debrief */}
          <div className="flex flex-col gap-6 text-on-surface">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-secondary/20 pb-2">
                <Activity size={14} className="text-secondary animate-pulse" />
                <h4 className="text-secondary font-bold text-xs tracking-widest uppercase">MISSION_OVERVIEW</h4>
              </div>
              <p className="text-[13px] leading-relaxed normal-case font-sans italic text-on-surface/80 bg-surface-high/50 p-4 border border-outline/5">
                {p.task}
              </p>
            </div>

            {p.challenge && (
              <div className="flex flex-col gap-3">
                <h4 className="text-tertiary font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
                   <div className="w-1 h-1 bg-tertiary" /> 
                   THE_CHALLENGE
                </h4>
                <p className="text-[12px] text-on-surface-muted leading-relaxed normal-case font-sans border-l border-tertiary/20 pl-4">
                  {p.challenge}
                </p>
              </div>
            )}

            {p.solution && (
              <div className="flex flex-col gap-3">
                <h4 className="text-primary font-bold text-[10px] tracking-widest uppercase flex items-center gap-2">
                   <div className="w-1 h-1 bg-primary" />
                   SOL_ARCHITECTURE
                </h4>
                <p className="text-[12px] text-on-surface-muted leading-relaxed normal-case font-sans border-l border-primary/20 pl-4">
                  {p.solution}
                </p>
              </div>
            )}

            {p.results && (
              <div className="flex flex-col gap-4 pt-2">
                 <div className="border-t border-emerald-400/20 pt-4">
                    <h4 className="text-emerald-400 font-bold text-xs tracking-widest uppercase flex items-center gap-2 mb-2">
                       <Award size={14} /> MISSION_OUTCOME
                    </h4>
                    <div className="bg-emerald-500/5 p-4 border border-emerald-500/10 text-[12px] text-emerald-400/80 leading-relaxed italic normal-case font-sans">
                       {p.results}
                    </div>
                 </div>
              </div>
            )}

            <div className="mt-auto pt-6">
              <a 
                href={p.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-tactical btn-tactical-primary w-full py-4 text-xs font-black uppercase flex items-center justify-center gap-3"
              >
                <ExternalLink size={14} /> OPEN_SECURE_UPLINK {">>"}
              </a>
            </div>
          </div>
        </div>
      )
    });
  };

  return (
    <div className="min-h-screen pt-4 pb-10 px-6 scanlines bg-surface">
      <div className="container mx-auto max-w-6xl flex flex-col gap-12">

        {/* Module Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline/10 pb-12 gap-1">
          <div className="flex flex-col gap-4">
            <motion.div {...fadeUp(0)} className="flex items-center gap-2">
              <Terminal size={14} className="text-secondary" />
              <span className="text-xs tracking-[0.3em] font-mono text-secondary uppercase">FEATURED WORK</span>
            </motion.div>
            <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-6xl font-bold tracking-tighter leading-none hover:flicker">
              DEPLOYED_MISSIONS
            </motion.h1>
          </div>
          <motion.div {...fadeUp(0.2)} className="flex flex-col text-xs font-mono text-on-surface-muted italic">
            <span>ARCHIVE_ACCESSED: {archiveDate}</span>
            <span>TOTAL_MODULES: 003_LOADED</span>
          </motion.div>
        </section>

        {/* Project Grid / Missions */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline/5 border border-outline/10"
        >
          {projects.map((p) => (
            <motion.div
              key={p.id}
              variants={item}
              onClick={() => openProjectModal(p)}
              className="bg-surface-low p-6 flex flex-col gap-6 group hover:bg-surface-high transition-all relative overflow-hidden cursor-pointer"
            >
              {/* HUD Marker */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-primary/30 group-hover:border-primary transition-colors" />
              <div className="hud-marker bg-secondary/30 group-hover:bg-secondary transition-colors" />

              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-mono text-primary/60 tracking-widest">{p.category}</span>
                  <h3 className="text-xl font-bold tracking-tight text-on-surface group-hover:glitch-text" data-text={p.title}>{p.title}</h3>
                </div>
                <Folder size={18} className="text-on-surface-muted opacity-20 group-hover:opacity-100 transition-opacity" />
              </div>

              <p className="text-sm text-on-surface-muted leading-relaxed font-sans min-h-[60px]">
                {p.task}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {p.stack.map((s: string) => (
                  <span key={s} className="text-xs font-mono border border-outline/20 px-2 py-0.5 text-on-surface-muted group-hover:border-secondary/40 group-hover:text-secondary transition-colors uppercase">
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-outline/5">
                <span className="text-[12px] text-emerald-400 font-mono border border-emerald-400 bg-emerald-500/5 px-2 py-0.5 tracking-widest rounded-full">{p.status}</span>
                <Link
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary-dim transition-colors group/link"
                >
                  VIEW PROJECT
                  <ArrowUpRight size={12} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* System Message */}
        <section className="bg-surface-high p-6 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-mono text-primary leading-tight max-w-xl uppercase">
            [NOTICE] All project documentation is verified and stable. Confidential details are withheld pending professional engagement.
          </p>
          <Link href="/contact" className="btn-tactical btn-tactical-secondary text-xs">
            REQUEST ACCESS {">>"}
          </Link>
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
