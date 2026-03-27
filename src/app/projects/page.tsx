"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowUpRight, Folder, Terminal } from "lucide-react";
import { TacticalModal } from "@/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@/lib/animations";
import { tacticalAudio } from "@/lib/sounds";
import { supabase } from "@/lib/supabase";

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

  const openProjectModal = (p: any) => {
    setActiveModal({
      title: p.title,
      subtitle: `MISSION_ID: ${p.id.split('-')[0]} // ${p.category}`,
      content: (
        <div className="flex flex-col gap-6 font-mono text-base uppercase">
          <div className="border-l-2 border-primary pl-4 py-2 bg-primary/5">
            <span className="text-primary font-extrabold text-sm tracking-widest">PROJECT_ID: {p.id}</span>
          </div>
          <div className="flex flex-col gap-4">
            <h4 className="text-secondary font-bold text-xs tracking-widest uppercase">MISSION_OVERVIEW</h4>
            <p className="text-base font-bold text-on-surface leading-snug normal-case font-sans">
              {p.task}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-primary font-bold text-xs tracking-widest uppercase">TECHNICAL_STACK</h4>
            <div className="flex flex-wrap gap-2">
              {p.stack.map((s: string) => (
                <span key={s} className="px-3 py-1 bg-surface-high border border-outline/20 text-xs font-bold text-on-surface-muted">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <Link href={p.link} target="_blank" rel="noopener noreferrer" className="btn-tactical btn-tactical-primary text-center py-4 text-sm font-black uppercase flex items-center justify-center gap-2">
            OPEN_SECURE_LINK <ArrowUpRight size={16} />
          </Link>
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
