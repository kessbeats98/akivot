"use client";

import { useState, useTransition } from "react";
import { Phone } from "lucide-react";
import { updateOwnPhoneAction } from "@/lib/auth/update-phone";

interface Props {
  initialPhone: string | null;
}

export function PhoneSettingsCard({ initialPhone }: Props) {
  const [value, setValue] = useState(initialPhone ?? "");
  const [savedPhone, setSavedPhone] = useState(initialPhone);
  const [editing, setEditing] = useState(!initialPhone);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setError(null);
    startTransition(async () => {
      const res = await updateOwnPhoneAction(value);
      if (res.ok) {
        setSavedPhone(value.trim());
        setEditing(false);
      } else {
        setError("אנא הזן מספר טלפון תקין");
      }
    });
  };

  return (
    <section className="bg-white rounded-[2rem] p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <Phone size={20} className="text-brand" />
        <div>
          <h3 className="font-bold text-dark">מספר טלפון</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            המספר משמש רק לפעולות קשר מהירות סביב טיול או חיוב פתוח.
          </p>
        </div>
      </div>

      {!editing && savedPhone ? (
        <div className="flex items-center justify-between gap-3">
          <span dir="ltr" className="text-sm font-mono text-dark">
            {savedPhone}
          </span>
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setValue(savedPhone);
            }}
            className="text-xs font-medium text-brand"
          >
            עריכה
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="tel"
            inputMode="tel"
            dir="ltr"
            placeholder="05X-XXXXXXX"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {error && <p className="text-xs text-danger">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              disabled={pending || !value.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-brand text-white text-sm font-semibold px-4 py-2 disabled:opacity-50"
            >
              {pending ? "שומר..." : "שמירה"}
            </button>
            {savedPhone && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setValue(savedPhone);
                  setError(null);
                }}
                className="text-xs text-gray-400"
              >
                ביטול
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
