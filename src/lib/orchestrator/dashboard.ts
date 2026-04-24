import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type {
  OrchestratorArtifactSnapshot,
  OrchestratorEventSnapshot,
  OrchestratorGitSnapshot,
  OrchestratorProcessSnapshot,
  OrchestratorSnapshot,
  OrchestratorTaskSnapshot,
} from "./dashboard-types";

const execFileAsync = promisify(execFile);

type FrontmatterValue = string | boolean | string[];

interface TaskFrontmatter {
  id: string;
  title: string;
  workflow: string;
  requires_preflight: boolean;
  result_contract_path: string;
}

interface ParsedTaskFile {
  frontmatter: TaskFrontmatter;
  taskPath: string;
  taskUpdatedAt: string;
}

interface RawArtifactData {
  status?: unknown;
  phase?: unknown;
  summary?: unknown;
  files_changed?: unknown;
  files_to_touch?: unknown;
}

interface RawEventData {
  timestamp?: unknown;
  task_id?: unknown;
  stage?: unknown;
  event?: unknown;
  status?: unknown;
  pid?: unknown;
  details?: unknown;
}

function summarizeEventDetails(
  event: string,
  details: Record<string, unknown>,
): Record<string, unknown> {
  if (event === "dry_run") {
    const command = Array.isArray(details.command) ? details.command : [];
    return {
      commandPreview: command
        .map((part) => (typeof part === "string" ? part : ""))
        .filter(Boolean)
        .map((part, index) => (index === 3 ? "<generated prompt>" : part))
        .slice(0, 8),
    };
  }

  return details;
}

async function loadLiveLogTail(limit = 120): Promise<string[]> {
  const logPath = path.join(orchestratorRoot(), "logs", "live.log");
  try {
    const text = await fs.readFile(logPath, "utf-8");
    return text
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .slice(-limit);
  } catch {
    return [];
  }
}

function repoRoot(): string {
  return process.cwd();
}

function orchestratorRoot(): string {
  return path.join(repoRoot(), ".orchestrator");
}

function relativePath(filePath: string): string {
  return path.relative(repoRoot(), filePath).replace(/\\/g, "/");
}

async function statIso(filePath: string): Promise<string | null> {
  try {
    const stat = await fs.stat(filePath);
    return stat.mtime.toISOString();
  } catch {
    return null;
  }
}

function parseScalar(raw: string): FrontmatterValue {
  const text = raw.trim();
  if (text === "true") return true;
  if (text === "false") return false;
  if (text === "[]") return [];
  return text;
}

function parseFrontmatter(text: string): Record<string, FrontmatterValue> {
  const lines = text.replace(/^\ufeff/, "").split("\n");
  if (lines[0]?.trim() !== "---") {
    throw new Error("Task file must start with frontmatter");
  }

  const endIndex = lines.slice(1).findIndex((line) => line.trim() === "---");
  if (endIndex === -1) {
    throw new Error("Task file frontmatter is not closed");
  }

  const parsed: Record<string, FrontmatterValue> = {};
  let currentListKey: string | null = null;
  for (const rawLine of lines.slice(1, endIndex + 1)) {
    const line = rawLine.trimEnd();
    const stripped = line.trim();
    if (!stripped) continue;

    if (stripped.startsWith("- ")) {
      if (currentListKey === null) continue;
      const existing = parsed[currentListKey];
      if (Array.isArray(existing)) {
        existing.push(stripped.slice(2).trim());
      }
      continue;
    }

    const separatorIndex = stripped.indexOf(":");
    if (separatorIndex === -1) continue;

    const key = stripped.slice(0, separatorIndex).trim();
    const value = stripped.slice(separatorIndex + 1).trim();
    if (value === "") {
      parsed[key] = [];
      currentListKey = key;
      continue;
    }

    parsed[key] = parseScalar(value);
    currentListKey = null;
  }

  return parsed;
}

async function loadTaskFiles(): Promise<ParsedTaskFile[]> {
  const tasksDir = path.join(orchestratorRoot(), "tasks");
  let entries: string[] = [];
  try {
    entries = await fs.readdir(tasksDir);
  } catch {
    return [];
  }

  const taskFiles = entries.filter((entry) => entry.endsWith(".md"));
  const loaded = await Promise.all(
    taskFiles.map(async (entry) => {
      const fullPath = path.join(tasksDir, entry);
      const taskUpdatedAt = (await statIso(fullPath)) ?? new Date(0).toISOString();
      const text = await fs.readFile(fullPath, "utf-8");
      const parsed = parseFrontmatter(text);

      const frontmatter: TaskFrontmatter = {
        id: String(parsed.id ?? entry.replace(/\.md$/, "")),
        title: String(parsed.title ?? entry.replace(/\.md$/, "")),
        workflow: String(parsed.workflow ?? "unknown"),
        requires_preflight: Boolean(parsed.requires_preflight),
        result_contract_path: String(
          parsed.result_contract_path ?? `.orchestrator/results/${String(parsed.id ?? entry.replace(/\.md$/, ""))}.json`,
        ),
      };

      return {
        frontmatter,
        taskPath: relativePath(fullPath),
        taskUpdatedAt,
      };
    }),
  );

  return loaded.sort((a, b) => b.taskUpdatedAt.localeCompare(a.taskUpdatedAt));
}

function normalizeArtifactItems(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === "string" ? item : ""))
    .filter((item) => item.length > 0)
    .slice(0, 6);
}

async function loadArtifact(filePath: string): Promise<OrchestratorArtifactSnapshot | null> {
  try {
    const text = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(text) as RawArtifactData;
    const items = normalizeArtifactItems(parsed.files_changed ?? parsed.files_to_touch);
    return {
      path: relativePath(filePath),
      updatedAt: (await statIso(filePath)) ?? new Date(0).toISOString(),
      status: typeof parsed.status === "string" ? parsed.status : "unknown",
      phase: typeof parsed.phase === "string" ? parsed.phase : "unknown",
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      items,
    };
  } catch {
    return null;
  }
}

function toEventSnapshot(raw: RawEventData): OrchestratorEventSnapshot | null {
  if (typeof raw.timestamp !== "string") return null;
  if (typeof raw.task_id !== "string") return null;
  if (typeof raw.stage !== "string") return null;
  if (typeof raw.event !== "string") return null;

  return {
    timestamp: raw.timestamp,
    taskId: raw.task_id,
    stage: raw.stage,
    event: raw.event,
    status: typeof raw.status === "string" ? raw.status : null,
    pid: typeof raw.pid === "number" ? raw.pid : Number(raw.pid ?? 0) || null,
    details:
      typeof raw.details === "object" && raw.details !== null
        ? summarizeEventDetails(raw.event, raw.details as Record<string, unknown>)
        : {},
  };
}

async function loadRecentEvents(limit = 30): Promise<OrchestratorEventSnapshot[]> {
  const eventsDir = path.join(orchestratorRoot(), "events");
  let entries: string[] = [];
  try {
    entries = await fs.readdir(eventsDir);
  } catch {
    return [];
  }

  const files = entries
    .filter((entry) => entry.endsWith(".jsonl"))
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 3);

  const loaded = await Promise.all(
    files.map(async (entry) => {
      const fullPath = path.join(eventsDir, entry);
      const text = await fs.readFile(fullPath, "utf-8");
      return text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          try {
            return toEventSnapshot(JSON.parse(line) as RawEventData);
          } catch {
            return null;
          }
        })
        .filter((item): item is OrchestratorEventSnapshot => item !== null);
    }),
  );

  return loaded
    .flat()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

async function runCommand(command: string, args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync(command, args, {
      cwd: repoRoot(),
      windowsHide: true,
      timeout: 4_000,
      maxBuffer: 1024 * 1024,
    });
    return stdout.trim();
  } catch {
    return "";
  }
}

async function loadGitSnapshot(): Promise<OrchestratorGitSnapshot> {
  const [branch, head, latestCommit, dirty] = await Promise.all([
    runCommand("git", ["branch", "--show-current"]),
    runCommand("git", ["rev-parse", "--short", "HEAD"]),
    runCommand("git", ["log", "--oneline", "-1"]),
    runCommand("git", ["status", "--short"]),
  ]);

  return {
    branch: branch || "unknown",
    head: head || "unknown",
    latestCommit: latestCommit || "unknown",
    dirtyFiles: dirty
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 12),
  };
}

function toProcessArray(raw: unknown): Array<Record<string, unknown>> {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null);
  if (typeof raw === "object") return [raw as Record<string, unknown>];
  return [];
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || value.length === 0) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString();
}

async function loadActiveProcesses(): Promise<OrchestratorProcessSnapshot[]> {
  if (process.platform !== "win32") return [];

  const script = [
    "$items = Get-CimInstance Win32_Process |",
    "  Where-Object { $_.CommandLine -match 'run_claude.py|claude-code|cli.js' } |",
    "  Select-Object ProcessId, Name, CreationDate, CommandLine;",
    "$items | ConvertTo-Json -Compress",
  ].join(" ");

  const stdout = await runCommand("powershell.exe", ["-NoProfile", "-Command", script]);
  if (!stdout) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(stdout);
  } catch {
    return [];
  }

  return toProcessArray(parsed)
    .map((item) => {
      const command = typeof item.CommandLine === "string" ? item.CommandLine : "";
      const taskIds = Array.from(new Set(command.match(/TASK-[A-Z0-9-]+/g) ?? []));
      return {
        pid: typeof item.ProcessId === "number" ? item.ProcessId : Number(item.ProcessId ?? 0),
        name: typeof item.Name === "string" ? item.Name : "unknown",
        startedAt: normalizeDate(item.CreationDate),
        command: command.length > 220 ? `${command.slice(0, 217)}...` : command,
        taskIds,
      } satisfies OrchestratorProcessSnapshot;
    })
    .filter((item) => item.pid > 0)
    .sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
}

function inferTaskStatus(
  taskId: string,
  preflight: OrchestratorArtifactSnapshot | null,
  result: OrchestratorArtifactSnapshot | null,
  activeProcesses: OrchestratorProcessSnapshot[],
): string {
  const hasActiveProcess = activeProcesses.some((process) => process.taskIds.includes(taskId));
  if (hasActiveProcess) return "running";
  if (result) return result.status;
  if (preflight) {
    return preflight.status === "ready_for_approval" ? "waiting_approval" : preflight.status;
  }
  return "task_ready";
}

function latestTimestamp(...values: Array<string | null>): string {
  const filtered = values.filter((value): value is string => Boolean(value));
  if (filtered.length === 0) return new Date(0).toISOString();
  return filtered.sort((a, b) => b.localeCompare(a))[0]!;
}

export async function loadOrchestratorSnapshot(): Promise<OrchestratorSnapshot> {
  const [tasks, activeProcesses, git, recentEvents, liveLogTail] = await Promise.all([
    loadTaskFiles(),
    loadActiveProcesses(),
    loadGitSnapshot(),
    loadRecentEvents(),
    loadLiveLogTail(),
  ]);

  const taskSnapshots = await Promise.all(
    tasks.map(async (task): Promise<OrchestratorTaskSnapshot> => {
      const resultPath = path.join(repoRoot(), task.frontmatter.result_contract_path);
      const preflightPath = resultPath.replace(/\.json$/, ".preflight.json");
      const [preflight, result] = await Promise.all([
        loadArtifact(preflightPath),
        loadArtifact(resultPath),
      ]);

      return {
        id: task.frontmatter.id,
        title: task.frontmatter.title,
        workflow: task.frontmatter.workflow,
        requiresPreflight: task.frontmatter.requires_preflight,
        taskPath: task.taskPath,
        taskUpdatedAt: task.taskUpdatedAt,
        inferredStatus: inferTaskStatus(task.frontmatter.id, preflight, result, activeProcesses),
        latestUpdatedAt: latestTimestamp(task.taskUpdatedAt, preflight?.updatedAt ?? null, result?.updatedAt ?? null),
        preflight,
        result,
      };
    }),
  );

  taskSnapshots.sort((a, b) => b.latestUpdatedAt.localeCompare(a.latestUpdatedAt));

  return {
    generatedAt: new Date().toISOString(),
    tasks: taskSnapshots,
    activeProcesses,
    git,
    recentEvents,
    liveLogTail,
  };
}
