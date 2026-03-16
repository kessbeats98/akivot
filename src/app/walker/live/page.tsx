import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getActiveWalksByWalker } from "@/lib/repositories/walksRepo";
import { endWalkFromLiveAction } from "./actions";
import { WalkerLiveClient } from "./WalkerLiveClient";

export default async function LiveWalkPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const activeWalks = await getActiveWalksByWalker(user.id);
  const walk = activeWalks[0];
  if (!walk) redirect("/walker/dashboard");

  return (
    <WalkerLiveClient
      walkId={walk.id}
      dogName={walk.dogName}
      startTime={walk.startTime.toISOString()}
      endWalkAction={endWalkFromLiveAction}
    />
  );
}
