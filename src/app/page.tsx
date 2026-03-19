import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { walkerProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  // Check if user has a walker profile
  const db = getDb();
  const [walkerProfile] = await db
    .select({ id: walkerProfiles.id })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.userId, user.id))
    .limit(1);
  
  if (walkerProfile) {
    redirect("/walker");
  } else {
    redirect("/owner");
  }
}
