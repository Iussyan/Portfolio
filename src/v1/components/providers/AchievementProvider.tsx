"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAchievements, Achievement } from "@v1/lib/useAchievements";
import { TacticalNotification } from "@v1/components/ui/TacticalNotification";
import { AnimatePresence } from "framer-motion";

interface AchievementContextType {
  unlockAchievement: (id: string) => void;
  achievements: Achievement[];
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const { achievements, unlockAchievement, newlyUnlocked, clearNotification } = useAchievements();
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);

  useEffect(() => {
    if (newlyUnlocked) {
      setNotificationQueue((prev) => [...prev, newlyUnlocked]);
      clearNotification();
    }
  }, [newlyUnlocked, clearNotification]);

  const removeNotification = (id: string) => {
    setNotificationQueue((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <AchievementContext.Provider value={{ achievements, unlockAchievement }}>
      {children}
      
      {/* Achievement Notifications Stack */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notificationQueue.map((a) => (
            <TacticalNotification
              key={a.id}
              isOpen={true}
              onClose={() => removeNotification(a.id)}
              type="SUCCESS"
              title="ACHIEVEMENT_UNLOCKED"
              message={`${a.title}: ${a.description}`}
              duration={6000}
            />
          ))}
        </AnimatePresence>
      </div>
    </AchievementContext.Provider>
  );
}

export function useAchievement() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error("useAchievement must be used within an AchievementProvider");
  }
  return context;
}
