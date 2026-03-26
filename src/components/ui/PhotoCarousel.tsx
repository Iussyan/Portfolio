"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { tacticalAudio } from "@/lib/sounds";

interface PhotoCarouselProps {
  images: string[];
}

export function PhotoCarousel({ images }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  if (!images || images.length === 0) return null;

  const next = () => {
    setIndex((prev) => (prev + 1) % images.length);
    tacticalAudio?.blip();
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + images.length) % images.length);
    tacticalAudio?.blip();
  };

  // Auto-slide effect
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [images.length, isPaused, index]); // Reset interval when index changes (manual or auto)

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative group w-full bg-surface-high border border-outline/20 overflow-hidden flex flex-col max-h-[70vh]"
    >
      {/* HUD Index Overlay */}
      <div className="absolute top-2 left-3 z-20 flex flex-col font-mono pointer-events-none">
        <span className="text-[10px] text-primary font-bold tracking-widest uppercase">IMAGE_SOURCE</span>
        <span className="text-secondary text-xs font-black">[{String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}]</span>
      </div>

      {/* Main Image View */}
      <div className="relative w-full aspect-4/3 sm:aspect-video flex items-center justify-center overflow-hidden bg-black/60">
        <AnimatePresence mode="wait">
          <motion.img
            key={index}
            src={images[index]}
            initial={{ opacity: 0, scale: 1.05, filter: "brightness(0)" }}
            animate={{ opacity: 1, scale: 1, filter: "brightness(1)" }}
            exit={{ opacity: 0, scale: 0.95, filter: "brightness(0)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full object-cover opacity-90"
            alt={`Event Image ${index + 1}`}
          />
        </AnimatePresence>

        {/* Scanlines Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20 scanlines" />

        {/* Navigation Controls */}
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-between px-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="w-10 h-10 bg-surface/80 border border-primary/20 flex items-center justify-center text-primary backdrop-blur-sm hover:bg-primary hover:text-surface transition-all"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="w-10 h-10 bg-surface/80 border border-primary/20 flex items-center justify-center text-primary backdrop-blur-sm hover:bg-primary hover:text-surface transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Corner HUD Markers */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-secondary/40" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-secondary/40" />
      </div>

      {/* Footer / Telemetry */}
      <div className="h-6 bg-surface-medium border-t border-outline/10 flex items-center justify-between px-3 text-[9px] font-mono font-bold text-on-surface-muted/60 uppercase tracking-tighter">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-secondary animate-pulse" />
          <span>REALTIME_VISUAL_SYNC // {isPaused ? "PAUSED" : "ACTIVE"}</span>
        </div>
        <div className="flex items-center gap-3">
          <span>CH: 01</span>
          <Maximize2 size={10} className="text-secondary/40" />
        </div>
      </div>
    </div>
  );
}
