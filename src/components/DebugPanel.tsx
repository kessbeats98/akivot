"use client";

import { useState, useEffect } from "react";
import type { DebugControls } from "@/lib/hooks/useDebugMode";
import {
  createTestDogAction,
  assignWalkerToSelfAction,
  setTestPriceAction,
  resetTestDataAction,
  listOwnedDogsAction,
} from "@/app/dev/actions";

interface Props {
  debug: DebugControls;
  /** Extra state info to display */
  info?: Record<string, string | number | boolean | null>;
  /** Optional seed callback — renders "Seed Data" button when provided */
  onSeed?: () => Promise<void>;
  /** Called after any test action that changes data */
  onRefresh?: () => void;
}

export function DebugPanel({ debug, info, onSeed, onRefresh }: Props) {
  const [seedState, setSeedState] = useState<"idle" | "loading" | "done">("idle");
  const [testOpen, setTestOpen] = useState(false);

  if (!debug.enabled) return null;

  const handleSeed = async () => {
    if (!onSeed || seedState === "loading") return;
    setSeedState("loading");
    try {
      await onSeed();
      setSeedState("done");
    } catch (err) {
      console.error("[debug] seed failed:", err);
      setSeedState("idle");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: 8,
        zIndex: 9999,
        background: "rgba(0,0,0,0.88)",
        color: "#e5e5e5",
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 11,
        fontFamily: "monospace",
        maxWidth: 260,
        lineHeight: 1.5,
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#4ade80" }}>DEBUG</div>

      {info && (
        <div style={{ marginBottom: 6, borderBottom: "1px solid #333", paddingBottom: 4 }}>
          {Object.entries(info).map(([k, v]) => (
            <div key={k}>
              <span style={{ color: "#888" }}>{k}:</span> {String(v ?? "—")}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <button onClick={() => debug.addTimeOffset(30)} style={btnStyle}>
          +30 min
        </button>
        <button onClick={() => debug.addTimeOffset(60)} style={btnStyle}>
          +60 min
        </button>
        <button onClick={() => debug.toggleForceOffline()} style={btnStyle}>
          {debug.forceOffline ? "Offline: ON" : "Offline: OFF"}
        </button>
        <button
          onClick={() =>
            debug.setForceWalkStatus(
              debug.forceWalkStatus === "COMPLETED" ? null : "COMPLETED",
            )
          }
          style={btnStyle}
        >
          {debug.forceWalkStatus ? `Status: ${debug.forceWalkStatus}` : "Force COMPLETED"}
        </button>
        {onSeed && (
          <button
            onClick={handleSeed}
            disabled={seedState === "loading"}
            style={{ ...btnStyle, color: seedState === "done" ? "#4ade80" : "#60a5fa" }}
          >
            {seedState === "loading" ? "Seeding..." : seedState === "done" ? "Seeded!" : "Seed Data"}
          </button>
        )}

        {/* Test Mode toggle */}
        <button
          onClick={() => setTestOpen((p) => !p)}
          style={{ ...btnStyle, color: "#fbbf24", borderColor: "#fbbf24" }}
        >
          {testOpen ? "- Test Mode" : "+ Test Mode"}
        </button>

        {testOpen && <TestModePanel onRefresh={onRefresh} />}

        <button onClick={() => debug.reset()} style={{ ...btnStyle, color: "#f87171" }}>
          Reset Debug
        </button>
      </div>
    </div>
  );
}

// --- Test Mode sub-panel ---

interface DogRow {
  dogId: string;
  dogName: string;
  walkerId: string | null;
}

function TestModePanel({ onRefresh }: { onRefresh?: () => void }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [dogName, setDogName] = useState("");
  const [ownedDogs, setOwnedDogs] = useState<DogRow[]>([]);
  const [selectedDog, setSelectedDog] = useState("");
  const [price, setPrice] = useState("50");

  const refreshDogs = async () => {
    try {
      const dogs = await listOwnedDogsAction();
      setOwnedDogs(dogs);
      if (dogs.length > 0 && !selectedDog) setSelectedDog(dogs[0]!.dogId);
    } catch (err) {
      console.error("[test-mode] listOwnedDogs failed:", err);
    }
  };

  // Load dogs on mount
  useEffect(() => {
    refreshDogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = async (label: string, fn: () => Promise<void>) => {
    if (loading) return;
    setLoading(true);
    setStatus(`${label}...`);
    try {
      await fn();
      setStatus(`${label} OK`);
      await refreshDogs();
      onRefresh?.();
    } catch (err) {
      setStatus(`ERR: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const currentDog = ownedDogs.find((d) => d.dogId === selectedDog);

  return (
    <div style={{ borderTop: "1px solid #fbbf24", paddingTop: 6, marginTop: 2 }}>
      <div style={{ color: "#fbbf24", fontWeight: 700, marginBottom: 4 }}>TEST MODE</div>

      {/* Status line */}
      {status && (
        <div style={{ color: status.startsWith("ERR") ? "#f87171" : "#4ade80", marginBottom: 4, wordBreak: "break-all" }}>
          {status}
        </div>
      )}

      {/* 1. Create dog */}
      <div style={{ marginBottom: 6 }}>
        <div style={labelStyle}>Create Dog</div>
        <div style={{ display: "flex", gap: 3 }}>
          <input
            type="text"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            placeholder="name"
            style={inputStyle}
          />
          <button
            onClick={() =>
              run("Create dog", async () => {
                await createTestDogAction(dogName);
                setDogName("");
              })
            }
            disabled={loading}
            style={btnStyle}
          >
            +
          </button>
        </div>
      </div>

      {/* Dog selector */}
      {ownedDogs.length > 0 && (
        <div style={{ marginBottom: 6 }}>
          <div style={labelStyle}>Select Dog</div>
          <select
            value={selectedDog}
            onChange={(e) => setSelectedDog(e.target.value)}
            style={{ ...inputStyle, width: "100%" }}
          >
            {ownedDogs.map((d) => (
              <option key={d.dogId} value={d.dogId}>
                {d.dogName} {d.walkerId ? "(assigned)" : "(no walker)"}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 2. Assign self as walker */}
      {currentDog && !currentDog.walkerId && (
        <button
          onClick={() =>
            run("Assign walker", async () => {
              await assignWalkerToSelfAction(selectedDog);
            })
          }
          disabled={loading}
          style={{ ...btnStyle, marginBottom: 4, width: "100%" }}
        >
          Assign me as walker
        </button>
      )}

      {/* 3. Set price */}
      {currentDog?.walkerId && (
        <div style={{ marginBottom: 6 }}>
          <div style={labelStyle}>Set Price (ILS)</div>
          <div style={{ display: "flex", gap: 3 }}>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              style={inputStyle}
            />
            <button
              onClick={() =>
                run("Set price", async () => {
                  await setTestPriceAction(currentDog.walkerId!, price);
                })
              }
              disabled={loading}
              style={btnStyle}
            >
              Set
            </button>
          </div>
        </div>
      )}

      {/* 4. Reset all test data */}
      <button
        onClick={() =>
          run("Reset", async () => {
            const { deleted } = await resetTestDataAction();
            const summary = Object.entries(deleted)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => `${k}:${v}`)
              .join(" ");
            setStatus(`Reset OK — ${summary || "nothing to delete"}`);
            setOwnedDogs([]);
            setSelectedDog("");
          })
        }
        disabled={loading}
        style={{ ...btnStyle, color: "#f87171", borderColor: "#f87171", width: "100%" }}
      >
        Reset ALL Test Data
      </button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 4,
  color: "#e5e5e5",
  padding: "4px 6px",
  cursor: "pointer",
  fontSize: 11,
  textAlign: "left" as const,
};

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: 4,
  color: "#e5e5e5",
  padding: "3px 6px",
  fontSize: 11,
  fontFamily: "monospace",
  flex: 1,
  minWidth: 0,
};

const labelStyle: React.CSSProperties = {
  color: "#888",
  fontSize: 10,
  marginBottom: 2,
};
