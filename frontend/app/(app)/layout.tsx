import AppShell from '@/app/components/app-shell';

export default function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
