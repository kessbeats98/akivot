import { WalkerNav } from '@/components/WalkerNav';

export default function WalkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <WalkerNav />
    </>
  );
}
