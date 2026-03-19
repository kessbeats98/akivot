import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { usersRepo } from "@/lib/repositories/usersRepo";
import { RegisterClient } from "./RegisterClient";

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    // User already logged in - redirect to appropriate dashboard
    const hasWalkerProfile = await usersRepo.hasWalkerProfile(session.user.id);
    if (hasWalkerProfile) {
      redirect("/walker/dashboard");
    } else {
      redirect("/owner/dashboard");
    }
  }

  return <RegisterClient />;
}
