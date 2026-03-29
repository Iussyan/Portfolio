"use client";

import { useEffect, useState } from "react";
import { supabase } from "@v2/lib/supabase";

export function Footer() {
  const [visitors, setVisitors] = useState<number | null>(null);

  useEffect(() => {
    const fetchAndIncrement = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("visitors")
          .select("count")
          .single();
        
        if (!error && data) {
           const newCount = data.count + 1;
           setVisitors(newCount);
           // Using upsup to handle the update on current session
           await supabase.from("visitors").update({ count: newCount }).eq("id", 1);
        }
      } catch (err) {
        console.error("Visitors fetch error", err);
      }
    };
    fetchAndIncrement();
  }, []);

  return (
    <footer className="border-t border-outline py-5 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-on-surface-muted/50">
        <span>© {new Date().getFullYear()} Julius Silvano. All rights reserved.</span>
        <div className="flex items-center gap-4">
          {visitors !== null && (
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/50" />
              {visitors.toLocaleString()} visitors
            </span>
          )}
          <span>Built with Next.js · Supabase</span>
        </div>
      </div>
    </footer>
  );
}
