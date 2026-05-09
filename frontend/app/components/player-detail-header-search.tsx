"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SubmitEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { FileSpreadsheet, Loader2, Search, Users } from "lucide-react";
import {
  DEFAULT_PLAYERS_PAGE,
  PLAYERS_FIXED_PAGE_SIZE,
  playersListHrefForState,
} from "@/lib/player-list-params";
import { getPlayers, type PlayerCardData } from "@/lib/players-api";

type Props = {
  currentIds: string[];
  maxIds?: number;
};

const SEARCH_DEBOUNCE_MS = 380;
const DEFAULT_MAX_IDS = 3;

export default function PlayerDetailHeaderSearch({
  currentIds,
  maxIds = DEFAULT_MAX_IDS,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState<PlayerCardData[]>([]);
  const [pending, setPending] = useState(false);
  const [debouncing, setDebouncing] = useState(false);
  const [loadedEmptyQuery, setLoadedEmptyQuery] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const portalMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const currentIdsKey = currentIds.join(",");
  const isAtMax = currentIds.length >= maxIds;

  useEffect(() => {
    let cancelled = false;
    let ac: AbortController | null = null;
    const q = draft.trim();
    if (q.length === 0) {
      setResults([]);
      setPending(false);
      setDebouncing(false);
      setLoadedEmptyQuery(null);
      setPanelOpen(false);
      return undefined;
    }

    setPanelOpen(true);
    setResults([]);
    setLoadedEmptyQuery(null);
    setDebouncing(true);
    const tid = window.setTimeout(() => {
      if (cancelled) return;
      setDebouncing(false);
      ac = new AbortController();
      setPending(true);
      const queryRun = q;
      const excludeIds = currentIdsKey ? currentIdsKey.split(",") : [];
      getPlayers(
        {
          search: queryRun,
          page: DEFAULT_PLAYERS_PAGE,
          pageSize: PLAYERS_FIXED_PAGE_SIZE,
        },
        { signal: ac.signal },
      )
        .then((res) => {
          if (!cancelled) {
            const rows = res.data.filter((p) => !excludeIds.includes(p.id));
            setResults(rows);
            setLoadedEmptyQuery(rows.length === 0 ? queryRun : null);
          }
        })
        .catch((err: unknown) => {
          const name =
            typeof err === "object" &&
            err !== null &&
            "name" in err &&
            typeof (err as { name: unknown }).name === "string"
              ? (err as { name: string }).name
              : "";
          if (name === "AbortError") return;
          if (!cancelled) {
            setResults([]);
            setLoadedEmptyQuery(queryRun);
          }
        })
        .finally(() => {
          if (!cancelled) setPending(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(tid);
      setDebouncing(false);
      ac?.abort();
    };
  }, [draft, currentIdsKey]);

  useEffect(() => {
    function handlePointerDown(ev: MouseEvent) {
      if (!containerRef.current?.contains(ev.target as Node)) {
        setPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    setDraft("");
    setResults([]);
    setPanelOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setPanelOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollbarWidth = window.innerWidth - html.clientWidth;
    const prevPaddingRight = body.style.paddingRight;
    body.style.paddingRight = `${scrollbarWidth}px`;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
      body.style.paddingRight = prevPaddingRight;
    };
  }, [panelOpen]);

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = draft.trim();
    router.push(
      playersListHrefForState({
        ...(trimmed ? { search: trimmed } : {}),
        page: DEFAULT_PLAYERS_PAGE,
        pageSize: PLAYERS_FIXED_PAGE_SIZE,
      }),
    );
    setPanelOpen(false);
  };

  const goToPlayer = useCallback(
    (id: string) => {
      setPanelOpen(false);
      router.push(`/players/${id}`);
    },
    [router],
  );

  const compareWith = useCallback(
    (id: string) => {
      if (isAtMax) return;
      setPanelOpen(false);
      setDraft("");
      const baseIds = currentIdsKey ? currentIdsKey.split(",") : [];
      const nextIds = Array.from(new Set([...baseIds, id])).slice(0, maxIds);
      const encoded = nextIds.map((x) => encodeURIComponent(x)).join(",");
      router.push(`/compare?ids=${encoded}`);
    },
    [router, currentIdsKey, isAtMax, maxIds],
  );

  const trimmedDraft = draft.trim();
  const showPanel =
    panelOpen &&
    trimmedDraft.length > 0 &&
    (debouncing ||
      pending ||
      results.length > 0 ||
      (loadedEmptyQuery !== null && loadedEmptyQuery === trimmedDraft));

  const mainDim = portalMounted
    ? createPortal(
        <div
          aria-hidden
          className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 ${showPanel ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
          onMouseDown={() => setPanelOpen(false)}
        />,
        document.body,
      )
    : null;

  return (
    <>
      {mainDim}
      <div ref={containerRef} className="relative z-[70] w-full max-w-xl">
        <form onSubmit={handleSubmit} noValidate>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              name="search"
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => draft.trim().length > 0 && setPanelOpen(true)}
              placeholder="Search players…"
              autoComplete="off"
              aria-label="Search players by name"
              aria-expanded={showPanel}
              aria-controls="player-detail-search-panel"
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
            />
            {showPanel ? (
              <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-lg border border-white/10 bg-[#0f1923] shadow-xl ring-1 ring-black/40 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-200">
                <div
                  id="player-detail-search-panel"
                  role="listbox"
                  aria-label="Search suggestions"
                  className="scrollbar-panel max-h-[min(32rem,calc(100vh-9rem))] overflow-y-auto py-2"
                >
                  {debouncing || (pending && results.length === 0) ? (
                    <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-neutral-500">
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      <span>Searching…</span>
                    </div>
                  ) : null}
                  {!pending &&
                  !debouncing &&
                  loadedEmptyQuery === trimmedDraft ? (
                    <p className="px-4 py-6 text-center text-sm text-neutral-500">
                      No players found
                    </p>
                  ) : null}
                  <div className="flex flex-col divide-y divide-white/10 px-2">
                    {results.map((player) => {
                      const club = player.currentSeason?.club?.trim() || "N/A";
                      const compareTitle = isAtMax
                        ? `Maximum ${maxIds} players in comparison`
                        : "Compare with current player";
                      const compareAriaLabel = isAtMax
                        ? `Maximum ${maxIds} players in comparison`
                        : "Compare with current player";
                      return (
                        <div
                          key={player.id}
                          role="option"
                          aria-selected={false}
                          className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-2 [&:has(.player-row-compare-hit:hover)_.compare-action-hit:not(:disabled)]:border-emerald-400/55 [&:has(.player-row-compare-hit:hover)_.compare-action-hit:not(:disabled)]:bg-emerald-500/25 [&:has(.player-row-compare-hit:hover)_.compare-action-hit:not(:disabled)]:text-emerald-200"
                        >
                          <button
                            type="button"
                            onClick={() => compareWith(player.id)}
                            disabled={isAtMax}
                            title={compareTitle}
                            aria-label={
                              isAtMax
                                ? compareAriaLabel
                                : `Compare ${player.name} with current player`
                            }
                            className="player-row-compare-hit flex min-w-0 flex-1 items-center gap-3 rounded-md px-1 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/15 enabled:cursor-pointer disabled:cursor-not-allowed"
                          >
                            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                              {player.photoUrl ? (
                                <Image
                                  src={player.photoUrl}
                                  alt={player.name}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  sizes="44px"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-neutral-600">
                                  ?
                                </span>
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-semibold text-white">
                                {player.name}
                              </span>
                              <span className="block truncate text-xs text-neutral-400">
                                <span className="tabular-nums text-neutral-300">
                                  {player.position}
                                </span>
                                <span className="mx-1.5 text-neutral-600">·</span>
                                <span>{club}</span>
                              </span>
                            </span>
                          </button>
                          <div className="flex shrink-0 items-center justify-end gap-2 sm:pl-1">
                            <button
                              type="button"
                              onClick={() => goToPlayer(player.id)}
                              title="Open player profile"
                              aria-label="Open player profile"
                              className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] text-neutral-300 outline-none transition-colors hover:border-white/30 hover:bg-white/[0.12] hover:text-white focus-visible:border-white/35 focus-visible:ring-2 focus-visible:ring-white/15"
                            >
                              <FileSpreadsheet
                                className="size-[18px]"
                                strokeWidth={1.65}
                                aria-hidden
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => compareWith(player.id)}
                              disabled={isAtMax}
                              title={compareTitle}
                              aria-label={compareAriaLabel}
                              className="compare-action-hit inline-flex size-9 shrink-0 items-center justify-center rounded-lg border outline-none transition-colors enabled:border-emerald-500/35 enabled:bg-emerald-500/[0.12] enabled:text-emerald-400 enabled:hover:border-emerald-400/70 enabled:hover:bg-emerald-500/35 enabled:hover:text-emerald-100 enabled:focus-visible:border-emerald-400/55 enabled:focus-visible:ring-2 enabled:focus-visible:ring-emerald-500/25 disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:bg-white/[0.03] disabled:text-neutral-600"
                            >
                              <Users
                                className="size-[18px]"
                                strokeWidth={1.65}
                                aria-hidden
                              />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </form>
      </div>
    </>
  );
}
