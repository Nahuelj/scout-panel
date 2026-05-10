'use client';

import { useLayoutEffect } from 'react';

type Props = {
  rootId: string;
};

export default function AppHeaderHeightSync({ rootId }: Props) {
  useLayoutEffect(() => {
    const root = document.getElementById(rootId);
    const header = document.getElementById('app-header');
    if (!root || !header) return;

    const sync = () => {
      const h = header.getBoundingClientRect().height;
      root.style.setProperty('--app-header-h', `${Math.round(h * 1000) / 1000}px`);
    };

    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(header);
    return () => {
      ro.disconnect();
    };
  }, [rootId]);

  return null;
}
