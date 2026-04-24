"use client";

import { useEffect, useState, type ReactNode } from "react";
import type {
  OrchestratorProcessSnapshot,
  OrchestratorSnapshot,
  OrchestratorTaskSnapshot,
} from "@/lib/orchestrator/dashboard-types";

interface Props {
  initialData: OrchestratorSnapshot;
}

const POLL_MS = 4000;

function timeLabel(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function statusClass(status: string): string {
  switch (status) {
    case "success":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "running":
      return "bg-sky-100 text-sky-800 border-sky-200";
    case "waiting_approval":
      return "bg-amber-100 text-amber-900 border-amber-200";
    case "blocked":
    case "failed":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-stone-100 text-stone-700 border-stone-200";
  }
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-sm font-black tracking-wide text-stone-700 uppercase">{children}</h2>;
}

function ProcessCard({ process }: { process: OrchestratorProcessSnapshot }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-stone-900">{process.name}</div>
          <div className="text-xs text-stone-500">PID {process.pid} · {timeLabel(process.startedAt)}</div>
        </div>
        {process.taskIds.length > 0 && (
          <div className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700">
            {process.taskIds.join(", ")}
          </div>
        )}
      </div>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-stone-950/95 p-3 text-[11px] leading-5 text-stone-100">
        {process.command || "No command line available"}
      </pre>
    </div>
  );
}

function ArtifactBlock({
  label,
  artifact,
}: {
  label: string;
  artifact: OrchestratorTaskSnapshot["preflight"] | OrchestratorTaskSnapshot["result"];
}) {
  if (!artifact) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-500">
        אין artifact עבור {label}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-bold text-stone-700">{label}</div>
        <div className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusClass(artifact.status)}`}>
          {artifact.status}
        </div>
      </div>
      <div className="mt-1 text-[11px] text-stone-500">
        {artifact.phase} · {timeLabel(artifact.updatedAt)}
      </div>
      <div className="mt-3 text-sm leading-6 text-stone-800">{artifact.summary || "No summary"}</div>
      {artifact.items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {artifact.items.map((item) => (
            <span
              key={item}
              className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700"
            >
              {item}
            </span>
          ))}
        </div>
      )}
      <div className="mt-3 font-mono text-[11px] text-stone-500">{artifact.path}</div>
    </div>
  );
}

function TaskCard({ task }: { task: OrchestratorTaskSnapshot }) {
  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-stone-500">{task.id}</div>
          <div className="mt-1 text-lg font-black leading-6 text-stone-900">{task.title}</div>
          <div className="mt-2 text-xs text-stone-500">
            {task.workflow} · {task.requiresPreflight ? "preflight" : "direct"} · {timeLabel(task.latestUpdatedAt)}
          </div>
        </div>
        <div className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusClass(task.inferredStatus)}`}>
          {task.inferredStatus}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-stone-950 px-4 py-3 font-mono text-[11px] text-stone-100">
        {task.taskPath}
      </div>

      <div className="mt-4 grid gap-3">
        {task.requiresPreflight && <ArtifactBlock label="Preflight" artifact={task.preflight} />}
        <ArtifactBlock label="Result" artifact={task.result} />
      </div>
    </div>
  );
}

export function OrchestratorDashboardClient({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
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

    void refresh();
    const intervalId = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_38%),linear-gradient(180deg,_#fcfcf9_0%,_#f5f5f0_100%)] px-4 pb-16 pt-6">
      <div className="mb-6 rounded-[32px] border border-stone-200 bg-white/90 p-5 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">Akivot Orchestrator</div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-950">דשבורד ריצה פשוט</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              מציג tasks, preflight, result, git snapshot, ותהליכים פעילים של Claude / run_claude.
            </p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-right">
            <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">עודכן</div>
            <div className="mt-1 font-mono text-xs text-stone-900">{timeLabel(data.generatedAt)}</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-teal-50 px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-teal-700">Branch</div>
            <div className="mt-1 font-mono text-sm font-bold text-teal-950">{data.git.branch}</div>
          </div>
          <div className="rounded-2xl bg-stone-100 px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-stone-600">HEAD</div>
            <div className="mt-1 font-mono text-sm font-bold text-stone-900">{data.git.head}</div>
          </div>
          <div className="rounded-2xl bg-amber-50 px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-amber-700">Tasks</div>
            <div className="mt-1 text-sm font-bold text-amber-950">{data.tasks.length}</div>
          </div>
          <div className="rounded-2xl bg-sky-50 px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-sky-700">Processes</div>
            <div className="mt-1 text-sm font-bold text-sky-950">{data.activeProcesses.length}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Latest Commit</div>
          <div className="mt-1 font-mono text-xs leading-5 text-stone-900">{data.git.latestCommit}</div>
        </div>

        {data.git.dirtyFiles.length > 0 && (
          <div className="mt-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Dirty Files</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.git.dirtyFiles.map((file) => (
                <span
                  key={file}
                  className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 font-mono text-[11px] text-stone-700"
                >
                  {file}
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            שגיאת רענון: {error}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <section className="space-y-3">
          <SectionTitle>Processes</SectionTitle>
          {data.activeProcesses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-5 text-sm text-stone-500">
              כרגע לא זוהו תהליכי `run_claude.py` או `claude-code`.
            </div>
          ) : (
            <div className="space-y-3">
              {data.activeProcesses.map((process) => (
                <ProcessCard key={`${process.pid}-${process.startedAt ?? "na"}`} process={process} />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <SectionTitle>Tasks</SectionTitle>
          {data.tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/70 px-4 py-5 text-sm text-stone-500">
              עדיין אין tasks תחת `.orchestrator/tasks`.
            </div>
          ) : (
            <div className="space-y-4">
              {data.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
