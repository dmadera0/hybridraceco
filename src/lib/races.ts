import { getCollection } from 'astro:content';
import { raceStatus, todayUtc, type RaceLike, type RaceStatus } from './race-dates';

export { formatRaceDates, raceStatus, todayUtc } from './race-dates';

export type Race = RaceLike;

const day = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Build day for the strip. RACE_TODAY=YYYY-MM-DD overrides it for previewing a future date:
 *   RACE_TODAY=2026-12-12 npm run build
 */
function buildDay(): string {
  const override = process.env.RACE_TODAY;
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) return override;
  return todayUtc();
}

/** Races from src/data/races.yaml, with dates as YYYY-MM-DD strings. */
export async function getRaceStatus(today = buildDay()): Promise<RaceStatus<Race>> {
  const races = (await getCollection('races')).map(({ id, data }) => ({
    id,
    city: data.city,
    start: day(data.start),
    end: day(data.end),
  }));
  return raceStatus(races, today);
}
