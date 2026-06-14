// Vercel serverless function backing the global game leaderboards.
//
// Storage: one Upstash Redis sorted set per game (`leaderboard:<game>`). The score
// is the ZSET score; the member is a JSON blob of the entry (name, company, email,
// location, timestamp + nonce so identical runs don't collapse). Sorted sets give
// us "top N" for free via ZRANGE.
//
// Privacy: `email` is collected for the site owner only; it is NEVER returned by
// the public GET. To read emails, call GET with `?admin=<LEADERBOARD_ADMIN_TOKEN>`
// (set that env var), or just browse the data in the Upstash console.
//
// Location: filled automatically from Vercel's edge geo headers (no API key). It's
// connection-level, so it can be a little off (VPNs, mobile); treated as a hint.
//
// Validation: the score is checked server-side (positive, multiple of 10, under a
// sane ceiling) so a visitor can't POST a fabricated value from the console. Text
// fields are sanitized and length-capped; a malformed email is dropped rather than
// failing the whole submission.
//
// Env (Vercel Upstash integration injects the first pair; KV_* names also accepted):
//   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
//   KV_REST_API_URL        / KV_REST_API_TOKEN
//   LEADERBOARD_ADMIN_TOKEN  (optional, gates email access)
// With no Redis env configured the endpoint degrades to an empty board.

import { Redis } from '@upstash/redis';

const TOP_N  = 5;    // entries returned to the client
const KEEP_N = 100;  // entries retained in Redis (trimmed on each write)

const LIMITS = { name: 24, company: 40, email: 120 };

// Per-game config. `max` is a generous sanity ceiling to reject garbage POSTed
// from the console; `step` is the score granularity a real run lands on. Breakout
// is endless and every brick is worth 10, so its scores are multiples of 10. The
// arcade games count in 1s (feet climbed / catches made). Adding a game here is all
// it takes to give it a global board.
const GAMES = {
  breakout:   { max: 1_000_000, step: 10 },
  doodlejump: { max:   100_000, step: 1  },
  juggling:   { max:   100_000, step: 1  },
  dino:       { max:   100_000, step: 1  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRedis() {
  const url   = process.env.UPSTASH_REDIS_REST_URL   || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? new Redis({ url, token }) : null;
}

const keyFor = game => `leaderboard:${game}`;

// Trim, strip control/format chars (\p{C}), collapse whitespace, length-cap.
function cleanText(raw, max) {
  return String(raw ?? '')
    .replace(/\p{C}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function geoFromHeaders(req) {
  const h = req.headers;
  const dec = v => { try { return decodeURIComponent(v || ''); } catch { return v || ''; } };
  return {
    city:    cleanText(dec(h['x-vercel-ip-city']), 60),
    region:  cleanText(h['x-vercel-ip-country-region'], 20),
    country: cleanText(h['x-vercel-ip-country'], 4), // ISO-3166 alpha-2, e.g. "US"
  };
}

// Map a stored entry to what the public board shows (no email, no internals).
function publicRow(entry, score, includeEmail) {
  const row = {
    name:    entry.name || 'Anonymous',
    company: entry.company || '',
    city:    entry.city || '',
    region:  entry.region || '',
    country: entry.country || '',
    score,
  };
  if (includeEmail) row.email = entry.email || '';
  return row;
}

function parseMember(member) {
  try { return JSON.parse(member); } catch { return { name: String(member) }; }
}

async function topScores(redis, game, includeEmail) {
  const flat = await redis.zrange(keyFor(game), 0, TOP_N - 1, { rev: true, withScores: true });
  const rows = [];
  for (let i = 0; i < flat.length; i += 2) {
    rows.push(publicRow(parseMember(flat[i]), Number(flat[i + 1]), includeEmail));
  }
  return rows;
}

export default async function handler(req, res) {
  const redis = getRedis();

  if (req.method === 'GET') {
    const game = String(req.query.game || '').trim();
    if (!game) return res.status(400).json({ error: 'missing game' });
    const adminToken = process.env.LEADERBOARD_ADMIN_TOKEN;
    const includeEmail = !!adminToken && req.query.admin === adminToken;
    if (!redis) return res.status(200).json({ scores: [], configured: false });
    try {
      return res.status(200).json({ scores: await topScores(redis, game, includeEmail), configured: true });
    } catch (err) {
      console.error('leaderboard GET failed', err);
      return res.status(200).json({ scores: [], configured: false });
    }
  }

  if (req.method === 'POST') {
    const body  = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const game  = String(body.game || '').trim();
    const score = Number(body.score);

    const cfg = GAMES[game];
    if (!cfg) return res.status(400).json({ error: 'unknown game' });
    if (!Number.isInteger(score) || score <= 0 || score > cfg.max || score % cfg.step !== 0) {
      return res.status(400).json({ error: 'invalid score' });
    }
    if (!redis) return res.status(200).json({ scores: [], configured: false });

    const emailRaw = cleanText(body.email, LIMITS.email);
    const entry = {
      name:    cleanText(body.name, LIMITS.name) || 'Anonymous',
      company: cleanText(body.company, LIMITS.company),
      email:   EMAIL_RE.test(emailRaw) ? emailRaw : '', // drop malformed, don't reject
      ...geoFromHeaders(req),
      ts: Date.now(),
      n:  Math.random().toString(36).slice(2, 8), // keep identical entries distinct
    };

    try {
      await redis.zadd(keyFor(game), { score, member: JSON.stringify(entry) });
      await redis.zremrangebyrank(keyFor(game), 0, -(KEEP_N + 1)); // keep only the highest KEEP_N
      return res.status(200).json({ scores: await topScores(redis, game, false), configured: true });
    } catch (err) {
      console.error('leaderboard POST failed', err);
      return res.status(500).json({ error: 'write failed' });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method not allowed' });
}
