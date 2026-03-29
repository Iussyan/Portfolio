"use client";

import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export type MetadataMap = {
  OPERATOR_STATUS: string;
  AVAILABILITY: string;
  CURRENT_MISSION: string;
  DATA_INTEGRITY: string;
  [key: string]: string;
};

export function useMetadata() {
  const [metadata, setMetadata] = useState<MetadataMap>({
    OPERATOR_STATUS: "ACTIVE",
    AVAILABILITY: "ACTIVE_SYNCHRONOUS",
    CURRENT_MISSION: "PORTFOLIO_OPTIMIZATION",
    DATA_INTEGRITY: "100%",
  });
  const [loading, setLoading] = useState(true);

  const fetchMetadata = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("metadata")
        .select("key, value");

      if (error) throw error;

      if (data) {
        const map: MetadataMap = { ...metadata };
        data.forEach((item: { key: string; value: string }) => {
          map[item.key] = item.value;
        });
        setMetadata(map);
      }
    } catch (err) {
      console.error("Error fetching metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();

    if (!supabase) return;

    let channel: any;
    try {
      // Subscribe to changes
      channel = supabase
        .channel("metadata_changes")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "metadata" },
          (payload: any) => {
            setMetadata((prev) => ({
              ...prev,
              [payload.new.key]: payload.new.value,
            }));
          }
        )
        .subscribe();
    } catch (err) {
      console.error("Error setting up metadata subscription:", err);
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return { metadata, loading, refresh: fetchMetadata };
}
