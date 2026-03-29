"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeId = "dark" | "light";

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("dark");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check local storage for saved theme on mount
    const saved = localStorage.getItem("operator-theme");
    
    // Map V1 theme names to V2
    let initialTheme: ThemeId = "dark";
    if (saved === "light" || saved === "professional") {
      initialTheme = "light";
    } else if (saved === "dark" || saved === "tactical") {
      initialTheme = "dark";
    }

    setThemeState(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
    
    if (initialTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.remove("theme-professional"); // Clear V1 potential class
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const setTheme = (newTheme: ThemeId) => {
    if (isTransitioning || newTheme === theme) return;
    
    // Start transition
    setIsTransitioning(true);
    
    // Switch theme halfway through the glitch animation
    setTimeout(() => {
      setThemeState(newTheme);
      localStorage.setItem("operator-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      
      if (newTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.remove("theme-professional"); // Clear V1 potential class
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    }, 50); // Reduced delay for immediate feel

    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 600); // 600ms total transition duration
  };


  return (
    <ThemeContext.Provider value={{ theme, setTheme, isTransitioning }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
