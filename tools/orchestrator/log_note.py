#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime, timezone
from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def runtime_log_dir(root: Path) -> Path:
    return root / ".orchestrator" / "logs"


def task_runtime_log_dir(root: Path) -> Path:
    return runtime_log_dir(root) / "tasks"


def live_runtime_log_path(root: Path) -> Path:
    return runtime_log_dir(root) / "live.log"


def task_runtime_log_path(root: Path, task_id: str) -> Path:
    return task_runtime_log_dir(root) / f"{task_id}.log"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Append a Codex/GStack operational log line.")
    parser.add_argument("--task-id", default="SESSION", help="Task id or session bucket.")
    parser.add_argument("--stage", default="orchestration", help="Logical stage label.")
    parser.add_argument("--source", default="codex", help="Source label, for example codex or gstack.")
    parser.add_argument("--message", required=True, help="Log message.")
    return parser.parse_args()


def append_runtime_log(root: Path, task_id: str, stage: str, source: str, message: str) -> None:
    log_root = runtime_log_dir(root)
    task_root = task_runtime_log_dir(root)
    log_root.mkdir(parents=True, exist_ok=True)
    task_root.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now(timezone.utc).isoformat()
    sanitized = " ".join(message.splitlines()).strip()
    line = f"{timestamp} [{task_id}] [{stage}] [{source}] {sanitized}\n"
    for path in (live_runtime_log_path(root), task_runtime_log_path(root, task_id)):
        with path.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(line)


def main() -> int:
    args = parse_args()
    append_runtime_log(repo_root(), args.task_id, args.stage, args.source, args.message)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
