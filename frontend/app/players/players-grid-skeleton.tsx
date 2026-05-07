export default function PlayersGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
  );
}
