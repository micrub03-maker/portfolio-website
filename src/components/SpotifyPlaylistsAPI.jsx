import React, { useState, useEffect } from 'react';
// Fix: Issue #41 — rich fallback data instead of generic placeholders
import { FALLBACK_PLAYLISTS, FALLBACK_TOP_ARTISTS, FALLBACK_TOP_TRACKS } from './SpotifyPlaylists';

const PLAYLIST_IDS = [
    '1KIXfl8eA8zAsXk2AOCN5K',
    '0A5kyzT4JY6dPXCAj5mr6n',
    '6eFkx6pxi7L6buUj8jcZeg',
    '5tzwDFgYtw6k6VYpwmBgmL',
];

async function getClientToken() {
    const clientId     = import.meta.env?.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET;
    if (!clientId || !clientSecret) throw new Error('Missing client credentials');

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: 'grant_type=client_credentials'
    });
    if (!res.ok) throw new Error(`Token error: ${res.status}`);
    return (await res.json()).access_token;
}

async function getUserToken() {
    const clientId      = import.meta.env?.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret  = import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET;
    const refreshToken  = import.meta.env?.VITE_SPOTIFY_REFRESH_TOKEN;
    if (!clientId || !clientSecret || !refreshToken) return null;

    const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });
    if (!res.ok) return null;
    return (await res.json()).access_token;
}

async function fetchPlaylistDetails(id, token) {
    const res = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Playlist ${id}: ${res.status}`);
    const d = await res.json();
    return {
        id: d.id,
        name: d.name,
        cover: d.images?.[0]?.url ?? null,
        url: d.external_urls.spotify
    };
}

async function fetchTopArtists(token) {
    const res = await fetch(
        'https://api.spotify.com/v1/me/top/artists?limit=5&time_range=medium_term',
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return [];
    return (await res.json()).items.map(a => ({
        id: a.id,
        name: a.name,
        image: a.images?.[1]?.url ?? a.images?.[0]?.url ?? null,
        url: a.external_urls.spotify
    }));
}

async function fetchTopTracks(token) {
    const res = await fetch(
        'https://api.spotify.com/v1/me/top/tracks?limit=3&time_range=short_term',
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return [];
    return (await res.json()).items.map(t => ({
        id: t.id,
        name: t.name,
        artist: t.artists?.[0]?.name ?? '',
        image: t.album?.images?.[2]?.url ?? t.album?.images?.[0]?.url ?? null,
        url: t.external_urls.spotify
    }));
}

const SpotifyIcon = () => (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
);

export default function SpotifyPlaylistsAPI() {
    const [playlists, setPlaylists]   = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [topTracks, setTopTracks]   = useState([]);
    const [loading, setLoading]       = useState(true);

    useEffect(() => {
        (async () => {
            const [playlistResult, artistResult, trackResult] = await Promise.allSettled([
                (async () => {
                    const token = await getClientToken();
                    return Promise.all(PLAYLIST_IDS.map(id => fetchPlaylistDetails(id, token)));
                })(),
                (async () => {
                    const token = await getUserToken();
                    return token ? fetchTopArtists(token) : [];
                })(),
                (async () => {
                    const token = await getUserToken();
                    return token ? fetchTopTracks(token) : [];
                })(),
            ]);

            // Fix: Issue #41 / F-4 — also fall back on fulfilled-but-empty results
            // (missing/expired refresh token and non-OK responses resolve to [])
            setPlaylists(
                playlistResult.status === 'fulfilled' && playlistResult.value.length > 0
                    ? playlistResult.value
                    : FALLBACK_PLAYLISTS
            );
            setTopArtists(
                artistResult.status === 'fulfilled' && artistResult.value.length > 0
                    ? artistResult.value
                    : FALLBACK_TOP_ARTISTS
            );
            setTopTracks(
                trackResult.status === 'fulfilled' && trackResult.value.length > 0
                    ? trackResult.value
                    : FALLBACK_TOP_TRACKS
            );
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-2 bg-black/30 rounded-2xl p-3 overflow-hidden">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                        <SpotifyIcon />
                    </div>
                    <span className="text-xs font-semibold text-white uppercase tracking-wide">Spotify</span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white/60 text-xs animate-pulse">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 bg-black/30 rounded-2xl p-3 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <SpotifyIcon />
                </div>
                <span className="text-xs font-semibold text-white uppercase tracking-wide">Spotify</span>
            </div>

            {/* Body: stacked on mobile, side-by-side on desktop */}
            <div className="flex flex-col gap-3 md:flex-row">
                {/* Playlists: 2x2 grid */}
                <div className="w-full md:w-[40%] md:flex-shrink-0">
                    <p className="text-[11px] uppercase tracking-wide text-white/40 font-semibold mb-1.5">playlists</p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {playlists.map((playlist) => (
                            <div
                                key={playlist.id}
                                className="bg-white/10 border border-white/10 rounded-lg overflow-hidden cursor-pointer group relative aspect-square"
                                onClick={() => playlist.url && window.open(playlist.url, '_blank')}
                            >
                                {/* Fix: F-5 — same onError fallback pattern as SpotifyPlaylists.jsx */}
                                {playlist.cover && (
                                    <img
                                        src={playlist.cover}
                                        alt={`${playlist.name} cover`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.style?.setProperty('display', 'flex'); }}
                                    />
                                )}
                                <div className="w-full h-full bg-gradient-to-br from-green-700/40 to-green-900/40 items-center justify-center" style={{ display: playlist.cover ? 'none' : 'flex' }}>
                                    <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                    </svg>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                                    <p className="text-[10px] text-white leading-tight truncate">{playlist.name}</p>
                                </div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Artists + tracks: side by side in their own row */}
                {(topArtists.length > 0 || topTracks.length > 0) && (
                <div className="flex gap-3 md:flex-1 min-w-0">

                {topArtists.length > 0 && (
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-white/40 font-semibold mb-1.5">top artists</p>
                        <div className="flex flex-col gap-1.5">
                            {topArtists.map((artist, i) => (
                                <div
                                    key={artist.id}
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => artist.url && window.open(artist.url, '_blank')}
                                >
                                    <span className="text-[11px] text-white/30 w-3 text-right flex-shrink-0">{i + 1}</span>
                                    <div className="w-8 h-8 md:w-[60px] md:h-[60px] rounded-full overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                                        {/* Fix: F-5 */}
                                        {artist.image && (
                                            <img
                                                src={artist.image}
                                                alt={artist.name}
                                                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.style?.setProperty('display', 'flex'); }}
                                            />
                                        )}
                                        <div className="w-full h-full items-center justify-center" style={{ display: artist.image ? 'none' : 'flex' }}>
                                            <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-[11px] md:text-[13px] text-white/70 truncate leading-tight">{artist.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {topTracks.length > 0 && (
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-wide text-white/40 font-semibold mb-1.5">top tracks</p>
                        <div className="flex flex-col gap-1.5">
                            {topTracks.map((track, i) => (
                                <div
                                    key={track.id}
                                    className="flex items-center gap-2 cursor-pointer group"
                                    onClick={() => track.url && window.open(track.url, '_blank')}
                                >
                                    <span className="text-[11px] text-white/30 w-3 text-right flex-shrink-0">{i + 1}</span>
                                    <div className="w-8 h-8 md:w-[60px] md:h-[60px] rounded-lg overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                                        {/* Fix: F-5 */}
                                        {track.image && (
                                            <img
                                                src={track.image}
                                                alt={track.name}
                                                className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.style?.setProperty('display', 'flex'); }}
                                            />
                                        )}
                                        <div className="w-full h-full bg-gradient-to-br from-green-700/40 to-green-900/40 items-center justify-center" style={{ display: track.image ? 'none' : 'flex' }}>
                                            <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <p className="text-[11px] md:text-[13px] text-white/70 truncate leading-tight">{track.name}</p>
                                        <p className="text-[10px] text-white/40 truncate leading-tight">{track.artist}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>
                )}
            </div>
        </div>
    );
}
