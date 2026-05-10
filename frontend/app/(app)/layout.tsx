import AppShell from '@/components/shared/app-shell';

export default function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
