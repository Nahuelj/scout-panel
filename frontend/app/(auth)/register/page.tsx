import { Crosshair } from 'lucide-react';
import { SignupForm } from '@/components/signup-form';
import WaveMeshBackground from '@/app/components/wave-mesh-background';

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden bg-[#080d14] p-6 md:p-10">
      <WaveMeshBackground />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-8 md:max-w-3xl">
        <div className="flex justify-center">
          <div className="inline-flex w-max shrink-0 items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2.5 backdrop-blur-md">
            <span
              className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/[0.15] ring-1 ring-emerald-400/20"
              aria-hidden
            >
              <Crosshair className="size-3.5 text-[#00E094]" strokeWidth={1.75} />
            </span>
            <span className="text-base font-bold tracking-tight text-white">
              Scout<span className="text-[#00E094]">DB</span>
            </span>
          </div>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
