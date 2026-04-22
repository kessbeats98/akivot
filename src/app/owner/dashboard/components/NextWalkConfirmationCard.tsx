"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type {
  ConfirmationCardView,
  OwnerAnswer,
} from "@/lib/services/confirmations/types";
import { answerConfirmationAction } from "../actions";

const STATE_COPY: Record<ConfirmationCardView["state"], string> = {
  WAITING: "ממתין",
  CONFIRMED: "מאושר",
  NOT_NEEDED: "לא צריך היום",
};

function formatTime(date: Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  dogId: string;
  confirmation: ConfirmationCardView;
}

export function NextWalkConfirmationCard({ dogId, confirmation }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const submit = (answer: OwnerAnswer) => {
    const fd = new FormData();
    fd.set("dogId", dogId);
    fd.set("answer", answer);
    startTransition(async () => {
      try {
        await answerConfirmationAction(dogId, answer, fd);
        setEditing(false);
        router.refresh();
      } catch (err) {
        console.error("[confirmation] submit failed", err);
      }
    });
  };

  const updatedLabel = `עודכן ${formatTime(confirmation.updatedAt)}`;

  const showButtons = confirmation.state === "WAITING" || editing;

  const containerClass =
    confirmation.state === "WAITING"
      ? "bg-amber-50 border border-amber-200"
      : confirmation.state === "CONFIRMED"
        ? "bg-emerald-50 border border-emerald-200"
        : "bg-white border border-gray-200";

  return (
    <div className={`rounded-2xl px-5 py-4 ${containerClass}`} dir="rtl">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-bold text-dark">
          {showButtons && confirmation.state === "WAITING"
            ? "המוביל שואל — טיול היום?"
            : STATE_COPY[confirmation.state]}
        </div>
        <div className="text-[11px] text-muted-color">{updatedLabel}</div>
      </div>

      {showButtons ? (
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("CONFIRMED")}
            className="rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            מאושר
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("NOT_NEEDED")}
            className="rounded-full bg-gray-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            לא צריך היום
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit("UNSURE")}
            className="rounded-full bg-white border border-gray-300 text-dark px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            לא בטוח
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-2 text-xs text-brand font-semibold"
        >
          שנה תשובה
        </button>
      )}
    </div>
  );
}
