"use client";

import { motion } from "framer-motion";
import { Award, Calendar, ExternalLink, Maximize2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { TacticalModal } from "@v2/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@v2/lib/animations";
import { tacticalAudio } from "@v2/lib/sounds";
import { PhotoCarousel } from "@v2/components/ui/PhotoCarousel";

const getSortDate = (dateStr: string) => {
  const start = dateStr.includes("-") ? dateStr.split("-")[0].trim() : dateStr;
  return start.replace(/\./g, "-");
};

export default function Expeditions() {
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: React.ReactNode } | null>(null);
  const [sortOrder, setSortOrder] = useState<"OLDEST_FIRST" | "LATEST_FIRST">("OLDEST_FIRST");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<"ALL" | "CERTIFICATE" | "EVENT">("ALL");

  useEffect(() => {
    const loadData = async () => {
      const { supabase } = await import("@v2/lib/supabase");
      if (!supabase) return;
      const { data: certs } = await supabase.from("certificates").select("*").order("date", { ascending: true });
      const { data: exps } = await supabase.from("expeditions").select("*").order("date", { ascending: true });
      if (certs) setCertificates(certs);
      if (exps) setEvents(exps);
      setIsLoading(false);
    };
    loadData();
    tacticalAudio?.comms();
  }, []);

  const sortedEvents = [...events].sort((a, b) => {
    const da = new Date(getSortDate(a.date)).getTime();
    const db = new Date(getSortDate(b.date)).getTime();
    return sortOrder === "OLDEST_FIRST" ? da - db : db - da;
  });

  const openCertModal = (cert: any) => {
    setActiveModal({
      title: cert.title,
      subtitle: `${cert.issuer} · ${cert.date}`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-1">
          {/* Visual Asset (Scaled Up) */}
          <div className="md:col-span-7 flex flex-col gap-4">
            {cert.image_url ? (
              <div className="relative w-full aspect-[1.414/1] bg-surface-medium rounded-2xl overflow-hidden group border border-outline shadow-2xl">
                <img src={cert.image_url} alt={cert.title} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-gradient-to-t from-void/40 to-transparent pointer-events-none" />
                <a
                  href={cert.image_url} target="_blank" rel="noopener noreferrer"
                  className="absolute top-4 right-4 p-2 rounded-xl bg-surface/80 backdrop-blur border border-outline text-on-surface-muted hover:text-primary transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                >
                  <Maximize2 size={16} />
                </a>
              </div>
            ) : (
              <div className="aspect-[1.414/1] bg-surface-medium rounded-2xl border border-dashed border-outline flex items-center justify-center">
                <Award size={40} className="opacity-10" />
              </div>
            )}
            <p className="text-sm text-on-surface-muted italic leading-relaxed border-l-2 border-primary/20 pl-4 py-1 opacity-70">
              Certified in {cert.skills?.join(", ")} by {cert.issuer} on {cert.date}.
            </p>
          </div>

          {/* Info Column (Right) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="p-5 bg-surface-medium rounded-2xl border border-outline shadow-sm">
              <span className="section-label block mb-1">Credential ID</span>
              <span className="font-mono text-[13px] text-primary font-black tracking-tight">{cert.credential_id || "VERIFIED"}</span>
            </div>
            <div>
              <span className="section-label block mb-3">Verified Skills</span>
              <div className="flex flex-wrap gap-2">
                {cert.skills?.map((s: string, i: number) => (
                  <span key={`${s}-${i}`} className="tag font-mono text-[11px] px-3 py-1">{s}</span>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              {cert.verify_link && (
                cert.verify_link.startsWith("http") ? (
                  <a href={cert.verify_link} target="_blank" rel="noopener noreferrer"
                    className="btn-primary w-full py-4 text-xs font-black tracking-widest uppercase flex items-center justify-center gap-3 rounded-2xl">
                    <ExternalLink size={14} /> Verify Credential
                  </a>
                ) : (
                  <div className="p-5 bg-surface-medium rounded-2xl border border-outline text-center">
                    <span className="section-label block mb-1">Access Code</span>
                    <span className="font-display font-black text-2xl text-primary">{cert.verify_link}</span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ),
    });
  };

  const openEventModal = (evt: any) => {
    setActiveModal({
      title: evt.name,
      subtitle: `${evt.type} · ${evt.date}`,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 px-1">
          {/* Carousel Column (Left & Scaled) */}
          <div className="md:col-span-7 flex flex-col gap-5">
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl border border-outline">
              <PhotoCarousel images={evt.images} />
            </div>
            <div className="p-1 px-2">
              <span className="section-label block mb-3">Expedition Narrative</span>
              <p className="text-[14px] text-on-surface-muted leading-relaxed font-medium line-clamp-4">{evt.description || "No textual briefing provided for this mission."}</p>
            </div>
          </div>

          {/* Info Column (Right) */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <div className="p-6 bg-surface-medium rounded-2xl border border-outline shadow-sm flex flex-col gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 -translate-y-12 translate-x-12 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity" />
              <span className="section-label block">Geographic Locale</span>
              <div className="flex items-center gap-2 text-secondary">
                <MapPin size={16} />
                <span className="font-display font-black text-secondary tracking-tight text-lg">{evt.location}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="p-5 bg-surface-medium rounded-2xl border border-outline">
                <span className="section-label block mb-1">Operational Type</span>
                <span className="font-display font-black text-[13px] text-primary tracking-tight">{evt.type}</span>
              </div>
              <div className="p-5 bg-surface-medium rounded-2xl border border-outline">
                <span className="section-label block mb-1">Status</span>
                <span className="font-display font-black text-[13px] text-secondary tracking-tight">ATTENDED</span>
              </div>
            </div>

            <div className="mt-auto p-6 bg-surface-low rounded-2xl border border-outline/5 flex items-center justify-center opacity-40">
              <span className="text-[10px] font-mono tracking-[.3em] uppercase">Visual Evidence Locked</span>
            </div>
          </div>
        </div>
      ),
    });
  };

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-3">
            <motion.span {...fadeUp(0)} className="section-label text-primary/60">03 — Expeditions</motion.span>
            <motion.h1 {...fadeUp(0.05)} className="font-display text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Credentials<br />
              <span className="text-primary">& Events.</span>
            </motion.h1>
          </div>
          <motion.div {...fadeUp(0.1)} className="flex items-center gap-1 bg-surface rounded-full border border-outline p-1">
            <button
              onClick={() => setSortOrder("OLDEST_FIRST")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${sortOrder === "OLDEST_FIRST" ? "bg-primary text-white" : "text-on-surface-muted hover:text-on-surface"}`}
            >Oldest</button>
            <button
              onClick={() => setSortOrder("LATEST_FIRST")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${sortOrder === "LATEST_FIRST" ? "bg-primary text-white" : "text-on-surface-muted hover:text-on-surface"}`}
            >Latest</button>
          </motion.div>
        </div>

        {/* ── Certificates ─────────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-primary/60" />
            <h2 className="section-label">Credentials</h2>
            <span className="ml-auto tag text-[10px]">{certificates.length}</span>
          </div>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {isLoading
              ? [...Array(3)].map((_, i) => <div key={i} className="bento-card h-44 animate-pulse bg-surface-medium" />)
              : certificates.map((cert) => (
                <motion.div
                  key={cert.id}
                  variants={item}
                  onClick={() => { openCertModal(cert); tacticalAudio?.blip(); }}
                  className="bento-card cursor-pointer group flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Award size={16} className="text-primary" />
                    </div>
                    <span className="tag tag-cyan text-[10px]">{cert.type}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors leading-tight">{cert.title}</h3>
                    <p className="text-xs font-mono text-on-surface-muted mt-1">{cert.issuer}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {cert.skills?.slice(0, 3).map((s: string, i: number) => (
                      <span key={`${s}-${i}`} className="tag font-mono text-[10px]">{s}</span>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-outline flex items-center justify-between">
                    <span className="text-xs font-mono text-on-surface-muted">{cert.date}</span>
                  </div>
                </motion.div>
              ))
            }
          </motion.div>
        </section>

        {/* ── Events Timeline ───────────────────────────────── */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-secondary/60" />
            <h2 className="section-label">Events & Field Work</h2>
            <span className="ml-auto tag tag-cyan text-[10px]">{sortedEvents.length}</span>
          </div>

          <div className="flex flex-col gap-3">
            {sortedEvents.map((evt: any, idx) => (
              <motion.div
                key={evt.id}
                variants={item}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                onClick={() => { openEventModal(evt); tacticalAudio?.blip(); }}
                className="bento-card cursor-pointer group grid grid-cols-1 sm:grid-cols-12 gap-4 items-center"
              >
                {/* Thumbnail */}
                <div className="sm:col-span-2 h-16 sm:h-full rounded-lg overflow-hidden bg-surface-medium border border-outline shrink-0">
                  {evt.images?.[0] ? (
                    <img
                      src={evt.images[0]}
                      alt=""
                      className="w-full h-full object-cover transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                      <Calendar size={20} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="sm:col-span-7 flex flex-col gap-1">
                  <h3 className="font-display font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{evt.name}</h3>
                  <p className="text-xs text-on-surface-muted line-clamp-1">{evt.description}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs font-mono text-on-surface-muted/60">
                      <MapPin size={10} />{evt.location}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="sm:col-span-3 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                  <span className="tag tag-pink text-[10px]">{evt.type}</span>
                  <span className="text-xs font-mono text-primary">{evt.date}</span>
                </div>
              </motion.div>
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
