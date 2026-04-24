export interface OrchestratorArtifactSnapshot {
  path: string;
  updatedAt: string;
  status: string;
  phase: string;
  summary: string;
  items: string[];
}

export interface OrchestratorEventSnapshot {
  timestamp: string;
  taskId: string;
  stage: string;
  event: string;
  status: string | null;
  pid: number | null;
  details: Record<string, unknown>;
}

export interface OrchestratorTaskSnapshot {
  id: string;
  title: string;
  workflow: string;
  requiresPreflight: boolean;
  taskPath: string;
  taskUpdatedAt: string;
  inferredStatus: string;
  latestUpdatedAt: string;
  preflight: OrchestratorArtifactSnapshot | null;
  result: OrchestratorArtifactSnapshot | null;
}

export interface OrchestratorProcessSnapshot {
  pid: number;
  name: string;
  startedAt: string | null;
  command: string;
  taskIds: string[];
}

export interface OrchestratorGitSnapshot {
  branch: string;
  head: string;
  latestCommit: string;
  dirtyFiles: string[];
}

export interface OrchestratorSnapshot {
  generatedAt: string;
  tasks: OrchestratorTaskSnapshot[];
  activeProcesses: OrchestratorProcessSnapshot[];
  git: OrchestratorGitSnapshot;
  recentEvents: OrchestratorEventSnapshot[];
  liveLogTail: string[];
}
