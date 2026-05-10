'use client';

import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import type { PlayerDetail } from '@/features/players/types/player.types';
import { getSlotColor } from '@/lib/compare-colors';

function calcAge(birthDate: string): number {
  return Math.floor(
    (Date.now() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  );
}

type Props = {
  player: PlayerDetail;
  nameAnchorRef: RefObject<HTMLHeadingElement | null>;
};

export default function PlayerStickyBar({ player, nameAnchorRef }: Props) {
  const [isNameVisible, setIsNameVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = nameAnchorRef.current;
    if (!el) return;

    const header = document.getElementById('app-header');

    const connect = () => {
      const inset = header?.offsetHeight ?? 72;
      return new IntersectionObserver(
        ([entry]) => setIsNameVisible(entry.isIntersecting),
        { threshold: 0, rootMargin: `-${inset}px 0px 0px 0px` },
      );
    };

    let observer = connect();
    observer.observe(el);

    const rebuild = () => {
      observer.disconnect();
      observer = connect();
      observer.observe(el);
    };

    window.addEventListener('resize', rebuild);
    const ro = header ? new ResizeObserver(rebuild) : null;
    if (header && ro) ro.observe(header);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', rebuild);
      ro?.disconnect();
    };
  }, [mounted, nameAnchorRef]);

  const age = player.birthDate ? calcAge(player.birthDate) : null;
  const accent = getSlotColor(0).base;

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-[#080d14]/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-sm transition-all duration-300 ${
        isNameVisible
          ? 'translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      }`}
    >
      <div className="mx-auto w-full max-w-screen-xl px-6 md:px-8">
        <div className="grid w-max max-w-full grid-cols-1">
          <div
            className="h-0.5 min-w-0 shrink-0"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <div className="flex min-w-0 items-center gap-3 py-3.5">
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-neutral-800 ring-1 ring-white/10">
              {player.photoUrl ? (
                <Image
                  src={player.photoUrl}
                  alt={player.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base text-neutral-500">
                  ?
                </div>
              )}
            </div>

            <div className="min-w-0 max-w-[min(20rem,calc(100vw-5.5rem))]">
              <p className="truncate text-sm font-bold leading-none text-white">
                {player.name}
              </p>
              <p className="mt-1.5 text-xs whitespace-nowrap text-neutral-500">
                {player.position}
                {age !== null && (
                  <span>
                    {' '}
                    <span className="text-white/20">•</span> {age} years
                  </span>
                )}
                {player.nationality && (
                  <span>
                    {' '}
                    <span className="text-white/20">•</span> {player.nationality}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
