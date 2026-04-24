import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserRole } from "@/lib/auth/get-user-role";
import { OwnerNav } from "@/components/layout/owner-nav";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const role = await getUserRole(user.id);
  if (role !== "owner" && role !== "both") redirect("/onboarding");

  return (
    <>
      {children}
      <OwnerNav />
    </>
  );
}
