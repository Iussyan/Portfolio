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
  Send,
  Award,
  Milestone,
  Plus,
  Eye,
  Edit3,
  MapPin,
  Cpu,
  Zap,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@v1/lib/supabase";
import { useMetadata } from "@v1/lib/useMetadata";
import { tacticalAudio } from "@v1/lib/sounds";
import { cn } from "@v1/lib/utils";
import { TacticalNotification, NotificationType } from "@v1/components/ui/TacticalNotification";
import { TacticalModal } from "@v1/components/ui/TacticalModal";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [expeditions, setExpeditions] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const { metadata, refresh: refreshMetadata } = useMetadata();
  const [activeTab, setActiveTab] = useState<'MESSAGES' | 'FEEDBACK' | 'METADATA' | 'MISSIONS' | 'LOGBOOK' | 'EXPEDITIONS'>('MESSAGES');
  const [isSaving, setIsSaving] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<any[]>([]);

  const showNotification = (type: NotificationType, title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, type, title, message }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Admin Modal State
  const [adminModal, setAdminModal] = useState<{
    isOpen: boolean;
    type: 'MESSAGE_DETAIL' | 'LOG_EDIT' | 'REPLY' | 'PROJECT_PREVIEW' | 'PROJECT_EDIT' | 'EXPEDITION_EDIT' | 'CERTIFICATE_EDIT';
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
    status: "PROD_STABLE",
    challenge: "",
    solution: "",
    results: "",
    image_url: ""
  });

  // Form States for Logs
  const [editingLog, setEditingLog] = useState<any | null>(null);
  const [newLog, setNewLog] = useState({
    title: "",
    content: "",
    sector: "WEB"
  });

  // Form States for Expeditions
  const [editingExpedition, setEditingExpedition] = useState<any | null>(null);
  const [newExpedition, setNewExpedition] = useState({
    name: "",
    type: "WORKSHOP",
    date: "",
    location: "",
    description: "",
    images: [] as string[]
  });

  // Form States for Certificates
  const [editingCertificate, setEditingCertificate] = useState<any | null>(null);
  const [newCertificate, setNewCertificate] = useState({
    title: "",
    issuer: "",
    date: "",
    skills: [] as string[],
    credential_id: "",
    type: "VERIFIED",
    verify_link: "",
    image_url: ""
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
      const { data: expS } = await supabase.from('expeditions').select('*').order('created_at', { ascending: false });
      const { data: certs } = await supabase.from('certificates').select('*').order('created_at', { ascending: false });
      
      if (msgs) setMessages(msgs);
      if (fdbck) setFeedback(fdbck);
      if (projs) setProjects(projs);
      if (lgS) setLogs(lgS);
      if (expS) setExpeditions(expS);
      if (certs) setCertificates(certs);
      
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

  // Expedition Handlers
  const handleCreateExpedition = async () => {
    setIsSaving(true);
    tacticalAudio?.click();
    try {
      const { error } = await supabase.from('expeditions').insert([newExpedition]);
      if (error) throw error;
      showNotification("SUCCESS", "EXPEDITION_ARCHIVED", `NEW_MISSION: ${newExpedition.name}`);
      setNewExpedition({ name: "", type: "WORKSHOP", date: "", location: "", description: "", images: [] });
      fetchData();
    } catch (err) {
      showNotification("ERROR", "ARCHIVE_FAILURE", "UNABLE_TO_COMMIT_EXPEDITION_DATA");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateExpedition = async () => {
    if (!editingExpedition) return;
    setIsSaving(true);
    tacticalAudio?.click();
    try {
      const { error } = await supabase.from('expeditions').update(editingExpedition).eq('id', editingExpedition.id);
      if (error) throw error;
      showNotification("SUCCESS", "EXPEDITION_SYNC", `UPDATED_MISSION: ${editingExpedition.name}`);
      setEditingExpedition(null);
      fetchData();
    } catch (err) {
      showNotification("ERROR", "SYNC_FAILURE", "UNABLE_TO_SYNCHRONIZE_EXPEDITION");
    } finally {
      setIsSaving(false);
    }
  };

  // Certificate Handlers
  const handleCreateCertificate = async () => {
    setIsSaving(true);
    tacticalAudio?.click();
    try {
      const { error } = await supabase.from('certificates').insert([newCertificate]);
      if (error) throw error;
      showNotification("SUCCESS", "CREDENTIAL_INDEXED", `NEW_CERT: ${newCertificate.title}`);
      setNewCertificate({ title: "", issuer: "", date: "", skills: [], credential_id: "", type: "VERIFIED", verify_link: "", image_url: "" });
      fetchData();
    } catch (err) {
      showNotification("ERROR", "INDEX_FAILURE", "UNABLE_TO_VERIFY_CREDENTIAL_DATA");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCertificate = async () => {
    if (!editingCertificate) return;
    setIsSaving(true);
    tacticalAudio?.click();
    try {
      const { error } = await supabase.from('certificates').update(editingCertificate).eq('id', editingCertificate.id);
      if (error) throw error;
      showNotification("SUCCESS", "CREDENTIAL_SYNC", `UPDATED_CERT: ${editingCertificate.title}`);
      setEditingCertificate(null);
      fetchData();
    } catch (err) {
      showNotification("ERROR", "SYNC_FAILURE", "UNABLE_TO_SYNCHRONIZE_CREDENTIAL");
    } finally {
      setIsSaving(false);
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
      setNewProject({ title: "", category: "", task: "", stack: "", link: "", status: "PROD_STABLE", challenge: "", solution: "", results: "", image_url: "" });
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
        status: editingProject.status,
        challenge: editingProject.challenge,
        solution: editingProject.solution,
        results: editingProject.results,
        image_url: editingProject.image_url
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    tacticalAudio?.click();
    showNotification("INFO", "UPLOAD_INITIATED", `PREPARING_${files.length}_ASSET_STREAMS_FOR_STORAGE...`);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const type = adminModal.type;
        const folder = type === 'PROJECT_EDIT' ? 'project-images' : 
                       type === 'CERTIFICATE_EDIT' ? 'certificates' : 'expeditions';
        const filePath = `${folder}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('projects')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('projects')
          .getPublicUrl(filePath);
        
        return publicUrl;
      });

      const publicUrls = await Promise.all(uploadPromises);
      const type = adminModal.type;

      if (isEditing) {
        if (type === 'PROJECT_EDIT') setEditingProject({ ...editingProject, image_url: publicUrls[0] });
        if (type === 'CERTIFICATE_EDIT') setEditingCertificate({ ...editingCertificate, image_url: publicUrls[0] });
        if (type === 'EXPEDITION_EDIT') {
          setEditingExpedition({ 
            ...editingExpedition, 
            images: [...(editingExpedition.images || []), ...publicUrls] 
          });
        }
      } else {
        if (type === 'PROJECT_EDIT') setNewProject({ ...newProject, image_url: publicUrls[0] });
        if (type === 'CERTIFICATE_EDIT') setNewCertificate({ ...newCertificate, image_url: publicUrls[0] });
        if (type === 'EXPEDITION_EDIT') {
          setNewExpedition({ 
            ...newExpedition, 
            images: [...(newExpedition.images || []), ...publicUrls] 
          });
        }
      }

      showNotification("SUCCESS", "UPLOAD_COMPLETE", `${files.length}_ASSETS_PUBLISHED_TO_SECURE_UPLINK`);
      tacticalAudio?.success();
    } catch (err: any) {
      console.error("Error uploading image:", err);
      showNotification("ERROR", "UPLOAD_FAILURE", err.message || "FAILED_TO_TRANSMIT_ASSET");
      tacticalAudio?.error();
    }
  };

  const handleSendEmailReply = () => {
    if (!adminModal.data) return;
    const { email, subject } = adminModal.data;
    const body = encodeURIComponent(replyContent);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=RE: ${encodeURIComponent(subject)}&body=${body}`;
    window.open(gmailUrl, '_blank');
    showNotification("SUCCESS", "UPLINK_ESTABLISHED", "REDIRECTING_TO_GMAIL_COMPOSE_INTERFACE");
    closeAdminModal();
  };

  const logout = () => {
    localStorage.removeItem("admin-session");
    router.push("/");
  };

  const latestActivity = [
    ...messages.map(m => ({ id: m.id, title: m.subject, date: m.created_at, type: 'COMM', icon: <MessageSquare size={12} /> })),
    ...logs.map(l => ({ id: l.id, title: l.title, date: l.created_at, type: 'DEBRIEF', icon: <Radio size={12} /> })),
    ...feedback.map(f => ({ id: f.id, title: 'SYSTEM_REPORT', date: f.created_at, type: 'FEEDBACK', icon: <Activity size={12} /> }))
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0, 5);

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
        
        {/* 1. Navigation Sidebar (Left: col-span-2) */}
        <aside className="lg:col-span-2 h-[calc(100dvh-140px)] overflow-y-auto pr-2 scrollbar-tactical flex flex-col gap-6 order-1">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black tracking-widest text-primary/40 uppercase px-2 mb-2">SECTOR_NAVIGATION</span>
            {[
              { id: 'MESSAGES', icon: <MessageSquare size={16} />, label: 'COMMS', count: messages.length },
              { id: 'FEEDBACK', icon: <Activity size={16} />, label: 'REPORTS', count: feedback.length },
              { id: 'METADATA', icon: <Settings size={16} />, label: 'CONFIG', count: 4 },
              { id: 'MISSIONS', icon: <Folder size={16} />, label: 'DOSSIERS', count: projects.length },
              { id: 'EXPEDITIONS', icon: <Award size={16} />, label: 'EXPEDITIONS', count: expeditions.length + certificates.length },
              { id: 'LOGBOOK', icon: <Radio size={16} />, label: 'LOGBOOK', count: logs.length }
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
                  <span className="text-[9px] font-black tracking-widest">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-surface-high/30 border border-outline/5 flex flex-col gap-3">
             <div className="flex justify-between items-center">
                <span className="text-[8px] font-bold text-on-surface-muted opacity-40 uppercase">STATUS</span>
                <div className="flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-secondary animate-pulse" style={{ animationDelay: `${i*200}ms` }} />)}
                </div>
             </div>
             <span className="text-[10px] font-black text-primary truncate uppercase">{editMetadata.OPERATOR_STATUS || "NOMINAL"}</span>
          </div>
        </aside>

        {/* 2. Content Area (Middle: col-span-7) */}
        <section className="lg:col-span-7 h-[calc(100dvh-140px)] overflow-y-auto pr-2 scrollbar-tactical order-2">
          <AnimatePresence mode="wait">
            {activeTab === 'MESSAGES' && (
              <motion.div 
                key="msgs" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-low p-6 border border-outline/10">
                   <div className="flex items-center gap-4">
                      <MessageSquare className="text-primary" size={24} />
                      <div>
                         <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">INTELLIGENCE_COMMUNICATIONS</h3>
                         <p className="text-[10px] text-on-surface-muted uppercase tracking-widest mt-1">Inbound transmissions from field contacts</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[9px] font-mono text-primary/40 uppercase">ACTIVE_TRAFFIC: {messages.length}</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   {messages.length === 0 ? (
                      <div className="p-12 border border-outline/10 text-center opacity-40 italic text-xs uppercase text-on-surface-muted">
                         NO_TRAFFIC_DETECTED_IN_SECTOR_COMMS
                      </div>
                   ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className="group bg-surface-low border border-outline/10 p-6 flex flex-col gap-4 hover:border-primary/40 transition-all relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -rotate-45 translate-x-16 -translate-y-16 pointer-events-none" />
                           <div className="flex justify-between items-start relative z-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                                    <User size={18} className="text-primary" />
                                 </div>
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black tracking-tight uppercase italic text-on-surface">{msg.name}</span>
                                    <span className="text-[10px] text-on-surface-muted font-mono">{msg.email}</span>
                                 </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                 <span className="text-[9px] text-on-surface-muted font-mono opacity-60">[{new Date(msg.created_at).toLocaleString()}]</span>
                                 <button 
                                   onClick={() => handleDelete('messages', msg.id)}
                                   className="p-1.5 text-on-surface-muted hover:text-tertiary transition-colors opacity-0 group-hover:opacity-100"
                                 >
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                           
                           <div className="bg-surface-high/50 p-4 border-l-2 border-primary/20 relative z-10">
                              <h4 className="text-[11px] font-black tracking-widest text-primary uppercase mb-2">SUBJECT: {msg.subject}</h4>
                              <p className="text-[13px] leading-relaxed text-on-surface/80 line-clamp-2 font-sans normal-case italic">{msg.content}</p>
                           </div>

                           <div className="flex justify-end relative z-10">
                              <button 
                                onClick={() => openAdminModal('MESSAGE_DETAIL', msg)}
                                className="btn-tactical border-primary text-primary hover:bg-primary/5 px-6 py-2 text-[10px] font-black uppercase tracking-widest"
                              >
                                OPEN_DEEP_INTEL
                              </button>
                           </div>
                        </div>
                      ))
                   )}
                </div>
              </motion.div>
            )}

            {activeTab === 'FEEDBACK' && (
              <motion.div 
                key="fdbk" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-low p-6 border border-outline/10">
                   <div className="flex items-center gap-4">
                      <Activity className="text-secondary" size={24} />
                      <div>
                         <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">OPERATOR_FEEDBACK_REPORTS</h3>
                         <p className="text-[10px] text-on-surface-muted uppercase tracking-widest mt-1">Direct feedback from tactical interface users</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[9px] font-mono text-secondary/40 uppercase">REPORTS_INDEXED: {feedback.length}</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {feedback.length === 0 ? (
                      <div className="col-span-full p-12 border border-outline/10 text-center opacity-40 italic text-xs uppercase text-on-surface-muted">
                         NO_FEEDBACK_REPORTS_INDEXED
                      </div>
                   ) : (
                      feedback.map((f) => (
                        <div key={f.id} className="group bg-surface-low border border-outline/10 p-6 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-secondary/40">
                           <div className="flex justify-between items-center relative z-10">
                              <div className="flex items-center gap-3">
                                 <div className="flex gap-1">
                                    {[1,2,3,4,5].map(i => (
                                       <div key={i} className={cn("w-2 h-4", i <= f.rating ? "bg-secondary" : "bg-outline/10")} />
                                    ))}
                                 </div>
                                 <span className="text-[10px] font-black text-secondary uppercase tracking-widest italic">RANK_{f.rating}_CERTIFIED</span>
                              </div>
                              <button 
                                onClick={() => handleDelete('feedback', f.id)}
                                className="p-1.5 text-on-surface-muted hover:text-tertiary transition-colors opacity-0 group-hover:opacity-100"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                           
                           <div className="bg-surface-high/50 p-4 border-l border-secondary/20 relative z-10">
                              <p className="text-[13px] leading-relaxed text-on-surface-muted italic font-mono uppercase tracking-tighter">
                                 {f.content || "NO_DESCRIPTION_PROVIDED_BY_TRANSMITTER"}
                              </p>
                           </div>

                           <div className="flex justify-between items-center mt-2 relative z-10">
                              <span className="text-[9px] text-on-surface-muted/30 font-mono italic">[{new Date(f.created_at).toLocaleDateString()} // ID: {f.id.split('-')[0]}]</span>
                              <div className="flex gap-1">
                                 <div className="w-1.5 h-1.5 rounded-full bg-secondary/20 animate-pulse" />
                                 <div className="w-1.5 h-1.5 rounded-full bg-secondary/40 animate-pulse delay-75" />
                                 <div className="w-1.5 h-1.5 rounded-full bg-secondary/60 animate-pulse delay-150" />
                              </div>
                           </div>
                        </div>
                      ))
                   )}
                </div>
              </motion.div>
            )}

            {activeTab === 'METADATA' && (
              <motion.div 
                key="meta" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-low p-6 border border-outline/10">
                   <div className="flex items-center gap-4">
                      <Settings className="text-secondary" size={24} />
                      <div>
                         <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">GLOBAL_CONFIG_PARAMETERS</h3>
                         <p className="text-[10px] text-on-surface-muted uppercase tracking-widest mt-1">Operational variables for profile synchronization</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <span className="text-[9px] font-mono text-secondary/40 uppercase">PARAMETERS_LOCKED: {Object.keys(metadata).length}</span>
                   </div>
                </div>

                <div className="bg-surface-low border border-outline/10 p-8 flex flex-col gap-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rotate-12 translate-x-32 -translate-y-32 pointer-events-none" />
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      {Object.keys(metadata).map((key) => (
                         <div key={key} className="flex flex-col gap-2 group">
                           <label className="text-[10px] font-black tracking-widest text-primary uppercase flex items-center gap-2">
                              <ChevronRight size={12} className="group-focus-within:translate-x-1 transition-transform" /> {key}
                           </label>
                           <div className="relative">
                              <input 
                                 type="text" 
                                 value={editMetadata[key] || ""}
                                 onChange={(e) => setEditMetadata((prev: any) => ({ ...prev, [key]: e.target.value.toUpperCase() }))}
                                 className="w-full bg-surface-high border border-outline/10 p-4 text-[13px] font-mono focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-muted/10 uppercase"
                              />
                              <div className="absolute inset-y-0 left-0 w-1 bg-primary scale-y-0 group-focus-within:scale-y-100 transition-transform origin-top" />
                           </div>
                         </div>
                      ))}
                   </div>

                   <div className="mt-8 pt-8 border-t border-outline/10 flex justify-end gap-4 relative z-10">
                       <button 
                         onClick={() => { setEditMetadata(metadata); tacticalAudio?.click(); }}
                         className="px-6 py-2 text-[10px] font-black text-on-surface-muted hover:text-on-surface transition-colors uppercase tracking-widest"
                       >
                          DISCARD_CHANGES
                       </button>
                       <button 
                         onClick={handleUpdateMetadata}
                         disabled={isSaving}
                         className="btn-tactical btn-tactical-primary px-10 py-4 text-[10px] font-black tracking-widest flex items-center gap-3 group/save"
                       >
                          {isSaving ? (
                            <>
                              <RefreshCcw size={16} className="animate-spin" />
                              SYNCHRONIZING...
                            </>
                          ) : (
                            <>
                              <Save size={16} className="group-hover/save:scale-110 transition-transform" />
                              COMMIT_PARAMETERS
                            </>
                          )}
                       </button>
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'MISSIONS' && (
              <motion.div 
                key="missions" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-low p-6 border border-outline/10">
                   <div className="flex items-center gap-4">
                      <Folder className="text-secondary" size={24} />
                      <div>
                         <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">FIELD_DOSSIER_ARCHIVE</h3>
                         <p className="text-[10px] text-on-surface-muted uppercase tracking-widest mt-1">Operational data for deployed project missions</p>
                      </div>
                   </div>
                   <button 
                      onClick={() => { setEditingProject(null); openAdminModal('PROJECT_EDIT', null); }}
                      className="btn-tactical border-secondary text-secondary hover:bg-secondary/5 px-6 py-3 text-[10px] font-black flex items-center gap-2"
                   >
                      <Plus size={16} /> INITIATE_NEW_DOSSIER
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {projects.length === 0 ? (
                      <div className="col-span-full p-12 border border-outline/10 text-center opacity-40 italic text-xs">
                         NO_DOSSIERS_INDEXED_IN_SECTOR
                      </div>
                   ) : (
                      projects.map((p) => (
                        <div key={p.id} className="group bg-surface-low border border-outline/10 flex flex-col hover:border-primary/40 transition-all relative overflow-hidden">
                           <div className="aspect-video bg-surface-high relative overflow-hidden">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 scale-105 group-hover:scale-100" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-10"><Folder size={48} /></div>
                              )}
                              <div className="absolute top-2 right-2 flex gap-1">
                                 <span className="bg-black/80 backdrop-blur-md px-2 py-0.5 text-[8px] font-bold text-primary border border-primary/20 uppercase">{p.status}</span>
                              </div>
                           </div>
                           <div className="p-4 flex flex-col gap-3">
                              <div className="flex flex-col">
                                 <span className="text-[8px] text-on-surface-muted uppercase font-bold tracking-[0.2em]">{p.category}</span>
                                 <h4 className="text-xs font-black text-on-surface uppercase truncate">{p.title}</h4>
                              </div>
                              <div className="flex gap-1 flex-wrap">
                                 {Array.isArray(p.stack) && p.stack.slice(0, 3).map((s: string) => (
                                    <span key={s} className="text-[7px] border border-outline/10 px-1.5 py-0.5 text-on-surface-muted uppercase">{s}</span>
                                 ))}
                                 {p.stack.length > 3 && <span className="text-[7px] text-on-surface-muted/40 self-center">+{p.stack.length - 3}</span>}
                              </div>
                              <div className="flex justify-between items-center mt-2 pt-3 border-t border-outline/5">
                                 <div className="flex gap-2">
                                    <button 
                                      onClick={() => openAdminModal('PROJECT_PREVIEW', p)}
                                      className="p-1.5 text-on-surface-muted hover:text-primary transition-colors"
                                    >
                                       <Eye size={14} />
                                    </button>
                                    <button 
                                      onClick={() => { setEditingProject(p); openAdminModal('PROJECT_EDIT', p); }}
                                      className="p-1.5 text-on-surface-muted hover:text-secondary transition-colors"
                                    >
                                       <Edit3 size={14} />
                                    </button>
                                 </div>
                                 <button 
                                   onClick={() => handleDelete('projects', p.id)}
                                   className="p-1.5 text-on-surface-muted hover:text-tertiary transition-colors"
                                 >
                                    <Trash2 size={14} />
                                 </button>
                              </div>
                           </div>
                        </div>
                      ))
                   )}
                </div>
              </motion.div>
            )}

            {activeTab === 'EXPEDITIONS' && (
              <motion.div 
                key="exps" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-12"
              >
                {/* Certificates Section */}
                <div className="flex flex-col gap-6">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-low p-6 border border-outline/10">
                      <div className="flex items-center gap-4">
                         <Award className="text-primary" size={24} />
                         <div>
                            <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">VERIFIED_CREDENTIALS</h3>
                            <p className="text-[10px] text-on-surface-muted uppercase tracking-widest mt-1">Professional certifications and validated skills</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => { setEditingCertificate(null); openAdminModal('CERTIFICATE_EDIT', null); }}
                         className="btn-tactical border-primary text-primary hover:bg-primary/5 px-6 py-3 text-[10px] font-black flex items-center gap-2"
                      >
                         <Plus size={16} /> INDEX_NEW_CREDENTIAL
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {certificates.length === 0 ? (
                         <div className="col-span-full p-8 border border-outline/10 text-center opacity-40 italic text-xs uppercase">
                            NO_CREDENTIALS_LOCATED
                         </div>
                      ) : (
                         certificates.map(cert => (
                           <div key={cert.id} className="group bg-surface-low border border-outline/10 p-5 hover:border-primary transition-all relative overflow-hidden flex flex-col justify-between h-full">
                              <div>
                                 <div className="flex justify-between items-start mb-3">
                                    <span className="text-[8px] text-primary/60 font-mono tracking-widest">{cert.date}</span>
                                    <div className="flex gap-2">
                                       <button 
                                         onClick={() => { setEditingCertificate(cert); openAdminModal('CERTIFICATE_EDIT', cert); }}
                                         className="p-1 text-on-surface-muted hover:text-primary transition-colors"
                                       >
                                          <Edit3 size={14} />
                                       </button>
                                       <button 
                                         onClick={() => handleDelete('certificates', cert.id)}
                                         className="p-1 text-on-surface-muted hover:text-tertiary transition-colors"
                                       >
                                          <Trash2 size={14} />
                                       </button>
                                    </div>
                                 </div>
                                 <h4 className="text-xs font-black text-on-surface uppercase italic mb-1">{cert.title}</h4>
                                 <p className="text-[10px] text-on-surface-muted uppercase font-bold mb-4">{cert.issuer}</p>
                                 <div className="flex flex-wrap gap-1">
                                    {Array.isArray(cert.skills) && cert.skills.map((s: string) => (
                                       <span key={s} className="text-[7px] border border-outline/5 bg-black/20 px-1.5 py-0.5 text-on-surface-muted uppercase">{s}</span>
                                    ))}
                                 </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-outline/5 flex justify-between items-center">
                                 <span className="text-[8px] font-mono text-emerald-400 border border-emerald-400/20 px-2 py-0.5 uppercase">{cert.type || 'CERTIFIED'}</span>
                                 <a href={cert.verify_link} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-primary hover:text-secondary flex items-center gap-1 group/link">
                                    VERIFY <ChevronRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                                 </a>
                              </div>
                           </div>
                         ))
                      )}
                   </div>
                </div>

                <div className="w-full h-px bg-outline/10" />

                {/* Expeditions Section */}
                <div className="flex flex-col gap-6">
                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-low p-6 border border-outline/10">
                      <div className="flex items-center gap-4">
                         <Milestone className="text-secondary" size={24} />
                         <div>
                            <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">MISSION_EXPEDITIONS</h3>
                            <p className="text-[10px] text-on-surface-muted uppercase tracking-widest mt-1">Field attendance in global technical operations</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => { setEditingExpedition(null); openAdminModal('EXPEDITION_EDIT', null); }}
                         className="btn-tactical border-secondary text-secondary hover:bg-secondary/5 px-6 py-3 text-[10px] font-black flex items-center gap-2"
                      >
                         <Plus size={16} /> LOG_NEW_EXPEDITION
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {expeditions.length === 0 ? (
                         <div className="col-span-full p-8 border border-outline/10 text-center opacity-40 italic text-xs uppercase text-on-surface-muted">
                            NO_EXPEDITIONS_RECORDED_IN_LOG
                         </div>
                      ) : (
                         expeditions.map(exp => (
                           <div key={exp.id} className="group bg-surface-low border border-outline/10 p-5 hover:border-secondary transition-all relative">
                              <div className="flex justify-between items-start mb-4">
                                 <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                       <span className="text-[9px] font-mono text-secondary tracking-widest uppercase">{exp.date}</span>
                                       <span className="text-[7px] text-on-surface-muted/40 uppercase">|</span>
                                       <span className="text-[8px] border border-secondary/20 px-1.5 py-0.5 text-secondary uppercase font-bold">{exp.type}</span>
                                    </div>
                                    <h4 className="text-sm font-black text-on-surface uppercase italic tracking-tight">{exp.name}</h4>
                                    <div className="flex items-center gap-1.5 opacity-60">
                                       <MapPin size={10} className="text-secondary" />
                                       <span className="text-[9px] text-on-surface-muted uppercase font-bold">{exp.location}</span>
                                    </div>
                                 </div>
                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button 
                                      onClick={() => { setEditingExpedition(exp); openAdminModal('EXPEDITION_EDIT', exp); }}
                                      className="p-2 text-on-surface-muted hover:text-secondary transition-colors"
                                    >
                                       <Edit3 size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete('expeditions', exp.id)}
                                      className="p-2 text-on-surface-muted hover:text-tertiary transition-colors"
                                    >
                                       <Trash2 size={14} />
                                    </button>
                                 </div>
                              </div>
                              <p className="text-[11px] text-on-surface-muted leading-relaxed line-clamp-2 italic border-l border-outline/10 pl-3 mb-4">{exp.description}</p>
                              {Array.isArray(exp.images) && exp.images.length > 0 && (
                                <div className="flex gap-2">
                                   {exp.images.slice(0, 4).map((img: string, i: number) => (
                                      <div key={i} className="w-10 h-10 bg-surface-high border border-outline/5 overflow-hidden">
                                         <img src={img} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                      </div>
                                   ))}
                                   {exp.images.length > 4 && (
                                      <div className="w-10 h-10 bg-surface-high border border-outline/5 flex items-center justify-center text-[10px] text-on-surface-muted font-bold">
                                         +{exp.images.length - 4}
                                      </div>
                                   )}
                                </div>
                              )}
                           </div>
                         ))
                      )}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'LOGBOOK' && (
              <motion.div 
                key="logbook" 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-low p-6 border border-outline/10">
                   <div className="flex items-center gap-4">
                      <Radio className="text-primary" size={24} />
                      <div>
                         <h3 className="text-[15px] font-black italic uppercase tracking-tighter leading-none">OPERATIONAL_DEBRIEFING_LOGS</h3>
                         <p className="text-[10px] text-on-surface-muted uppercase tracking-widest mt-1">Archived field reports and technical activity streams</p>
                      </div>
                   </div>
                   <button 
                      onClick={() => openAdminModal('LOG_EDIT', null)}
                      className="btn-tactical border-primary text-primary hover:bg-primary/5 px-6 py-3 text-[10px] font-black flex items-center gap-2"
                   >
                      <Plus size={16} /> INITIATE_NEW_DEBRIEF
                   </button>
                </div>

                <div className="flex flex-col gap-4">
                   {logs.length === 0 ? (
                      <div className="p-12 border border-outline/10 text-center opacity-40 italic text-xs uppercase text-on-surface-muted">
                         NO_OPERATIONAL_LOGS_FOUND_IN_ARCHIVE
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {logs.map((l) => (
                           <div key={l.id} className="group bg-surface-low border border-outline/10 p-6 flex flex-col gap-4 hover:border-primary/40 transition-all relative overflow-hidden">
                              <div className="flex justify-between items-start relative z-10">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center">
                                       <Radio size={18} className="text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                       <div className="flex items-center gap-2">
                                          <span className="text-[8px] font-black bg-primary/20 text-primary px-1.5 py-0.5 uppercase tracking-widest">{l.sector}</span>
                                          <span className="text-[9px] text-on-surface-muted font-mono opacity-60">[{new Date(l.created_at).toLocaleString()}]</span>
                                       </div>
                                       <h4 className="text-sm font-black tracking-tight uppercase italic text-on-surface mt-1">{l.title}</h4>
                                    </div>
                                 </div>
                                 <div className="flex gap-2 relative z-10">
                                    <button 
                                      onClick={() => { setEditingLog(l); openAdminModal('LOG_EDIT', l); }}
                                      className="p-1.5 text-on-surface-muted hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                       <Edit3 size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleDelete('logs', l.id)}
                                      className="p-1.5 text-on-surface-muted hover:text-tertiary transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                       <Trash2 size={16} />
                                    </button>
                                 </div>
                              </div>
                              
                              <div className="bg-surface-high/50 p-4 border-l-2 border-primary/20 relative z-10">
                                 <p className="text-[13px] leading-relaxed text-on-surface/80 whitespace-pre-wrap font-mono uppercase text-[12px] italic">
                                    {l.content}
                                 </p>
                              </div>
                           </div>
                        ))}
                      </div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 3. Operational Intel (Right: col-span-3) */}
        <div className="lg:col-span-3 h-[calc(100dvh-140px)] overflow-y-auto pr-2 scrollbar-tactical flex flex-col gap-6 order-3">
          {/* Sector Analytics */}
          <div className="p-6 bg-surface-medium border border-outline/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -rotate-45 translate-x-12 -translate-y-12" />
            <div className="flex items-center gap-3 mb-6">
               <Database size={16} className="text-primary animate-pulse" />
               <h3 className="text-[10px] font-black tracking-widest text-primary uppercase">SECTOR_ANALYTICS</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'COMMS', val: messages.length, color: 'text-primary' },
                 { label: 'DOSSIERS', val: projects.length, color: 'text-secondary' },
                 { label: 'REPORTS', val: feedback.length, color: 'text-tertiary' },
                 { label: 'ARCHIVE', val: expeditions.length + certificates.length, color: 'text-on-surface' },
               ].map(stat => (
                 <div key={stat.label} className="flex flex-col border-l border-outline/10 pl-3 py-1">
                    <span className="text-[8px] text-on-surface-muted opacity-40 uppercase font-bold">{stat.label}</span>
                    <span className={cn("text-xl font-black tracking-tighter", stat.color)}>{String(stat.val).padStart(2, '0')}</span>
                 </div>
               ))}
            </div>

            <div className="mt-8 pt-6 border-t border-primary/10">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[8px] font-bold text-on-surface-muted opacity-40 uppercase">CORE_STABILITY</span>
                  <span className="text-[8px] text-secondary font-black">99.8%</span>
               </div>
               <div className="h-1 bg-surface-low border border-outline/5 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: '99.8%' }}
                    className="h-full bg-secondary"
                  />
               </div>
            </div>
          </div>

          {/* Active Activity Feed */}
          <div className="p-6 bg-surface-low border border-outline/10 flex flex-col gap-6">
            <div className="flex items-center gap-3">
               <Activity size={16} className="text-secondary" />
               <h3 className="text-[10px] font-black tracking-widest text-secondary uppercase">ACTIVE_TRANSMISSIONS</h3>
            </div>
            
            <div className="flex flex-col gap-4">
               {latestActivity.length === 0 ? (
                 <div className="p-4 border border-outline/5 text-center opacity-40 italic text-[10px] uppercase">
                    NO_ACTIVITY_DETECTED
                 </div>
               ) : (
                 latestActivity.map((activity, idx) => (
                   <div key={`${activity.type}-${idx}`} className="flex gap-4 group/item">
                      <div className="w-8 h-8 rounded-full bg-surface-high border border-outline/10 flex items-center justify-center shrink-0 group-hover/item:border-secondary transition-colors">
                         {activity.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                         <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black text-secondary uppercase tracking-tighter">{activity.type}</span>
                            <span className="text-[8px] text-on-surface-muted opacity-40 tabular-nums">
                               {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                         <h4 className="text-[10px] font-bold text-on-surface truncate uppercase tracking-tight">{activity.title}</h4>
                      </div>
                   </div>
                 ))
               )}
            </div>
            
            <button 
              onClick={() => { tacticalAudio?.click(); }}
              className="mt-2 w-full py-2 border border-secondary/20 text-[8px] font-black text-secondary hover:bg-secondary/5 transition-all uppercase tracking-[0.2em]"
            >
               VIEW_COMPLETE_LOGS
            </button>
          </div>

          {/* System Environment */}
          <div className="p-4 bg-surface-high/20 border border-outline/5 flex flex-col gap-3">
             <div className="flex items-center justify-between text-[8px] font-bold text-on-surface-muted opacity-40 uppercase">
                <span>SYSTEM_VECTORS</span>
                <span>STATUS</span>
             </div>
             {[
               { icon: <Cpu size={10} />, label: 'PROCESSING', val: 'OPTIMAL' },
               { icon: <Zap size={10} />, label: 'LATENCY', val: '12ms' },
             ].map(stat => (
               <div key={stat.label} className="flex justify-between items-center bg-surface-high/50 px-3 py-2 border border-outline/5">
                  <div className="flex items-center gap-2">
                     <span className="text-primary">{stat.icon}</span>
                     <span className="text-[9px] font-bold tracking-tighter">{stat.label}:</span>
                  </div>
                  <span className="text-[9px] font-black text-primary">{stat.val}</span>
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* Background HUD Decor */}
      <div className="fixed bottom-4 left-4 pointer-events-none opacity-10">
         <Radio size={100} className="text-primary animate-pulse" />
      </div>
      <div className="fixed top-1/2 right-4 -translate-y-1/2 pointer-events-none opacity-5 vertical-text text-[80px] font-black">
         OVERRIDE_MODE_ACTIVE
      </div>

      {/* Tactical Notifications Stack */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <TacticalNotification 
              key={n.id}
              isOpen={true}
              onClose={() => removeNotification(n.id)}
              type={n.type}
              title={n.title}
              message={n.message}
            />
          ))}
        </AnimatePresence>
      </div>

      <TacticalModal
        isOpen={adminModal.isOpen}
        onClose={closeAdminModal}
        title={
          adminModal.type === 'MESSAGE_DETAIL' ? 'DEEP_INTEL_READOUT' :
          adminModal.type === 'LOG_EDIT' ? (adminModal.data ? 'REVISE_REPORT' : 'COMMIT_NEW_REPORT') :
          adminModal.type === 'PROJECT_PREVIEW' ? 'MISSION_HUD_PREVIEW' :
          adminModal.type === 'PROJECT_EDIT' ? (adminModal.data ? 'REVISE_MISSION_DOSSIER' : 'INITIATE_NEW_MISSION') :
          adminModal.type === 'EXPEDITION_EDIT' ? (adminModal.data ? 'SYNC_EXPEDITION_DATA' : 'ARCHIVE_FIELD_EXPEDITION') :
          adminModal.type === 'CERTIFICATE_EDIT' ? (adminModal.data ? 'UPDATE_CREDENTIAL' : 'INDEX_NEW_CREDENTIAL') :
          'UPLINK_COMPOSITION'
        }
        subtitle={
          adminModal.type === 'MESSAGE_DETAIL' ? `COMMS_ID: ${adminModal.data?.id.split('-')[0]}` :
          adminModal.type === 'LOG_EDIT' ? 'FIELD_OPERATIONAL_DATA' :
          adminModal.type === 'PROJECT_PREVIEW' ? `DRAFT_ID: ${adminModal.data?.title?.substring(0, 4)} // HUD_V3` :
          adminModal.type === 'PROJECT_EDIT' ? 'ARCHITECTURAL_MISSION_PARAMETERS' :
          adminModal.type === 'EXPEDITION_EDIT' ? 'GLOBAL_TECH_SUMMIT_DEBRIEFING' :
          adminModal.type === 'CERTIFICATE_EDIT' ? 'VERIFIED_COMPETENCY_VERIFICATION' :
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
                        value={(adminModal.data ? editingLog?.title : newLog.title) || ""}
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
                      value={(adminModal.data ? editingLog?.content : newLog.content) || ""}
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

          {adminModal.type === 'PROJECT_PREVIEW' && adminModal.data && (
            <div className="flex flex-col gap-6 font-mono text-base uppercase">
              {adminModal.data.image_url && (
                <div className="relative w-full aspect-video border border-outline/10 bg-surface-high overflow-hidden">
                  <img src={adminModal.data.image_url} alt="Preview" className="w-full h-full object-cover grayscale" />
                </div>
              )}
              <div className="border-l-2 border-primary pl-4 py-2 bg-primary/5">
                <span className="text-primary font-extrabold text-sm tracking-widest uppercase">{adminModal.data.title || 'UNTITLED_MISSION'}</span>
              </div>
              
              <div className="flex flex-col gap-4">
                <h4 className="text-secondary font-bold text-xs tracking-widest uppercase">MISSION_OVERVIEW</h4>
                <p className="text-base font-bold text-on-surface leading-snug normal-case font-sans">
                  {adminModal.data.task || 'NO_TASKS_DEFINED'}
                </p>
              </div>

              {adminModal.data.challenge && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-tertiary font-bold text-xs tracking-widest uppercase">THE_CHALLENGE</h4>
                  <p className="text-sm text-on-surface-muted leading-relaxed normal-case font-sans italic border-l border-tertiary/20 pl-4">
                    {adminModal.data.challenge}
                  </p>
                </div>
              )}

              {adminModal.data.solution && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-primary font-bold text-xs tracking-widest uppercase">SOL_ARCHITECTURE</h4>
                  <p className="text-sm text-on-surface-muted leading-relaxed normal-case font-sans border-l border-primary/20 pl-4">
                    {adminModal.data.solution}
                  </p>
                </div>
              )}

              {adminModal.data.results && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-emerald-400 font-bold text-xs tracking-widest uppercase">MISSION_OUTCOME</h4>
                  <p className="text-sm text-emerald-400/80 leading-relaxed normal-case font-sans italic border-l border-emerald-400/20 pl-4">
                    {adminModal.data.results}
                  </p>
                </div>
              )}
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

          {adminModal.type === 'PROJECT_EDIT' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">MISSION_TITLE</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingProject?.title : newProject.title) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({...editingProject, title: e.target.value}) : setNewProject({...newProject, title: e.target.value})}
                    className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-primary outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">SECTOR_CATEGORY</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingProject?.category : newProject.category) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({...editingProject, category: e.target.value}) : setNewProject({...newProject, category: e.target.value})}
                    className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-primary outline-none transition-all uppercase"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">MISSION_DEBRIEF</label>
                <textarea 
                  value={(adminModal.data ? editingProject?.task : newProject.task) || ""}
                  onChange={(e) => adminModal.data ? setEditingProject({...editingProject, task: e.target.value}) : setNewProject({...newProject, task: e.target.value})}
                  className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-primary outline-none h-20 resize-none transition-all normal-case"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-tertiary uppercase font-bold tracking-widest">THE_CHALLENGE</label>
                  <textarea 
                    value={(adminModal.data ? editingProject?.challenge : newProject.challenge) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({...editingProject, challenge: e.target.value}) : setNewProject({...newProject, challenge: e.target.value})}
                    className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-tertiary outline-none h-32 resize-none transition-all normal-case"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-primary uppercase font-bold tracking-widest">SOL_ARCHITECTURE</label>
                  <textarea 
                    value={(adminModal.data ? editingProject?.solution : newProject.solution) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({...editingProject, solution: e.target.value}) : setNewProject({...newProject, solution: e.target.value})}
                    className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-primary outline-none h-32 resize-none transition-all normal-case"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest">MISSION_RESULTS</label>
                  <textarea 
                    value={(adminModal.data ? editingProject?.results : newProject.results) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({...editingProject, results: e.target.value}) : setNewProject({...newProject, results: e.target.value})}
                    className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-emerald-400 outline-none h-32 resize-none transition-all normal-case"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">TECH_STACK (COMMA_DELIMITED)</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? (Array.isArray(editingProject?.stack) ? editingProject.stack.join(", ") : editingProject?.stack) : newProject.stack) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({...editingProject, stack: e.target.value}) : setNewProject({...newProject, stack: e.target.value})}
                    className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-primary outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-on-surface-muted uppercase font-bold tracking-widest">UPLINK_URL</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingProject?.link : newProject.link) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({...editingProject, link: e.target.value}) : setNewProject({...newProject, link: e.target.value})}
                    className="w-full bg-surface-low border border-outline/10 p-3 text-xs font-mono focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center bg-surface-high p-4 border border-outline/10">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-on-surface-muted uppercase font-bold tracking-widest">ASSET_UPLOAD</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, !!adminModal.data)} className="text-[10px]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] text-on-surface-muted uppercase font-bold tracking-widest">OP_STATUS</label>
                  <select 
                     value={adminModal.data ? editingProject?.status : newProject.status}
                     onChange={(e) => adminModal.data ? setEditingProject({...editingProject, status: e.target.value}) : setNewProject({...newProject, status: e.target.value})}
                     className="bg-black text-[10px] font-mono text-emerald-400 border border-emerald-400/20 p-2 uppercase outline-none"
                  >
                     <option value="PROD_STABLE">PROD_STABLE</option>
                     <option value="LIVE_STABLE">LIVE_STABLE</option>
                     <option value="ACTIVE_PROD">ACTIVE_PROD</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button onClick={closeAdminModal} className="px-8 py-3 border border-outline/10 text-[10px] hover:bg-surface-high uppercase font-black">ABORT</button>
                <button 
                  onClick={() => {
                    adminModal.data ? handleUpdateProject() : handleCreateProject();
                    closeAdminModal();
                  }}
                  className="btn-tactical btn-tactical-primary px-12 py-3 text-[10px] font-black"
                >
                  {adminModal.data ? 'SYNCHRONIZE_DOSSIER' : 'COMMIT_ARCHIVE'}
                </button>
              </div>
            </div>
          )}

          {adminModal.type === 'EXPEDITION_EDIT' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-secondary tracking-widest uppercase">MISSION_NAME</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingExpedition?.name : newExpedition.name) || ""}
                    onChange={(e) => adminModal.data ? setEditingExpedition({...editingExpedition, name: e.target.value}) : setNewExpedition({...newExpedition, name: e.target.value})}
                    className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-secondary outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-secondary tracking-widest uppercase">LOCATION_COORDINATES</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingExpedition?.location : newExpedition.location) || ""}
                    onChange={(e) => adminModal.data ? setEditingExpedition({...editingExpedition, location: e.target.value}) : setNewExpedition({...newExpedition, location: e.target.value})}
                    className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-secondary outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-secondary tracking-widest uppercase">MISSION_TIMELINE</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingExpedition?.date : newExpedition.date) || ""}
                    onChange={(e) => adminModal.data ? setEditingExpedition({...editingExpedition, date: e.target.value}) : setNewExpedition({...newExpedition, date: e.target.value})}
                    className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-secondary outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-secondary tracking-widest uppercase">OP_TYPE</label>
                  <select 
                    value={adminModal.data ? editingExpedition?.type : newExpedition.type}
                    onChange={(e) => adminModal.data ? setEditingExpedition({...editingExpedition, type: e.target.value}) : setNewExpedition({...newExpedition, type: e.target.value})}
                    className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-secondary outline-none transition-all uppercase"
                  >
                    <option value="WORKSHOP">WORKSHOP</option>
                    <option value="HACKATHON">HACKATHON</option>
                    <option value="CONVENTION">CONVENTION</option>
                    <option value="MEETUP">MEETUP</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-4 bg-surface-high p-4 border border-outline/10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-secondary tracking-widest uppercase">MISSION_ASSET_UPLINK (MULTIPLE)</label>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(e, !!adminModal.data)} 
                      className="text-[10px]" 
                    />
                  </div>
                </div>

                {/* Image Grid with Delete logic */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                  {(adminModal.data ? editingExpedition?.images : newExpedition.images)?.map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square bg-black border border-outline/10 group overflow-hidden">
                      <img src={img} alt="Asset" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                      <button 
                        onClick={() => {
                          const currentImages = adminModal.data ? editingExpedition.images : newExpedition.images;
                          const updated = currentImages.filter((_: any, i: number) => i !== idx);
                          adminModal.data 
                            ? setEditingExpedition({...editingExpedition, images: updated})
                            : setNewExpedition({...newExpedition, images: updated});
                        }}
                        className="absolute top-0 right-0 bg-tertiary/80 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {((adminModal.data ? editingExpedition?.images : newExpedition.images)?.length === 0) && (
                    <div className="col-span-full py-4 text-center border border-dashed border-outline/20 text-[10px] text-on-surface-muted italic uppercase">
                      NO_ASSETS_ARCHIVED
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-secondary tracking-widest uppercase">MISSION_DEBRIEF</label>
                <textarea 
                  value={(adminModal.data ? editingExpedition?.description : newExpedition.description) || ""}
                  onChange={(e) => adminModal.data ? setEditingExpedition({...editingExpedition, description: e.target.value}) : setNewExpedition({...newExpedition, description: e.target.value})}
                  className="bg-surface-low border border-outline/10 p-3 text-[12px] font-sans focus:border-secondary outline-none transition-all min-h-[120px] normal-case"
                />
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button onClick={closeAdminModal} className="px-8 py-3 border border-outline/10 text-[10px] hover:bg-surface-high uppercase font-black">ABORT</button>
                <button 
                  onClick={() => {
                    adminModal.data ? handleUpdateExpedition() : handleCreateExpedition();
                    closeAdminModal();
                  }}
                  className="btn-tactical border-secondary bg-secondary/10 text-secondary hover:bg-secondary/20 px-12 py-3 text-[10px] font-black"
                >
                  {adminModal.data ? 'SYNC_MISSION_DATA' : 'ARCHIVE_MISSION'}
                </button>
              </div>
            </div>
          )}

          {adminModal.type === 'CERTIFICATE_EDIT' && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-primary tracking-widest uppercase">CERT_TITLE</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingCertificate?.title : newCertificate.title) || ""}
                    onChange={(e) => adminModal.data ? setEditingCertificate({...editingCertificate, title: e.target.value}) : setNewCertificate({...newCertificate, title: e.target.value})}
                    className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-primary outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-primary tracking-widest uppercase">ISSUING_BODY</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingCertificate?.issuer : newCertificate.issuer) || ""}
                    onChange={(e) => adminModal.data ? setEditingCertificate({...editingCertificate, issuer: e.target.value}) : setNewCertificate({...newCertificate, issuer: e.target.value})}
                    className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-primary outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-primary tracking-widest uppercase">DATE_ACQUIRED</label>
                  <input 
                    type="text" 
                    value={(adminModal.data ? editingCertificate?.date : newCertificate.date) || ""}
                    onChange={(e) => adminModal.data ? setEditingCertificate({...editingCertificate, date: e.target.value}) : setNewCertificate({...newCertificate, date: e.target.value})}
                    className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-primary outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-primary tracking-widest uppercase">CREDENTIAL_TYPE</label>
                  <select 
                    value={(adminModal.data ? editingCertificate?.type : newCertificate.type) || ""}
                    onChange={(e) => adminModal.data ? setEditingCertificate({...editingCertificate, type: e.target.value}) : setNewCertificate({...newCertificate, type: e.target.value})}
                    className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-primary outline-none transition-all uppercase"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="HONORARY">HONORARY</option>
                    <option value="INTERNAL">INTERNAL</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-primary tracking-widest uppercase">CREDENTIAL_ID (OPTIONAL)</label>
                <input 
                  type="text" 
                  placeholder="e.g. UC-12345678-ABCD"
                  value={(adminModal.data ? editingCertificate?.credential_id : newCertificate.credential_id) || ""}
                  onChange={(e) => adminModal.data ? setEditingCertificate({...editingCertificate, credential_id: e.target.value}) : setNewCertificate({...newCertificate, credential_id: e.target.value})}
                  className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-primary outline-none transition-all uppercase"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-primary tracking-widest uppercase">VERIFIED_SKILLS (COMMA_SEPARATED)</label>
                <input 
                  type="text" 
                  value={adminModal.data ? (Array.isArray(editingCertificate?.skills) ? editingCertificate.skills.join(', ') : editingCertificate?.skills) : newCertificate.skills}
                  onChange={(e) => adminModal.data ? setEditingCertificate({...editingCertificate, skills: e.target.value.split(',').map((s: string) => s.trim().toUpperCase())}) : setNewCertificate({...newCertificate, skills: e.target.value.split(',').map((s: string) => s.trim().toUpperCase())})}
                  className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-primary outline-none transition-all uppercase"
                />
              </div>
               <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-primary tracking-widest uppercase">VERIFY_LINK</label>
                <input 
                  type="text" 
                  value={(adminModal.data ? editingCertificate?.verify_link : newCertificate.verify_link) || ""}
                  onChange={(e) => adminModal.data ? setEditingCertificate({...editingCertificate, verify_link: e.target.value}) : setNewCertificate({...newCertificate, verify_link: e.target.value})}
                  className="bg-surface-low border border-outline/10 p-3 text-[12px] font-mono focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between bg-surface-high p-4 border border-outline/10 gap-4">
                 <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[9px] text-on-surface-muted uppercase font-bold tracking-widest">CERT_IMAGE_UPLINK</label>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, !!adminModal.data)} className="text-[10px]" />
                 </div>
                 {(adminModal.data ? editingCertificate?.image_url : newCertificate.image_url) && (
                    <div className="w-20 h-20 bg-black border border-primary/20 p-1">
                       <img 
                          src={adminModal.data ? editingCertificate?.image_url : newCertificate.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-contain grayscale" 
                       />
                    </div>
                 )}
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button onClick={closeAdminModal} className="px-8 py-3 border border-outline/10 text-[10px] hover:bg-surface-high uppercase font-black">ABORT</button>
                <button 
                  onClick={() => {
                    adminModal.data ? handleUpdateCertificate() : handleCreateCertificate();
                    closeAdminModal();
                  }}
                  className="btn-tactical btn-tactical-primary px-12 py-3 text-[10px] font-black"
                >
                  {adminModal.data ? 'SYNC_CREDENTIAL' : 'INDEX_CREDENTIAL'}
                </button>
              </div>
            </div>
          )}
        </div>
      </TacticalModal>
    </div>
  );
}
