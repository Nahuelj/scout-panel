import { Suspense } from 'react';

import AppHeaderHeightSync from '@/components/shared/app-header-height-sync';
import DashboardHeader from '@/components/shared/dashboard-header';
import PageTransition from '@/components/shared/page-transition';
import SelectionBar from '@/components/shared/selection-bar';
import WaveMeshBackground from '@/components/shared/wave-mesh-background';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="app-shell-root"
      className="min-h-screen bg-[#080d14] [--app-header-h:5.625rem] sm:[--app-header-h:5.875rem] md:[--app-header-h:6.25rem]"
    >
      <AppHeaderHeightSync rootId="app-shell-root" />
      <div
        id="app-header"
        className="relative sticky top-0 z-50 w-full overflow-visible border-b border-white/5 bg-[#080d14]"
      >
        <WaveMeshBackground />
        <div className="relative z-10 mx-auto max-w-screen-xl px-6 pb-4 pt-6 md:px-8 md:pt-8">
          <Suspense fallback={null}>
            <DashboardHeader />
          </Suspense>
        </div>
      </div>
      <div className="mx-auto max-w-screen-xl px-6 md:px-8 pb-6 md:pb-8 pt-8">
        <PageTransition>{children}</PageTransition>
      </div>
      <SelectionBar />
    </div>
  );
}
