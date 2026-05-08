"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
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

type Props = { currentPlayerId: string };

const SEARCH_DEBOUNCE_MS = 380;

export default function PlayerDetailHeaderSearch({ currentPlayerId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [results, setResults] = useState<PlayerCardData[]>([]);
  const [pending, setPending] = useState(false);
  const [debouncing, setDebouncing] = useState(false);
  const [loadedEmptyQuery, setLoadedEmptyQuery] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

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
            const rows = res.data.filter((p) => p.id !== currentPlayerId);
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
  }, [draft, currentPlayerId]);

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
      setPanelOpen(false);
      router.push(
        `/compare?ids=${encodeURIComponent(currentPlayerId)},${encodeURIComponent(id)}`,
      );
    },
    [router, currentPlayerId],
  );

  const trimmedDraft = draft.trim();
  const showPanel =
    panelOpen &&
    trimmedDraft.length > 0 &&
    (debouncing ||
      pending ||
      results.length > 0 ||
      (loadedEmptyQuery !== null && loadedEmptyQuery === trimmedDraft));

  const mainDim =
    typeof document !== "undefined" && showPanel
      ? createPortal(
          <div
            aria-hidden
            className="fixed inset-0 z-40 bg-black/45 pointer-events-auto"
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
              <div
                id="player-detail-search-panel"
                role="listbox"
                aria-label="Search suggestions"
                className="scrollbar-panel absolute left-0 right-0 top-[calc(100%+0.5rem)] max-h-[min(32rem,calc(100vh-9rem))] overflow-y-auto rounded-lg border border-white/10 bg-[#0f1923] py-2 shadow-xl ring-1 ring-black/40"
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
                <div className="flex flex-col gap-2 px-2 pb-1 pt-1">
                  {results.map((player) => {
                    const club = player.currentSeason?.club?.trim() || "N/A";
                    return (
                      <div
                        key={player.id}
                        role="option"
                        aria-selected={false}
                        className="flex flex-col gap-2 rounded-lg border border-white/[0.07] px-2 py-2 sm:flex-row sm:items-center sm:gap-2 [&:has(.player-row-compare-hit:hover)_.compare-action-hit]:border-emerald-400/55 [&:has(.player-row-compare-hit:hover)_.compare-action-hit]:bg-emerald-500/25 [&:has(.player-row-compare-hit:hover)_.compare-action-hit]:text-emerald-200"
                      >
                        <button
                          type="button"
                          onClick={() => compareWith(player.id)}
                          title="Compare with current player"
                          aria-label={`Compare ${player.name} with current player`}
                          className="player-row-compare-hit flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md px-1 py-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-white/15"
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
                            title="Compare with current player"
                            aria-label="Compare with current player"
                            className="compare-action-hit inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/35 bg-emerald-500/[0.12] text-emerald-400 outline-none transition-colors hover:border-emerald-400/70 hover:bg-emerald-500/35 hover:text-emerald-100 focus-visible:border-emerald-400/55 focus-visible:ring-2 focus-visible:ring-emerald-500/25"
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
            ) : null}
          </div>
        </form>
      </div>
    </>
  );
}
