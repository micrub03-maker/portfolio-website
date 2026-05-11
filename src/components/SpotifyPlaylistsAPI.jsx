import React, { useState, useEffect } from 'react';

export default function SpotifyPlaylistsAPI() {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Array of playlist IDs to fetch
    const playlistIds = [
        '217EFGlRqIsfRCIDLsTbh3', // nz 🇳🇿
        '53dTdvacLgE7I4LTCKRXtk', // reggaetón 🇵🇷 y más 🇪🇸
        '6fM0D7wYCk3F0ca09zOPR5', // hip hop & rap
        '1leRsxnuchoYZsQWgzmGWq'  // afrobeats
    ];

    // Get Spotify access token
    const getSpotifyToken = async () => {
        const clientId = import.meta.env?.VITE_SPOTIFY_CLIENT_ID || (typeof process !== "undefined" ? process.env?.REACT_APP_SPOTIFY_CLIENT_ID : undefined);
        const clientSecret = import.meta.env?.VITE_SPOTIFY_CLIENT_SECRET || (typeof process !== "undefined" ? process.env?.REACT_APP_SPOTIFY_CLIENT_SECRET : undefined);

        if (!clientId || !clientSecret) {
            throw new Error('Spotify credentials not found');
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error(`Failed to get Spotify token: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
    };

    // Fetch playlist details
    const fetchPlaylistDetails = async (playlistId, token) => {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch playlist ${playlistId}: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            id: data.id,
            name: data.name,
            cover: data.images && data.images.length > 0 ? data.images[0].url : null,
            url: data.external_urls.spotify
        };
    };

    // Fetch all playlists
    const fetchPlaylists = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = await getSpotifyToken();
            const playlistPromises = playlistIds.map(id => fetchPlaylistDetails(id, token));
            const playlistData = await Promise.all(playlistPromises);
            
            setPlaylists(playlistData);
        } catch (err) {
            console.error('Error fetching Spotify playlists:', err);
            setError(err.message);
            
            // Fallback to static data
            setPlaylists([
                {
                    id: '1',
                    name: "nz 🇳🇿",
                    cover: "/images/cover.jpeg",
                    url: "https://open.spotify.com/playlist/217EFGlRqIsfRCIDLsTbh3"
                },
                {
                    id: '2',
                    name: "reggaetón 🇵🇷 y más 🇪🇸",
                    cover: "/images/cover.jpeg", 
                    url: "https://open.spotify.com/playlist/53dTdvacLgE7I4LTCKRXtk"
                },
                {
                    id: '3',
                    name: "hip hop & rap",
                    cover: "/images/cover.jpeg",
                    url: "https://open.spotify.com/playlist/6fM0D7wYCk3F0ca09zOPR5"
                },
                {
                    id: '4',
                    name: "afrobeats",
                    cover: "/images/cover.jpeg",
                    url: "https://open.spotify.com/playlist/1leRsxnuchoYZsQWgzmGWq"
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    if (loading) {
        return (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full flex flex-col overflow-hidden">
                <div className="flex items-center justify-center mb-2">
                    <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center mr-1">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                    </div>
                    <h3 className="text-white font-semibold text-xs">Spotify</h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-white/60 text-xs">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full w-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-center mb-3">
                <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center mr-1">
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                </div>
                <h3 className="text-white font-semibold text-sm">Spotify</h3>
                {error && (
                    <span className="text-yellow-500 text-xs ml-1" title={`API Error: ${error}`}>
                        ⚠️
                    </span>
                )}
            </div>
            
            <div className="flex-1 min-h-0">
                <div className="grid grid-cols-2 gap-2 h-full">
                    {playlists.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="relative rounded-lg overflow-hidden cursor-pointer group h-full flex flex-col"
                            onClick={() => playlist.url && window.open(playlist.url, '_blank')}
                        >
                            <div className="flex-1 min-h-0 relative">
                                {playlist.cover ? (
                                    <img
                                        src={playlist.cover}
                                        alt={`${playlist.name} cover`}
                                        className="w-full h-full object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center rounded-md">
                                        <svg className="w-6 h-6 text-white opacity-60" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                        </svg>
                                    </div>
                                )}
                                
                                {/* Title overlay */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                                    <p className="text-white text-[10px] font-medium leading-tight truncate">
                                        {playlist.name}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
