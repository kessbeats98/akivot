"use client";

import { useEffect, useRef, useState } from "react";
import type { OrchestratorSnapshot } from "@/lib/orchestrator/dashboard-types";

interface Props {
  initialData: OrchestratorSnapshot;
}

const POLL_MS = 4000;

export function OrchestratorDashboardClientLive({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const terminalRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    const node = terminalRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [data.liveLogTail]);

  async function refresh() {
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/dev/orchestrator", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const next = (await response.json()) as OrchestratorSnapshot;
      setData(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function refreshSafely() {
      try {
        const response = await fetch("/api/dev/orchestrator", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const next = (await response.json()) as OrchestratorSnapshot;
        if (!cancelled) {
          setData(next);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    }

    void refreshSafely();
    const intervalId = window.setInterval(() => {
      void refreshSafely();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black p-3">
      <div className="flex h-[calc(100vh-24px)] flex-col rounded-[28px] border border-stone-800 bg-stone-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 px-4 py-3 font-mono text-[11px] text-stone-400">
          <div>live://codex-gstack-claude</div>
          <div className="flex items-center gap-3">
            {error && <span className="text-rose-400">error: {error}</span>}
            <button
              type="button"
              onClick={() => {
                void refresh();
              }}
              disabled={isRefreshing}
              className="rounded-lg border border-stone-700 px-2 py-1 text-stone-200 transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "refreshing" : "refresh"}
            </button>
          </div>
        </div>
        <div className="flex-1 p-3">
          <div className="h-full rounded-[22px] border border-stone-800 bg-black p-3">
            <pre
              ref={terminalRef}
              className="h-full overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-stone-100"
            >
              {data.liveLogTail.join("\n")}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
