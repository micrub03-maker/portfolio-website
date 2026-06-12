import React from 'react';

const PLAYLISTS = [
    {
        id: '1KIXfl8eA8zAsXk2AOCN5K',
        name: 'Zzaj par & pihpoh',
        cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8484527870b5e9d6097eb3644b',
        url: 'https://open.spotify.com/playlist/1KIXfl8eA8zAsXk2AOCN5K',
    },
    {
        id: '0A5kyzT4JY6dPXCAj5mr6n',
        name: '🪨',
        cover: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da84eb6587fcbdb489a54d751c25',
        url: 'https://open.spotify.com/playlist/0A5kyzT4JY6dPXCAj5mr6n',
    },
    {
        id: '6eFkx6pxi7L6buUj8jcZeg',
        name: 'Jazzy&bluesy stuff',
        cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84ce0abae3e3bf743e00915ea3',
        url: 'https://open.spotify.com/playlist/6eFkx6pxi7L6buUj8jcZeg',
    },
    {
        id: '5tzwDFgYtw6k6VYpwmBgmL',
        name: 'R&b, indie, funk & other fun stuff',
        cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da840d7bf3f2706e7f87e7d3c289',
        url: 'https://open.spotify.com/playlist/5tzwDFgYtw6k6VYpwmBgmL',
    },
];

const TOP_ARTISTS = [
    { id: '5INjqkS1o8h1imAzPqGZBb', name: 'Tame Impala', image: 'https://i.scdn.co/image/ab67616100005174e412a782245eb20d9626c601', url: 'https://open.spotify.com/artist/5INjqkS1o8h1imAzPqGZBb' },
    { id: '1uiEZYehlNivdK3iQyAbye', name: 'Tom Misch',   image: 'https://i.scdn.co/image/ab67616100005174d13583bc1c845d1fedbe059f', url: 'https://open.spotify.com/artist/1uiEZYehlNivdK3iQyAbye' },
    { id: '59oA5WbbQvomJz2BuRG071', name: 'Jungle',      image: 'https://i.scdn.co/image/ab6761610000517421f6e9ccd576bb2ef541a3fe', url: 'https://open.spotify.com/artist/59oA5WbbQvomJz2BuRG071' },
    { id: '3oKRxpszQKUjjaHz388fVA', name: 'Parcels',     image: 'https://i.scdn.co/image/ab676161000051743f64ee564d3617f6a764f933', url: 'https://open.spotify.com/artist/3oKRxpszQKUjjaHz388fVA' },
    { id: '6yrtCy4XJHXM6tczo4RlTs', name: 'Lime Cordiale', image: 'https://i.scdn.co/image/ab6761610000517434660d01a37a353e8783c89d', url: 'https://open.spotify.com/artist/6yrtCy4XJHXM6tczo4RlTs' },
];

const TOP_TRACKS = [
    { id: '1To3VopSqc8cWHcZJrpjvX', name: 'Mumbo Sugar',    artist: 'Arc De Soleil', image: 'https://i.scdn.co/image/ab67616d00004851aaa0e265b3d9c073d08911d2', url: 'https://open.spotify.com/track/1To3VopSqc8cWHcZJrpjvX' },
    { id: '0AFajg4fi2mIxO0CSBBIp5', name: 'Struck',          artist: 'Saloon Dion',  image: 'https://i.scdn.co/image/ab67616d0000485136270a5c729b95e46310f9a4', url: 'https://open.spotify.com/track/0AFajg4fi2mIxO0CSBBIp5' },
    { id: '0iI2cOHpX6xmwKD15Q5ynd', name: 'Breakfast in Bed', artist: 'Rayana Jay', image: 'https://i.scdn.co/image/ab67616d00004851b2fbd9875d8ab3d79484d12f', url: 'https://open.spotify.com/track/0iI2cOHpX6xmwKD15Q5ynd' },
];

const SpotifyIcon = () => (
    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
);

const SpotifyPlaylists = () => (
    <div className="flex flex-col gap-3 bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-3 shadow-2xl overflow-hidden">
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
                    {PLAYLISTS.map((playlist) => (
                        <div
                            key={playlist.id}
                            className="bg-white/10 border border-white/10 rounded-lg overflow-hidden cursor-pointer group relative aspect-square"
                            onClick={() => playlist.url && window.open(playlist.url, '_blank')}
                        >
                            {playlist.cover ? (
                                <img src={playlist.cover} alt={`${playlist.name} cover`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-green-700/40 to-green-900/40 flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                    </svg>
                                </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 py-1">
                                <p className="text-[10px] text-white leading-tight truncate">{playlist.name}</p>
                            </div>
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Artists + tracks: side by side in their own row */}
            <div className="flex gap-3 md:flex-1 min-w-0">
                {/* Top artists */}
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-white/40 font-semibold mb-1.5">top artists</p>
                    <div className="flex flex-col gap-1.5">
                        {TOP_ARTISTS.map((artist, i) => (
                            <div
                                key={artist.id}
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => artist.url && window.open(artist.url, '_blank')}
                            >
                                <span className="text-[11px] text-white/30 w-3 text-right flex-shrink-0">{i + 1}</span>
                                <div className="w-8 h-8 md:w-[60px] md:h-[60px] rounded-full overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                                    {artist.image ? (
                                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <p className="text-[11px] md:text-[13px] text-white/70 truncate leading-tight">{artist.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top tracks */}
                <div className="flex-1 min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-white/40 font-semibold mb-1.5">top tracks</p>
                    <div className="flex flex-col gap-1.5">
                        {TOP_TRACKS.map((track, i) => (
                            <div
                                key={track.id}
                                className="flex items-center gap-2 cursor-pointer group"
                                onClick={() => track.url && window.open(track.url, '_blank')}
                            >
                                <span className="text-[11px] text-white/30 w-3 text-right flex-shrink-0">{i + 1}</span>
                                <div className="w-8 h-8 md:w-[60px] md:h-[60px] rounded-lg overflow-hidden bg-white/10 border border-white/10 flex-shrink-0">
                                    {track.image ? (
                                        <img src={track.image} alt={track.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-700/40 to-green-900/40 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <p className="text-[11px] md:text-[13px] text-white/70 truncate leading-tight">{track.name}</p>
                                    <p className="text-[10px] text-white/40 truncate leading-tight">{track.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default SpotifyPlaylists;