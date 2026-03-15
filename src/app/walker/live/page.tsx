import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth/session"
import { getActiveWalksByWalker } from "@/lib/repositories/walksRepo"
import { LiveWalkTimer } from "@/components/walker/live-walk-timer"
import { BottomNav } from "@/components/layout/bottom-nav"
import { endWalkFromLiveAction } from "./actions"
import { ArrowRight, PawPrint, MapPin, Camera, Home } from "lucide-react"

export default async function LiveWalkPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const activeWalks = await getActiveWalksByWalker(user.id)
  const walk = activeWalks[0]
  if (!walk) redirect("/walker/dashboard")

  return (
    <div dir="rtl" className="flex flex-col min-h-screen bg-background-light">
      <header className="bg-white border-b border-primary/10 px-4 py-4 flex items-center justify-between sticky top-0 z-10">
        <a href="/walker/dashboard" className="p-2 hover:bg-primary/5 rounded-full transition-colors">
          <ArrowRight size={24} />
        </a>
        <h1 className="text-xl font-bold">בטיול כרגע: {walk.dogName}</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 flex flex-col p-4 gap-6 max-w-md mx-auto w-full">
        {/* Status banner */}
        <div className="bg-primary text-white p-4 rounded-xl flex items-center justify-between shadow-lg shadow-primary/20">
          <div className="flex items-center gap-3">
            <PawPrint size={22} />
            <div>
              <p className="font-bold text-lg leading-none">סטטוס: בשידור חי</p>
              <p className="text-sm opacity-90">המיקום משותף עם הבעלים</p>
            </div>
          </div>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inset-0 rounded-full bg-white opacity-75" />
            <span className="relative rounded-full h-3 w-3 bg-white border border-primary" />
          </span>
        </div>

        {/* Map placeholder */}
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border-4 border-white shadow-sm bg-primary/10">
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin size={32} className="text-primary/30" />
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs font-bold text-slate-800">מיקום חי</span>
          </div>
        </div>

        {/* Timer */}
        <LiveWalkTimer startTime={walk.startTime.toISOString()} />

        {/* Action buttons */}
        <div className="grid grid-cols-1 gap-4 mt-auto pb-4">
          <button
            disabled
            className="flex items-center justify-center gap-3 bg-primary text-white h-16 rounded-xl font-bold text-lg opacity-60 cursor-not-allowed"
          >
            <Camera size={22} /> תמונה מהדרך
          </button>
          <form action={endWalkFromLiveAction.bind(null, walk.id)}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 bg-accent text-white h-16 rounded-xl font-bold text-lg shadow-md active:scale-95 transition-transform"
            >
              <Home size={22} /> סיימנו, חזרנו הביתה
            </button>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
