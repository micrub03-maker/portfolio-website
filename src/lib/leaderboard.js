// Thin client for the /api/leaderboard serverless function.
//
// Every call swallows failure and returns a safe empty value, so the games work
// exactly the same when there's no backend: `vite dev` (no /api), a gh-pages
// build, or a clone without the Upstash env vars configured. The leaderboard
// simply doesn't appear instead of throwing.

const API = '/api/leaderboard';

// Resolves to { scores, configured }. `configured` is false whenever there's no
// reachable/working backend, so callers can hide leaderboard UI (e.g. the initials
// prompt) in local dev or on a static host rather than offer a board that can't save.
export async function fetchLeaderboard(game) {
  try {
    const res = await fetch(`${API}?game=${encodeURIComponent(game)}`);
    if (!res.ok) return { scores: [], configured: false };
    const data = await res.json();
    return {
      scores: Array.isArray(data.scores) ? data.scores : [],
      configured: data.configured === true,
    };
  } catch {
    return { scores: [], configured: false };
  }
}

// Submit a score with the player's details. `entry` is { name, company, email };
// location is stamped server-side from edge geo headers. Returns the refreshed
// top-N on success, or null if the submission didn't take (offline, not configured,
// rejected). Callers fall back to fetchLeaderboard.
export async function submitScore(game, score, entry = {}) {
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game,
        score,
        name:    entry.name ?? '',
        company: entry.company ?? '',
        email:   entry.email ?? '',
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data.scores) ? data.scores : null;
  } catch {
    return null;
  }
}

// --- Single global high score -------------------------------------------------
// The arcade games (DoodleJump, JugglingGame) don't want a full top-N board or to
// prompt for player details — just one global number to beat, shown in the corner.
// These wrap the same endpoint: read the highest score, or submit anonymously.

// Resolves to { high, configured }. `high` is the current global record (0 if the
// board is empty or there's no backend); `configured` mirrors fetchLeaderboard.
export async function fetchHighScore(game) {
  const { scores, configured } = await fetchLeaderboard(game);
  return { high: scores.length ? scores[0].score : 0, configured };
}

// Submit a score anonymously. Returns the new global high (number) if the write
// took, or null if it didn't (offline, not configured, rejected).
export async function submitHighScore(game, score) {
  const scores = await submitScore(game, score);
  return Array.isArray(scores) && scores.length ? scores[0].score : null;
}
