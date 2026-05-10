'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shellRef = useRef<HTMLDivElement>(null);
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname;
      return;
    }
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;
    el.classList.remove('page-fade-in');
    void el.offsetHeight;
    el.classList.add('page-fade-in');
  }, [pathname]);

  return (
    <div ref={shellRef} className="page-fade-in">
      {children}
    </div>
  );
}
