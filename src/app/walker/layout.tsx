import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserRole } from "@/lib/auth/get-user-role";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function WalkerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id);
  if (role !== "walker" && role !== "both") redirect("/onboarding");

  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
