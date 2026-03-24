"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "akivot_debug";

/** Check if debug mode is active (URL param or localStorage). Client-only. */
function isDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("debug") === "true") return true;
  try { return localStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
}

export interface DebugControls {
  enabled: boolean;
  /** Offset in seconds added to elapsed timer */
  timeOffset: number;
  /** Force offline simulation (overrides navigator.onLine checks) */
  forceOffline: boolean;
  /** Force walk status returned by checkWalkStatusAction mock */
  forceWalkStatus: string | null;

  addTimeOffset: (minutes: number) => void;
  toggleForceOffline: () => void;
  setForceWalkStatus: (status: string | null) => void;
  reset: () => void;
}

export function useDebugMode(): DebugControls {
  const [enabled, setEnabled] = useState(false);
  const [timeOffset, setTimeOffset] = useState(0);
  const [forceOffline, setForceOffline] = useState(false);
  const [forceWalkStatus, setForceWalkStatus] = useState<string | null>(null);

  useEffect(() => {
    const active = isDebugEnabled();
    setEnabled(active);
    if (active) {
      // Persist so it survives navigations
      try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
      console.log("[debug] Debug mode active");
    }
  }, []);

  const addTimeOffset = useCallback((minutes: number) => {
    setTimeOffset((prev) => prev + minutes * 60);
  }, []);

  const toggleForceOffline = useCallback(() => {
    setForceOffline((prev) => !prev);
  }, []);

  const reset = useCallback(() => {
    setTimeOffset(0);
    setForceOffline(false);
    setForceWalkStatus(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    setEnabled(false);
    console.log("[debug] Debug mode reset");
  }, []);

  return {
    enabled,
    timeOffset,
    forceOffline,
    forceWalkStatus,
    addTimeOffset,
    toggleForceOffline,
    setForceWalkStatus,
    reset,
  };
}
