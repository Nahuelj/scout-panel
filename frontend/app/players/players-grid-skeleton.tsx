export default function PlayersGridSkeleton() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-[var(--app-header-h)] z-[45] border-b border-white/10 bg-[#080d14]/95 py-4 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-screen-xl flex-col gap-4 px-6 sm:flex-row sm:items-end sm:justify-between md:px-8">
          <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-3 w-16 rounded-full bg-white/[0.06] animate-pulse" />
                <div className="h-10 w-36 rounded-lg border border-white/10 bg-[#0f1923] animate-pulse" />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-12 rounded-full bg-white/[0.06] animate-pulse" />
              <div className="h-10 w-44 rounded-lg border border-white/10 bg-[#0f1923] animate-pulse" />
            </div>
          </div>
          <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:max-w-sm sm:shrink-0">
            <div className="h-3 w-14 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="h-10 w-full rounded-lg border border-white/10 bg-white/5 animate-pulse sm:w-72" />
          </div>
        </div>
      </div>

      <div className="pb-0 pt-[110px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center rounded-2xl bg-[#0f1923] border border-white/5 p-5 gap-3 animate-pulse"
            >
              <div className="w-20 h-20 rounded-xl bg-white/5" />
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="h-4 w-12 rounded-full bg-white/5" />
                <div className="h-4 w-3/4 rounded bg-white/5" />
                <div className="h-3 w-1/2 rounded bg-white/5" />
                <div className="h-3 w-2/3 rounded bg-white/5" />
              </div>
              <div className="w-full h-px bg-white/5" />
              <div className="grid grid-cols-3 w-full gap-2">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex flex-col items-center gap-1">
                    <div className="h-2 w-6 rounded bg-white/5" />
                    <div className="h-5 w-8 rounded bg-white/5" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#080d14]/95 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:pb-[calc(1rem+env(safe-area-inset-bottom))] md:pt-4"
      >
        <div className="mx-auto flex max-w-screen-xl flex-col gap-3 px-6 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <div className="h-4 w-44 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="flex items-center gap-2 sm:justify-end">
            <div className="h-9 w-28 rounded-lg border border-white/10 bg-white/[0.03] animate-pulse" />
            <div className="h-9 w-24 rounded-lg border border-white/10 bg-white/[0.03] animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}
