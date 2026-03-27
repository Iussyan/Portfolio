"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "tactical" | "professional";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("tactical");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Check local storage for saved theme on mount
    const savedTheme = localStorage.getItem("operator-theme") as Theme;
    if (savedTheme === "professional" || savedTheme === "tactical") {
      setTheme(savedTheme);
      if (savedTheme === "professional") {
        document.documentElement.classList.add("theme-professional");
      }
    }
  }, []);

  const toggleTheme = () => {
    if (isTransitioning) return;
    
    // Start transition
    setIsTransitioning(true);
    
    // Switch theme halfway through the glitch animation
    setTimeout(() => {
      setTheme((prev) => {
        const newTheme = prev === "tactical" ? "professional" : "tactical";
        localStorage.setItem("operator-theme", newTheme);
        
        if (newTheme === "professional") {
          document.documentElement.classList.add("theme-professional");
        } else {
          document.documentElement.classList.remove("theme-professional");
        }
        
        return newTheme;
      });
    }, 200); // 200ms into the transition

    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 800); // 800ms total transition duration
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isTransitioning }}>
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
