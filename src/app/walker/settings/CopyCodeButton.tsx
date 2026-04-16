"use client";

import { useState } from "react";

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-2xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand-dark transition-colors"
    >
      <span className="material-symbols-rounded text-base">
        {copied ? "check" : "content_copy"}
      </span>
      {copied ? "הועתק!" : "העתק קוד"}
    </button>
  );
}
