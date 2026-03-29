"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Layers,
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
import { supabase } from "@v2/lib/supabase";
import { useMetadata } from "@v2/lib/useMetadata";
import { tacticalAudio } from "@v2/lib/sounds";
import { cn } from "@v2/lib/utils";
import { TacticalNotification, NotificationType } from "@v2/components/ui/TacticalNotification";
import { TacticalModal } from "@v2/components/ui/TacticalModal";

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
  const [isLoading, setIsLoading] = useState(false);


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
    type: 'MESSAGE_DETAIL' | 'LOG_EDIT' | 'REPLY' | 'PROJECT_PREVIEW' | 'PROJECT_EDIT' | 'EXPEDITION_EDIT' | 'CERTIFICATE_EDIT' | 'PROFILE' | 'FEEDBACK_SUMMARY';
    data: any;
  }>({
    isOpen: false,
    type: 'MESSAGE_DETAIL',
    data: null,
  });

  const [replyContent, setReplyContent] = useState("");

  const openAdminModal = (type: 'MESSAGE_DETAIL' | 'LOG_EDIT' | 'REPLY' | 'PROJECT_PREVIEW' | 'PROJECT_EDIT' | 'EXPEDITION_EDIT' | 'CERTIFICATE_EDIT' | 'PROFILE' | 'FEEDBACK_SUMMARY', data: any) => {
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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-void p-4 sm:p-8 font-sans text-on-surface select-none overflow-x-hidden">
      {/* Management Header */}
      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 border-b border-outline pb-8 relative">
        <div className="flex items-center gap-6">
          <div
            onClick={() => openAdminModal('PROFILE', {})}
            className="w-16 h-16 bg-surface-high border border-outline/10 rounded-2xl overflow-hidden relative shadow-2xl shadow-primary/5 cursor-pointer group hover:scale-105 transition-all duration-500"
          >
            <img src="/assets/profile/operator.jpeg" alt="Julius Silvano" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-void animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-normal leading-tight">Project<br /><span className="text-primary/60 italic font-medium">Administration</span></h1>
            <div className="flex items-center gap-2 text-[10px] font-mono text-on-surface-muted mt-1 uppercase tracking-[.2em] opacity-40">
              Consolidated Access · v3.0.0
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchData(); tacticalAudio?.blip(); }}
            className="btn-ghost px-4 py-2 text-xs flex items-center gap-2 border border-outline hover:border-primary/40"
          >
            <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button
            onClick={logout}
            className="btn-ghost bg-surface-low px-4 py-2 text-xs flex items-center gap-2 border border-outline hover:border-tertiary/40 text-tertiary/80 hover:text-tertiary"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Secure Exit</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-[calc(100vh-180px)] overflow-y-auto lg:overflow-hidden pb-32 lg:pb-0 scrollbar-tactical">

        {/* Column 1: Navigation Sidebar */}
        <aside className="lg:col-span-2 xl:col-span-2 flex flex-col gap-6 order-1 lg:h-full lg:overflow-y-auto lg:pr-2 lg:scrollbar-tactical">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
            <span className="section-label px-2 mb-2 text-primary/40 uppercase col-span-full">Directories</span>
            {[
              { id: 'MESSAGES', icon: <Mail size={18} />, label: 'Inquiries', count: messages.length },
              { id: 'FEEDBACK', icon: <Star size={18} />, label: 'Feedback', count: feedback.length },
              { id: 'MISSIONS', icon: <Layers size={18} />, label: 'Projects', count: projects.length },
              { id: 'EXPEDITIONS', icon: <Award size={18} />, label: 'Awards', count: expeditions.length + certificates.length },
              { id: 'LOGBOOK', icon: <Activity size={18} />, label: 'Activity', count: logs.length },
              { id: 'METADATA', icon: <Settings size={18} />, label: 'Config', count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); tacticalAudio?.click(); }}
                className={cn(
                  "w-full p-4 rounded-xl border flex items-center justify-between transition-all group relative overflow-hidden",
                  activeTab === tab.id
                    ? "bg-primary/10 border-primary/40 text-primary shadow-lg shadow-primary/5"
                    : "bg-surface-low border-outline/10 text-on-surface-muted hover:border-primary/20 hover:bg-surface-medium"
                )}
              >
                <div className="flex items-center gap-3 relative z-10 transition-transform group-hover:translate-x-1">
                  <span className={cn("transition-colors", activeTab === tab.id ? "text-primary" : "text-on-surface-muted/40 group-hover:text-primary/60")}>
                    {tab.icon}
                  </span>
                  <span className="text-xs font-bold tracking-tight">{tab.label}</span>
                </div>
                {tab.count !== null && (
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full border relative z-10",
                    activeTab === tab.id
                      ? "bg-primary/20 border-primary/20 text-primary"
                      : "bg-surface-high border-outline text-on-surface-muted/60"
                  )}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <motion.div layoutId="tab-indicator" className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* Column 2: Content Area */}
        <section className="col-span-1 lg:col-span-7 xl:col-span-7 order-2 lg:h-full lg:overflow-y-auto lg:pr-2 lg:scrollbar-tactical">
          <AnimatePresence mode="wait">
            {activeTab === 'MESSAGES' && (
              <motion.div
                key="msgs"
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight">Inbound Inquiries</h3>
                      <p className="section-label mt-1">Direct transmissions from professional contacts</p>
                    </div>
                  </div>
                  <div className="bg-surface-medium px-4 py-2 rounded-lg border border-outline flex items-center gap-3">
                    <span className="text-[10px] font-mono text-on-surface-muted uppercase tracking-widest">Active Traffic</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold font-mono">{messages.length}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {messages.length === 0 ? (
                    <div className="p-20 border border-dashed border-outline/20 rounded-3xl text-center opacity-30 italic text-sm">
                      No communications currently indexed in sector.
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="group bg-surface-medium border border-outline rounded-2xl p-6 flex flex-col gap-6 hover:border-primary/40 transition-all relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-surface-high border border-outline rounded-full flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                              <User size={20} className="text-on-surface-muted group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-base font-bold tracking-tight text-on-surface">{msg.name}</span>
                              <span className="text-xs text-on-surface-muted italic opacity-60 font-mono">{msg.email}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] text-on-surface-muted font-mono opacity-40 px-3 py-1 bg-surface-high rounded-full border border-outline uppercase">
                              {new Date(msg.created_at).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => handleDelete('messages', msg.id)}
                              className="p-2 text-on-surface-muted hover:text-tertiary transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 p-5 bg-surface-high rounded-xl border border-outline/5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 -translate-y-16 translate-x-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                          <h4 className="text-[11px] font-black tracking-widest text-primary uppercase opacity-60 leading-none">Transmission Subject</h4>
                          <p className="text-sm font-semibold text-on-surface leading-normal">{msg.subject}</p>
                          <div className="w-full h-px bg-outline/5 my-2" />
                          <p className="text-sm leading-relaxed text-on-surface-muted font-sans italic">{msg.content}</p>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => openAdminModal('MESSAGE_DETAIL', msg)}
                            className="px-6 py-2.5 bg-primary/5 border border-primary/20 rounded-lg text-primary text-[11px] font-bold uppercase tracking-widest hover:bg-primary/10 transition-all flex items-center gap-2"
                          >
                            View Detailed Intel <ChevronRight size={14} />
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
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-secondary/5 border border-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Star className="text-secondary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight">Experience Reports</h3>
                      <p className="section-label mt-1 text-secondary/60">Analytical dossiers from the Glacier interface</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => openAdminModal('FEEDBACK_SUMMARY', feedback)}
                    className="bg-surface-medium px-4 py-2 rounded-lg border border-outline flex items-center gap-4 hover:bg-surface-high hover:border-primary/40 transition-all group"
                  >
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-cyan-500 rounded-full group-hover:bg-primary transition-colors" />)}
                    </div>
                    <span className="text-[10px] font-bold font-mono tracking-widest uppercase opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all">Feedback Count: {feedback.length}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {feedback.length === 0 ? (
                    <div className="col-span-full p-20 border border-dashed border-outline/20 rounded-3xl text-center opacity-30 italic text-sm font-mono uppercase tracking-widest">
                      No experience reports currently indexed.
                    </div>
                  ) : (
                    feedback.map((f) => (
                      <div key={f.id} className="group bg-surface-medium border border-outline p-6 rounded-2xl flex flex-col gap-6 relative overflow-hidden transition-all hover:bg-surface-high hover:border-secondary/40 shadow-sm">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Rank Index</span>
                            <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-display font-black tracking-tighter text-on-surface leading-none">
                                {String(f.rating).padStart(2, '0')}
                              </span>
                              <span className="text-xs font-bold text-on-surface-muted opacity-20">/ 05</span>
                            </div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <div className="flex flex-col gap-0.5">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={cn("w-3 h-1 rounded-full transition-all", i <= f.rating ? "bg-cyan-500" : "bg-outline/10")} />
                              ))}
                            </div>
                            <button
                              onClick={() => handleDelete('feedback', f.id)}
                              className="ml-4 p-2 bg-surface-high border border-outline rounded-lg text-on-surface-muted hover:text-tertiary transition-all opacity-0 group-hover:opacity-100 hover:border-tertiary/20"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="p-6 bg-surface-low rounded-xl border border-outline/5 relative overflow-hidden flex flex-col gap-3 group/msg">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 -translate-y-12 translate-x-12 rounded-full blur-2xl opacity-0 group-hover/msg:opacity-100 transition-opacity" />
                          <span className="text-[9px] font-bold text-secondary/40 uppercase tracking-widest leading-none">Transmission Analysis</span>
                          <p className="text-sm leading-relaxed text-on-surface-muted italic font-mono uppercase tracking-tight">
                            {f.content || "No textual transmission provided."}
                          </p>
                        </div>

                        <div className="flex justify-between items-center mt-auto pt-4 border-t border-outline/5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold text-on-surface-muted opacity-30 tracking-widest uppercase">Report ID</span>
                            <span className="text-[10px] font-mono font-bold text-on-surface-muted uppercase">{f.id.split('-')[0]}</span>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-[9px] font-bold text-on-surface-muted opacity-30 tracking-widest uppercase">Date Stamp</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-bold text-on-surface-muted">{new Date(f.created_at).toLocaleDateString()}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(var(--color-secondary),0.4)]" />
                            </div>
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
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Settings className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight">System Configuration</h3>
                      <p className="section-label mt-1">Global variables for profile synchronization</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-medium border border-outline p-8 rounded-3xl flex flex-col gap-10 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-32 translate-x-32" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    {Object.keys(metadata).map((key) => (
                      <div key={key} className="flex flex-col gap-3 group">
                        <label className="text-[10px] font-bold tracking-widest text-primary/60 uppercase flex items-center gap-2 group-focus-within:text-primary transition-colors">
                          <ChevronRight size={12} className="group-focus-within:translate-x-1 transition-transform" /> {key.replace(/_/g, ' ')}
                        </label>
                        <div className="relative group/field">
                          <input
                            type="text"
                            value={editMetadata[key] || ""}
                            onChange={(e) => setEditMetadata((prev: any) => ({ ...prev, [key]: e.target.value.toUpperCase() }))}
                            className="w-full bg-surface-low border border-outline rounded-xl p-4 text-[13px] font-mono focus:border-primary/60 focus:bg-surface-high focus:outline-none transition-all placeholder:text-on-surface-muted/10 uppercase"
                          />
                          <div className="absolute top-3 right-3 opacity-0 group-focus-within/field:opacity-40 transition-opacity">
                            <Edit3 size={14} className="text-primary" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-8 border-t border-outline/10 flex flex-col sm:flex-row justify-end gap-6 relative z-10 items-center">
                    <button
                      onClick={() => { setEditMetadata(metadata); tacticalAudio?.click(); }}
                      className="text-[11px] font-black text-on-surface-muted hover:text-on-surface transition-colors uppercase tracking-widest"
                    >
                      Discard Changes
                    </button>
                    <button
                      onClick={handleUpdateMetadata}
                      disabled={isSaving}
                      className="px-8 py-3 bg-primary text-void rounded-xl text-[11px] font-bold tracking-widest flex items-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCcw size={16} className="animate-spin" />
                          Commiting...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Sync Configuration
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
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Layers className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight">Project Management</h3>
                      <p className="section-label mt-1">Operational data for deployed project missions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setEditingProject(null); openAdminModal('PROJECT_EDIT', null); }}
                    className="px-6 py-2.5 bg-primary text-void rounded-xl text-[11px] font-bold tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <Plus size={16} /> New Portfolio Project
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.length === 0 ? (
                    <div className="col-span-full p-20 border border-dashed border-outline/20 rounded-3xl text-center opacity-30 italic text-sm">
                      No project dossiers indexed in sector.
                    </div>
                  ) : (
                    projects.map((p) => (
                      <div key={p.id} className="group bg-surface-medium border border-outline rounded-2xl flex flex-col hover:border-primary/40 transition-all relative overflow-hidden shadow-sm">
                        <div className="aspect-video bg-surface-high relative overflow-hidden">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.title} className="w-full h-full object-cover transition-all duration-700 scale-105 group-hover:scale-100" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10"><Folder size={48} /></div>
                          )}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <span className="bg-void/80 backdrop-blur-md px-3 py-1 text-[9px] font-bold text-primary border border-primary/20 rounded-full lowercase tracking-tight">{p.status.replace(/_/g, ' ')}</span>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col gap-4">
                          <div className="flex flex-col">
                            <span className="section-label text-primary/60 mb-1">{p.category}</span>
                            <h4 className="text-base font-bold text-on-surface truncate">{p.title}</h4>
                          </div>
                          <div className="flex gap-1.5 flex-wrap">
                            {Array.isArray(p.stack) && p.stack.slice(0, 3).map((s: string) => (
                              <span key={s} className="text-[9px] font-mono border border-outline/10 bg-surface-high px-2 py-0.5 rounded text-on-surface-muted/80 uppercase">{s}</span>
                            ))}
                            {p.stack.length > 3 && <span className="text-[9px] text-on-surface-muted/40 self-center font-mono">+{p.stack.length - 3}</span>}
                          </div>
                          <div className="flex justify-between items-center mt-2 pt-4 border-t border-outline/5">
                            <div className="flex gap-2">
                              <button
                                onClick={() => openAdminModal('PROJECT_PREVIEW', p)}
                                className="p-2 bg-surface-high rounded-lg text-on-surface-muted hover:text-primary transition-colors border border-outline/5"
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                onClick={() => { setEditingProject(p); openAdminModal('PROJECT_EDIT', p); }}
                                className="p-2 bg-surface-high rounded-lg text-on-surface-muted hover:text-secondary transition-colors border border-outline/5"
                              >
                                <Edit3 size={16} />
                              </button>
                            </div>
                            <button
                              onClick={() => handleDelete('projects', p.id)}
                              className="p-2 text-on-surface-muted hover:text-tertiary transition-colors"
                            >
                              <Trash2 size={16} />
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
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-12"
              >
                {/* Certificates Section */}
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                        <Award className="text-primary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold tracking-tight">Verified Credentials</h3>
                        <p className="section-label mt-1">Professional certifications and validated skills</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setEditingCertificate(null); openAdminModal('CERTIFICATE_EDIT', null); }}
                      className="px-6 py-2.5 bg-surface-medium border border-outline rounded-xl text-[11px] font-bold tracking-widest flex items-center gap-2 hover:bg-surface-high transition-all"
                    >
                      <Plus size={16} /> New Credential
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {certificates.length === 0 ? (
                      <div className="col-span-full p-12 border border-dashed border-outline/20 rounded-3xl text-center opacity-30 italic text-sm">
                        No credentials located in sector.
                      </div>
                    ) : (
                      certificates.map(cert => (
                        <div key={cert.id} className="group bg-surface-medium border border-outline rounded-2xl p-6 hover:border-primary transition-all relative overflow-hidden flex flex-col justify-between h-full shadow-sm">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] text-primary/60 font-mono tracking-widest font-bold uppercase bg-surface-high px-3 py-1 rounded-full border border-outline/5">{cert.date}</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setEditingCertificate(cert); openAdminModal('CERTIFICATE_EDIT', cert); }}
                                  className="p-1.5 text-on-surface-muted hover:text-primary transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete('certificates', cert.id)}
                                  className="p-1.5 text-on-surface-muted hover:text-tertiary transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                            <h4 className="text-base font-bold text-on-surface leading-tight mb-1">{cert.title}</h4>
                            <p className="section-label text-primary/60 mb-5">{cert.issuer}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {Array.isArray(cert.skills) && cert.skills.map((s: string) => (
                                <span key={s} className="text-[8px] font-mono border border-outline/10 bg-black/20 px-2 py-0.5 rounded text-on-surface-muted/60 uppercase">{s}</span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-6 pt-4 border-t border-outline/5 flex justify-between items-center">
                            <span className="text-[9px] font-bold text-emerald-400 border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 rounded-full uppercase tracking-tighter">{cert.type || 'CERTIFIED'}</span>
                            <a href={cert.verify_link} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary hover:text-secondary flex items-center gap-1 group/link">
                              UPLINK <ChevronRight size={12} className="group-hover/link:translate-x-0.5 transition-transform" />
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="w-full h-px bg-outline/10" />

                {/* Expeditions Section */}
                <div className="flex flex-col gap-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-secondary/5 border border-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                        <Milestone className="text-secondary" size={20} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl font-bold tracking-tight">Field Experience</h3>
                        <p className="section-label mt-1 text-secondary/60">Professional attendance in global technical operations</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setEditingExpedition(null); openAdminModal('EXPEDITION_EDIT', null); }}
                      className="px-6 py-2.5 bg-surface-medium border border-outline rounded-xl text-[11px] font-bold tracking-widest flex items-center gap-2 hover:bg-surface-high transition-all"
                    >
                      <Plus size={16} /> New Experience
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {expeditions.length === 0 ? (
                      <div className="col-span-full p-12 border border-dashed border-outline/20 rounded-3xl text-center opacity-30 italic text-sm">
                        No experiences recorded in log.
                      </div>
                    ) : (
                      expeditions.map(exp => (
                        <div key={exp.id} className="group bg-surface-medium border border-outline rounded-2xl p-6 hover:border-secondary transition-all relative shadow-sm">
                          <div className="flex justify-between items-start mb-5">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-secondary font-bold tracking-widest uppercase">{exp.date}</span>
                                <span className="w-1 h-1 rounded-full bg-outline/20" />
                                <span className="text-[9px] bg-secondary/10 border border-secondary/20 px-2 py-0.5 text-secondary rounded-full font-bold lowercase">{exp.type}</span>
                              </div>
                              <h4 className="text-lg font-bold text-on-surface leading-tight tracking-tight">{exp.name}</h4>
                              <div className="flex items-center gap-1.5 opacity-60">
                                <MapPin size={12} className="text-secondary" />
                                <span className="text-[10px] text-on-surface-muted font-bold uppercase tracking-widest">{exp.location}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button
                                onClick={() => { setEditingExpedition(exp); openAdminModal('EXPEDITION_EDIT', exp); }}
                                className="p-2 bg-surface-high rounded-lg text-on-surface-muted hover:text-secondary transition-colors border border-outline/5"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete('expeditions', exp.id)}
                                className="p-2 text-on-surface-muted hover:text-tertiary transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-on-surface-muted leading-relaxed line-clamp-3 italic font-sans border-l-2 border-outline/10 pl-4 mb-6">{exp.description}</p>
                          {Array.isArray(exp.images) && exp.images.length > 0 && (
                            <div className="flex gap-2">
                              {exp.images.slice(0, 4).map((img: string, i: number) => (
                                <div key={i} className="w-12 h-12 bg-surface-high border border-outline/5 rounded-lg overflow-hidden relative group/img">
                                  <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                </div>
                              ))}
                              {exp.images.length > 4 && (
                                <div className="w-12 h-12 bg-surface-high border border-outline/5 rounded-lg flex items-center justify-center text-[11px] text-on-surface-muted font-black font-mono">
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
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Activity className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold tracking-tight">Activity History</h3>
                      <p className="section-label mt-1">Archived field reports and technical activity streams</p>
                    </div>
                  </div>
                  <button
                    onClick={() => openAdminModal('LOG_EDIT', null)}
                    className="px-6 py-2.5 bg-primary text-void rounded-xl text-[11px] font-bold tracking-widest flex items-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <Plus size={16} /> New Activity Entry
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {logs.length === 0 ? (
                    <div className="p-20 border border-dashed border-outline/20 rounded-3xl text-center opacity-30 italic text-sm">
                      No activity logs found in archive.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {logs.map((l) => (
                        <div key={l.id} className="group bg-surface-medium border border-outline rounded-2xl p-6 flex flex-col gap-6 hover:border-primary/40 transition-all relative shadow-sm">
                          <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-surface-high border border-outline rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                <Radio size={22} className="text-primary/60 group-hover:text-primary transition-colors" />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-3 py-0.5 rounded-full lowercase tracking-tight border border-primary/20">{l.sector}</span>
                                  <span className="text-[10px] text-on-surface-muted font-mono opacity-60 uppercase tracking-widest">{new Date(l.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="text-lg font-bold text-on-surface leading-tight mt-2">{l.title}</h4>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setEditingLog(l); openAdminModal('LOG_EDIT', l); }}
                                className="p-2 bg-surface-high rounded-lg text-on-surface-muted hover:text-primary transition-colors border border-outline/5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Edit3 size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete('logs', l.id)}
                                className="p-2 text-on-surface-muted hover:text-tertiary transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>

                          <div className="p-5 bg-surface-low rounded-xl border-l-[3px] border-primary/20">
                            <p className="text-sm leading-relaxed text-on-surface-muted whitespace-pre-wrap font-sans italic opacity-80">
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

        {/* Column 3: Analytics & Activity Sidebar */}
        <div className="flex lg:col-span-3 flex-col gap-6 order-3 lg:h-full lg:overflow-y-auto lg:overflow-x-hidden lg:pr-2 lg:scrollbar-tactical mb-12 lg:mb-0">
          {/* Sector Analytics */}
          <div className="p-6 bg-surface-medium border border-outline rounded-2xl flex flex-col relative group shadow-lg">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-12 translate-x-12" />
            <div className="flex items-center gap-3 mb-8">
              <Database size={16} className="text-primary" />
              <h3 className="section-label uppercase">Strategic Metrics</h3>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[
                { label: 'Inquiries', val: messages.length, color: 'text-primary' },
                { label: 'Feedback', val: feedback.length, color: 'text-secondary' },
                { label: 'Solutions', val: projects.length, color: 'text-on-surface' },
                { label: 'Archives', val: expeditions.length + certificates.length, color: 'text-on-surface-muted' },
              ].map(stat => (
                <div key={stat.label} className="flex flex-col border-l-2 border-outline/10 pl-4 group/stat hover:border-primary/40 transition-all">
                  <span className="text-[8px] text-on-surface-muted opacity-40 uppercase font-black tracking-widest mb-2 leading-none">{stat.label}</span>
                  <span className={cn("text-2xl font-display font-extrabold tracking-tighter leading-none mb-1", stat.color)}>{String(stat.val).padStart(2, '0')}</span>
                  <div className="flex gap-0.5 opacity-20 group-hover/stat:opacity-60 transition-opacity">
                    {[1, 2, 3].map(i => <div key={i} className={cn("w-1 h-1 rounded-full", stat.color.replace('text-', 'bg-'))} />)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-outline/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-bold text-on-surface-muted uppercase opacity-40">System Uptime</span>
                <span className="text-[10px] text-emerald-500 font-mono font-bold tracking-widest">99.98%</span>
              </div>
              <div className="h-1 bg-surface-low rounded-full overflow-hidden border border-outline/5">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: '99.98%' }}
                  className="h-full bg-emerald-500/60"
                />
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="p-6 bg-surface-medium border border-outline rounded-2xl flex flex-col gap-6 shadow-lg">
            <div className="flex items-center gap-3">
              <Activity size={16} className="text-secondary" />
              <h3 className="section-label uppercase">Recent Traffic</h3>
            </div>

            <div className="flex flex-col gap-5">
              {latestActivity.length === 0 ? (
                <div className="p-6 border border-dashed border-outline/20 rounded-xl text-center opacity-30 italic text-[10px]">
                  No recent traffic.
                </div>
              ) : (
                latestActivity.map((activity, idx) => (
                  <div key={`${activity.type}-${idx}`} className="flex gap-4 group/item">
                    <div className="w-9 h-9 rounded-xl bg-surface-high border border-outline flex items-center justify-center shrink-0 group-hover/item:border-secondary/40 transition-colors">
                      {activity.icon}
                    </div>
                    <div className="flex flex-col min-w-0 justify-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-secondary uppercase tracking-widest">{activity.type}</span>
                        <span className="w-1 h-1 rounded-full bg-outline/20" />
                        <span className="text-[9px] text-on-surface-muted opacity-40 font-mono">
                          {new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h4 className="text-[11px] font-bold text-on-surface/80 truncate tracking-tight">{activity.title}</h4>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => { setActiveTab('LOGBOOK'); tacticalAudio?.click(); }}
              className="mt-2 w-full py-2.5 bg-surface-high border border-outline rounded-xl text-[10px] font-bold text-on-surface-muted hover:text-primary hover:border-primary/20 transition-all uppercase tracking-widest"
            >
              Browse Archives
            </button>
          </div>
        </div>

      </main>

      {/* Subtle background accent */}
      <div className="fixed bottom-8 left-8 pointer-events-none opacity-5">
        <ShieldCheck size={80} className="text-primary" />
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
          adminModal.type === 'MESSAGE_DETAIL' ? 'Inquiry Detail' :
            adminModal.type === 'LOG_EDIT' ? (adminModal.data ? 'Edit Activity Record' : 'Create Activity Record') :
              adminModal.type === 'PROJECT_PREVIEW' ? 'Project Insight' :
                adminModal.type === 'PROJECT_EDIT' ? (adminModal.data ? 'Edit Project Dossier' : 'New Project Registration') :
                  adminModal.type === 'EXPEDITION_EDIT' ? (adminModal.data ? 'Edit ExpeditionEntry' : 'New Expedition Entry') :
                    adminModal.type === 'CERTIFICATE_EDIT' ? (adminModal.data ? 'Edit Credential' : 'Add New Credential') :
                      adminModal.type === 'FEEDBACK_SUMMARY' ? 'Feedback Summary' :
                        'Compose Outbound'
        }
        subtitle={
          adminModal.type === 'MESSAGE_DETAIL' ? `ID: ${adminModal.data?.id.split('-')[0]}` :
            adminModal.type === 'LOG_EDIT' ? 'System activity stream management' :
              adminModal.type === 'PROJECT_PREVIEW' ? adminModal.data?.title :
                adminModal.type === 'PROJECT_EDIT' ? 'Define project parameters and scope' :
                  adminModal.type === 'EXPEDITION_EDIT' ? 'Event and mission details' :
                    adminModal.type === 'CERTIFICATE_EDIT' ? 'Credential verification details' :
                      adminModal.type === 'FEEDBACK_SUMMARY' ? 'Consolidated experience records' :
                        `Responding to: ${adminModal.data?.name}`
        }
      >
        <div className="font-sans text-on-surface text-[13px]">
          {adminModal.type === 'MESSAGE_DETAIL' && adminModal.data && (
            <div className="flex flex-col gap-8 mb-4">
              <div className="bg-surface-high/50 p-6 rounded-2xl border border-outline/10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black tracking-widest text-primary/60 uppercase leading-none">Origin Name</span>
                    <span className="text-base font-bold text-on-surface">{adminModal.data.name}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="text-[10px] font-black tracking-widest text-primary/60 uppercase leading-none">Contact Email</span>
                    <span className="text-xs font-mono font-medium text-on-surface-muted italic">{adminModal.data.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black tracking-widest text-primary uppercase opacity-60">Transmission Subject</label>
                <p className="text-lg font-bold text-on-surface leading-tight tracking-tight border-b border-outline/10 pb-4">{adminModal.data.subject}</p>
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black tracking-widest text-primary uppercase opacity-60">Core Message Content</label>
                <div className="bg-surface-medium border border-outline rounded-3xl p-8 min-h-[150px] relative overflow-hidden group shadow-inner">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                  <p className="leading-relaxed text-on-surface-muted font-sans font-medium">
                    {adminModal.data.content}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => openAdminModal('REPLY', adminModal.data)}
                  className="flex-1 py-4 bg-primary text-void rounded-2xl font-bold text-[11px] tracking-widest uppercase flex items-center justify-center gap-2 hover:scale-[1.01] transition-all shadow-lg active:scale-95 shadow-primary/10"
                >
                  <Send size={16} /> Compose Field Response
                </button>
              </div>
            </div>
          )}

          {adminModal.type === 'LOG_EDIT' && (
            <div className="flex flex-col gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-primary/60 uppercase font-black tracking-widest leading-none">Entry Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. SYSTEM_OPTIMIZATION // CORE"
                    value={(adminModal.data ? editingLog?.title : newLog.title) || ""}
                    onChange={(e) => adminModal.data ? setEditingLog({ ...editingLog, title: e.target.value.toUpperCase() }) : setNewLog({ ...newLog, title: e.target.value.toUpperCase() })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-sm font-mono focus:border-primary/40 outline-none transition-all placeholder:text-on-surface-muted/20"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-primary/60 uppercase font-black tracking-widest leading-none">Sector Classification</label>
                  <select
                    value={adminModal.data ? editingLog?.sector : newLog.sector}
                    onChange={(e) => adminModal.data ? setEditingLog({ ...editingLog, sector: e.target.value }) : setNewLog({ ...newLog, sector: e.target.value })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-sm font-mono text-primary font-bold focus:border-primary/40 outline-none transition-all uppercase appearance-none"
                  >
                    <option value="WEB">WEB_SECTOR</option>
                    <option value="MOBILE">MOBILE_SECTOR</option>
                    <option value="AI">AI_SECTOR</option>
                    <option value="SYSTEM">SYSTEM_CORE</option>
                    <option value="INFRA">INFRASTRUCTURE</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-primary/60 uppercase font-black tracking-widest leading-none">Technical Briefing</label>
                <textarea
                  placeholder="DETAILED_PROCESS_DEBRIEFING..."
                  value={(adminModal.data ? editingLog?.content : newLog.content) || ""}
                  onChange={(e) => adminModal.data ? setEditingLog({ ...editingLog, content: e.target.value }) : setNewLog({ ...newLog, content: e.target.value })}
                  className="w-full bg-surface-high border border-outline rounded-2xl p-6 text-sm font-mono focus:border-primary/40 outline-none h-48 resize-none transition-all placeholder:text-on-surface-muted/20 uppercase leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-6 pt-4 items-center">
                <button
                  onClick={closeAdminModal}
                  className="text-[10px] font-black text-on-surface-muted hover:text-on-surface transition-colors uppercase tracking-widest"
                >
                  Abort Record
                </button>
                <button
                  onClick={() => {
                    if (adminModal.data) handleUpdateLog();
                    else handleCreateLog();
                    closeAdminModal();
                  }}
                  className="px-10 py-3.5 bg-primary text-void rounded-2xl font-bold text-[11px] tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10"
                >
                  {adminModal.data ? 'Synchronize Record' : 'Commit to Log'}
                </button>
              </div>
            </div>
          )}

          {adminModal.type === 'PROJECT_PREVIEW' && adminModal.data && (
            <div className="flex flex-col gap-10 font-sans">
              {adminModal.data.image_url && (
                <div className="relative w-full aspect-[21/9] rounded-3xl border border-outline/10 bg-surface-high overflow-hidden shadow-2xl">
                  <img src={adminModal.data.image_url} alt="Insight Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-void/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 flex items-center gap-3">
                    <span className="px-3 py-1 bg-primary text-void text-[10px] font-black uppercase tracking-widest rounded-full">{adminModal.data.category || 'Portfolio'}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-primary uppercase tracking-[.3em] opacity-40">Project Insight</span>
                <h2 className="text-3xl font-display font-extrabold text-on-surface leading-tight tracking-tighter italic">
                  {adminModal.data.title || 'Untitled Venture'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-4">
                  <h4 className="text-[11px] font-black text-on-surface-muted tracking-[.2em] uppercase flex items-center gap-2">
                    <div className="w-4 h-[1px] bg-secondary/40" /> Core Objectives
                  </h4>
                  <p className="text-base font-medium text-on-surface leading-normal">
                    {adminModal.data.task || 'Objectives currently classified.'}
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  {adminModal.data.challenge && (
                    <div className="flex flex-col gap-2 p-5 bg-surface-medium rounded-2xl border border-outline/5">
                      <h4 className="text-[10px] font-black text-tertiary tracking-widest uppercase mb-2">The Challenge</h4>
                      <p className="text-[13px] text-on-surface-muted leading-relaxed font-medium italic opacity-70">
                        {adminModal.data.challenge}
                      </p>
                    </div>
                  )}

                  {adminModal.data.solution && (
                    <div className="flex flex-col gap-2">
                      <h4 className="text-[10px] font-black text-primary tracking-widest uppercase">Technical Overview</h4>
                      <p className="text-[14px] text-on-surface leading-relaxed font-medium opacity-80">
                        {adminModal.data.solution}
                      </p>
                    </div>
                  )}

                  {adminModal.data.results && (
                    <div className="flex flex-col gap-2 border-t border-outline/10 pt-4">
                      <h4 className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Strategic Outcome</h4>
                      <p className="text-[13px] text-emerald-500/80 leading-relaxed font-bold italic opacity-90">
                        {adminModal.data.results}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {adminModal.type === 'REPLY' && adminModal.data && (
            <div className="flex flex-col gap-8">
              <div className="bg-surface-high border border-outline/10 p-5 rounded-2xl flex flex-col gap-2 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full" />
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-secondary uppercase tracking-[.2em] leading-none">Target Address</span>
                  <span className="text-xs font-mono font-medium text-on-surface italic">{adminModal.data.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-black text-on-surface-muted uppercase tracking-[.2em] leading-none">Reference Subject</span>
                  <span className="text-xs font-bold text-on-surface">RE: {adminModal.data.subject}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-secondary/60 uppercase font-black tracking-widest leading-none">Outbound Response Body</label>
                <textarea
                  autoFocus
                  placeholder="Draft your professional response here..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full bg-surface-high border border-outline rounded-3xl p-8 text-sm font-sans focus:border-secondary/40 outline-none h-72 resize-none transition-all leading-relaxed shadow-inner placeholder:text-on-surface-muted/20"
                />
              </div>

              <div className="flex gap-6 items-center justify-between pt-4">
                <button
                  onClick={() => openAdminModal('MESSAGE_DETAIL', adminModal.data)}
                  className="text-[10px] font-black text-on-surface-muted hover:text-on-surface transition-colors uppercase tracking-widest"
                >
                  Return to Insight
                </button>
                <button
                  onClick={handleSendEmailReply}
                  className="px-12 py-4 bg-secondary text-void rounded-2xl font-bold text-[11px] tracking-widest uppercase hover:scale-105 active:scale-95 transition-all shadow-xl shadow-secondary/20 flex items-center gap-3"
                >
                  <Mail size={16} /> Broadcast Response
                </button>
              </div>
            </div>
          )}

          {adminModal.type === 'PROJECT_EDIT' && (
            <div className="flex flex-col gap-8 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-primary/60 uppercase font-black tracking-widest leading-none">Project Designation</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingProject?.title : newProject.title) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, title: e.target.value }) : setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-sm font-display font-bold focus:border-primary/40 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-primary/60 uppercase font-black tracking-widest leading-none">Sector Category</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingProject?.category : newProject.category) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, category: e.target.value }) : setNewProject({ ...newProject, category: e.target.value })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-sm font-display font-bold focus:border-primary/40 outline-none transition-all uppercase"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] text-primary/60 uppercase font-black tracking-widest leading-none">Primary Narrative</label>
                <textarea
                  value={(adminModal.data ? editingProject?.task : newProject.task) || ""}
                  onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, task: e.target.value }) : setNewProject({ ...newProject, task: e.target.value })}
                  className="w-full bg-surface-high border border-outline rounded-2xl p-5 text-sm font-sans font-medium focus:border-primary/40 outline-none h-24 resize-none transition-all leading-relaxed"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-tertiary uppercase font-black tracking-widest leading-none">The Challenge</label>
                  <textarea
                    value={(adminModal.data ? editingProject?.challenge : newProject.challenge) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, challenge: e.target.value }) : setNewProject({ ...newProject, challenge: e.target.value })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-sans font-medium focus:border-tertiary/40 outline-none h-32 resize-none transition-all leading-relaxed italic"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-primary uppercase font-black tracking-widest leading-none">Technical Architecture</label>
                  <textarea
                    value={(adminModal.data ? editingProject?.solution : newProject.solution) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, solution: e.target.value }) : setNewProject({ ...newProject, solution: e.target.value })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-sans font-medium focus:border-primary/40 outline-none h-32 resize-none transition-all leading-relaxed"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-emerald-500 uppercase font-black tracking-widest leading-none">Core Results</label>
                  <textarea
                    value={(adminModal.data ? editingProject?.results : newProject.results) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, results: e.target.value }) : setNewProject({ ...newProject, results: e.target.value })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-sans font-bold focus:border-emerald-500/40 outline-none h-32 resize-none transition-all leading-relaxed text-emerald-500/80"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-on-surface-muted uppercase font-black tracking-widest leading-none">Technical Stack</label>
                  <input
                    type="text"
                    placeholder="React, Tailwind, Node.js..."
                    value={(adminModal.data ? (Array.isArray(editingProject?.stack) ? editingProject.stack.join(", ") : editingProject?.stack) : newProject.stack) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, stack: e.target.value }) : setNewProject({ ...newProject, stack: e.target.value })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-xs font-mono focus:border-primary/40 outline-none transition-all"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-on-surface-muted uppercase font-black tracking-widest leading-none">Production Link</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingProject?.link : newProject.link) || ""}
                    onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, link: e.target.value }) : setNewProject({ ...newProject, link: e.target.value })}
                    className="w-full bg-surface-high border border-outline rounded-xl p-4 text-xs font-mono focus:border-primary/40 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center bg-surface-medium p-6 rounded-2xl border border-outline/5 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[9px] text-on-surface-muted uppercase font-black tracking-widest leading-none opacity-40">Asset Repository</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, !!adminModal.data)} className="text-[10px] font-mono" />
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <label className="text-[9px] text-on-surface-muted uppercase font-black tracking-widest leading-none opacity-40">Operational Status</label>
                  <select
                    value={adminModal.data ? editingProject?.status : newProject.status}
                    onChange={(e) => adminModal.data ? setEditingProject({ ...editingProject, status: e.target.value }) : setNewProject({ ...newProject, status: e.target.value })}
                    className="bg-surface-high text-[10px] font-black tracking-widest text-emerald-500 border border-emerald-500/20 px-4 py-2.5 rounded-xl uppercase outline-none focus:border-emerald-500/40 transition-all appearance-none"
                  >
                    <option value="PROD_STABLE">PRODUCTION_STABLE</option>
                    <option value="LIVE_STABLE">LIVE_OPERATIONAL</option>
                    <option value="ACTIVE_PROD">ACTIVE_DEVELOPMENT</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-6 mt-4 items-center">
                <button onClick={closeAdminModal} className="text-[10px] font-black text-on-surface-muted hover:text-on-surface transition-colors uppercase tracking-widest">Abort Archive</button>
                <button
                  onClick={() => {
                    adminModal.data ? handleUpdateProject() : handleCreateProject();
                    closeAdminModal();
                  }}
                  className="px-12 py-4 bg-primary text-void rounded-2xl font-bold text-[11px] tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10"
                >
                  {adminModal.data ? 'Synchronize Dossier' : 'Finalize Record'}
                </button>
              </div>
            </div>
          )}

          {adminModal.type === 'EXPEDITION_EDIT' && (
            <div className="flex flex-col gap-8 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Expedition Title</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingExpedition?.name : newExpedition.name) || ""}
                    onChange={(e) => adminModal.data ? setEditingExpedition({ ...editingExpedition, name: e.target.value }) : setNewExpedition({ ...newExpedition, name: e.target.value })}
                    className="bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-display font-bold focus:border-secondary/40 outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Geographic Locale</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingExpedition?.location : newExpedition.location) || ""}
                    onChange={(e) => adminModal.data ? setEditingExpedition({ ...editingExpedition, location: e.target.value }) : setNewExpedition({ ...newExpedition, location: e.target.value })}
                    className="bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-display font-bold focus:border-secondary/40 outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Temporal Window</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingExpedition?.date : newExpedition.date) || ""}
                    onChange={(e) => adminModal.data ? setEditingExpedition({ ...editingExpedition, date: e.target.value }) : setNewExpedition({ ...newExpedition, date: e.target.value })}
                    className="bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-display font-bold focus:border-secondary/40 outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Operational Essence</label>
                  <select
                    value={adminModal.data ? editingExpedition?.type : newExpedition.type}
                    onChange={(e) => adminModal.data ? setEditingExpedition({ ...editingExpedition, type: e.target.value }) : setNewExpedition({ ...newExpedition, type: e.target.value })}
                    className="bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-display font-bold focus:border-secondary/40 outline-none transition-all uppercase appearance-none"
                  >
                    <option value="WORKSHOP">ACADEMIC_WORKSHOP</option>
                    <option value="HACKATHON">COMPETITIVE_HACKATHON</option>
                    <option value="CONVENTION">TECH_CONVENTION</option>
                    <option value="MEETUP">COMMUNITY_MEETUP</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-6 bg-surface-medium p-6 rounded-3xl border border-outline/5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none opacity-60">Visual Assets Archive</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, !!adminModal.data)}
                      className="text-[10px] font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-4">
                  {(adminModal.data ? editingExpedition?.images : newExpedition.images)?.map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square bg-void border border-outline/10 group rounded-xl overflow-hidden shadow-inner">
                      <img src={img} alt="Asset" className="w-full h-full object-cover transition-all group-hover:scale-110" />
                      <button
                        onClick={() => {
                          const currentImages = adminModal.data ? editingExpedition.images : newExpedition.images;
                          const updated = currentImages.filter((_: any, i: number) => i !== idx);
                          adminModal.data
                            ? setEditingExpedition({ ...editingExpedition, images: updated })
                            : setNewExpedition({ ...newExpedition, images: updated });
                        }}
                        className="absolute top-1 right-1 bg-tertiary/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {((adminModal.data ? editingExpedition?.images : newExpedition.images)?.length === 0) && (
                    <div className="col-span-full py-8 text-center border border-dashed border-outline/10 rounded-2xl text-[10px] text-on-surface-muted italic uppercase tracking-widest opacity-30">
                      No visual assets archived
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest leading-none">Expedition Narrative</label>
                <textarea
                  value={(adminModal.data ? editingExpedition?.description : newExpedition.description) || ""}
                  onChange={(e) => adminModal.data ? setEditingExpedition({ ...editingExpedition, description: e.target.value }) : setNewExpedition({ ...newExpedition, description: e.target.value })}
                  className="bg-surface-high border border-outline rounded-2xl p-6 text-sm font-sans font-medium focus:border-secondary/40 outline-none transition-all min-h-[140px] leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-6 mt-4 items-center">
                <button onClick={closeAdminModal} className="text-[10px] font-black text-on-surface-muted hover:text-on-surface transition-colors uppercase tracking-widest">Abort</button>
                <button
                  onClick={() => {
                    adminModal.data ? handleUpdateExpedition() : handleCreateExpedition();
                    closeAdminModal();
                  }}
                  className="px-12 py-4 bg-secondary text-void rounded-2xl font-bold text-[11px] tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-secondary/10"
                >
                  {adminModal.data ? 'Synchronize Record' : 'Finalize Expedition'}
                </button>
              </div>
            </div>
          )}

          {adminModal.type === 'CERTIFICATE_EDIT' && (
            <div className="flex flex-col gap-8 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Credential Title</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingCertificate?.title : newCertificate.title) || ""}
                    onChange={(e) => adminModal.data ? setEditingCertificate({ ...editingCertificate, title: e.target.value }) : setNewCertificate({ ...newCertificate, title: e.target.value })}
                    className="bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-display font-bold focus:border-primary/40 outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Issuing Authority</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingCertificate?.issuer : newCertificate.issuer) || ""}
                    onChange={(e) => adminModal.data ? setEditingCertificate({ ...editingCertificate, issuer: e.target.value }) : setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                    className="bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-display font-bold focus:border-primary/40 outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Recognition Date</label>
                  <input
                    type="text"
                    value={(adminModal.data ? editingCertificate?.date : newCertificate.date) || ""}
                    onChange={(e) => adminModal.data ? setEditingCertificate({ ...editingCertificate, date: e.target.value }) : setNewCertificate({ ...newCertificate, date: e.target.value })}
                    className="bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-display font-bold focus:border-primary/40 outline-none transition-all uppercase"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Recognition Level</label>
                  <select
                    value={(adminModal.data ? editingCertificate?.type : newCertificate.type) || ""}
                    onChange={(e) => adminModal.data ? setEditingCertificate({ ...editingCertificate, type: e.target.value }) : setNewCertificate({ ...newCertificate, type: e.target.value })}
                    className="bg-surface-high border border-outline rounded-xl p-4 text-[13px] font-display font-bold focus:border-primary/40 outline-none transition-all uppercase appearance-none"
                  >
                    <option value="VERIFIED">VERIFIED_CREDENTIAL</option>
                    <option value="HONORARY">HONORARY_RECOGNITION</option>
                    <option value="INTERNAL">INTERNAL_DEVELOPMENT</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Verification ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. UC-12345678-ABCD"
                  value={(adminModal.data ? editingCertificate?.credential_id : newCertificate.credential_id) || ""}
                  onChange={(e) => adminModal.data ? setEditingCertificate({ ...editingCertificate, credential_id: e.target.value }) : setNewCertificate({ ...newCertificate, credential_id: e.target.value })}
                  className="bg-surface-high border border-outline rounded-xl p-4 text-xs font-mono focus:border-primary/40 outline-none transition-all uppercase"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Validated Competencies</label>
                <input
                  type="text"
                  placeholder="EX: CLOUD_ARCH, REACT_PRO, SYSTEM_DESIGN..."
                  value={adminModal.data ? (Array.isArray(editingCertificate?.skills) ? editingCertificate.skills.join(', ') : editingCertificate?.skills) : newCertificate.skills}
                  onChange={(e) => adminModal.data ? setEditingCertificate({ ...editingCertificate, skills: e.target.value.split(',').map((s: string) => s.trim().toUpperCase()) }) : setNewCertificate({ ...newCertificate, skills: e.target.value.split(',').map((s: string) => s.trim().toUpperCase()) })}
                  className="bg-surface-high border border-outline rounded-xl p-4 text-xs font-mono focus:border-primary/40 outline-none transition-all uppercase"
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Direct Verification Link</label>
                <input
                  type="text"
                  value={(adminModal.data ? editingCertificate?.verify_link : newCertificate.verify_link) || ""}
                  onChange={(e) => adminModal.data ? setEditingCertificate({ ...editingCertificate, verify_link: e.target.value }) : setNewCertificate({ ...newCertificate, verify_link: e.target.value })}
                  className="bg-surface-high border border-outline rounded-xl p-4 text-xs font-mono focus:border-primary/40 outline-none transition-all"
                />
              </div>

              <div className="flex flex-col md:flex-row items-center justify-between bg-surface-medium p-6 rounded-3xl border border-outline/5 gap-8">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[9px] text-on-surface-muted uppercase font-black tracking-widest leading-none opacity-40">Credential Asset Repository</label>
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, !!adminModal.data)} className="text-[10px] font-mono" />
                </div>
                {(adminModal.data ? editingCertificate?.image_url : newCertificate.image_url) && (
                  <div className="w-24 h-24 bg-void border border-primary/20 p-1.5 rounded-2xl shadow-xl overflow-hidden relative group">
                    <img
                      src={adminModal.data ? editingCertificate?.image_url : newCertificate.image_url}
                      alt="Preview"
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-6 mt-4 items-center">
                <button onClick={closeAdminModal} className="text-[10px] font-black text-on-surface-muted hover:text-on-surface transition-colors uppercase tracking-widest">Abort</button>
                <button
                  onClick={() => {
                    adminModal.data ? handleUpdateCertificate() : handleCreateCertificate();
                    closeAdminModal();
                  }}
                  className="px-12 py-4 bg-primary text-void rounded-2xl font-bold text-[11px] tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/10"
                >
                  {adminModal.data ? 'Synchronize Record' : 'Finalize Credential'}
                </button>
              </div>
            </div>
          )}

          {adminModal.type === 'PROFILE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-sans">
              <div className="flex flex-col gap-8">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-surface-medium border border-outline relative shadow-2xl group">
                  <img src="/assets/profile/operator.jpeg" alt="Julius Silvano" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-void/90 via-void/40 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_10px_rgba(var(--secondary),0.8)]" />
                      <span className="text-[10px] font-black text-white/90 uppercase tracking-[.3em]">Verified Administrative Identity</span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface-medium/50 border border-outline/10 p-6 rounded-2xl flex flex-col gap-2">
                  <span className="text-[9px] text-primary font-black tracking-widest uppercase leading-none opacity-60">System Designation</span>
                  <p className="text-lg font-display font-extrabold text-on-surface leading-tight italic">Lead Software Engineer</p>
                </div>
              </div>

              <div className="flex flex-col gap-10 py-4">
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-primary/60 uppercase tracking-[.3em] leading-none">Administrative Persona</span>
                  <h2 className="text-4xl font-display font-extrabold text-on-surface tracking-tighter leading-none italic">
                    Julius Silvano
                  </h2>
                  <p className="text-sm text-on-surface-muted leading-relaxed font-medium mt-2">
                    Orchestrating high-fidelity digital systems. Bridging the gap between rigorous engineering and expressive design.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {[
                    { label: "Temporal Status", val: "Available for Strategic Partnerships", color: "text-secondary" },
                    { label: "Operational Hub", val: "Quezon City · PH", color: "text-on-surface" },
                    { label: "Response Window", val: "0900 — 1800 PHT", color: "text-on-surface-muted" },
                  ].map(info => (
                    <div key={info.label} className="border-l-2 border-outline/20 pl-5 py-1">
                      <span className="text-[9px] uppercase font-black text-on-surface-muted/60 block mb-1 tracking-widest">{info.label}</span>
                      <p className={cn("text-[13px] font-bold tracking-tight", info.color)}>{info.val}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-5 border border-outline/20 bg-surface-high rounded-2xl shadow-inner group cursor-help">
                  <div className="flex items-center gap-3 mb-3">
                    <ShieldCheck size={16} className="text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-black uppercase tracking-[.2em] text-on-surface">Cryptographic Signature</span>
                  </div>
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <p className="text-[9px] font-mono text-on-surface-muted opacity-40 break-all leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">
                      SHA256: 8A4E9C...DEF1B0X00...F9A1B022...9CDE00
                    </p>
                    <p className="text-[8px] font-mono text-primary/20 uppercase tracking-widest">Identity Verified via Blockchain</p>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={closeAdminModal}
                    className="px-10 py-3 border border-outline text-[10px] font-black text-on-surface-muted hover:text-on-surface hover:border-on-surface transition-all rounded-xl uppercase tracking-widest"
                  >
                    Exit Profile
                  </button>
                </div>
              </div>
            </div>
          )}

          {adminModal.type === 'FEEDBACK_SUMMARY' && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/5 border border-secondary/20 flex items-center justify-center">
                    <Star size={14} className="text-secondary" />
                  </div>
                  <h2 className="text-2xl font-display font-black tracking-tighter text-on-surface uppercase">Feedback Summary</h2>
                </div>
                <p className="text-[10px] text-on-surface-muted uppercase tracking-[.2em] opacity-40 mt-1">Consolidated record of all user experiences</p>
              </div>

              <div className="bg-surface-high border border-outline rounded-2xl overflow-hidden shadow-inner">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-surface-medium border-b border-outline/10">
                  <div className="col-span-2 text-[9px] font-black uppercase tracking-widest text-on-surface-muted opacity-40">ID</div>
                  <div className="col-span-2 text-[9px] font-black uppercase tracking-widest text-on-surface-muted opacity-40">Rating</div>
                  <div className="col-span-6 text-[9px] font-black uppercase tracking-widest text-on-surface-muted opacity-40">Message</div>
                  <div className="col-span-2 text-[9px] font-black uppercase tracking-widest text-on-surface-muted opacity-40 text-right">Date</div>
                </div>
                
                <div className="max-h-[50vh] overflow-y-auto scrollbar-tactical">
                  {feedback.length === 0 ? (
                    <div className="px-6 py-12 text-center text-xs text-on-surface-muted opacity-20 italic uppercase tracking-widest">
                      No feedback records available
                    </div>
                  ) : (
                    feedback.map((f, i) => (
                      <div key={f.id} className={cn(
                        "grid grid-cols-12 gap-4 px-6 py-5 hover:bg-surface-medium transition-all group border-b border-outline/5 last:border-none",
                        i % 2 === 0 ? "bg-surface-low/30" : "bg-transparent"
                      )}>
                        <div className="col-span-2 text-[10px] font-mono font-bold text-on-surface-muted/60 flex items-center">{f.id.split('-')[0].toUpperCase()}</div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span className="text-sm font-display font-black text-secondary leading-none">{String(f.rating).padStart(2, '0')}</span>
                          <div className="hidden sm:flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(dot => (
                              <div key={dot} className={cn("w-1 h-1 rounded-full", dot <= f.rating ? "bg-secondary" : "bg-outline/20")} />
                            ))}
                          </div>
                        </div>
                        <div className="col-span-6 text-[11px] text-on-surface/80 font-medium truncate flex items-center italic">
                          {f.content || "Empty response"}
                        </div>
                        <div className="col-span-2 text-[10px] font-mono text-on-surface-muted/40 text-right flex items-center justify-end">
                          {new Date(f.created_at).toLocaleDateString([], { month: '2-digit', day: '2-digit', year: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-6 items-center pt-2">
                <button 
                  onClick={closeAdminModal}
                  className="px-12 py-3 bg-secondary text-void rounded-xl font-bold text-[11px] tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-secondary/10"
                >
                  Close Summary
                </button>
              </div>
            </div>
          )}
        </div>
      </TacticalModal>
    </div>
  );
}
