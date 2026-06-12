import React, { useState, useEffect } from 'react';

const PLAYLIST_IDS = [
    '1KIXfl8eA8zAsXk2AOCN5K',
    '0A5kyzT4JY6dPXCAj5mr6n',
    '6eFkx6pxi7L6buUj8jcZeg',
    '5tzwDFgYtw6k6VYpwmBgmL',
];

const STATIC_PLAYLISTS = [
    { id: '1', name: "Playlist 1", cover: null, url: "https://open.spotify.com/playlist/1KIXfl8eA8zAsXk2AOCN5K" },
    { id: '2', name: "Playlist 2", cover: null, url: "https://open.spotify.com/playlist/0A5kyzT4JY6dPXCAj5mr6n" },
    { id: '3', name: "Playlist 3", cover: null, url: "https://open.spotify.com/playlist/6eFkx6pxi7L6buUj8jcZeg" },
    { id: '4', name: "Playlist 4", cover: null, url: "https://open.spotify.com/playlist/5tzwDFgYtw6k6VYpwmBgmL" },
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

const SpotifyIcon = () => (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
);

export default function SpotifyPlaylistsAPI() {
    const [playlists, setPlaylists]   = useState([]);
    const [topArtists, setTopArtists] = useState([]);
    const [loading, setLoading]       = useState(true);

    useEffect(() => {
        (async () => {
            // Playlists (client_credentials) and top artists (refresh token) in parallel
            const [playlistResult, artistResult] = await Promise.allSettled([
                (async () => {
                    const token = await getClientToken();
                    return Promise.all(PLAYLIST_IDS.map(id => fetchPlaylistDetails(id, token)));
                })(),
                (async () => {
                    const token = await getUserToken();
                    return token ? fetchTopArtists(token) : [];
                })(),
            ]);

            setPlaylists(
                playlistResult.status === 'fulfilled'
                    ? playlistResult.value
                    : STATIC_PLAYLISTS
            );
            setTopArtists(
                artistResult.status === 'fulfilled' ? artistResult.value : []
            );
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col gap-2 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-2xl overflow-hidden h-full">
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
        <div className="flex flex-col gap-2 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-2xl overflow-hidden h-full">
            {/* Header */}
            <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <SpotifyIcon />
                </div>
                <span className="text-xs font-semibold text-white uppercase tracking-wide">Spotify</span>
            </div>

            {/* Playlists grid */}
            <div>
                <p className="text-[9px] uppercase tracking-wide text-white/40 font-semibold mb-1.5">my playlists</p>
                <div className="grid grid-cols-4 gap-1.5">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="bg-white/10 border border-white/10 rounded-lg overflow-hidden cursor-pointer group relative aspect-square"
                            onClick={() => playlist.url && window.open(playlist.url, '_blank')}
                        >
                            {playlist.cover ? (
                                <img
                                    src={playlist.cover}
                                    alt={`${playlist.name} cover`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-700/40 to-green-900/40 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                    </svg>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-0.5">
                                <p className="text-[9px] text-white leading-tight truncate">{playlist.name}</p>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Top artists */}
            {topArtists.length > 0 && (
                <div className="border-t border-white/20 pt-2">
                    <p className="text-[9px] uppercase tracking-wide text-white/40 font-semibold mb-1.5">top artists</p>
                    <div className="flex justify-between">
                        {topArtists.map(artist => (
                            <div
                                key={artist.id}
                                className="flex flex-col items-center gap-1 cursor-pointer group w-1/5"
                                onClick={() => artist.url && window.open(artist.url, '_blank')}
                            >
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                                    {artist.image ? (
                                        <img
                                            src={artist.image}
                                            alt={artist.name}
                                            className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[9px] text-white/70 text-center leading-tight line-clamp-1 w-full px-0.5">{artist.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
