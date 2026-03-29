"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type CoreVersion = "v1" | "v2";

interface VersionContextType {
  version: CoreVersion;
  isTransitioning: boolean;
  toggleVersion: () => void;
  setVersion: (v: CoreVersion) => void;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export function VersionProvider({ children }: { children: React.ReactNode }) {
  const [version, setVersionState] = useState<CoreVersion>("v2"); // Glacier (V2) is default
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("portfolio-version") as CoreVersion;
    if (saved && (saved === "v1" || saved === "v2")) {
      setVersionState(saved);
      document.documentElement.setAttribute("data-core", saved);
    } else {
      document.documentElement.setAttribute("data-core", "v2");
    }
  }, []);

  const setVersion = (v: CoreVersion) => {
    setVersionState(v);
    localStorage.setItem("portfolio-version", v);
    document.documentElement.setAttribute("data-core", v);
  };

  const toggleVersion = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Phase 1: Peak of animation (600ms) - Swap the core
    setTimeout(() => {
      const next = version === "v1" ? "v2" : "v1";
      setVersion(next);
    }, 600);

    // Phase 2: Completion (1500ms) - End transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
  };

  if (!mounted) return null;

  return (
    <VersionContext.Provider value={{ version, toggleVersion, setVersion, isTransitioning }}>
      {children}
    </VersionContext.Provider>
  );
}

export const useVersion = () => {
  const context = useContext(VersionContext);
  if (context === undefined) {
    throw new Error("useVersion must be used within a VersionProvider");
  }
  return context;
};
