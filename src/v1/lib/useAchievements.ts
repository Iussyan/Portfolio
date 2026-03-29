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
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window === "undefined") return INITIAL_ACHIEVEMENTS;
    
    const stored = localStorage.getItem("silvano_achievements");
    if (!stored) return INITIAL_ACHIEVEMENTS;
    
    try {
      const parsed: Achievement[] = JSON.parse(stored);
      // Merge INITIAL_ACHIEVEMENTS with stored data to catch any new achievements
      // while preserving the unlockedStatus of existing ones.
      return INITIAL_ACHIEVEMENTS.map(initial => {
        const found = parsed.find(p => p.id === initial.id);
        return found ? { ...initial, unlockedAt: found.unlockedAt } : initial;
      });
    } catch (e) {
      return INITIAL_ACHIEVEMENTS;
    }
  });
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Sync to localStorage when achievements change
  useEffect(() => {
    if (achievements.length > 0) {
      localStorage.setItem("silvano_achievements", JSON.stringify(achievements));
    }
  }, [achievements]);

  const unlockAchievement = useCallback((id: string) => {
    setAchievements((prev) => {
      const index = prev.findIndex((a) => a.id === id);
      if (index === -1 || prev[index].unlockedAt) return prev;

      const updated = [...prev];
      updated[index] = { ...updated[index], unlockedAt: new Date().toISOString() };
      return updated;
    });
  }, []);

  // Effect to detect new unlocks and notify
  const [lastCount, setLastCount] = useState<number | null>(null);
  
  useEffect(() => {
    const unlocked = achievements.filter(a => a.unlockedAt);
    if (lastCount === null) {
      setLastCount(unlocked.length);
      return;
    }

    if (unlocked.length > lastCount) {
      // Find the most recently unlocked achievement
      const latest = [...unlocked].sort((a, b) => 
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
      )[0];
      setNewlyUnlocked(latest);
    }
    setLastCount(unlocked.length);
  }, [achievements, lastCount]);

  const clearNotification = () => setNewlyUnlocked(null);

  return { achievements, unlockAchievement, newlyUnlocked, clearNotification };
}
