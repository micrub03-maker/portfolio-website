/**
 * One-time script to get a Spotify refresh token with user-top-read scope.
 * Run: node spotify-auth.mjs <CLIENT_ID> <CLIENT_SECRET>
 * Then open the printed URL in your browser.
 */

import http from 'http';

const CLIENT_ID     = process.argv[2];
const CLIENT_SECRET = process.argv[3];
const PORT          = 3001;
const REDIRECT_URI  = `http://127.0.0.1:${PORT}/callback`;
const SCOPE         = 'user-top-read';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Usage: node spotify-auth.mjs YOUR_CLIENT_ID YOUR_CLIENT_SECRET');
  process.exit(1);
}

const authUrl =
  `https://accounts.spotify.com/authorize` +
  `?client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPE)}`;

console.log('\n1. Add this exact redirect URI in your Spotify app settings:');
console.log(`   ${REDIRECT_URI}`);
console.log('\n2. Then open this URL in your browser:\n');
console.log('   ' + authUrl);
console.log('\nWaiting for Spotify to redirect back...\n');

const server = http.createServer(async (req, res) => {
  const url  = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const code = url.searchParams.get('code');
  const err  = url.searchParams.get('error');

  if (err || !code) {
    res.writeHead(400);
    res.end(`<h2>Error: ${err ?? 'no code received'}</h2>`);
    server.close();
    return;
  }

  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/x-www-form-urlencoded',
        'Authorization': `Basic ${creds}`,
      },
      body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
    });

    const data = await tokenRes.json();

    if (!data.refresh_token) {
      res.writeHead(500);
      res.end(`<pre>Token exchange failed:\n${JSON.stringify(data, null, 2)}</pre>`);
      server.close();
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h2 style="font-family:monospace">Got it! Add this to .env.local:</h2>
      <pre style="background:#111;color:#0f0;padding:1rem;border-radius:8px;font-size:1rem">VITE_SPOTIFY_REFRESH_TOKEN=${data.refresh_token}</pre>
      <p style="font-family:monospace">You can close this tab and stop the script (Ctrl+C).</p>
    `);

    console.log('✅  Refresh token obtained!\n');
    console.log('Add this to .env.local:');
    console.log(`\nVITE_SPOTIFY_REFRESH_TOKEN=${data.refresh_token}\n`);
  } catch (e) {
    res.writeHead(500);
    res.end(`<pre>${e.message}</pre>`);
  }

  server.close();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Listening on http://127.0.0.1:${PORT}`);
});
