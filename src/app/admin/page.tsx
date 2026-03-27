"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, 
  MessageSquare, 
  Activity, 
  Trash2, 
  Save, 
  LogOut, 
  RefreshCcw,
  ShieldCheck,
  ChevronRight,
  User,
  Radio,
  Clock,
  Settings,
  Folder,
  Mail,
  Send
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useMetadata } from "@/lib/useMetadata";
import { tacticalAudio } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { TacticalNotification, NotificationType } from "@/components/ui/TacticalNotification";
import { TacticalModal } from "@/components/ui/TacticalModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const { metadata, refresh: refreshMetadata } = useMetadata();
  const [activeTab, setActiveTab] = useState<'MESSAGES' | 'FEEDBACK' | 'METADATA' | 'MISSIONS' | 'LOGBOOK'>('MESSAGES');
  const [isSaving, setIsSaving] = useState(false);

  // Notification State
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "INFO",
    title: "",
    message: "",
  });

  const showNotification = (type: NotificationType, title: string, message: string) => {
    setNotification({ isOpen: true, type, title, message });
  };

  // Admin Modal State
  const [adminModal, setAdminModal] = useState<{
    isOpen: boolean;
    type: 'MESSAGE_DETAIL' | 'LOG_EDIT' | 'REPLY';
    data: any;
  }>({
    isOpen: false,
    type: 'MESSAGE_DETAIL',
    data: null,
  });

  const [replyContent, setReplyContent] = useState("");

  const openAdminModal = (type: typeof adminModal.type, data: any) => {
    setAdminModal({ isOpen: true, type, data });
    if (type === 'REPLY') setReplyContent("");
    tacticalAudio?.click();
  };

  const closeAdminModal = () => {
    setAdminModal(prev => ({ ...prev, isOpen: false }));
    tacticalAudio?.click();
  };
  
  // Metadata Edit State
  const [editMetadata, setEditMetadata] = useState<any>({});

  useEffect(() => {
    const session = localStorage.getItem("admin-session");
    if (session !== "active") {
      router.push("/");
    } else {
      setIsAuthorized(true);
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (metadata) {
      setEditMetadata(metadata);
    }
  }, [metadata]);

  // Form States for Projects
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [newProject, setNewProject] = useState({
    title: "",
    category: "",
    task: "",
    stack: "",
    link: "",
    status: "PROD_STABLE"
  });

  // Form States for Logs
  const [editingLog, setEditingLog] = useState<any | null>(null);
  const [newLog, setNewLog] = useState({
    title: "",
    content: "",
    sector: "WEB"
  });

  const fetchData = async () => {
    if (!supabase) {
      showNotification("ERROR", "SUPABASE_CLIENT_OFFLINE", "ENVIRONMENT_VARIABLES_NOT_DETECTED");
      return;
    }
    try {
      const { data: msgs } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
      const { data: fdbck } = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
      const { data: projs } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      const { data: lgS } = await supabase.from('logs').select('*').order('created_at', { ascending: false });
      
      if (msgs) setMessages(msgs);
      if (fdbck) setFeedback(fdbck);
      if (projs) setProjects(projs);
      if (lgS) setLogs(lgS);
      
      showNotification("INFO", "DATA_STREAM_SYNC", "ALL_OPERATIONAL_DATA_LOGS_RETRIEVED");
    } catch (err) {
      console.error("Error fetching admin data:", err);
      showNotification("ERROR", "SYNC_FAILURE", "UNABLE_TO_RETRIEVE_DATA_FROM_CLOUD");
    }
  };

  const handleUpdateMetadata = async () => {
    setIsSaving(true);
    tacticalAudio?.click();
    try {
      for (const [key, value] of Object.entries(editMetadata)) {
        const { error } = await supabase
          .from('metadata')
          .update({ value })
          .eq('key', key);
        if (error) throw error;
      }
      await refreshMetadata();
      tacticalAudio?.success();
      showNotification("SUCCESS", "OPERATIONAL_SHIFT", "GLOBAL_METADATA_SYNCHRONIZED_SUCCESSFULLY");
    } catch (err) {
      console.error("Error updating metadata:", err);
      tacticalAudio?.error();
      showNotification("ERROR", "SYNC_ERROR", "FAILED_TO_COMMIT_OPERATIONAL_SHIFT");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (table: string, id: string) => {
     if (!confirm(`CONFIRM_PURGE_REQUEST: ${table.toUpperCase()} // ${id}`)) return;
     tacticalAudio?.click();
     try {
       const { error } = await supabase.from(table).delete().eq('id', id);
       if (error) throw error;
       fetchData();
       tacticalAudio?.success();
       showNotification("SUCCESS", "PURGE_COMPLETE", `${table.toUpperCase()}_ENTRY_PERMANENTLY_REMOVED`);
     } catch (err) {
       console.error(`Error deleting from ${table}:`, err);
       tacticalAudio?.error();
       showNotification("ERROR", "PURGE_FAILURE", `FAILED_TO_DELETE_FROM_${table.toUpperCase()}`);
     }
  };

  const handleCreateProject = async () => {
    tacticalAudio?.click();
    try {
      const payload = {
        ...newProject,
        stack: newProject.stack.split(',').map(s => s.trim().toUpperCase())
      };
      const { error } = await supabase.from('projects').insert([payload]);
      if (error) throw error;
      setNewProject({ title: "", category: "", task: "", stack: "", link: "", status: "PROD_STABLE" });
      fetchData();
      tacticalAudio?.success();
      showNotification("SUCCESS", "MISSION_LOGGED", "NEW_PROJECT_DOSSIER_COMMITTED_TO_ARCHIVE");
    } catch (err) {
      console.error("Error creating project:", err);
      tacticalAudio?.error();
      showNotification("ERROR", "INSERT_FAILURE", "UNABLE_TO_COMMIT_NEW_PROJECT_DOSSIER");
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    tacticalAudio?.click();
    try {
      const payload = {
        title: editingProject.title,
        category: editingProject.category,
        task: editingProject.task,
        stack: Array.isArray(editingProject.stack) 
          ? editingProject.stack 
          : editingProject.stack.split(',').map((s: string) => s.trim().toUpperCase()),
        link: editingProject.link,
        status: editingProject.status
      };
      const { error } = await supabase.from('projects').update(payload).eq('id', editingProject.id);
      if (error) throw error;
      setEditingProject(null);
      fetchData();
      tacticalAudio?.success();
      showNotification("SUCCESS", "DOSSIER_SYNC", "PROJECT_ARCHIVE_SUCCESSFULLY_UPDATED");
    } catch (err) {
      console.error("Error updating project:", err);
      tacticalAudio?.error();
      showNotification("ERROR", "UPDATE_FAILURE", "FAILED_TO_SYNCHRONIZE_PROJECT_DATA");
    }
  };

  const handleCreateLog = async () => {
    tacticalAudio?.click();
    try {
      const { error } = await supabase.from('logs').insert([newLog]);
      if (error) throw error;
      setNewLog({ title: "", content: "", sector: "WEB" });
      fetchData();
      tacticalAudio?.success();
      showNotification("SUCCESS", "SIGNAL_TRANSMITTED", "NEW_OPERATIONAL_LOG_COMMITTED_TO_FIELD_REPORTS");
    } catch (err) {
      console.error("Error creating log:", err);
      tacticalAudio?.error();
      showNotification("ERROR", "TRANSMIT_FAILURE", "FAILED_TO_TRANSMIT_NEW_FIELD_REPORT");
    }
  };

  const handleUpdateLog = async () => {
    if (!editingLog) return;
    tacticalAudio?.click();
    try {
      const { error } = await supabase.from('logs').update({
        title: editingLog.title,
        content: editingLog.content,
        sector: editingLog.sector
      }).eq('id', editingLog.id);
      if (error) throw error;
      setEditingLog(null);
      fetchData();
      tacticalAudio?.success();
      showNotification("SUCCESS", "LOG_SYNC", "FIELD_REPORT_ARCHIVE_SUCCESSFULLY_UPDATED");
    } catch (err) {
      console.error("Error updating log:", err);
      tacticalAudio?.error();
      showNotification("ERROR", "SYNC_FAILURE", "FAILED_TO_SYNCHRONIZE_FIELD_REPORT_DATA");
    }
  };

  const handleSendEmailReply = () => {
    if (!adminModal.data) return;
    const { email, subject } = adminModal.data;
    const body = encodeURIComponent(replyContent);
    const mailtoUrl = `mailto:${email}?subject=Re: ${subject}&body=${body}`;
    window.location.href = mailtoUrl;
    showNotification("SUCCESS", "UPLINK_ESTABLISHED", "REDIRECTING_TO_MAIL_CLIENT");
    closeAdminModal();
  };

  const logout = () => {
    localStorage.removeItem("admin-session");
    router.push("/");
  };

  if (isAuthorized === null) return null;

  return (
    <div className="min-h-screen bg-surface p-6 font-mono text-on-surface select-none scanlines overflow-x-hidden">
      {/* HUD Header */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-primary/20 pb-6 relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 border border-primary/40 flex items-center justify-center shrink-0 relative">
            <ShieldCheck size={24} className="text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-secondary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">ADMIN_INTEL_CENTER</h1>
            <div className="flex items-center gap-2 text-[10px] text-primary/60 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 bg-secondary rounded-full" /> SESSION_ACTIVE</span>
              <span>//</span>
              <span>OPERATOR_01_CLEARANCE</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => { fetchData(); tacticalAudio?.blip(); }}
            className="btn-tactical border-primary/20 px-4 py-2 text-[10px] flex items-center gap-2 hover:bg-primary/5"
          >
            <RefreshCcw size={14} /> REFRESH_STREAM
          </button>
          <button 
            onClick={logout}
            className="btn-tactical border-tertiary/40 px-4 py-2 text-[10px] flex items-center gap-2 hover:bg-tertiary/5 text-tertiary"
          >
            <LogOut size={14} /> PURGE_SESSION
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 1. Navigation Sidebar (Mobile: Order 1) */}
        <aside className="lg:col-span-3 flex flex-col gap-4 order-1 lg:order-1">
          {[
            { id: 'MESSAGES', icon: <MessageSquare size={16} />, label: 'COMMS_TRAFFIC', count: messages.length },
            { id: 'FEEDBACK', icon: <Activity size={16} />, label: 'SYSTEM_REPORTS', count: feedback.length },
            { id: 'METADATA', icon: <Settings size={16} />, label: 'GLOBAL_CONFIG', count: 4 },
            { id: 'MISSIONS', icon: <Folder size={16} />, label: 'PROJECT_DOSSIERS', count: projects.length },
            { id: 'LOGBOOK', icon: <Radio size={16} />, label: 'OPERATIONAL_LOGS', count: logs.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); tacticalAudio?.click(); }}
              className={cn(
                "w-full p-4 border flex items-center justify-between transition-all group relative overflow-hidden",
                activeTab === tab.id 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "bg-surface-low border-outline/10 text-on-surface-muted hover:border-primary/40"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                {tab.icon}
                <span className="text-[10px] font-black tracking-[0.2em]">{tab.label}</span>
              </div>
              <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity">[{tab.count}]</span>
              {activeTab === tab.id && (
                <motion.div layoutId="tab-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              )}
            </button>
          ))}
        </aside>

        {/* 2. Operational Preview (Mobile: Order 3, Desktop: Column 1) */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-3 lg:order-3">
          <div className="p-6 bg-surface-high/30 border border-secondary/10 flex flex-col gap-4">
             <h3 className="text-[10px] font-black tracking-widest text-secondary opacity-60 uppercase mb-2">LIVE_PREVIEW</h3>
             <div className="flex flex-col gap-2 border-l-2 border-secondary/20 pl-4">
                <div className="flex flex-col">
                   <span className="text-[8px] text-on-surface-muted opacity-40 uppercase">STATUS</span>
                   <span className="text-xs font-bold text-primary tracking-tighter uppercase">{editMetadata.OPERATOR_STATUS || "..."}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[8px] text-on-surface-muted opacity-40 uppercase">MISSION</span>
                   <span className="text-[11px] font-bold text-on-surface tracking-tighter uppercase italic">{editMetadata.CURRENT_MISSION || "..."}</span>
                </div>
             </div>
          </div>
        </div>

        {/* 3. System Telemetry (Mobile: Order 4, Desktop: Column 1) */}
        <div className="lg:col-span-3 flex flex-col gap-4 order-4 lg:order-4">
          <div className="p-6 bg-surface-medium border border-outline/10 flex flex-col gap-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rotate-45 translate-x-8 -translate-y-8" />
            <h3 className="text-[10px] font-black tracking-widest text-primary opacity-60 uppercase mb-2">SYSTEM_TELEMETRY</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'LATENCY', val: '12ms', status: 'GREEN' },
                { label: 'DB_HEALTH', val: 'NOMINAL', status: 'GREEN' },
                { label: 'UPLINK', val: 'SECURE', status: 'CYAN' },
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center text-[9px] font-bold italic tracking-tighter">
                   <span className="text-on-surface-muted opacity-40">{stat.label}:</span>
                   <span className={stat.status === 'GREEN' ? 'text-secondary' : 'text-primary'}>{stat.val}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between gap-1 items-end">
               <div className="flex gap-0.5">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="w-1 h-3 bg-primary/20 animate-pulse" style={{ animationDelay: `${i*100}ms` }} />)}
               </div>
               <span className="text-[8px] opacity-20 uppercase tracking-tighter">syncing...</span>
            </div>
          </div>
        </div>

        {/* 4. Content Area (Mobile: Order 2, Desktop: Column 2) */}
        <section className="lg:col-span-9 lg:row-start-1 lg:col-start-4 lg:row-span-3 flex flex-col gap-6 order-2 lg:order-2">
          <AnimatePresence mode="wait">
            {activeTab === 'MESSAGES' && (
              <motion.div 
                key="msgs" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4"
              >
                {messages.length === 0 ? (
                  <div className="p-12 border border-outline/10 text-center opacity-40 italic text-xs">
                    NO_TRAFFIC_DETECTED_IN_SECTOR_COMMS
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className="group bg-surface-low border border-outline/10 p-6 flex flex-col gap-4 hover:border-primary/40 transition-all relative">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
                            <User size={14} className="text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-black tracking-tight uppercase truncate max-w-[200px]">{msg.name}</span>
                            <span className="text-[11px] text-on-surface-muted italic">{msg.email}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 px-2">
                          <span className="text-[10px] text-on-surface-muted font-mono opacity-60">[{new Date(msg.created_at).toLocaleString()}]</span>
                          <button 
                            onClick={() => handleDelete('messages', msg.id)}
                            className="p-1.5 text-on-surface-muted hover:text-tertiary transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                        <div className="border-l-2 border-primary/20 pl-4 py-2 flex justify-between items-end gap-4">
                          <div>
                            <span className="text-[11px] font-black tracking-widest text-primary uppercase block mb-1">Subject: {msg.subject}</span>
                            <p className="text-[13px] leading-relaxed text-on-surface/80 line-clamp-2">{msg.content}</p>
                          </div>
                          <button 
                            onClick={() => openAdminModal('MESSAGE_DETAIL', msg)}
                            className="btn-tactical border-primary/40 px-3 py-1 text-[9px] hover:bg-primary/5 whitespace-nowrap"
                          >
                            OPEN_DEEP_INTEL
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </motion.div>
            )}

            {activeTab === 'FEEDBACK' && (
              <motion.div 
                key="fdbk" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {feedback.length === 0 ? (
                   <div className="col-span-2 p-12 border border-outline/10 text-center opacity-40 italic text-xs">
                      NO_FEEDBACK_REPORTS_INDEXED
                   </div>
                ) : (
                  feedback.map((f) => (
                    <div key={f.id} className="bg-surface-low border border-outline/10 p-6 flex flex-col gap-4 relative group">
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                               <div key={i} className={cn("w-3 h-1.5", i <= f.rating ? "bg-secondary" : "bg-outline/10")} />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">RANK_{f.rating}</span>
                        </div>
                        <button 
                          onClick={() => handleDelete('feedback', f.id)}
                          className="text-on-surface-muted hover:text-tertiary opacity-0 group-hover:opacity-100 transition-all px-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="bg-surface-high/50 p-3 text-[13px] italic leading-tight uppercase font-mono tracking-tighter text-on-surface-muted overflow-y-auto max-h-32">
                         {f.content || "NO_DESCRIPTION_PROVIDED_BY_TRANSMITTER"}
                      </div>
                      <div className="mt-2 flex justify-end">
                         <span className="text-[9px] opacity-30 italic">{new Date(f.created_at).toLocaleDateString()} // LOG_ID: {f.id.split('-')[0]}</span>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'METADATA' && (
              <motion.div 
                key="meta" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-surface-low border border-outline/10 p-8 flex flex-col gap-8"
              >
                <div className="flex items-center gap-4 border-l-4 border-secondary pl-6 py-2 bg-secondary/5">
                   <Settings className="text-secondary" />
                   <div>
                      <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">GLOBAL_METADATA_CONTROLS</h3>
                      <p className="text-[11px] text-on-surface-muted uppercase tracking-widest mt-1">Operational parameters affecting public profile synchronization</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                   {Object.keys(metadata).map((key) => (
                      <div key={key} className="flex flex-col gap-2 group">
                        <label className="text-[11px] font-black tracking-widest text-primary uppercase flex items-center gap-2">
                           <ChevronRight size={12} /> {key}
                        </label>
                        <div className="relative">
                           <input 
                              type="text" 
                              value={editMetadata[key] || ""}
                              onChange={(e) => setEditMetadata((prev: any) => ({ ...prev, [key]: e.target.value.toUpperCase() }))}
                              className="w-full bg-surface-high border-l border-outline/20 p-3 text-[13px] font-mono focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-muted/10 uppercase"
                           />
                           <div className="absolute bottom-0 left-0 w-0 h-px bg-primary group-focus-within:w-full transition-all duration-300" />
                        </div>
                      </div>
                   ))}
                </div>

                <div className="mt-8 pt-8 border-t border-outline/10 flex justify-end gap-4">
                    <button 
                      onClick={() => { setEditMetadata(metadata); tacticalAudio?.click(); }}
                      className="px-6 py-2 text-[10px] font-bold text-on-surface-muted hover:text-on-surface transition-colors"
                    >
                       DISCARD_LOCAL_CHANGES
                    </button>
                    <button 
                      onClick={handleUpdateMetadata}
                      disabled={isSaving}
                      className="btn-tactical btn-tactical-primary px-8 py-3 text-xs flex items-center gap-2 group/save"
                    >
                       {isSaving ? (
                         <>
                           <RefreshCcw size={16} className="animate-spin" />
                           SYNCHRONIZING...
                         </>
                       ) : (
                         <>
                           <Save size={16} className="group-hover/save:translate-y-[-2px] transition-transform" />
                           COMMIT_OPERATIONAL_SHIFT
                         </>
                       )}
                    </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'MISSIONS' && (
              <motion.div 
                key="missions" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-8"
              >
                <div className="flex items-center gap-4 border-l-4 border-secondary pl-6 py-2 bg-secondary/5">
                   <Folder className="text-secondary" />
                   <div>
                      <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">PROJECT_DOSSIER_ARCHIVE</h3>
                      <p className="text-[11px] text-on-surface-muted uppercase tracking-widest mt-1">Management of deployed missions and technical case studies</p>
                   </div>
                </div>

                <div className="bg-surface-high/50 p-6 border border-outline/10 flex flex-col gap-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                      <Folder size={80} />
                   </div>
                   <h4 className="text-[11px] font-black tracking-widest text-secondary uppercase">[{editingProject ? 'ELUCIDATE_MISSION' : 'INITIATE_NEW_MISSION'}]</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                         <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">MISSION_TITLE</label>
                         <input 
                            type="text" 
                            placeholder="TITLE // SECTOR"
                            value={editingProject ? editingProject.title : newProject.title}
                            onChange={(e) => editingProject ? setEditingProject({...editingProject, title: e.target.value}) : setNewProject({...newProject, title: e.target.value})}
                            className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-secondary outline-none uppercase transition-all"
                         />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">SECTOR_CATEGORY</label>
                         <input 
                            type="text" 
                            placeholder="E.G. WEB ARCHITECTURE"
                            value={editingProject ? editingProject.category : newProject.category}
                            onChange={(e) => editingProject ? setEditingProject({...editingProject, category: e.target.value}) : setNewProject({...newProject, category: e.target.value})}
                            className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-secondary outline-none uppercase transition-all"
                         />
                      </div>
                   </div>
                   <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">MISSION_DEBRIEF</label>
                      <textarea 
                         placeholder="PROVIDE_DETAILED_MISSION_LOGS..."
                         value={editingProject ? editingProject.task : newProject.task}
                         onChange={(e) => editingProject ? setEditingProject({...editingProject, task: e.target.value}) : setNewProject({...newProject, task: e.target.value})}
                         className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-secondary outline-none uppercase h-24 resize-none transition-all"
                      />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                         <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">TECH_STACK (COMMA_DELIMITED)</label>
                         <input 
                            type="text" 
                            placeholder="REACT, NEXT, TS, SUPABASE..."
                            value={editingProject ? (Array.isArray(editingProject.stack) ? editingProject.stack.join(", ") : editingProject.stack) : newProject.stack}
                            onChange={(e) => editingProject ? setEditingProject({...editingProject, stack: e.target.value}) : setNewProject({...newProject, stack: e.target.value})}
                            className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-secondary outline-none uppercase transition-all"
                         />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">UPLINK_URL</label>
                         <input 
                            type="text" 
                            placeholder="HTTPS://..."
                            value={editingProject ? editingProject.link : newProject.link}
                            onChange={(e) => editingProject ? setEditingProject({...editingProject, link: e.target.value}) : setNewProject({...newProject, link: e.target.value})}
                            className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-secondary outline-none transition-all lowercase"
                         />
                      </div>
                   </div>
                   <div className="flex flex-col sm:flex-row justify-between items-center bg-surface-low p-4 border border-outline/10 gap-4 mt-2">
                      <div className="flex items-center gap-6">
                         <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-on-surface-muted uppercase font-bold tracking-widest">OPERATIONAL_STATUS</label>
                            <select 
                               value={editingProject ? editingProject.status : newProject.status}
                               onChange={(e) => editingProject ? setEditingProject({...editingProject, status: e.target.value}) : setNewProject({...newProject, status: e.target.value})}
                               className="bg-black text-[10px] font-mono text-emerald-400 border border-emerald-400/20 p-2 uppercase outline-none"
                            >
                               <option value="PROD_STABLE">PROD_STABLE</option>
                               <option value="LIVE_STABLE">LIVE_STABLE</option>
                               <option value="ACTIVE_PROD">ACTIVE_PROD</option>
                               <option value="ARCHIVED">ARCHIVED</option>
                               <option value="UNDER_CONSTRUCTION">UNDER_CONSTRUCTION</option>
                            </select>
                         </div>
                      </div>
                      <div className="flex gap-3">
                         {editingProject && (
                           <button 
                             onClick={() => { setEditingProject(null); tacticalAudio?.click(); }}
                             className="px-6 py-2 border border-outline/20 text-[10px] font-black tracking-widest uppercase hover:bg-surface-medium transition-colors"
                           >
                             ABORT_EDIT
                           </button>
                         )}
                         <button 
                            onClick={editingProject ? handleUpdateProject : handleCreateProject}
                            className="btn-tactical btn-tactical-primary px-8 py-2 text-[10px] font-black tracking-[0.2em] uppercase"
                         >
                            {editingProject ? 'SYNCHRONIZE_DATA' : 'COMMIT_NEW_DOSSIER'}
                         </button>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between px-2 mb-2">
                      <h4 className="text-[10px] font-black tracking-[0.3em] text-on-surface-muted/60 uppercase">ACTIVE_DOSSIER_READOUT</h4>
                      <span className="text-[9px] font-mono text-primary/40 uppercase">COUNT: {projects.length}</span>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projects.map((p) => (
                         <div key={p.id} className="bg-surface-low border border-outline/10 p-5 transition-all hover:border-secondary group relative">
                            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-secondary/20 group-hover:border-secondary transition-colors" />
                            <div className="flex justify-between items-start mb-4">
                               <div className="flex flex-col gap-1">
                                  <h3 className="text-sm font-black tracking-tight uppercase italic text-on-surface group-hover:text-secondary transition-colors">{p.title}</h3>
                                  <div className="flex items-center gap-2">
                                     <div className="w-1 h-1 rounded-full bg-secondary opacity-40" />
                                     <span className="text-[9px] text-secondary/80 tracking-[0.2em] uppercase font-bold">{p.category}</span>
                                  </div>
                               </div>
                               <div className="flex gap-1">
                                  <button 
                                     onClick={() => { setEditingProject(p); tacticalAudio?.click(); }}
                                     className="p-2 text-on-surface-muted hover:text-secondary opacity-0 group-hover:opacity-100 transition-all"
                                     title="EDIT_DOSSIER"
                                  >
                                     <ChevronRight size={14} />
                                  </button>
                                  <button 
                                     onClick={() => handleDelete('projects', p.id)}
                                     className="p-2 text-on-surface-muted hover:text-tertiary opacity-0 group-hover:opacity-100 transition-all italic"
                                     title="DELETE_ARCHIVE"
                                  >
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                            </div>
                            <p className="text-[11px] text-on-surface-muted leading-relaxed line-clamp-2 mb-4 normal-case font-sans border-l border-outline/10 pl-3 italic">{p.task}</p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                               {p.stack.map((s: string) => (
                                  <span key={s} className="text-[8px] font-mono border border-outline/10 bg-surface-high px-1.5 py-0.5 text-on-surface-muted uppercase">{s}</span>
                               ))}
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-outline/5">
                               <span className="text-[9px] text-emerald-400 font-mono tracking-widest border border-emerald-400/20 px-2 py-0.5 rounded-full">{p.status}</span>
                               <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-primary hover:text-secondary transition-colors flex items-center gap-1">
                                  VERIFY_UPLINK <ChevronRight size={10} />
                                </a>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'LOGBOOK' && (
              <motion.div 
                key="logbook" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-8"
              >
                <div className="flex items-center gap-4 border-l-4 border-primary pl-6 py-2 bg-primary/5">
                   <Radio className="text-primary" />
                   <div>
                      <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">OPERATIONAL_LOGBOOK_ARCHIVE</h3>
                      <p className="text-[11px] text-on-surface-muted uppercase tracking-widest mt-1">Technical field reports and technical activity logs</p>
                   </div>
                </div>

                    <div className="flex justify-between items-center bg-surface-low p-4 border border-outline/10 gap-4 mt-2">
                       <button 
                          onClick={() => openAdminModal('LOG_EDIT', null)}
                          className="btn-tactical btn-tactical-primary w-full py-4 text-[10px] font-black tracking-[0.3em] uppercase flex items-center justify-center gap-3"
                       >
                          <Radio size={16} /> INITIATE_NEW_DEPLOYMENT_LOG
                       </button>
                    </div>

                <div className="flex flex-col gap-4">
                   <div className="flex items-center justify-between px-2 mb-2">
                      <h4 className="text-[10px] font-black tracking-[0.3em] text-on-surface-muted/60 uppercase">OPERATIONAL_DATA_LOGS</h4>
                      <span className="text-[9px] font-mono text-primary/40 uppercase">COUNT: {logs.length}</span>
                   </div>
                   <div className="flex flex-col gap-px bg-outline/5 border border-outline/10">
                      {logs.map((l) => (
                         <div key={l.id} className="bg-surface-low p-5 transition-all hover:bg-surface-medium group flex flex-col md:flex-row justify-between items-start gap-6 border-b border-outline/5 last:border-b-0">
                            <div className="flex-1 flex flex-col gap-2">
                               <div className="flex items-center gap-3">
                                  <span className="text-[8px] font-mono border border-primary/20 bg-primary/5 px-2 py-0.5 text-primary uppercase fon-bold">{l.sector}</span>
                                  <h3 className="text-xs font-black tracking-widest uppercase italic text-on-surface">{l.title}</h3>
                                  <span className="text-[9px] text-on-surface-muted font-mono opacity-40">[{new Date(l.created_at).toLocaleDateString()}]</span>
                               </div>
                               <p className="text-[12px] text-on-surface-muted leading-relaxed italic normal-case font-sans border-l border-primary/10 pl-4">{l.content}</p>
                            </div>
                             <div className="flex gap-2">
                                <button 
                                   onClick={() => { setEditingLog(l); openAdminModal('LOG_EDIT', l); }}
                                   className="p-2 text-on-surface-muted hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                                >
                                   <ChevronRight size={14} />
                                </button>
                               <button 
                                  onClick={() => handleDelete('logs', l.id)}
                                  className="p-2 text-on-surface-muted hover:text-tertiary transition-all opacity-0 group-hover:opacity-100"
                               >
                                  <Trash2 size={14} />
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Background HUD Decor */}
      <div className="fixed bottom-4 left-4 pointer-events-none opacity-10">
         <Radio size={100} className="text-primary animate-pulse" />
      </div>
      <div className="fixed top-1/2 right-4 -translate-y-1/2 pointer-events-none opacity-5 vertical-text text-[80px] font-black">
         OVERRIDE_MODE_ACTIVE
      </div>

      {/* Tactical Notifications */}
      <TacticalNotification 
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />

      <TacticalModal
        isOpen={adminModal.isOpen}
        onClose={closeAdminModal}
        title={
          adminModal.type === 'MESSAGE_DETAIL' ? 'DEEP_INTEL_READOUT' :
          adminModal.type === 'LOG_EDIT' ? (adminModal.data ? 'REVISE_REPORT' : 'COMMIT_NEW_REPORT') :
          'UPLINK_COMPOSITION'
        }
        subtitle={
          adminModal.type === 'MESSAGE_DETAIL' ? `COMMS_ID: ${adminModal.data?.id.split('-')[0]}` :
          adminModal.type === 'LOG_EDIT' ? 'FIELD_OPERATIONAL_DATA' :
          `RESPONDING_TO: ${adminModal.data?.name}`
        }
      >
        <div className="font-mono uppercase text-xs">
          {adminModal.type === 'MESSAGE_DETAIL' && adminModal.data && (
            <div className="flex flex-col gap-6">
               <div className="bg-primary/5 p-4 border-l-2 border-primary">
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-[10px] text-on-surface-muted">TRANSMITTER_ID</span>
                     <span className="font-bold text-primary">{adminModal.data.name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                     <span className="text-[10px] text-on-surface-muted">COORDS_EMAIL</span>
                     <span className="font-bold text-on-surface">{adminModal.data.email}</span>
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black tracking-widest text-primary/60">REDACTED_SUBJECT</span>
                  <p className="text-sm font-bold italic border border-outline/10 p-4 bg-surface-high">{adminModal.data.subject}</p>
               </div>
               <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black tracking-widest text-primary/60">TRANSMISSION_CONTENT</span>
                  <p className="text-sm leading-relaxed normal-case font-sans bg-surface-low border border-outline/5 p-6 min-h-[150px]">
                    {adminModal.data.content}
                  </p>
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={() => openAdminModal('REPLY', adminModal.data)}
                    className="btn-tactical btn-tactical-primary flex-1 py-4 flex items-center justify-center gap-3"
                  >
                     <Send size={16} /> INITIATE_REPLY_UPLINK
                  </button>
               </div>
            </div>
          )}

          {adminModal.type === 'LOG_EDIT' && (
            <div className="flex flex-col gap-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">LOG_TITLE</label>
                      <input 
                        type="text" 
                        placeholder="ACTION // SECTOR"
                        value={adminModal.data ? editingLog?.title : newLog.title}
                        onChange={(e) => adminModal.data ? setEditingLog({...editingLog, title: e.target.value}) : setNewLog({...newLog, title: e.target.value})}
                        className="w-full bg-surface-low border border-outline/10 p-3 text-sm font-mono focus:border-primary outline-none uppercase transition-all"
                      />
                  </div>
                  <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">SECTOR_CLASSIFICATION</label>
                      <select 
                        value={adminModal.data ? editingLog?.sector : newLog.sector}
                        onChange={(e) => adminModal.data ? setEditingLog({...editingLog, sector: e.target.value}) : setNewLog({...newLog, sector: e.target.value})}
                        className="bg-black text-[12px] font-mono text-primary border border-primary/20 p-3 uppercase outline-none"
                      >
                        <option value="WEB">WEB</option>
                        <option value="MOBILE">MOBILE</option>
                        <option value="AI">AI</option>
                        <option value="SYSTEM">SYSTEM</option>
                        <option value="INFRA">INFRA</option>
                      </select>
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">LOG_CONTENT</label>
                  <textarea 
                      placeholder="PROVIDE_TECHNICAL_DEBRIEFING..."
                      value={adminModal.data ? editingLog?.content : newLog.content}
                      onChange={(e) => adminModal.data ? setEditingLog({...editingLog, content: e.target.value}) : setNewLog({...newLog, content: e.target.value})}
                      className="w-full bg-surface-low border border-outline/10 p-4 text-sm font-mono focus:border-primary outline-none uppercase h-48 resize-none transition-all"
                  />
               </div>
               <div className="flex justify-end gap-4">
                  <button 
                    onClick={closeAdminModal}
                    className="px-8 py-4 border border-outline/20 text-[10px] hover:bg-surface-high"
                  >
                    ABORT_TASK
                  </button>
                  <button 
                    onClick={() => {
                       if (adminModal.data) handleUpdateLog();
                       else handleCreateLog();
                       closeAdminModal();
                    }}
                    className="btn-tactical btn-tactical-primary px-12 py-4"
                  >
                     {adminModal.data ? 'SYNC_LOG_ARCHIVE' : 'TRANSMIT_REPORT'}
                  </button>
               </div>
            </div>
          )}

          {adminModal.type === 'REPLY' && adminModal.data && (
            <div className="flex flex-col gap-6">
               <div className="bg-surface-high border border-outline/10 p-4 flex flex-col gap-1">
                  <span className="text-[10px] text-primary">DESTINATION: {adminModal.data.email}</span>
                  <span className="text-[10px] text-on-surface-muted">SUBJECT: RE: {adminModal.data.subject}</span>
               </div>
               <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">REPLY_TRANSMISSION</label>
                  <textarea 
                      autoFocus
                      placeholder="IDENTIFY_REPLY_PARAMETERS..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="w-full bg-surface-low border border-outline/10 p-6 text-sm font-mono focus:border-secondary outline-none h-64 resize-none transition-all normal-case"
                  />
               </div>
               <div className="flex gap-4">
                  <button 
                    onClick={() => openAdminModal('MESSAGE_DETAIL', adminModal.data)}
                    className="px-8 py-4 border border-outline/20 text-[10px] hover:bg-surface-high"
                  >
                    RETURN_TO_INTEL
                  </button>
                  <button 
                    onClick={handleSendEmailReply}
                    className="btn-tactical btn-tactical-primary flex-1 py-4 flex items-center justify-center gap-3"
                  >
                     <Mail size={16} /> BROADCAST_REPLY_VIA_SMTP
                  </button>
               </div>
            </div>
          )}
        </div>
      </TacticalModal>
    </div>
  );
}
