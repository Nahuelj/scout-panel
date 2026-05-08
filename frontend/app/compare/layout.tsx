import AppShell from '@/app/components/app-shell';

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
