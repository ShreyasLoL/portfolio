// One-off generator for phase 1 MOCK contribution data.
// Writes data/contributions.json in the same shape the GitHub GraphQL
// contributionCalendar returns, so phase 2 can replace the file directly.
// Delete this script once real data is wired up.
//
// Usage: node scripts/mock-contributions.mjs [seed]

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const seed = Number(process.argv[2] ?? 20261017);

// Small seeded PRNG (mulberry32) so the output is reproducible.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(seed);

// Weekly activity states. p = chance a weekday has any contributions,
// mean = average count on an active day.
const STATES = {
  quiet: { p: 0.06, mean: 1.5 },
  low: { p: 0.4, mean: 2.5 },
  normal: { p: 0.68, mean: 4 },
  burst: { p: 0.92, mean: 8 },
};

// Week-to-week transitions: produces clustered bursts and quiet gaps
// instead of uniform noise.
const NEXT = {
  quiet: [['quiet', 0.5], ['low', 0.38], ['burst', 0.12]],
  low: [['low', 0.42], ['normal', 0.35], ['quiet', 0.16], ['burst', 0.07]],
  normal: [['normal', 0.45], ['burst', 0.25], ['low', 0.2], ['quiet', 0.1]],
  burst: [['burst', 0.4], ['normal', 0.4], ['low', 0.15], ['quiet', 0.05]],
};

function pick(options) {
  let r = rand();
  for (const [name, weight] of options) {
    if ((r -= weight) < 0) return name;
  }
  return options[options.length - 1][0];
}

function dayCount(state, weekday) {
  const weekend = weekday === 0 || weekday === 6;
  const p = state.p * (weekend ? 0.35 : 1);
  if (rand() >= p) return 0;
  // A few heavy days.
  if (rand() < 0.025) return 14 + Math.floor(rand() * 14);
  const mean = state.mean * (weekend ? 0.6 : 1);
  // Exponential-ish tail, minimum 1.
  return 1 + Math.floor(-Math.log(1 - rand()) * Math.max(mean - 1, 0.5));
}

function ymd(d) {
  return d.toISOString().slice(0, 10);
}

// "Today" in local time, handled as a UTC date to avoid timezone drift.
const now = new Date();
const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));

// 53 week columns ending today: go back 52 weeks, then to that week's Sunday.
const start = new Date(today);
start.setUTCDate(start.getUTCDate() - 52 * 7);
start.setUTCDate(start.getUTCDate() - start.getUTCDay());

const weeks = [];
let total = 0;
let state = 'normal';
let week = null;

for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
  const weekday = d.getUTCDay();
  if (weekday === 0 || week === null) {
    if (week !== null) state = pick(NEXT[state]);
    week = { contributionDays: [] };
    weeks.push(week);
  }
  const contributionCount = dayCount(STATES[state], weekday);
  total += contributionCount;
  week.contributionDays.push({ date: ymd(d), contributionCount, weekday });
}

const data = { mock: true, totalContributions: total, weeks };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'data', 'contributions.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2) + '\n');

console.log(`Wrote ${out}: ${weeks.length} weeks, ${total} contributions (seed ${seed})`);
