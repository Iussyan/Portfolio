"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useVisitorCount() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!supabase) return;

    // 1. Increment count on mount (once per session to avoid refresh-spam)
    const increment = async () => {
      const hasIndexed = sessionStorage.getItem("silvano_visitor_indexed");
      if (hasIndexed) return;

      await supabase.rpc('increment_visitor_count');
      sessionStorage.setItem("silvano_visitor_indexed", "true");
    };

    // 2. Fetch initial count
    const fetchCount = async () => {
      const { data } = await supabase
        .from('metadata')
        .select('value')
        .eq('key', 'VISITOR_COUNT')
        .single();
      
      if (data) setCount(parseInt(data.value));
    };

    increment().then(() => fetchCount());

    // 3. Subscribe to real-time updates
    const channel = supabase
      .channel('metadata_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'metadata',
          filter: 'key=eq.VISITOR_COUNT',
        },
        (payload: { new: { value: string } }) => {
          setCount(parseInt(payload.new.value));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
