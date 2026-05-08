import DashboardHeader from '@/app/components/dashboard-header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[#080d14] [--app-header-h:5.625rem] sm:[--app-header-h:5.875rem] md:[--app-header-h:6.25rem]"
    >
      <div id="app-header" className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#080d14]">
        <div className="mx-auto max-w-screen-xl px-6 md:px-8 pb-4 pt-6 md:pt-8">
          <DashboardHeader />
        </div>
      </div>
      <div className="mx-auto max-w-screen-xl px-6 md:px-8 pb-6 md:pb-8 pt-8">
        {children}
      </div>
    </div>
  );
}
