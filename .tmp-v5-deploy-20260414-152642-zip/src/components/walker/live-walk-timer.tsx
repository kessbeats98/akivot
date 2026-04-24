"use client"

import { useEffect, useState } from "react"

type Props = { startTime: string }

const pad2 = (n: number) => String(n).padStart(2, "0")

export function LiveWalkTimer({ startTime }: Props) {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - new Date(startTime).getTime()) / 1000)
  )

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(startTime).getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [startTime])

  const hh = Math.floor(elapsed / 3600)
  const mm = Math.floor((elapsed % 3600) / 60)
  const ss = elapsed % 60

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-2">
      <p className="text-primary font-semibold tracking-wider text-sm uppercase">זמן טיול</p>
      <div className="font-mono text-6xl font-bold tracking-tighter text-neutral-dark flex gap-2 items-center">
        <span className="bg-white px-2 py-1 rounded-lg border border-slate-200">{pad2(hh)}</span>
        <span className="text-primary/40">:</span>
        <span className="bg-white px-2 py-1 rounded-lg border border-slate-200">{pad2(mm)}</span>
        <span className="text-primary/40">:</span>
        <span className="bg-white px-2 py-1 rounded-lg border border-slate-200">{pad2(ss)}</span>
      </div>
      <div className="flex gap-12 mt-2 text-xs text-slate-500 font-medium">
        <span>שעות</span><span>דקות</span><span>שניות</span>
      </div>
    </div>
  )
}
