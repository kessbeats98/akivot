import { OwnerNav } from '@/components/OwnerNav';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <OwnerNav />
    </>
  );
}
