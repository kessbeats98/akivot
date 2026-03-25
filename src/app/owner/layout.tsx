import { OwnerNav } from "@/components/layout/owner-nav";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <OwnerNav />
    </>
  );
}
