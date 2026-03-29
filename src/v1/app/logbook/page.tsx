"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@v1/lib/supabase";
import { fadeUp, stagger, item } from "@v1/lib/animations";
import { tacticalAudio } from "@v1/lib/sounds";
import { Radio, Terminal, Calendar, Activity, ChevronRight, Binary } from "lucide-react";
import { cn } from "@v1/lib/utils";

export default function Logbook() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncDate, setSyncDate] = useState<string>("AWAITING_SYNC...");

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
    const formattedDate = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    setSyncDate(formattedDate);
    tacticalAudio?.comms();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen pt-4 pb-12 px-6 scanlines bg-surface font-mono">
      <div className="container mx-auto max-w-5xl flex flex-col gap-12">

        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline/10 pb-12 gap-1">
          <div className="flex flex-col gap-4">
            <motion.div {...fadeUp(0)} className="flex items-center gap-2">
              <Radio size={14} className="text-primary animate-pulse" />
              <span className="text-xs tracking-[0.3em] font-mono text-primary uppercase">FIELD_REPORT_ARCHIVE</span>
            </motion.div>
            <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-6xl font-bold tracking-tighter leading-none hover:flicker">
              OPERATIONAL_LOGS
            </motion.h1>
          </div>
          <motion.div {...fadeUp(0.2)} className="flex flex-col text-xs font-mono text-on-surface-muted italic">
            <span>UPLINK_STATUS: SECURE</span>
            <span>SYNC_DATE: {syncDate}</span>
          </motion.div>
        </section>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Logs Feed */}
          <section className="lg:col-span-8 flex flex-col gap-8">
            <div className="flex items-center gap-2 px-2 border-l-2 border-primary/60">
              <Activity size={14} className="text-primary" />
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-primary">COMM_TRAFFIC</h2>
            </div>

            {isLoading ? (
               <div className="p-20 border border-outline/10 flex flex-col items-center justify-center gap-4 text-primary opacity-20 italic text-xs">
                  <Terminal className="animate-pulse" />
                  INITIATING_UPLINK...
               </div>
            ) : logs.length === 0 ? (
               <div className="p-20 border border-outline/10 text-center text-on-surface-muted opacity-40 italic text-xs">
                  NO_FIELD_REPORTS_ARCHIVED
               </div>
            ) : (
              <motion.div 
                variants={stagger}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-12"
              >
                {logs.map((log) => (
                  <motion.div 
                    key={log.id} 
                    variants={item}
                    className="group relative flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-surface-high border border-outline/10 flex items-center justify-center shrink-0 relative group-hover:border-primary/40 transition-colors">
                          <Binary size={18} className="text-primary/40 group-hover:text-primary transition-colors" />
                          <div className="absolute top-0 left-0 w-1 h-1 bg-primary" />
                       </div>
                       <div className="flex flex-col">
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-bold text-primary tracking-widest uppercase">{log.sector}</span>
                             <span className="text-[10px] text-on-surface-muted opacity-40">[{new Date(log.created_at).toLocaleDateString()}]</span>
                          </div>
                          <h3 className="text-xl font-black tracking-tight text-on-surface uppercase group-hover:flicker italic">{log.title}</h3>
                       </div>
                    </div>
                    
                    <div className="ml-14 p-6 bg-surface-low border border-outline/10 border-l-4 border-l-primary/40 group-hover:border-l-primary transition-all shadow-xl shadow-black/20">
                       <p className="text-[14px] text-on-surface/90 italic leading-relaxed font-sans normal-case">
                          {log.content}
                       </p>
                    </div>

                    <div className="absolute left-[20px] top-[40px] bottom-[-48px] w-px bg-outline/10 last:hidden" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </section>

          {/* Sidebar Stats */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
             <div className="p-6 bg-surface-high/50 border border-outline/10 flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -translate-y-8 translate-x-8 rotate-45" />
                <h4 className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">OPERATIONAL_METRICS</h4>
                <div className="flex flex-col gap-4">
                   {[
                     { label: 'TOTAL_REPORTS', val: logs.length },
                     { label: 'SECTOR_COVERAGE', val: '100%' },
                     { label: 'DATA_FIDELITY', val: 'MAX' },
                   ].map(stat => (
                     <div key={stat.label} className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-on-surface-muted opacity-40 uppercase tracking-tighter">{stat.label}</span>
                        <span className="text-secondary">{stat.val}</span>
                     </div>
                   ))}
                </div>
                <div className="mt-2 pt-4 border-t border-outline/5">
                   <div className="flex gap-0.5">
                      {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-1 flex-1 bg-primary/20" />)}
                   </div>
                </div>
             </div>

             <div className="p-6 bg-surface-low border border-primary/20 flex flex-col gap-4 group cursor-pointer hover:bg-primary/5 transition-all">
                <h4 className="text-[10px] font-black tracking-widest text-secondary uppercase">UPLINK_ENCRYPTED</h4>
                <p className="text-[11px] leading-tight text-on-surface-muted uppercase">
                   Confidential technical briefings are synchronized via the master operational trunk. Data integrity is enforced.
                </p>
                <div className="flex items-center gap-2 text-primary font-bold text-[10px]">
                   VERIFY_PROTOCOLS <ChevronRight size={10} />
                </div>
             </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
