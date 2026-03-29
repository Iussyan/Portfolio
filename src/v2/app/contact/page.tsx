"use client";

import { motion } from "framer-motion";
import { Camera, Download, ExternalLink as LinkedInIcon, Link2, Mail, MapPin, MessageCircle, Send, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { TacticalModal } from "@v2/components/ui/TacticalModal";
import { TacticalNotification, NotificationType } from "@v2/components/ui/TacticalNotification";
import { fadeUp, stagger, item } from "@v2/lib/animations";
import { tacticalAudio } from "@v2/lib/sounds";
import { supabase } from "@v2/lib/supabase";
import { useMetadata } from "@v2/lib/useMetadata";

export default function Contact() {
  const { metadata } = useMetadata();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ isOpen: boolean; type: NotificationType; title: string; message: string }>({
    isOpen: false, type: "INFO", title: "", message: "",
  });

  useEffect(() => { tacticalAudio?.comms(); }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    tacticalAudio?.click();
    try {
      const { error } = await supabase.from("messages").insert([{
        name: formData.name, email: formData.email, subject: formData.subject, content: formData.message,
      }]);
      if (error) throw error;
      setFormData({ name: "", email: "", subject: "", message: "" });
      tacticalAudio?.success();
      setNotification({ isOpen: true, type: "SUCCESS", title: "Message Sent", message: "I'll get back to you within 24-48 hours." });
    } catch {
      tacticalAudio?.error();
      setNotification({ isOpen: true, type: "ERROR", title: "Send Failed", message: "Please try again or contact me directly." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) return;
    setIsFeedbackSubmitting(true);
    try {
      const { error } = await supabase.from("feedback").insert([{ rating: feedbackRating, content: feedbackText }]);
      if (error) throw error;
      setFeedbackRating(0);
      setFeedbackText("");
      tacticalAudio?.success();
      setNotification({ isOpen: true, type: "SUCCESS", title: "Feedback Received", message: "Thank you for your feedback!" });
    } catch {
      setNotification({ isOpen: true, type: "ERROR", title: "Failed to Submit", message: "Could not save feedback." });
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };

  const socials = [
    { icon: <Link2 size={18} />, label: "LinkedIn", url: "https://linkedin.com/in/silvano-julius-jr-k-570947353", color: "text-primary" },
    { icon: <LinkedInIcon size={18} />, label: "GitHub", url: "https://github.com/Iussyan", color: "text-on-surface" },
    { icon: <MessageCircle size={18} />, label: "Facebook", url: "https://www.facebook.com/iussyan", color: "text-secondary" },
    { icon: <Camera size={18} />, label: "Instagram", url: "https://www.instagram.com/iuss.yan", color: "text-tertiary" },
  ];

  return (
    <div className="min-h-screen pt-8 pb-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <motion.span {...fadeUp(0)} className="section-label text-primary/60">04 — Contact</motion.span>
          <motion.h1 {...fadeUp(0.05)} className="font-display text-5xl sm:text-6xl font-extrabold tracking-normal leading-tight">
            Let's build<br />
            <span className="text-primary">something great.</span>
          </motion.h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── Left column ──────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-4">

            {/* Identity card */}
            <motion.div {...fadeUp(0.05)} className="glow-card p-6 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 shrink-0">
                  <img src="/assets/profile/operator.jpeg" alt="Julius" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-on-surface">Julius Silvano</h2>
                  <p className="text-xs font-mono text-primary mt-0.5">Full-Stack Developer</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-3 border-t border-outline">
                <div className="flex items-center gap-2 text-xs text-on-surface-muted">
                  <Mail size={12} className="text-primary/60 shrink-0" />
                  silvano.julius.kadusale@gmail.com
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-muted">
                  <MapPin size={12} className="text-primary/60 shrink-0" />
                  Quezon City, Philippines
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-muted">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {metadata.AVAILABILITY || "Open to opportunities"}
                </div>
              </div>
              <a
                href="/assets/profile/business_card.png"
                download="SILVANO_CARD.png"
                onClick={() => tacticalAudio?.success()}
                className="btn-ghost px-4 py-2 text-sm flex items-center justify-center gap-2 w-full"
              >
                <Download size={14} /> Download Card
              </a>
            </motion.div>

            {/* Socials */}
            <motion.div {...fadeUp(0.1)} className="bento-card flex flex-col gap-3">
              <span className="section-label">Socials</span>
              <div className="grid grid-cols-2 gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => tacticalAudio?.blip()}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-surface-low hover:bg-surface-medium border border-outline hover:border-primary/20 transition-all group"
                  >
                    <span className={`${s.color} group-hover:scale-110 transition-transform`}>{s.icon}</span>
                    <span className="text-xs font-display font-medium text-on-surface-muted group-hover:text-on-surface transition-colors">{s.label}</span>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Feedback */}
            <motion.div {...fadeUp(0.15)} className="bento-card flex flex-col gap-4">
              <span className="section-label">Rate this Portfolio</span>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => { setFeedbackRating(n); tacticalAudio?.success(); }}
                    className={`flex-1 py-2 text-lg transition-all rounded-lg ${feedbackRating >= n
                      ? "text-primary bg-primary/10 border border-primary/30"
                      : "text-on-surface-muted/30 hover:text-on-surface-muted border border-outline"
                      }`}
                  >
                    <Star size={16} className="mx-auto" fill={feedbackRating >= n ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Optional: share your thoughts..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                disabled={isFeedbackSubmitting}
                className="w-full bg-surface-medium border border-outline rounded-lg p-3 text-sm font-sans text-on-surface placeholder:text-on-surface-muted/30 focus:border-primary/40 focus:outline-none resize-none h-20 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleFeedbackSubmit}
                disabled={isFeedbackSubmitting || feedbackRating === 0}
                className="btn-ghost px-4 py-2 text-sm disabled:opacity-40 w-full"
              >
                {isFeedbackSubmitting ? "Submitting…" : "Submit Feedback"}
              </button>
            </motion.div>
          </div>

          {/* ── Right column: Form ──────────────────── */}
          <motion.div
            {...fadeUp(0.1)}
            className="lg:col-span-8 glow-card p-6 sm:p-8 flex flex-col gap-6"
          >
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-display font-bold text-xl text-on-surface">Send a message</h3>
                <p className="text-xs font-mono text-on-surface-muted mt-1">Direct communication channel for professional inquiries.</p>
              </div>

              <div className="p-6 border-l-2 border-primary/20 bg-primary/5 rounded-r-xl mb-4 mt-4">
                <p className="text-sm italic text-on-surface-muted leading-relaxed">
                  "Code is not just logic; it's the bridge between a vision and its reality. I build bridges that last."
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-4 h-px bg-primary/30" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60">My Philosophy</span>
                </div>
              </div>
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: "name", label: "Your Name", placeholder: "John Doe", type: "text", key: "name" },
                  { id: "email", label: "Email Address", placeholder: "you@example.com", type: "email", key: "email" },
                ].map((f) => (
                  <div key={f.id} className="flex flex-col gap-2 group">
                    <label htmlFor={f.id} className="section-label group-focus-within:text-primary transition-colors">{f.label}</label>
                    <input
                      type={f.type}
                      id={f.id}
                      required
                      placeholder={f.placeholder}
                      value={(formData as any)[f.key]}
                      onChange={(e) => setFormData(prev => ({ ...prev, [f.key]: e.target.value }))}
                      disabled={isSubmitting}
                      className="bg-surface-medium border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted/30 focus:border-primary/40 focus:outline-none focus:bg-surface-high transition-all disabled:opacity-50"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 group">
                <label htmlFor="subject" className="section-label group-focus-within:text-primary transition-colors">Subject</label>
                <input
                  type="text"
                  id="subject"
                  required
                  placeholder="Project inquiry, collaboration..."
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  disabled={isSubmitting}
                  className="bg-surface-medium border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted/30 focus:border-primary/40 focus:outline-none focus:bg-surface-high transition-all disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-2 group">
                <label htmlFor="message" className="section-label group-focus-within:text-primary transition-colors">Message</label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  placeholder="Tell me about your idea, project, or just say hi..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  disabled={isSubmitting}
                  className="bg-surface-medium border border-outline rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-muted/30 focus:border-primary/40 focus:outline-none focus:bg-surface-high transition-all resize-none disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary self-end px-8 py-3 text-sm gap-2.5 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? "Sending…" : "Send Message"}
                {!isSubmitting && <Send size={14} />}
              </button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Notification */}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <TacticalNotification
          isOpen={notification.isOpen}
          onClose={() => setNotification(p => ({ ...p, isOpen: false }))}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          className="pointer-events-auto"
        />
      </div>
    </div>
  );
}
