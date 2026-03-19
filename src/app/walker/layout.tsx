import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { hasWalkerProfile } from "@/lib/repositories/usersRepo";

export default async function WalkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }

  const isWalker = await hasWalkerProfile(user.id);
  if (!isWalker) {
    redirect("/owner");
  }

  return <>{children}</>;
}
