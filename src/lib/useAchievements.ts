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
      try {
        const parsed = JSON.parse(stored);
        setAchievements(parsed);
      } catch (e) {
        setAchievements(INITIAL_ACHIEVEMENTS);
      }
    } else {
      setAchievements(INITIAL_ACHIEVEMENTS);
    }
  }, []);

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
      const newlyUnlockedAch = { ...updated[index], unlockedAt: new Date().toISOString() };
      updated[index] = newlyUnlockedAch;
      
      // We set newlyUnlocked here, it's safer as it's not nested in a complex way 
      // but still we'll move it out of the return if possible.
      // Actually, setting another state during a state update is allowed if it's not circular,
      // but let's use the effect approach.
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
