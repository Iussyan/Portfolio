"use client";

import { motion } from "framer-motion";

import { cn } from "@v1/lib/utils";
import { Activity, Camera, Download, ExternalLink, Link, Mail, MapPin, MessageCircle, Quote, Radio, Send, Terminal, User } from "lucide-react";
import { useState } from "react";
import { TacticalModal } from "@v1/components/ui/TacticalModal";
import { fadeUp, stagger, item } from "@v1/lib/animations";
import { tacticalAudio } from "@v1/lib/sounds";
import { useEffect } from "react";
import { supabase } from "@v1/lib/supabase";
import { TacticalNotification, NotificationType } from "@v1/components/ui/TacticalNotification";
import { useMetadata } from "@v1/lib/useMetadata";

export default function Contact() {
  const { metadata } = useMetadata();
  const [activeModal, setActiveModal] = useState<{ title: string; subtitle?: string; content: React.ReactNode } | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [feedbackStatus, setFeedbackStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

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

  useEffect(() => {
    tacticalAudio?.comms();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('IDLE');
    tacticalAudio?.click();

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          content: formData.message
        }]);

      if (error) throw error;

      setSubmitStatus('SUCCESS');
      setFormData({ name: "", email: "", subject: "", message: "" });
      tacticalAudio?.success();
      setNotification({
        isOpen: true,
        type: "SUCCESS",
        title: "UPLINK_ESTABLISHED",
        message: "Your message has been successfully transmitted to the operator."
      });
    } catch (err) {
      console.error(err);
      setSubmitStatus('ERROR');
      tacticalAudio?.error();
      setNotification({
        isOpen: true,
        type: "ERROR",
        title: "UPLINK_FAILED",
        message: "Technical error detected. Transmission could not be completed."
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitStatus('IDLE'), 5000);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) return;
    setIsFeedbackSubmitting(true);
    setFeedbackStatus('IDLE');
    tacticalAudio?.click();

    try {
      const { error } = await supabase
        .from('feedback')
        .insert([{
          rating: feedbackRating,
          content: feedbackText
        }]);

      if (error) throw error;

      setFeedbackStatus('SUCCESS');
      setFeedbackRating(0);
      setFeedbackText("");
      tacticalAudio?.success();
      setNotification({
        isOpen: true,
        type: "SUCCESS",
        title: "REPORT_FILED",
        message: "System feedback report has been indexed and stored."
      });
    } catch (err) {
      console.error(err);
      setFeedbackStatus('ERROR');
      tacticalAudio?.error();
      setNotification({
        isOpen: true,
        type: "ERROR",
        title: "SYNC_ERROR",
        message: "Failed to store feedback report in the central database."
      });
    } finally {
      setIsFeedbackSubmitting(false);
      setTimeout(() => setFeedbackStatus('IDLE'), 5000);
    }
  };

  const openContactModal = (node: { label: string; val: string }) => {
    setActiveModal({
      title: node.label,
      subtitle: "CONTACT_METADATA_NODE",
      content: (
        <div className="flex flex-col gap-6 font-mono text-xs uppercase">
          <div className="border-l-2 border-primary pl-4 py-2 bg-primary/5">
            <span className="text-primary font-bold">NODE_STATUS: ONLINE</span>
          </div>
          <p className="text-sm font-bold text-on-surface leading-snug">
            {node.label} IDENTIFIER: <span className="text-secondary">{node.val}</span>
          </p>
          <div className="bg-surface-high p-4 border border-outline/10 text-[10px] text-on-surface-muted italic normal-case">
            This node is a verified transmission channel for the operator. All communications through this vector are logged and encrypted.
          </div>
        </div>
      )
    });
  };

  return (
    <div className="min-h-screen pt-4 pb-12 px-6 scanlines bg-surface">
      <div className="container mx-auto max-w-5xl flex flex-col gap-12">

        {/* Terminal Header */}
        <div className="flex flex-col gap-4">
          <motion.div {...fadeUp(0)} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <span className="text-xs tracking-[0.3em] font-mono text-primary uppercase font-bold">UPLINK_ESTABLISHED</span>
          </motion.div>
          <motion.h1 {...fadeUp(0.1)} className="text-4xl sm:text-6xl font-bold tracking-tighter leading-none hover:glitch-text uppercase" data-text="CONTACT_OPERATOR">
            CONTACT_OPERATOR
          </motion.h1>
          <motion.p {...fadeUp(0.25)} className="text-on-surface-muted text-base leading-relaxed max-w-xl font-sans mt-2">
            Initiate a secure transmission channel for collaboration, inquiries, or system integration.
            Our lines are encrypted and monitored for high-priority traffic.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* 1. Tactical ID Card (Primary Identity) */}
          <motion.div
            variants={fadeUp(0.1)}
            initial="initial"
            animate="animate"
            className="lg:col-span-8 lg:col-start-5 order-1 bg-surface-medium border-l-4 border-primary p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 -rotate-45 translate-x-12 -translate-y-12 group-hover:bg-primary/10 transition-colors" />

            <div className="w-24 h-24 bg-surface-high border-2 border-primary/20 flex items-center justify-center shrink-0 relative">
              <img
                src="/assets/profile/operator.jpeg"
                alt="Operator Profile"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 scanlines opacity-20" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary animate-pulse" />
            </div>

            <div className="flex-1 flex flex-col gap-3 text-center sm:text-left">
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-primary tracking-widest uppercase mb-1">IDENTITY_VERIFIED // IUSSYAN.TECH</span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-on-surface">SILVANO, JULIUS JR. K.</h3>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-on-surface-muted italic">
                  <div className="w-1 h-1 bg-secondary rounded-full" />
                  ROLE: FULLSTACK_DEVELOPER
                </div>
                <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-on-surface-muted italic">
                  <div className="w-1 h-1 bg-secondary rounded-full" />
                  SECTOR: QC_PHILIPPINES
                </div>
              </div>
            </div>

            <a
              href="/assets/profile/business_card.png"
              download="SILVANO_DIGITAL_BUSINESS_CARD.png"
              onClick={() => tacticalAudio?.success()}
              className="btn-tactical btn-tactical-secondary px-6 py-3 sm:py-2 flex items-center gap-2 group/btn select-none touch-manipulation w-full sm:w-auto"
            >
              <Download size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
              <span className="text-[10px] font-black tracking-[0.2em]">EXPORT_IDENTITY_NODE</span>
            </a>
          </motion.div>

          {/* 2nd - 5th Components (Metadata & Social) */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="lg:col-span-4 lg:row-start-1 lg:row-span-3 flex flex-col gap-12 order-2 lg:order-2"
          >
            {/* 2. Contact Details */}
            <motion.div variants={item} className="flex flex-col gap-6 order-2">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase border-l-2 border-primary pl-3">CONTACT DETAILS</h2>

              {[
                { icon: <Mail size={16} />, label: "EMAIL", val: "silvano.julius.kadusale@gmail.com" },
                { icon: <MapPin size={16} />, label: "LOCATION", val: "QC_PHILIPPINES" },
                { icon: <Terminal size={16} />, label: "AVAILABILITY", val: metadata.AVAILABILITY }
              ].map((node) => (
                <div
                  key={node.label}
                  onClick={() => openContactModal(node)}
                  className="flex flex-col gap-1 cursor-pointer group"
                >
                  <div className="flex items-center gap-2 text-primary/60 group-hover:text-primary transition-colors">
                    {node.icon}
                    <span className="text-xs font-mono font-bold tracking-widest">{node.label}</span>
                  </div>
                  <span className="text-base font-bold tracking-tight text-on-surface ml-6 italic group-hover:text-secondary transition-colors underline-offset-4 group-hover:underline">{node.val}</span>
                </div>
              ))}
            </motion.div>

            {/* 3. Signal Transmitters */}
            <motion.div variants={item} className="flex flex-col gap-6 order-3">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase border-l-2 border-secondary pl-3">SIGNAL_TRANSMITTERS</h2>
              <div className="grid grid-cols-2 gap-px bg-outline/5 border border-outline/10 overflow-hidden">
                {[
                  { icon: <Link size={18} />, label: "LINKEDIN", url: "https://linkedin.com/in/silvano-julius-jr-k-570947353" },
                  { icon: <Terminal size={18} />, label: "GITHUB", url: "https://github.com/Iussyan" },
                  { icon: <MessageCircle size={18} />, label: "FACEBOOK", url: "https://www.facebook.com/iussyan" },
                  { icon: <Camera size={18} />, label: "INSTAGRAM", url: "https://www.instagram.com/iuss.yan" }
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => tacticalAudio?.blip()}
                    className="flex flex-col items-center justify-center p-6 bg-surface-low hover:bg-surface-high transition-all group relative overflow-hidden text-center"
                  >
                    <div className="text-primary/40 group-hover:text-primary transition-colors mb-2">
                      {social.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-[0.2em] text-on-surface-muted group-hover:text-on-surface transition-colors">{social.label}</span>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/20 group-hover:border-primary transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* 4. Channels Open Box */}
            <motion.div variants={item} className="bg-surface-high p-6 flex flex-col gap-4 -mt-2 relative order-4">
              <div className="hud-marker" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary font-mono select-none">UPLINK_CHANNELS_OPEN</span>
              </div>
              <p className="text-xs text-on-surface-muted leading-relaxed uppercase tracking-tight">
                Operator is currently active and accepting mission inquiries. Response time synchronized
                to current sector workload.
              </p>
            </motion.div>

            {/* 5. Feedback Uplink */}
            <motion.div variants={item} className="flex flex-col gap-6 bg-surface-low border border-outline/10 p-6 relative order-5">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2">
                <Activity size={14} className="text-primary" />
                FEEDBACK_UPLINK
              </h2>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-on-surface-muted uppercase tracking-widest italic">SYSTEM_RATING</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        onMouseEnter={() => tacticalAudio?.blip()}
                        onClick={() => { setFeedbackRating(level); tacticalAudio?.success(); }}
                        className={`h-6 flex-1 border transition-all ${feedbackRating >= level
                          ? "bg-primary/20 border-primary"
                          : "bg-surface-high border-outline/20 hover:border-primary/40"
                          }`}
                      >
                        <div className={`w-full h-full ${feedbackRating >= level ? "animate-pulse bg-primary/30" : ""}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <textarea
                    placeholder="BRIEF_SYSTEM_ANALYSIS..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    disabled={isFeedbackSubmitting}
                    className="w-full bg-surface-high border border-outline/10 p-3 text-[10px] font-mono focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-muted/20 resize-none h-20 uppercase disabled:opacity-50"
                  />
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={isFeedbackSubmitting || feedbackRating === 0}
                    className="btn-tactical btn-tactical-primary py-2 text-[10px] font-black tracking-widest disabled:opacity-50 relative overflow-hidden"
                  >
                    {isFeedbackSubmitting ? "PROCESSING_DATA..." :
                      feedbackStatus === 'SUCCESS' ? "REPORT_STORED" :
                        feedbackStatus === 'ERROR' ? "UPLINK_FAILED" : "SUBMIT_REPORT"}
                    {isFeedbackSubmitting && (
                      <motion.div
                        className="absolute inset-0 bg-primary/20"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 6. Uplink Form */}
          <motion.div
            variants={fadeUp(0.25)}
            initial="initial"
            animate="animate"
            className="lg:col-span-8 lg:col-start-5 order-6 bg-surface-low border border-outline/10 p-0 relative overflow-hidden"
          >
            {/* Form Header / Status Bar */}
            <div className="bg-surface-medium border-b border-outline/10 px-8 py-3 flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-muted/60">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
                  <span className="text-primary">SECURE_CHANNEL_v4.2</span>
                </div>
                <span className="hidden sm:inline">//</span>
                <span className="hidden sm:inline">BUFF: READY</span>
              </div>
              <div className="flex items-center gap-4">
                <span>ENC: AES-256</span>
                <div className="w-10 h-1.5 bg-outline/10 relative overflow-hidden hidden sm:block">
                  <motion.div
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-primary/20 w-1/3"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 relative">
              <div className="absolute top-0 left-0 w-8 h-px bg-primary/40" />
              <div className="absolute top-0 left-0 w-px h-8 bg-primary/40" />
              <div className="absolute bottom-0 right-0 w-8 h-px bg-secondary/40" />
              <div className="absolute bottom-0 right-0 w-px h-8 bg-secondary/40" />

              <form className="flex flex-col gap-10" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex flex-col gap-2 group">
                    <div className="flex items-center justify-between px-1">
                      <label htmlFor="name" className="text-[10px] font-bold tracking-[0.2em] text-on-surface-muted uppercase group-focus-within:text-primary transition-colors">TRANSMITTER_ID</label>
                      <span className="text-[9px] font-mono text-primary/0 group-focus-within:text-primary/40 transition-colors">REQ*</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isSubmitting}
                        placeholder="NAME // IDENTITY"
                        className="w-full bg-surface-high/50 border-l border-outline/20 p-4 text-sm font-mono focus:border-primary focus:bg-surface-high focus:outline-none transition-all placeholder:text-on-surface-muted/10 disabled:opacity-50"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-px bg-primary group-focus-within:w-full transition-all duration-300" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 group">
                    <div className="flex items-center justify-between px-1">
                      <label htmlFor="email" className="text-[10px] font-bold tracking-[0.2em] text-on-surface-muted uppercase group-focus-within:text-primary transition-colors">E_MAIL_ADDRESS</label>
                      <span className="text-[9px] font-mono text-primary/0 group-focus-within:text-primary/40 transition-colors">REQ*</span>
                    </div>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={isSubmitting}
                        placeholder="NAME@DOMAIN.COM"
                        className="w-full bg-surface-high/50 border-l border-outline/20 p-4 text-sm font-mono focus:border-primary focus:bg-surface-high focus:outline-none transition-all placeholder:text-on-surface-muted/10 disabled:opacity-50"
                      />
                      <div className="absolute bottom-0 left-0 w-0 h-px bg-primary group-focus-within:w-full transition-all duration-300" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 group">
                  <div className="flex items-center justify-between px-1">
                    <label htmlFor="subject" className="text-[10px] font-bold tracking-[0.2em] text-on-surface-muted uppercase group-focus-within:text-primary transition-colors">SUBJECT_LINE</label>
                    <span className="text-[9px] font-mono text-primary/0 group-focus-within:text-primary/40 transition-colors">REQ*</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="MISSION_QUERY // COLLABORATIVE_SYNC"
                      className="w-full bg-surface-high/50 border-l border-outline/20 p-4 text-sm font-mono focus:border-primary focus:bg-surface-high focus:outline-none transition-all placeholder:text-on-surface-muted/10 disabled:opacity-50"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-px bg-primary group-focus-within:w-full transition-all duration-300" />
                  </div>
                </div>

                <div className="flex flex-col gap-2 group">
                  <div className="flex items-center justify-between px-1">
                    <label htmlFor="message" className="text-[10px] font-bold tracking-[0.2em] text-on-surface-muted uppercase group-focus-within:text-primary transition-colors">DATA_PACKET_CONTENT</label>
                    <span className="text-[9px] font-mono text-primary/0 group-focus-within:text-primary/40 transition-colors">REQ*</span>
                  </div>
                  <div className="relative">
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      disabled={isSubmitting}
                      placeholder="ENTER_MESSAGE_BODY_HERE..."
                      className="w-full bg-surface-high/50 border-l border-outline/20 p-4 text-sm font-mono focus:border-primary focus:bg-surface-high focus:outline-none transition-all placeholder:text-on-surface-muted/10 resize-none disabled:opacity-50"
                    />
                    <div className="absolute bottom-0 left-0 w-0 h-px bg-primary group-focus-within:w-full transition-all duration-300" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="hidden sm:flex flex-col gap-0.5 opacity-30 select-none">
                    <span className={cn(
                      "text-[8px] font-mono font-bold tracking-[0.3em] uppercase",
                      submitStatus === 'SUCCESS' ? "text-secondary" :
                        submitStatus === 'ERROR' ? "text-tertiary" : "text-on-surface-muted"
                    )}>
                      {submitStatus === 'SUCCESS' ? "TRANSMISSION_SUCCESSFUL" :
                        submitStatus === 'ERROR' ? "TRANSMISSION_FAILED" : "SYSTEM_READY"}
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                          key={i}
                          className={cn(
                            "w-1.5 h-1.5 transition-colors duration-500",
                            submitStatus === 'SUCCESS' ? "bg-secondary" :
                              submitStatus === 'ERROR' ? "bg-tertiary" : "bg-primary/40"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-tactical btn-tactical-primary group flex items-center gap-3 px-8 h-12 disabled:opacity-50 relative overflow-hidden"
                  >
                    <div className="flex flex-col items-start leading-none">
                      <span className="text-xs font-black uppercase tracking-widest">
                        {isSubmitting ? "TRANSMITTING..." :
                          submitStatus === 'SUCCESS' ? "UPLINK_COMPLETE" :
                            submitStatus === 'ERROR' ? "RETRY_UPLINK" : "SEND MESSAGE"}
                      </span>
                      <span className="text-[8px] font-mono opacity-50 uppercase tracking-tighter">
                        {isSubmitting ? "DUMPING_PACKETS" : "INIT_UPLINK"}
                      </span>
                    </div>
                    <Send size={16} className={cn(
                      "transition-transform",
                      isSubmitting ? "animate-pulse" : "group-hover:translate-x-1 group-hover:-translate-y-1"
                    )} />
                    {isSubmitting && (
                      <motion.div
                        className="absolute inset-0 bg-primary/10"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* 7. Operator Quote Card */}
          <motion.div
            variants={fadeUp(0.3)}
            initial="initial"
            animate="animate"
            className="lg:col-span-8 lg:col-start-5 order-7 bg-surface-medium border border-outline/10 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-12 bg-primary/20" />
            <Quote size={40} className="text-primary/10 mb-6" />
            <p className="text-lg sm:text-2xl font-black italic tracking-tight text-on-surface-muted/80 uppercase leading-none max-w-2xl px-4">
              "ADAPT TO THE VOID, INTEGRATE THE SIGNAL, AND LEAVE NO TRACE BUT THE CODE THAT REMAINS."
            </p>
            <div className="mt-8 flex items-center gap-3 opacity-30">
              <div className="w-8 h-px bg-on-surface-muted" />
              <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase">JOURNEY_SUMMATION</span>
              <div className="w-8 h-px bg-on-surface-muted" />
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/5 blur-3xl rounded-full" />
          </motion.div>

        </div>
      </div>

      <TacticalNotification
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        className="fixed top-22 left-1/2 -translate-x-1/2 z-[9999]"
      />

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
