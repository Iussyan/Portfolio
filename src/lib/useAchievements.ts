"use client";

import { useState, useEffect, useCallback } from "react";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  unlockedAt?: string;
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: "SYSTEM_ONLINE", title: "SYSTEM_ONLINE", description: "Successfully established primary uplink to the portfolio." },
  { id: "INTEL_RECON", title: "INTEL_RECON", description: "Accessed the restricted operator dossier (About page)." },
  { id: "MISSION_ANALYST", title: "MISSION_ANALYST", description: "Dived deep into deployed mission data." },
  { id: "GHOST_SIGNAL", title: "GHOST_SIGNAL", description: "Discovered a hidden tactical sub-routine." },
  { id: "THEME_OVERRIDE", title: "THEME_OVERRIDE", description: "Manually synchronized tactical visual protocols." },
];

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("silvano_achievements");
    if (stored) {
      setAchievements(JSON.parse(stored));
    } else {
      setAchievements(INITIAL_ACHIEVEMENTS);
    }
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      const index = prev.findIndex((a) => a.id === id);
      if (index === -1 || prev[index].unlockedAt) return prev;

      const updated = [...prev];
      updated[index] = { ...updated[index], unlockedAt: new Date().toISOString() };
      
      localStorage.setItem("silvano_achievements", JSON.stringify(updated));
      setNewlyUnlocked(updated[index]);
      
      return updated;
    });
  }, []);

  const clearNotification = () => setNewlyUnlocked(null);

  return { achievements, unlockAchievement, newlyUnlocked, clearNotification };
}
