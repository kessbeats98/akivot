import { notFound } from "next/navigation";
import { loadOrchestratorSnapshot } from "@/lib/orchestrator/dashboard";
import { OrchestratorDashboardClientLive } from "./OrchestratorDashboardClientLive";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export default async function DevOrchestratorPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const snapshot = await loadOrchestratorSnapshot();
  return <OrchestratorDashboardClientLive initialData={snapshot} />;
}
