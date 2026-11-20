/** Pure race-calendar logic, kept free of Astro imports so it can be tested with plain Node. */
export interface RaceLike {
  id: string;
  city: string;
  /** YYYY-MM-DD */
  start: string;
  /** YYYY-MM-DD, inclusive */
  end: string;
}

export type RaceStatus<R extends RaceLike = RaceLike> =
  | { kind: 'live'; races: R[] }
  | { kind: 'next'; races: R[] }
  | { kind: 'none'; races: [] };

/** Today as YYYY-MM-DD in UTC. The site rebuilds daily, so this is the build day. */
export function todayUtc(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/**
 * Races on now (start <= today <= end), or else the next race(s) to start.
 * Several races starting on the same next day are returned together.
 */
export function raceStatus<R extends RaceLike>(races: R[], today = todayUtc()): RaceStatus<R> {
  const live = races.filter((r) => r.start <= today && today <= r.end);
  if (live.length) return { kind: 'live', races: live.sort((a, b) => a.start.localeCompare(b.start) || a.city.localeCompare(b.city)) };
  const upcoming = races
    .filter((r) => r.start > today)
    .sort((a, b) => a.start.localeCompare(b.start) || a.city.localeCompare(b.city));
  if (!upcoming.length) return { kind: 'none', races: [] };
  return { kind: 'next', races: upcoming.filter((r) => r.start === upcoming[0].start) };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "18–22 Nov 2026", "29 Nov – 1 Dec 2026", "31 Dec 2026 – 2 Jan 2027", "6 Mar 2027". */
export function formatRaceDates(start: string, end: string): string {
  const [sy, sm, sd] = start.split('-').map(Number);
  const [ey, em, ed] = end.split('-').map(Number);
  const s = (d: number, m: number) => `${d} ${MONTHS[m - 1]}`;
  if (start === end) return `${s(sd, sm)} ${sy}`;
  if (sy !== ey) return `${s(sd, sm)} ${sy} – ${s(ed, em)} ${ey}`;
  if (sm !== em) return `${s(sd, sm)} – ${s(ed, em)} ${ey}`;
  return `${sd}–${ed} ${MONTHS[em - 1]} ${ey}`;
}
