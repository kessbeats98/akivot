#!/usr/bin/env python3
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
import shutil
import subprocess
import sys
import textwrap
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid5


REQUIRED_FRONTMATTER_FIELDS = {
    "id",
    "title",
    "created_by",
    "workflow",
    "mode",
    "requires_preflight",
    "branch",
    "base_commit",
    "status",
    "priority",
    "result_contract_path",
}

REQUIRED_RESULT_FIELDS = {
    "id",
    "status",
    "phase",
    "summary",
    "files_changed",
    "commands_run",
    "tests_run",
    "tests_passed",
    "tests_failed",
    "blockers",
    "scope_deviations",
    "follow_up_recommendation",
}

REQUIRED_PREFLIGHT_FIELDS = {
    "id",
    "status",
    "phase",
    "summary",
    "files_to_touch",
    "commands_to_run",
    "validation_plan",
    "risks",
    "scope_deviations",
    "blockers",
    "follow_up_recommendation",
}

VALID_RESULT_STATUSES = {"success", "partial", "blocked", "failed"}
VALID_PREFLIGHT_STATUSES = {"ready_for_approval", "blocked", "failed"}
RESULT_LIST_FIELDS = (
    "files_changed",
    "commands_run",
    "tests_run",
    "tests_passed",
    "tests_failed",
    "blockers",
    "scope_deviations",
)
PREFLIGHT_LIST_FIELDS = (
    "files_to_touch",
    "commands_to_run",
    "validation_plan",
    "risks",
    "scope_deviations",
    "blockers",
)

DEFAULT_ALLOWED_TOOLS = "Read,Grep,Glob,Write,Edit,MultiEdit,Bash"
DEFAULT_MAX_PREFLIGHT_REVISIONS = 2
VALID_EXECUTION_CHANNELS = {"auto", "headless", "session"}


class ContractError(RuntimeError):
    pass


@dataclass
class TaskContract:
    path: Path
    frontmatter: dict[str, Any]
    body: str
    sections: dict[str, str]

    @property
    def task_id(self) -> str:
        return str(self.frontmatter["id"])

    @property
    def result_contract_path(self) -> str:
        return str(self.frontmatter["result_contract_path"])

    @property
    def task_size(self) -> str:
        raw = self.frontmatter.get("task_size", "standard")
        return str(raw).strip().lower() or "standard"

    @property
    def claude_execution_mode(self) -> str:
        raw = self.frontmatter.get("claude_execution_mode", "auto")
        return str(raw).strip().lower() or "auto"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run a structured Claude Code execution task from a task contract."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--task", help="Path to a task contract markdown file.")
    group.add_argument(
        "--task-id",
        help="Task id to resolve from .orchestrator/tasks/<TASK_ID>.md",
    )
    parser.add_argument(
        "--claude-bin",
        default="claude",
        help="Claude Code CLI binary name or path. Default: claude",
    )
    parser.add_argument(
        "--allowed-tools",
        default=DEFAULT_ALLOWED_TOOLS,
        help="Comma-separated Claude tools allowlist.",
    )
    parser.add_argument(
        "--bare",
        action="store_true",
        help=(
            "Pass --bare to Claude. Use this only for API-key-based automation or other "
            "fully explicit environments. Subscription/OAuth auth may not work in bare mode."
        ),
    )
    parser.add_argument(
        "--persist-session",
        action="store_false",
        dest="no_session_persistence",
        help="Allow Claude session persistence. Default behavior is ephemeral runs.",
    )
    parser.set_defaults(no_session_persistence=True)
    parser.add_argument(
        "--permission-mode",
        default=None,
        help="Optional Claude permission mode override.",
    )
    parser.add_argument(
        "--execution-channel",
        choices=("auto", "headless", "session"),
        default="auto",
        help=(
            "How Claude should run for this task. 'auto' uses the task contract and task_size "
            "policy, 'headless' uses ephemeral -p runs, 'session' uses a persisted Claude session."
        ),
    )
    parser.add_argument(
        "--dangerously-skip-permissions",
        action="store_true",
        help="Pass --dangerously-skip-permissions to Claude. Use only in trusted sandboxes.",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=1200,
        help="Maximum Claude execution time in seconds. Default: 1200",
    )
    parser.add_argument(
        "--skip-auth-check",
        action="store_true",
        help="Skip the Claude auth status probe before execution.",
    )
    parser.add_argument(
        "--approve-preflight",
        action="store_true",
        help=(
            "For tasks that require preflight effectively (explicitly or via task_size), "
            "execute only after a valid preflight plan already exists."
        ),
    )
    parser.add_argument(
        "--approval-note",
        default="",
        help="Optional approval note to embed in the approved execution prompt.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Validate the task contract and print the Claude invocation without running it.",
    )
    parser.add_argument(
        "--summary-format",
        choices=("text", "json"),
        default="text",
        help="Transport summary output format. Default: text",
    )
    parser.add_argument(
        "--max-preflight-revisions",
        type=int,
        default=DEFAULT_MAX_PREFLIGHT_REVISIONS,
        help="Maximum Codex review correction rounds for preflight plans. Default: 2",
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print extra diagnostic details, including the generated prompt.",
    )
    return parser.parse_args()


def repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def ensure_path_within_repo(root: Path, raw_path: str) -> Path:
    resolved = (root / raw_path).resolve()
    root_resolved = root.resolve()
    try:
        resolved.relative_to(root_resolved)
    except ValueError as exc:
        raise ContractError(f"path escapes repo root: {raw_path}") from exc
    return resolved


def parse_scalar(raw: str) -> Any:
    text = raw.strip()
    if text == "":
        return ""
    if text in {"true", "false"}:
        return text == "true"
    if text == "[]":
        return []
    if text.startswith('"') and text.endswith('"'):
        return text[1:-1]
    if text.startswith("'") and text.endswith("'"):
        return text[1:-1]
    return text


def parse_frontmatter(frontmatter: str) -> dict[str, Any]:
    parsed: dict[str, Any] = {}
    current_list_key: str | None = None

    for raw_line in frontmatter.splitlines():
        line = raw_line.rstrip()
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue

        if stripped.startswith("- "):
            if current_list_key is None:
                raise ContractError(f"list item without list key in frontmatter: {raw_line}")
            parsed.setdefault(current_list_key, []).append(stripped[2:].strip())
            continue

        if ":" not in stripped:
            raise ContractError(f"invalid frontmatter line: {raw_line}")

        key, value = stripped.split(":", 1)
        key = key.strip()
        value = value.strip()

        if value == "":
            parsed[key] = []
            current_list_key = key
            continue

        parsed[key] = parse_scalar(value)
        current_list_key = None

    return parsed


def split_frontmatter(text: str) -> tuple[dict[str, Any], str]:
    lines = text.lstrip("\ufeff").splitlines()
    if not lines or lines[0].strip() != "---":
        raise ContractError("task contract must start with YAML frontmatter")

    try:
        end_index = lines[1:].index("---") + 1
    except ValueError as exc:
        raise ContractError("task contract frontmatter is not closed") from exc

    frontmatter_text = "\n".join(lines[1:end_index])
    body = "\n".join(lines[end_index + 1 :]).strip()
    return parse_frontmatter(frontmatter_text), body


def parse_sections(body: str) -> dict[str, str]:
    sections: dict[str, list[str]] = {}
    current_heading: str | None = None

    for line in body.splitlines():
        stripped = line.strip()
        if stripped.startswith("#"):
            heading = stripped.lstrip("#").strip().lower()
            current_heading = heading
            sections.setdefault(current_heading, [])
            continue

        if current_heading is not None:
            sections[current_heading].append(line)

    return {key: "\n".join(value).strip() for key, value in sections.items()}


def list_from_section(sections: dict[str, str], name: str) -> list[str]:
    body = sections.get(name.lower(), "")
    items: list[str] = []
    for raw_line in body.splitlines():
        stripped = raw_line.strip()
        if stripped.startswith("- "):
            items.append(stripped[2:].strip())
    return items


def load_task_contract(task_path: Path) -> TaskContract:
    text = task_path.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(text)
    sections = parse_sections(body)
    return TaskContract(path=task_path, frontmatter=frontmatter, body=body, sections=sections)


def resolve_preflight_contract_path(
    task: TaskContract,
    root: Path,
    result_path: Path,
) -> Path:
    raw_path = task.frontmatter.get("preflight_contract_path")
    if raw_path:
        return ensure_path_within_repo(root, str(raw_path))
    suffix = result_path.suffix or ".json"
    return result_path.with_name(f"{result_path.stem}.preflight{suffix}")


def validate_task_contract(
    task: TaskContract,
    root: Path,
) -> tuple[Path, Path | None, list[str], list[str]]:
    missing = sorted(REQUIRED_FRONTMATTER_FIELDS - set(task.frontmatter))
    if missing:
        raise ContractError(f"task contract missing frontmatter fields: {', '.join(missing)}")

    if task.frontmatter["mode"] != "direct_execute":
        raise ContractError("run_claude.py currently supports only mode=direct_execute")
    if task.frontmatter["status"] != "ready_for_executor":
        raise ContractError("task contract status must be ready_for_executor")
    if task.claude_execution_mode not in VALID_EXECUTION_CHANNELS:
        raise ContractError(
            "claude_execution_mode must be one of: "
            + ", ".join(sorted(VALID_EXECUTION_CHANNELS))
        )

    required_sections = [
        "goal",
        "context",
        "scope",
        "out of scope",
        "allowed files",
        "blocked files",
        "execution instructions",
        "validation",
        "expected deliverables",
    ]
    missing_sections = [name for name in required_sections if name not in task.sections]
    if missing_sections:
        raise ContractError(
            "task contract missing sections: " + ", ".join(missing_sections)
        )

    result_path = ensure_path_within_repo(root, task.result_contract_path)
    preflight_path = None
    if effective_requires_preflight(task):
        preflight_path = resolve_preflight_contract_path(task, root, result_path)
    allowed_files = list_from_section(task.sections, "allowed files")
    blocked_files = list_from_section(task.sections, "blocked files")

    if not allowed_files:
        raise ContractError("allowed files section must not be empty")

    return result_path, preflight_path, allowed_files, blocked_files


def effective_requires_preflight(task: TaskContract) -> bool:
    explicit = bool(task.frontmatter["requires_preflight"])
    if explicit:
        return True
    return task.task_size != "tiny"


def effective_execution_channel(
    task: TaskContract,
    args: argparse.Namespace,
) -> tuple[str, str]:
    if args.execution_channel != "auto":
        return args.execution_channel, "cli override"
    if task.claude_execution_mode != "auto":
        return task.claude_execution_mode, "task contract"
    if task.task_size == "large":
        return "session", "task_size=large defaults to persisted session mode"
    return "headless", f"task_size={task.task_size} defaults to headless mode"


def task_session_id(task: TaskContract) -> str:
    return str(uuid5(NAMESPACE_URL, f"akivot-orchestrator:{task.task_id}"))


def resolve_task_path(args: argparse.Namespace, root: Path) -> Path:
    if args.task:
        return ensure_path_within_repo(root, args.task)
    return ensure_path_within_repo(root, f".orchestrator/tasks/{args.task_id}.md")


def current_branch(root: Path) -> str:
    result = subprocess.run(
        ["git", "branch", "--show-current"],
        cwd=root,
        capture_output=True,
        text=True,
        check=False,
    )
    branch = result.stdout.strip()
    return branch or "unknown"


def relative_for_display(root: Path, path: Path) -> str:
    return path.resolve().relative_to(root.resolve()).as_posix()


def preflight_runtime_exclusions(root: Path, preflight_path: Path) -> set[str]:
    exclusions = {relative_for_display(root, preflight_path)}
    for runtime_dir in (root / ".orchestrator" / "events", root / ".orchestrator" / "logs"):
        if runtime_dir.exists():
            for path in runtime_dir.rglob("*"):
                if path.is_file():
                    exclusions.add(relative_for_display(root, path))
    return exclusions


def event_log_dir(root: Path) -> Path:
    return root / ".orchestrator" / "events"


def runtime_log_dir(root: Path) -> Path:
    return root / ".orchestrator" / "logs"


def task_runtime_log_dir(root: Path) -> Path:
    return runtime_log_dir(root) / "tasks"


def live_runtime_log_path(root: Path) -> Path:
    return runtime_log_dir(root) / "live.log"


def task_runtime_log_path(root: Path, task_id: str) -> Path:
    return task_runtime_log_dir(root) / f"{task_id}.log"


def append_runtime_log(
    root: Path,
    task_id: str,
    stage: str,
    source: str,
    message: str,
) -> None:
    try:
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
    except Exception:
        return


def summarize_runtime_event_details(event: str, details: dict[str, Any]) -> dict[str, Any]:
    if event == "dry_run":
        command = details.get("command", [])
        if isinstance(command, list):
            preview: list[str] = []
            for index, part in enumerate(command):
                if not isinstance(part, str):
                    continue
                preview.append("<generated prompt>" if index == 3 else part)
                if len(preview) >= 8:
                    break
            return {"commandPreview": preview}
    return details


def append_event(
    root: Path,
    task_id: str,
    stage: str,
    event: str,
    *,
    status: str | None = None,
    details: dict[str, Any] | None = None,
) -> None:
    try:
        log_dir = event_log_dir(root)
        log_dir.mkdir(parents=True, exist_ok=True)
        timestamp = datetime.now(timezone.utc)
        payload = {
            "timestamp": timestamp.isoformat(),
            "task_id": task_id,
            "stage": stage,
            "event": event,
            "status": status,
            "pid": os.getpid(),
            "details": details or {},
        }
        log_path = log_dir / f"{timestamp.date().isoformat()}.jsonl"
        with log_path.open("a", encoding="utf-8", newline="\n") as handle:
            handle.write(json.dumps(payload, ensure_ascii=True) + "\n")
        append_runtime_log(
            root,
            task_id,
            stage,
            "event",
            json.dumps(
                {
                    "event": event,
                    "status": status,
                    "details": summarize_runtime_event_details(event, details or {}),
                },
                ensure_ascii=True,
            ),
        )
    except Exception:
        return


def allowed_skill_text(task: TaskContract) -> str:
    allowed_skills = task.frontmatter.get("allowed_gstack_skills", [])
    if not isinstance(allowed_skills, list):
        allowed_skills = []
    return ", ".join(allowed_skills) if allowed_skills else "none"


def build_direct_execute_prompt(task: TaskContract, root: Path, result_path: Path) -> str:
    skill_text = allowed_skill_text(task)

    task_text = task.path.read_text(encoding="utf-8").lstrip("\ufeff")

    return textwrap.dedent(
        f"""
        You are Claude Code acting as the primary executor in a structured Codex workflow.

        Repository root: {root}
        Task contract path: {relative_for_display(root, task.path)}
        Result contract path: {relative_for_display(root, result_path)}

        Hard rules:
        - This run is direct_execute. Execute the task now; do not write a preflight plan.
        - Follow the task contract exactly.
        - Respect Scope, Out Of Scope, Allowed Files, Blocked Files, and forbidden_actions.
        - Do not widen scope silently.
        - Do not use any gstack skill unless explicitly allowed.
        - Allowed gstack skills for this run: {skill_text}
        - Do not ask the user for more information in this run.
        - If you are blocked, you must still write a valid result contract with status=blocked.
        - You must write a valid JSON result contract to {relative_for_display(root, result_path)}.
        - The result JSON must include these fields:
          id, status, phase, summary, files_changed, commands_run, tests_run,
          tests_passed, tests_failed, blockers, scope_deviations, follow_up_recommendation
        - Valid status values are: success, partial, blocked, failed
        - files_changed, commands_run, tests_run, tests_passed, tests_failed,
          blockers, and scope_deviations must be JSON arrays.
        - tests_passed and tests_failed are arrays of test names or suites, never counts.
        - If no tests passed or failed, write [] for those fields.
        - Never exit without writing the result contract first.
        - After writing the result contract, print a short human summary.

        Task contract follows verbatim:

        {task_text}
        """
    ).strip()


def build_preflight_prompt(task: TaskContract, root: Path, preflight_path: Path) -> str:
    skill_text = allowed_skill_text(task)
    task_text = task.path.read_text(encoding="utf-8").lstrip("\ufeff")

    return textwrap.dedent(
        f"""
        You are Claude Code acting as the primary executor in a structured Codex workflow.

        Repository root: {root}
        Task contract path: {relative_for_display(root, task.path)}
        Preflight contract path: {relative_for_display(root, preflight_path)}

        Hard rules:
        - This run is preflight only. You are planning, not executing.
        - Do not modify repository source files.
        - Do not write the final result contract in this stage.
        - Follow the task contract exactly.
        - Respect Scope, Out Of Scope, Allowed Files, Blocked Files, and forbidden_actions.
        - Do not widen scope silently.
        - Do not use any gstack skill unless explicitly allowed.
        - Allowed gstack skills for this run: {skill_text}
        - Do not ask the user for more information in this run.
        - You must write a valid JSON preflight contract to {relative_for_display(root, preflight_path)}.
        - The preflight JSON must include these fields:
          id, status, phase, summary, files_to_touch, commands_to_run, validation_plan,
          risks, scope_deviations, blockers, follow_up_recommendation
        - Valid preflight status values are: ready_for_approval, blocked, failed
        - files_to_touch, commands_to_run, validation_plan, risks, scope_deviations,
          and blockers must be JSON arrays.
        - files_to_touch must list only the repo-relative files or directories you expect
          to touch during execution, excluding the preflight artifact itself.
        - If you can proceed after approval, set status=ready_for_approval.
        - If you are blocked or the requested scope is unsafe, set status=blocked or failed.
        - Never execute code changes before approval.
        - After writing the preflight contract, print a short human summary.

        Task contract follows verbatim:

        {task_text}
        """
    ).strip()


def build_preflight_revision_prompt(
    task: TaskContract,
    root: Path,
    preflight_path: Path,
    current_preflight: dict[str, Any],
    review_feedback: list[str],
    revision_round: int,
    max_revision_rounds: int,
) -> str:
    skill_text = allowed_skill_text(task)
    task_text = task.path.read_text(encoding="utf-8").lstrip("\ufeff")
    preflight_json = json.dumps(current_preflight, indent=2)
    feedback_text = "\n".join(f"- {item}" for item in review_feedback)

    return textwrap.dedent(
        f"""
        You are Claude Code acting as the primary executor in a structured Codex workflow.

        Repository root: {root}
        Task contract path: {relative_for_display(root, task.path)}
        Preflight contract path: {relative_for_display(root, preflight_path)}

        This is a preflight revision round {revision_round} of at most {max_revision_rounds}.

        Hard rules:
        - This run is still preflight only. You are revising the execution plan, not executing code.
        - Do not modify repository source files.
        - Overwrite the preflight contract with a revised valid JSON plan.
        - Do not write the final result contract in this stage.
        - Follow the task contract exactly.
        - Respect Scope, Out Of Scope, Allowed Files, Blocked Files, and forbidden_actions.
        - Do not widen scope silently.
        - Do not use any gstack skill unless explicitly allowed.
        - Allowed gstack skills for this run: {skill_text}
        - You must address every Codex review item below.
        - If you believe one item should not be changed, explain that clearly inside blockers or scope_deviations while still revising the plan.
        - The preflight JSON must include these fields:
          id, status, phase, summary, files_to_touch, commands_to_run, validation_plan,
          risks, scope_deviations, blockers, follow_up_recommendation
        - Valid preflight status values are: ready_for_approval, blocked, failed
        - files_to_touch, commands_to_run, validation_plan, risks, scope_deviations,
          and blockers must be JSON arrays.
        - files_to_touch must list only the repo-relative files or directories you expect
          to touch during execution, excluding the preflight artifact itself.
        - After writing the revised preflight contract, print a short human summary.

        Codex review feedback to address:
        {feedback_text}

        Current preflight that needs revision:
        {preflight_json}

        Original task contract follows verbatim:
        {task_text}
        """
    ).strip()


def build_approved_execution_prompt(
    task: TaskContract,
    root: Path,
    result_path: Path,
    preflight_path: Path,
    preflight: dict[str, Any],
    approval_note: str,
) -> str:
    skill_text = allowed_skill_text(task)
    task_text = task.path.read_text(encoding="utf-8").lstrip("\ufeff")
    preflight_json = json.dumps(preflight, indent=2)
    approval_note_text = approval_note.strip() or "No approval note provided."

    return textwrap.dedent(
        f"""
        You are Claude Code acting as the primary executor in a structured Codex workflow.

        Repository root: {root}
        Task contract path: {relative_for_display(root, task.path)}
        Approved preflight path: {relative_for_display(root, preflight_path)}
        Result contract path: {relative_for_display(root, result_path)}

        Hard rules:
        - This run is approved execution after preflight.
        - The approved preflight plan is binding. Execute within it.
        - Do not modify repository files outside the approved files_to_touch list.
        - If execution would require extra files, stop and write a blocked result contract.
        - Follow the task contract exactly.
        - Respect Scope, Out Of Scope, Allowed Files, Blocked Files, and forbidden_actions.
        - Do not widen scope silently.
        - Do not use any gstack skill unless explicitly allowed.
        - Allowed gstack skills for this run: {skill_text}
        - Do not ask the user for more information in this run.
        - You must write a valid JSON result contract to {relative_for_display(root, result_path)}.
        - The result JSON must include these fields:
          id, status, phase, summary, files_changed, commands_run, tests_run,
          tests_passed, tests_failed, blockers, scope_deviations, follow_up_recommendation
        - Valid status values are: success, partial, blocked, failed
        - files_changed, commands_run, tests_run, tests_passed, tests_failed,
          blockers, and scope_deviations must be JSON arrays.
        - tests_passed and tests_failed are arrays of test names or suites, never counts.
        - If no tests passed or failed, write [] for those fields.
        - Never exit without writing the result contract first.
        - After writing the result contract, print a short human summary.

        Codex approval note:
        {approval_note_text}

        Approved preflight follows verbatim:

        {preflight_json}

        Original task contract follows verbatim:

        {task_text}
        """
    ).strip()


def build_claude_command(
    args: argparse.Namespace,
    root: Path,
    prompt: str,
    execution_channel: str,
    task: TaskContract,
) -> list[str]:
    launcher = resolve_claude_launcher(args.claude_bin)
    command = launcher + [
        "-p",
        prompt,
        "--add-dir",
        str(root),
    ]
    if execution_channel == "session":
        command.extend([
            "--session-id",
            task_session_id(task),
            "--name",
            task.task_id,
        ])
    if args.bare:
        command.append("--bare")
    if execution_channel != "session" and args.no_session_persistence:
        command.append("--no-session-persistence")
    if args.allowed_tools:
        command.extend(["--allowed-tools", args.allowed_tools])
    if args.permission_mode:
        command.extend(["--permission-mode", args.permission_mode])
    if args.dangerously_skip_permissions:
        command.append("--dangerously-skip-permissions")
    return command


def resolve_executable(raw_name: str) -> str:
    candidate = Path(raw_name)
    if candidate.exists():
        return str(candidate)

    for name in (
        raw_name,
        f"{raw_name}.cmd",
        f"{raw_name}.bat",
        f"{raw_name}.exe",
        f"{raw_name}.ps1",
    ):
        resolved = shutil.which(name)
        if resolved:
            return resolved

    raise ContractError(f"could not resolve executable: {raw_name}")


def resolve_claude_launcher(raw_name: str) -> list[str]:
    executable = resolve_executable(raw_name)
    executable_path = Path(executable)

    if executable_path.suffix.lower() in {".cmd", ".ps1"}:
        base_dir = executable_path.parent
        cli_js = base_dir / "node_modules" / "@anthropic-ai" / "claude-code" / "cli.js"
        local_node = base_dir / "node.exe"
        node_bin = str(local_node) if local_node.exists() else shutil.which("node")
        if cli_js.exists() and node_bin:
            return [node_bin, str(cli_js)]

    return [executable]


def load_json_contract(path: Path, label: str) -> dict[str, Any]:
    if not path.exists():
        raise ContractError(f"{label} was not written: {path}")
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ContractError(f"{label} is not valid JSON: {path}") from exc
    return data


def load_result_contract(result_path: Path) -> dict[str, Any]:
    return load_json_contract(result_path, "result contract")


def load_preflight_contract(preflight_path: Path) -> dict[str, Any]:
    return load_json_contract(preflight_path, "preflight contract")


def output_excerpt(stdout: str, stderr: str, limit: int = 400) -> str:
    combined = "\n".join(part.strip() for part in (stdout, stderr) if part.strip()).strip()
    if not combined:
        return ""
    compact = " ".join(combined.split())
    if len(compact) <= limit:
        return compact
    return compact[: limit - 3] + "..."


def looks_like_auth_error(text: str) -> bool:
    normalized = text.lower()
    return "not logged in" in normalized or "please run /login" in normalized


def auth_error_message() -> str:
    return (
        "Claude CLI is not logged in. Run `claude auth login` or open `claude` "
        "and run `/login`, then rerun the task."
    )


def has_env_auth() -> bool:
    return bool(
        os.environ.get("CLAUDE_CODE_OAUTH_TOKEN")
        or os.environ.get("ANTHROPIC_API_KEY")
    )


def probe_auth_status(launcher: list[str], root: Path) -> None:
    completed = subprocess.run(
        launcher + ["auth", "status"],
        cwd=root,
        capture_output=True,
        text=True,
        timeout=30,
        check=False,
    )
    if completed.returncode == 0:
        return

    excerpt = output_excerpt(completed.stdout, completed.stderr)
    if excerpt and looks_like_auth_error(excerpt):
        raise ContractError(auth_error_message())
    if excerpt:
        raise ContractError(f"Claude auth check failed: {excerpt}")
    raise ContractError("Claude auth check failed with no output")


def run_claude_command(
    command: list[str],
    root: Path,
    args: argparse.Namespace,
    task_id: str,
    stage: str,
) -> subprocess.CompletedProcess[str]:
    append_runtime_log(
        root,
        task_id,
        stage,
        "system",
        "spawn " + json.dumps(command, ensure_ascii=True),
    )

    stdout_chunks: list[str] = []
    stderr_chunks: list[str] = []

    def make_reader(
        stream: Any,
        sink: list[str],
        source: str,
    ) -> threading.Thread:
        def _reader() -> None:
            try:
                for line in iter(stream.readline, ""):
                    sink.append(line)
                    stripped = line.rstrip()
                    if stripped:
                        append_runtime_log(root, task_id, stage, source, stripped)
                        if args.verbose and source == "stdout":
                            print(stripped, file=sys.stderr)
                        if source == "stderr":
                            print(stripped, file=sys.stderr)
            finally:
                stream.close()

        return threading.Thread(target=_reader, daemon=True)

    try:
        process = subprocess.Popen(
            command,
            cwd=root,
            text=True,
            encoding="utf-8",
            errors="replace",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except OSError as exc:
        raise ContractError(f"Claude execution failed to start: {exc}") from exc

    assert process.stdout is not None
    assert process.stderr is not None
    stdout_thread = make_reader(process.stdout, stdout_chunks, "stdout")
    stderr_thread = make_reader(process.stderr, stderr_chunks, "stderr")
    stdout_thread.start()
    stderr_thread.start()

    try:
        returncode = process.wait(timeout=args.timeout_seconds)
    except subprocess.TimeoutExpired as exc:
        process.kill()
        stdout_thread.join(timeout=5)
        stderr_thread.join(timeout=5)
        raise ContractError(
            f"Claude execution timed out after {args.timeout_seconds} seconds"
        ) from exc

    stdout_thread.join(timeout=5)
    stderr_thread.join(timeout=5)

    completed = subprocess.CompletedProcess(
        command,
        returncode,
        "".join(stdout_chunks),
        "".join(stderr_chunks),
    )

    return completed


def repo_snapshot(root: Path, excluded_paths: set[str] | None = None) -> dict[str, tuple[int, int]]:
    excluded_paths = excluded_paths or set()
    completed = subprocess.run(
        ["git", "ls-files", "-z", "--cached", "--others", "--exclude-standard"],
        cwd=root,
        capture_output=True,
        text=False,
        check=False,
    )
    if completed.returncode != 0:
        excerpt = output_excerpt(
            completed.stdout.decode("utf-8", errors="replace"),
            completed.stderr.decode("utf-8", errors="replace"),
        )
        raise ContractError(f"git snapshot failed: {excerpt or 'no output'}")

    snapshot: dict[str, tuple[int, int]] = {}
    for raw_path in completed.stdout.split(b"\0"):
        if not raw_path:
            continue
        rel_path = raw_path.decode("utf-8", errors="surrogateescape").replace("\\", "/")
        if rel_path in excluded_paths:
            continue
        absolute_path = root / rel_path
        if absolute_path.is_file():
            stat = absolute_path.stat()
            snapshot[rel_path] = (stat.st_size, stat.st_mtime_ns)
    return snapshot


def detect_snapshot_drift(
    before: dict[str, tuple[int, int]],
    after: dict[str, tuple[int, int]],
) -> list[str]:
    drift: list[str] = []
    for path in sorted(set(before) | set(after)):
        if before.get(path) != after.get(path):
            drift.append(path)
    return drift


def normalize_repo_relative_path(root: Path, raw_path: str) -> str:
    if not raw_path:
        raise ContractError("empty path entry in files_changed")
    resolved = ensure_path_within_repo(root, raw_path)
    return relative_for_display(root, resolved)


def path_matches_prefix(path: str, prefix: str) -> bool:
    normalized_prefix = prefix.replace("\\", "/").rstrip("/")
    if not normalized_prefix:
        return False
    return path == normalized_prefix or path.startswith(normalized_prefix + "/")


def normalize_result_list_field(field: str, value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if field in {"tests_passed", "tests_failed"} and type(value) in {int, float} and value == 0:
        return []
    raise ContractError(f"result contract field must be a list: {field}")


def normalize_preflight_list_field(field: str, value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    raise ContractError(f"preflight contract field must be a list: {field}")


def validate_paths_against_prefixes(
    paths: list[str],
    prefixes: list[str],
    label: str,
) -> list[str]:
    violations: list[str] = []
    for path in paths:
        if not any(path_matches_prefix(path, prefix) for prefix in prefixes):
            violations.append(f"{label}: {path}")
    return violations


def validate_preflight_contract(
    task: TaskContract,
    preflight: dict[str, Any],
    root: Path,
    allowed_files: list[str],
    blocked_files: list[str],
) -> dict[str, Any]:
    missing = sorted(REQUIRED_PREFLIGHT_FIELDS - set(preflight))
    if missing:
        raise ContractError(
            "preflight contract missing required fields: " + ", ".join(missing)
        )

    if preflight["id"] != task.task_id:
        raise ContractError("preflight contract id does not match task id")
    if preflight["status"] not in VALID_PREFLIGHT_STATUSES:
        raise ContractError("preflight contract has invalid status")
    if preflight["phase"] != "preflight":
        raise ContractError("preflight contract phase must be preflight")

    normalized_preflight = dict(preflight)
    for field in PREFLIGHT_LIST_FIELDS:
        normalized_preflight[field] = normalize_preflight_list_field(field, preflight[field])

    normalized_files = [
        normalize_repo_relative_path(root, str(path))
        for path in normalized_preflight["files_to_touch"]
    ]

    violations = validate_paths_against_prefixes(
        normalized_files,
        allowed_files,
        "preflight path outside allowed files",
    )
    for planned_path in normalized_files:
        if any(path_matches_prefix(planned_path, prefix) for prefix in blocked_files):
            violations.append(f"preflight path is explicitly blocked: {planned_path}")

    if violations:
        raise ContractError("; ".join(violations))

    normalized_preflight["files_to_touch"] = normalized_files
    return normalized_preflight


def review_preflight_contract(
    preflight: dict[str, Any],
) -> list[str]:
    feedback: list[str] = []

    summary = str(preflight.get("summary", "")).strip()
    if len(summary) < 24:
        feedback.append("Expand the summary so it clearly explains the planned implementation and the decision logic.")

    files_to_touch = preflight.get("files_to_touch", [])
    if not isinstance(files_to_touch, list) or len(files_to_touch) == 0:
        feedback.append("List the concrete files_to_touch for execution. The plan is not actionable without them.")

    commands_to_run = preflight.get("commands_to_run", [])
    if not isinstance(commands_to_run, list) or len(commands_to_run) == 0:
        feedback.append("Add at least one concrete commands_to_run entry for execution or validation.")

    validation_plan = preflight.get("validation_plan", [])
    if not isinstance(validation_plan, list) or len(validation_plan) == 0:
        feedback.append("Add a concrete validation_plan. It should say how the changed behavior will be checked.")

    follow_up_recommendation = str(preflight.get("follow_up_recommendation", "")).strip()
    if not follow_up_recommendation:
        feedback.append("Add a concise follow_up_recommendation so approval and next-step handling are clear.")

    scope_deviations = preflight.get("scope_deviations", [])
    if isinstance(scope_deviations, list) and scope_deviations:
        feedback.append("Remove avoidable scope_deviations or explain them more precisely inside the revised plan.")

    blockers = preflight.get("blockers", [])
    if preflight.get("status") == "ready_for_approval" and isinstance(blockers, list) and blockers:
        feedback.append("A ready_for_approval plan should not carry unresolved blockers. Either resolve them in the plan or change the status.")

    return feedback


def validate_result_contract(
    task: TaskContract,
    result: dict[str, Any],
    root: Path,
    allowed_files: list[str],
    blocked_files: list[str],
    planned_files: list[str] | None = None,
) -> dict[str, Any]:
    missing = sorted(REQUIRED_RESULT_FIELDS - set(result))
    if missing:
        raise ContractError(
            "result contract missing required fields: " + ", ".join(missing)
        )

    if result["id"] != task.task_id:
        raise ContractError("result contract id does not match task id")
    if result["status"] not in VALID_RESULT_STATUSES:
        raise ContractError("result contract has invalid status")

    normalized_result = dict(result)
    for field in RESULT_LIST_FIELDS:
        normalized_result[field] = normalize_result_list_field(field, result[field])

    normalized_files = [
        normalize_repo_relative_path(root, str(path))
        for path in normalized_result["files_changed"]
    ]

    violations = validate_paths_against_prefixes(
        normalized_files,
        allowed_files,
        "changed path outside allowed files",
    )
    for changed_path in normalized_files:
        if any(path_matches_prefix(changed_path, prefix) for prefix in blocked_files):
            violations.append(f"changed path is explicitly blocked: {changed_path}")
        if planned_files is not None and not any(
            path_matches_prefix(changed_path, prefix) for prefix in planned_files
        ):
            violations.append(
                f"changed path outside approved preflight plan: {changed_path}"
            )

    if violations:
        raise ContractError("; ".join(violations))

    normalized_result["files_changed"] = normalized_files
    return normalized_result


def print_summary(summary: dict[str, Any], output_format: str) -> None:
    if output_format == "json":
        print(json.dumps(summary, indent=2))
        return

    if summary.get("status") == "dry_run":
        command = summary.get("command", [])
        display_parts = []
        skip_next = False
        for part in command:
            if skip_next:
                display_parts.append("<generated prompt>")
                skip_next = False
                continue
            if part == "-p":
                display_parts.append("-p")
                skip_next = True
                continue
            display_parts.append(str(part))
        command_text = " ".join(display_parts)
        print(f"TASK {summary['task_id']}: dry_run")
        print(f"Task: {summary['task_path']}")
        print(f"Result: {summary['result_contract_path']}")
        print(f"Mode: {summary['mode']} | Workflow: {summary['workflow']}")
        print(
            "Claude channel: "
            f"{summary.get('claude_execution_channel', 'headless')}"
        )
        if summary.get("claude_session_id"):
            print(f"Claude session: {summary['claude_session_id']}")
        print(f"Claude command: {command_text}")
        if summary.get("branch_warning"):
            print(f"Warning: {summary['branch_warning']}")
        return

    if summary.get("stage") == "preflight":
        planned_files = summary.get("files_to_touch", [])
        planned_display = ", ".join(planned_files) if planned_files else "none"
        print(f"TASK {summary['task_id']}: {summary['status']}")
        print(f"Preflight: {summary['preflight_contract_path']}")
        print(
            "Claude channel: "
            f"{summary.get('claude_execution_channel', 'headless')}"
        )
        if summary.get("claude_session_id"):
            print(f"Claude session: {summary['claude_session_id']}")
        print(f"Planned files: {planned_display}")
        print(
            "Proposed checks: "
            f"{summary['commands_to_run_count']} commands, "
            f"{summary['validation_plan_count']} validation steps"
        )
        print(f"Summary: {summary['summary']}")
        if summary.get("next_step_command"):
            print(f"Approve with: {summary['next_step_command']}")
        if summary.get("branch_warning"):
            print(f"Warning: {summary['branch_warning']}")
        return

    files_changed = summary.get("files_changed", [])
    files_display = ", ".join(files_changed) if files_changed else "none"
    print(f"TASK {summary['task_id']}: {summary['status']}")
    print(f"Result: {summary['result_contract_path']}")
    print(
        "Claude channel: "
        f"{summary.get('claude_execution_channel', 'headless')}"
    )
    if summary.get("claude_session_id"):
        print(f"Claude session: {summary['claude_session_id']}")
    print(f"Files changed: {files_display}")
    print(
        "Tests: "
        f"{summary['tests_run_count']} run, "
        f"{summary['tests_passed_count']} passed groups, "
        f"{summary['tests_failed_count']} failed groups"
    )
    print(f"Summary: {summary['summary']}")
    if summary.get("branch_warning"):
        print(f"Warning: {summary['branch_warning']}")


def build_self_command(
    args: argparse.Namespace,
    root: Path,
    extra_args: list[str] | None = None,
) -> str:
    extra_args = extra_args or []
    command = [sys.executable, "tools/orchestrator/run_claude.py"]
    if args.task:
        command.extend(["--task", relative_for_display(root, ensure_path_within_repo(root, args.task))])
    else:
        command.extend(["--task-id", str(args.task_id)])
    if args.permission_mode:
        command.extend(["--permission-mode", str(args.permission_mode)])
    if args.execution_channel != "auto":
        command.extend(["--execution-channel", str(args.execution_channel)])
    if args.summary_format:
        command.extend(["--summary-format", str(args.summary_format)])
    if args.bare:
        command.append("--bare")
    if not args.no_session_persistence:
        command.append("--persist-session")
    if args.skip_auth_check:
        command.append("--skip-auth-check")
    if args.allowed_tools != DEFAULT_ALLOWED_TOOLS:
        command.extend(["--allowed-tools", str(args.allowed_tools)])
    if args.max_preflight_revisions != DEFAULT_MAX_PREFLIGHT_REVISIONS:
        command.extend(["--max-preflight-revisions", str(args.max_preflight_revisions)])
    if args.dangerously_skip_permissions:
        command.append("--dangerously-skip-permissions")
    command.extend(extra_args)
    return " ".join(command)


def main() -> int:
    args = parse_args()
    if args.approval_note and not args.approve_preflight:
        raise ContractError("--approval-note requires --approve-preflight")

    root = repo_root()
    root.mkdir(exist_ok=True)

    task_path = resolve_task_path(args, root)
    task = load_task_contract(task_path)
    result_path, preflight_path, allowed_files, blocked_files = validate_task_contract(
        task,
        root,
    )
    result_path.parent.mkdir(parents=True, exist_ok=True)

    requires_preflight = effective_requires_preflight(task)
    if args.approve_preflight and not requires_preflight:
        raise ContractError("--approve-preflight requires an effective preflight task (requires_preflight=true or task_size!=tiny)")
    if preflight_path is not None:
        preflight_path.parent.mkdir(parents=True, exist_ok=True)

    branch_warning = ""
    live_branch = current_branch(root)
    declared_branch = str(task.frontmatter["branch"])
    if live_branch != declared_branch:
        branch_warning = (
            f"task contract branch is {declared_branch}, current repo branch is {live_branch}"
        )

    execution_channel, execution_channel_reason = effective_execution_channel(task, args)
    claude_session_id = task_session_id(task) if execution_channel == "session" else ""

    stage = "direct_execute"
    approved_preflight: dict[str, Any] | None = None
    preflight_enforced = (
        requires_preflight and not bool(task.frontmatter["requires_preflight"])
    )
    if requires_preflight and not args.approve_preflight:
        stage = "preflight"
        assert preflight_path is not None
        prompt = build_preflight_prompt(task, root, preflight_path)
    elif requires_preflight and args.approve_preflight:
        stage = "approved_execute"
        assert preflight_path is not None
        approved_preflight = validate_preflight_contract(
            task,
            load_preflight_contract(preflight_path),
            root,
            allowed_files,
            blocked_files,
        )
        if approved_preflight["status"] != "ready_for_approval":
            raise ContractError(
                "preflight contract is not ready for approval; rerun preflight or inspect blockers"
            )
        prompt = build_approved_execution_prompt(
            task,
            root,
            result_path,
            preflight_path,
            approved_preflight,
            args.approval_note,
        )
    else:
        prompt = build_direct_execute_prompt(task, root, result_path)

    command = build_claude_command(args, root, prompt, execution_channel, task)
    append_event(
        root,
        task.task_id,
        stage,
        "task_loaded",
        details={
            "workflow": str(task.frontmatter["workflow"]),
            "task_path": relative_for_display(root, task.path),
            "requires_preflight": requires_preflight,
            "task_size": task.task_size,
            "claude_execution_channel": execution_channel,
        },
    )
    append_event(
        root,
        task.task_id,
        stage,
        "execution_channel_selected",
        details={
            "channel": execution_channel,
            "reason": execution_channel_reason,
            "session_id": claude_session_id,
        },
    )
    if preflight_enforced:
        append_event(
            root,
            task.task_id,
            stage,
            "preflight_enforced",
            details={
                "reason": "task_size is not tiny, so preflight is required by default",
                "task_size": task.task_size,
            },
        )

    try:
        if args.dry_run:
            append_event(
                root,
                task.task_id,
                stage,
                "dry_run",
                status="dry_run",
                details={"command": command},
            )
            dry_summary = {
                "task_id": task.task_id,
                "task_path": relative_for_display(root, task.path),
                "result_contract_path": relative_for_display(root, result_path),
                "status": "dry_run",
                "stage": stage,
                "mode": task.frontmatter["mode"],
                "workflow": task.frontmatter["workflow"],
                "branch_warning": branch_warning,
                "command": command,
                "claude_execution_channel": execution_channel,
            }
            if claude_session_id:
                dry_summary["claude_session_id"] = claude_session_id
            if preflight_path is not None:
                dry_summary["preflight_contract_path"] = relative_for_display(root, preflight_path)
            print_summary(dry_summary, args.summary_format)
            if args.verbose:
                print("\n--- CLAUDE PROMPT ---")
                print(prompt)
            return 0

        launcher = resolve_claude_launcher(args.claude_bin)
        if not args.skip_auth_check and not has_env_auth():
            append_event(root, task.task_id, stage, "auth_probe_started")
            probe_auth_status(launcher, root)
            append_event(root, task.task_id, stage, "auth_probe_succeeded")

        if stage == "preflight":
            assert preflight_path is not None
            if preflight_path.exists():
                if preflight_path.is_dir():
                    raise ContractError(f"preflight contract path is a directory: {preflight_path}")
                preflight_path.unlink()

            snapshot_before = repo_snapshot(
                root,
                excluded_paths=preflight_runtime_exclusions(root, preflight_path),
            )
            completed: subprocess.CompletedProcess[str] | None = None
            normalized_preflight: dict[str, Any] | None = None
            review_feedback: list[str] = []

            for revision_round in range(args.max_preflight_revisions + 1):
                revision_mode = revision_round > 0
                if revision_mode:
                    assert normalized_preflight is not None
                    prompt = build_preflight_revision_prompt(
                        task,
                        root,
                        preflight_path,
                        normalized_preflight,
                        review_feedback,
                        revision_round,
                        args.max_preflight_revisions,
                    )
                    command = build_claude_command(args, root, prompt, execution_channel, task)
                    append_event(
                        root,
                        task.task_id,
                        stage,
                        "codex_review_revision_requested",
                        details={
                            "revision_round": revision_round,
                            "feedback": review_feedback,
                        },
                    )

                if preflight_path.exists():
                    if preflight_path.is_dir():
                        raise ContractError(f"preflight contract path is a directory: {preflight_path}")
                    preflight_path.unlink()

                append_event(
                    root,
                    task.task_id,
                    stage,
                    "claude_run_started",
                    details={
                        "kind": "preflight_revision" if revision_mode else "preflight",
                        "preflight_path": relative_for_display(root, preflight_path),
                        "revision_round": revision_round,
                        "claude_execution_channel": execution_channel,
                        "session_id": claude_session_id,
                    },
                )
                completed = run_claude_command(command, root, args, task.task_id, stage)
                append_event(
                    root,
                    task.task_id,
                    stage,
                    "claude_run_finished",
                    details={"returncode": completed.returncode, "revision_round": revision_round},
                )
                if not preflight_path.exists():
                    excerpt = output_excerpt(completed.stdout, completed.stderr)
                    if excerpt and looks_like_auth_error(excerpt):
                        raise ContractError(auth_error_message())
                    if excerpt:
                        raise ContractError(
                            f"preflight contract was not written: {preflight_path}; Claude output: {excerpt}"
                        )
                    raise ContractError(f"preflight contract was not written: {preflight_path}")

                snapshot_after = repo_snapshot(
                    root,
                    excluded_paths=preflight_runtime_exclusions(root, preflight_path),
                )
                drift = detect_snapshot_drift(snapshot_before, snapshot_after)
                if drift:
                    raise ContractError(
                        "preflight changed repo files before approval: " + ", ".join(drift)
                    )

                normalized_preflight = validate_preflight_contract(
                    task,
                    load_preflight_contract(preflight_path),
                    root,
                    allowed_files,
                    blocked_files,
                )

                if normalized_preflight["status"] != "ready_for_approval":
                    review_feedback = []
                    break

                review_feedback = review_preflight_contract(normalized_preflight)
                if not review_feedback:
                    append_event(
                        root,
                        task.task_id,
                        stage,
                        "codex_review_accepted",
                        details={"revision_round": revision_round},
                    )
                    break

                append_event(
                    root,
                    task.task_id,
                    stage,
                    "codex_review_feedback",
                    details={
                        "revision_round": revision_round,
                        "feedback": review_feedback,
                    },
                )
                if revision_round >= args.max_preflight_revisions:
                    append_event(
                        root,
                        task.task_id,
                        stage,
                        "preflight_not_converged",
                        status="failed",
                        details={
                            "revision_round": revision_round,
                            "feedback": review_feedback,
                        },
                    )
                    raise ContractError(
                        "preflight review did not converge after "
                        f"{args.max_preflight_revisions} revision rounds"
                    )

            assert completed is not None
            assert normalized_preflight is not None
            append_event(
                root,
                task.task_id,
                stage,
                "preflight_ready",
                status=normalized_preflight["status"],
                details={
                    "preflight_path": relative_for_display(root, preflight_path),
                    "files_to_touch": normalized_preflight["files_to_touch"],
                },
            )
            next_step_command = ""
            if normalized_preflight["status"] == "ready_for_approval":
                next_step_command = build_self_command(
                    args,
                    root,
                    extra_args=["--approve-preflight"],
                )
            summary = {
                "task_id": task.task_id,
                "stage": "preflight",
                "status": normalized_preflight["status"],
                "summary": normalized_preflight["summary"],
                "task_path": relative_for_display(root, task.path),
                "preflight_contract_path": relative_for_display(root, preflight_path),
                "files_to_touch": normalized_preflight["files_to_touch"],
                "commands_to_run_count": len(normalized_preflight["commands_to_run"]),
                "validation_plan_count": len(normalized_preflight["validation_plan"]),
                "claude_returncode": completed.returncode,
                "branch_warning": branch_warning,
                "next_step_command": next_step_command,
                "claude_execution_channel": execution_channel,
            }
            if claude_session_id:
                summary["claude_session_id"] = claude_session_id
            print_summary(summary, args.summary_format)
            if completed.returncode != 0 and normalized_preflight["status"] == "ready_for_approval":
                print(
                    "Warning: Claude exited non-zero but preflight reported ready_for_approval.",
                    file=sys.stderr,
                )
                return 2
            return 0 if normalized_preflight["status"] == "ready_for_approval" else 3

        if stage == "approved_execute":
            append_event(
                root,
                task.task_id,
                stage,
                "preflight_approved",
                details={
                    "approved_files": approved_preflight["files_to_touch"] if approved_preflight else [],
                    "approval_note": args.approval_note.strip(),
                },
            )

        if result_path.exists():
            if result_path.is_dir():
                raise ContractError(f"result contract path is a directory: {result_path}")
            result_path.unlink()

        append_event(
            root,
            task.task_id,
            stage,
            "claude_run_started",
            details={
                "kind": "execution",
                "result_path": relative_for_display(root, result_path),
                "claude_execution_channel": execution_channel,
                "session_id": claude_session_id,
            },
        )
        completed = run_claude_command(command, root, args, task.task_id, stage)
        append_event(
            root,
            task.task_id,
            stage,
            "claude_run_finished",
            details={"returncode": completed.returncode},
        )
        if not result_path.exists():
            excerpt = output_excerpt(completed.stdout, completed.stderr)
            if excerpt and looks_like_auth_error(excerpt):
                raise ContractError(auth_error_message())
            if excerpt:
                raise ContractError(
                    f"result contract was not written: {result_path}; Claude output: {excerpt}"
                )
            raise ContractError(f"result contract was not written: {result_path}")

        result = load_result_contract(result_path)
        normalized_result = validate_result_contract(
            task,
            result,
            root,
            allowed_files,
            blocked_files,
            planned_files=approved_preflight["files_to_touch"] if approved_preflight else None,
        )
        append_event(
            root,
            task.task_id,
            stage,
            "result_ready",
            status=normalized_result["status"],
            details={
                "result_path": relative_for_display(root, result_path),
                "files_changed": normalized_result["files_changed"],
            },
        )

        summary = {
            "task_id": task.task_id,
            "status": normalized_result["status"],
            "summary": normalized_result["summary"],
            "task_path": relative_for_display(root, task.path),
            "result_contract_path": relative_for_display(root, result_path),
            "files_changed": normalized_result["files_changed"],
            "tests_run_count": len(normalized_result["tests_run"]),
            "tests_passed_count": len(normalized_result["tests_passed"]),
            "tests_failed_count": len(normalized_result["tests_failed"]),
            "claude_returncode": completed.returncode,
            "branch_warning": branch_warning,
            "claude_execution_channel": execution_channel,
        }
        if claude_session_id:
            summary["claude_session_id"] = claude_session_id
        if preflight_path is not None:
            summary["preflight_contract_path"] = relative_for_display(root, preflight_path)
        print_summary(summary, args.summary_format)

        if completed.returncode != 0 and normalized_result["status"] == "success":
            print(
                "Warning: Claude exited non-zero but result contract reported success.",
                file=sys.stderr,
            )
            return 2

        return 0 if normalized_result["status"] == "success" else 3
    except ContractError as exc:
        append_event(
            root,
            task.task_id,
            stage,
            "error",
            status="failed",
            details={"message": str(exc)},
        )
        raise


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ContractError as exc:
        print(f"run_claude.py error: {exc}", file=sys.stderr)
        raise SystemExit(1)
