import { BottomNav } from "@/components/layout/bottom-nav";

export default function WalkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
