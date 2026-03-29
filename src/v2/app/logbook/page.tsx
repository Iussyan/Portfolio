"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@v2/lib/supabase";
import { fadeUp, stagger, item } from "@v2/lib/animations";
import { tacticalAudio } from "@v2/lib/sounds";
import { Radio, Terminal, Calendar, Activity, ChevronRight, Binary } from "lucide-react";
import { cn } from "@v2/lib/utils";

export default function Logbook() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncDate, setSyncDate] = useState<string>("Updating...");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setLogs(data);
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('public:logs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, () => {
        fetchLogs();
      })
      .subscribe();

    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setSyncDate(formattedDate);
    tacticalAudio?.comms();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6 bg-void text-on-surface">
      <div className="max-w-6xl mx-auto flex flex-col gap-12">

        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline pb-12 gap-8">
          <div className="flex flex-col gap-3">
            <motion.div {...fadeUp(0)} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="section-label text-primary/60">03 — Activity Log</span>
            </motion.div>
            <motion.h1
              {...fadeUp(0.05)}
              className="font-display text-5xl sm:text-6xl font-extrabold tracking-normal leading-tight"
            >
              Development<br />
              <span className="text-primary">milestones.</span>
            </motion.h1>
          </div>
          <motion.div
            {...fadeUp(0.1)}
            className="flex flex-col text-xs font-mono text-on-surface-muted italic text-right"
          >
            <span>Network Status: Encrypted</span>
            <span>Last Indexed: {syncDate}</span>
          </motion.div>
        </section>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Logs Feed */}
          <section className="lg:col-span-8 flex flex-col gap-10">
            <div className="flex items-center gap-3">
              <Activity size={16} className="text-secondary/60" />
              <span className="section-label">Journal Entries</span>
            </div>

            {isLoading ? (
              <div className="p-20 border border-outline/10 bg-surface-low rounded-2xl flex flex-col items-center justify-center gap-4 text-primary/40 italic text-sm">
                <Terminal className="animate-pulse" size={32} />
                Synchronizing logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-20 border border-outline bg-surface-low rounded-2xl text-center text-on-surface-muted italic text-sm">
                No public records found in this sector.
              </div>
            ) : (
              <motion.div
                variants={stagger}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-8"
              >
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    variants={item}
                    className="group flex flex-col gap-4 relative"
                  >
                    {/* Log Card */}
                    <div className="glow-card p-6 sm:p-8 flex flex-col gap-6 bg-surface transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors">
                            <Binary size={22} className="text-primary/60 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="tag text-[9px] uppercase tracking-widest">{log.sector}</span>
                              <span className="text-[10px] font-mono text-on-surface-muted opacity-60">
                                {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            <h3 className="font-display font-bold text-xl text-on-surface group-hover:text-primary transition-colors leading-tight">
                              {log.title}
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-surface-low rounded-xl border-l-2 border-primary/20 group-hover:border-primary/50 transition-all">
                        <p className="text-base text-on-surface-muted leading-relaxed font-sans">
                          {log.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-4 border-t border-outline/50">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                          <span className="text-[10px] font-mono text-on-surface-muted uppercase tracking-widest">Entry Verified</span>
                        </div>
                        <span className="text-[10px] font-mono text-on-surface-muted/30">ID: {log.id?.slice(0, 8)}</span>
                      </div>
                    </div>

                    {/* Timeline Connector */}
                    <div className="absolute -left-6 top-0 -bottom-8 w-px bg-linear-to-b from-primary/30 to-transparent hidden xl:block" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* Sidebar Stats */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            <div className="bento-card bg-surface-medium flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-12 translate-x-12 rotate-45" />
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="section-label text-secondary">Activity Metrics</span>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { label: 'Archived Logs', val: logs.length },
                  { label: 'Sync Fidelity', val: '100%' },
                  { label: 'Network', val: 'Glacier-Secure' },
                ].map(stat => (
                  <div key={stat.label} className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-muted font-mono">{stat.label}</span>
                    <span className="text-on-surface font-bold">{stat.val}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 pt-4 border-t border-outline/10">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-1 flex-1 bg-primary/20 rounded-full" />)}
                  <div className="h-1 flex-1 bg-emerald-500 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
