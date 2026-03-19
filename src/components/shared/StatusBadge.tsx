import type { WalkStatus } from "@/lib/services/walks/types";

type StatusBadgeProps = {
  status: WalkStatus;
};

const statusConfig: Record<WalkStatus, { label: string; className: string; dot?: boolean }> = {
  LIVE: {
    label: "בהליכה",
    className: "bg-destructive-light text-destructive border border-destructive/20",
    dot: true,
  },
  COMPLETED: {
    label: "הושלם",
    className: "bg-primary-light text-primary border border-primary/20",
  },
  AUTO_CLOSED: {
    label: "נסגר אוטומטית",
    className: "bg-accent-light text-accent border border-accent/20",
  },
  PLANNED: {
    label: "מתוכנן",
    className: "bg-muted text-muted-foreground border border-border",
  },
  CANCELLED: {
    label: "בוטל",
    className: "bg-destructive-light text-destructive border border-destructive/20",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${config.className}
      `}
    >
      {config.dot && (
        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse-live" />
      )}
      {config.label}
    </span>
  );
}
