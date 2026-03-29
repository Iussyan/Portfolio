"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowUpRight, ExternalLink, Layers } from "lucide-react";
import { TacticalModal } from "@v2/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@v2/lib/animations";
import { tacticalAudio } from "@v2/lib/sounds";
import { supabase } from "@v2/lib/supabase";
import { useAchievement } from "@v2/components/providers/AchievementProvider";

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: React.ReactNode } | null>(null);
  const { unlockAchievement } = useAchievement();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const channel = supabase
      .channel("public:projects")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, fetchProjects)
      .subscribe();
    tacticalAudio?.comms();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openProjectModal = (p: any) => {
    unlockAchievement("MISSION_ANALYST");
    setActiveModal({
      title: p.title,
      subtitle: `${p.category} · ${p.status}`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="flex flex-col gap-4">
            {p.image_url ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-medium border border-outline">
                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-surface-medium border border-outline flex items-center justify-center">
                <Layers size={40} className="text-on-surface-muted/20" />
              </div>
            )}
            {/* Stack */}
            <div className="flex flex-wrap gap-1.5">
              {(Array.isArray(p.stack) ? p.stack : (p.stack || "").split(",")).map((t: string) => (
                <span key={t} className="tag font-mono text-xs">{t.trim()}</span>
              ))}
            </div>
            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost px-4 py-2 text-sm flex items-center gap-2 w-full justify-center"
              >
                <ExternalLink size={14} /> View Live Project
              </a>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5">
            {p.task && (
              <div>
                <span className="section-label block mb-2">Overview</span>
                <p className="text-sm text-on-surface-muted leading-relaxed">{p.task}</p>
              </div>
            )}
            {p.challenge && (
              <div>
                <span className="section-label block mb-2 text-tertiary/60">Challenge</span>
                <p className="text-sm text-on-surface-muted leading-relaxed italic border-l-2 border-tertiary/20 pl-3">{p.challenge}</p>
              </div>
            )}
            {p.solution && (
              <div>
                <span className="section-label block mb-2 text-primary/60">Solution</span>
                <p className="text-sm text-on-surface-muted leading-relaxed border-l-2 border-primary/20 pl-3">{p.solution}</p>
              </div>
            )}
            {p.results && (
              <div>
                <span className="section-label block mb-2 text-secondary/60">Outcome</span>
                <p className="text-sm text-on-surface-muted leading-relaxed italic border-l-2 border-secondary/20 pl-3">{p.results}</p>
              </div>
            )}
          </div>
        </div>
      ),
    });
  };


  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <motion.span {...fadeUp(0)} className="section-label text-primary/60">02 — Projects</motion.span>
          <motion.h1 {...fadeUp(0.05)} className="font-display text-5xl sm:text-6xl font-extrabold tracking-normal leading-tight">
            Things I've<br />
            <span className="text-primary">shipped.</span>
          </motion.h1>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bento-card h-64 animate-pulse bg-surface-medium" />
            ))}
          </div>
        ) : (
          <motion.div 
            variants={stagger} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((p) => (
              <motion.div
                key={p.id}
                variants={item}
                whileHover={{ 
                  scale: 1.03, 
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 20 } 
                }}
                onClick={() => { openProjectModal(p); tacticalAudio?.blip(); }}
                className="bento-card cursor-pointer group flex flex-col justify-between h-full bg-surface border border-outline hover:border-primary/40 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-300 relative z-10"
              >
                {/* Image thumbnail / Header */}
                <div className="relative h-48 -mx-6 -mt-6 mb-5 overflow-hidden bg-surface-medium">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10 bg-radial from-primary/20 to-transparent">
                      <Layers size={40} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="tag text-[10px] tracking-widest">{p.category}</span>
                    <span className="tag tag-cyan text-[10px] tracking-widest">{p.status}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-primary transition-colors tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-xs text-on-surface-muted leading-relaxed line-clamp-3">
                    {p.task}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-outline flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5 flex-1 mr-4">
                    {(Array.isArray(p.stack) ? p.stack : (p.stack || "").split(",")).slice(0, 4).map((t: string) => (
                      <span key={t} className="text-[9px] font-mono text-on-surface-muted bg-surface-medium px-1.5 py-0.5 rounded border border-outline">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                  <div className="p-2 -mr-2 text-on-surface-muted group-hover:text-primary transition-colors">
                    <ExternalLink size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
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
