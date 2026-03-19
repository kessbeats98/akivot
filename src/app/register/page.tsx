import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasWalkerProfile } from "@/lib/repositories/usersRepo";
import { RegisterClient } from "./RegisterClient";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    // User already logged in - redirect to appropriate dashboard
    const isWalker = await hasWalkerProfile(user.id);
    if (isWalker) {
      redirect("/walker/dashboard");
    } else {
      redirect("/owner/dashboard");
    }
  }

  return <RegisterClient />;
}
