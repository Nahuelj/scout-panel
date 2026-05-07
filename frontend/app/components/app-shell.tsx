import DashboardHeader from '@/app/components/dashboard-header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080d14] p-6 md:p-8">
      <div className="max-w-screen-xl mx-auto">
        <DashboardHeader />
        {children}
      </div>
    </div>
  );
}
