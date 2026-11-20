import { getCollection } from 'astro:content';
import { raceStatus, todayUtc, type RaceLike, type RaceStatus } from './race-dates';

export { formatRaceDates, raceStatus, todayUtc } from './race-dates';

export type Race = RaceLike;

const day = (d: Date) => d.toISOString().slice(0, 10);

/** Races from src/data/races.yaml, with dates as YYYY-MM-DD strings. */
export async function getRaceStatus(today = todayUtc()): Promise<RaceStatus<Race>> {
  const races = (await getCollection('races')).map(({ id, data }) => ({
    id,
    city: data.city,
    start: day(data.start),
    end: day(data.end),
  }));
  return raceStatus(races, today);
}
