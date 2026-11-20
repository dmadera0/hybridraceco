#!/usr/bin/env node
/**
 * Replace the races in src/data/races.yaml with a race list exported as CSV.
 *
 *   npm run races:import -- path/to/races.csv
 *   npm run races:import -- path/to/races.csv --include-youngstars
 *
 * Expected columns (header row required, any order):
 *   Race City   e.g. Dallas
 *   Event Name  e.g. HYROX DALLAS
 *   Date        e.g. "Nov 18 – Nov 22, 2026", "Mar 6, 2027", "Dec 30 – Jan 2, 2027"
 *
 * Rows with no usable date ("Date coming soon") are skipped and listed. Youngstars events are
 * skipped by default so the strip doesn't show the same city twice. The comment block at the top
 * of races.yaml is kept; everything below it is rewritten, sorted by start date.
 */
import { readFile, writeFile } from 'node:fs/promises';

const OUT_FILE = new URL('../src/data/races.yaml', import.meta.url);
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

/** Minimal CSV parser: quoted fields, escaped quotes, commas and newlines inside quotes. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (field += '"'), i++;
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') row.push(field), (field = '');
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field), rows.push(row), (row = []), (field = '');
    } else field += c;
  }
  if (field || row.length) row.push(field), rows.push(row);
  return rows.filter((r) => r.some((f) => f.trim()));
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * "Nov 18 – Nov 22, 2026" -> { start: "2026-11-18", end: "2026-11-22" }.
 * The year belongs to the end date; a start month later than the end month is the previous year.
 */
export function parseDateRange(text) {
  const t = text.replace(/[–—-]/g, '–').replace(/\s+/g, ' ').trim();
  const m = /^([A-Za-z]{3})[a-z]*\.? (\d{1,2})(?: – (?:([A-Za-z]{3})[a-z]*\.? )?(\d{1,2}))?,? (\d{4})$/.exec(t);
  if (!m) return undefined;
  const [, sMon, sDay, eMonRaw, eDay, yearText] = m;
  const sm = MONTHS[sMon.toLowerCase()];
  const em = eMonRaw ? MONTHS[eMonRaw.toLowerCase()] : sm;
  if (!sm || !em) return undefined;
  const ey = Number(yearText);
  const sy = sm > em ? ey - 1 : ey;
  const start = `${sy}-${pad(sm)}-${pad(sDay)}`;
  const end = `${ey}-${pad(em)}-${pad(eDay ?? sDay)}`;
  return end >= start ? { start, end } : undefined;
}

const yamlString = (s) => (/^[\p{L}\p{N} .'()&/-]+$/u.test(s) && !/^\d/.test(s) ? s : JSON.stringify(s));

async function main() {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const includeYoungstars = args.includes('--include-youngstars');
  if (!file) throw new Error('Usage: npm run races:import -- path/to/races.csv [--include-youngstars]');

  const [header, ...rows] = parseCsv(await readFile(file, 'utf8'));
  const col = (name) => {
    const i = header.findIndex((h) => h.trim().toLowerCase() === name);
    if (i < 0) throw new Error(`Missing column "${name}" in ${file}.`);
    return i;
  };
  const [cityCol, eventCol, dateCol] = [col('race city'), col('event name'), col('date')];

  const races = [];
  const skipped = { noDate: [], youngstars: [], duplicate: [] };
  const seen = new Set();
  for (const row of rows) {
    const city = row[cityCol]?.trim();
    const event = row[eventCol]?.trim();
    const dateText = row[dateCol]?.trim() ?? '';
    if (!city) continue;
    if (!includeYoungstars && /youngstars/i.test(event ?? '')) {
      skipped.youngstars.push(event);
      continue;
    }
    const dates = parseDateRange(dateText);
    if (!dates) {
      skipped.noDate.push(`${event || city} (${dateText || 'no date'})`);
      continue;
    }
    const key = `${city}|${dates.start}|${dates.end}`;
    if (seen.has(key)) {
      skipped.duplicate.push(event || city);
      continue;
    }
    seen.add(key);
    races.push({ city, event, ...dates });
  }
  races.sort((a, b) => a.start.localeCompare(b.start) || a.city.localeCompare(b.city));

  const existing = await readFile(OUT_FILE, 'utf8').catch(() => '');
  const intro = existing.split(/\n(?=- )/)[0].replace(/\s+$/, '');
  const body = races
    .map((r) =>
      [`- city: ${yamlString(r.city)}`, r.event ? `  event: ${yamlString(r.event)}` : null, `  start: ${r.start}`, `  end: ${r.end}`]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n\n');
  await writeFile(OUT_FILE, `${intro}\n\n${body}\n`);

  console.log(`Wrote ${races.length} races to src/data/races.yaml (${races[0]?.start} to ${races.at(-1)?.end}).`);
  if (skipped.youngstars.length) console.log(`Skipped ${skipped.youngstars.length} Youngstars events (use --include-youngstars to keep them).`);
  if (skipped.noDate.length) console.log(`Skipped, no usable date: ${skipped.noDate.join('; ')}`);
  if (skipped.duplicate.length) console.log(`Skipped duplicates: ${skipped.duplicate.join('; ')}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
