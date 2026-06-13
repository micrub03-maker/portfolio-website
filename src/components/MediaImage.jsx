import { useRef, useState } from 'react';

const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(src);

export function MediaImage({ src, alt, tall = false, fill = false, fit = 'object-cover', compact = false, padded = false, height, videoAspect, imageAspect, square = false, fluid = false, natural = false }) {
  const video = isVideo(src);
  // Fix: Issue #38 — portrait videos crop from the top for consistent cross-browser framing
  const isPortraitVideo = video && !!videoAspect && (videoAspect.includes('[9/16]') || videoAspect.includes('[45/64]'));
  // Fix: Issue #37 — respect prefers-reduced-motion: no autoplay, show a play button instead
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videoRef = useRef(null);
  const [manuallyPlaying, setManuallyPlaying] = useState(false);

  const containerClass = video
    // Fix: Issue #39 — default video aspect to 16:9 landscape
    ? `${videoAspect || 'aspect-video'} ${fluid ? 'w-full' : 'max-w-[220px] mx-auto'} ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} flex-shrink-0`
    : natural
      ? `w-full ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} flex-shrink-0`
      : `w-full ${imageAspect ? imageAspect : square ? "aspect-square" : fill ? "flex-1" : tall ? "h-[239px]" : "h-[184px]"} ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} ${padded ? 'p-2 bg-gray-50' : ''} flex-shrink-0`;
  const mediaClass = natural
    ? `w-full h-auto ${compact ? 'rounded-xl' : ''}`
    : `w-full h-full ${video ? 'object-cover' : padded ? 'object-contain' : fit} ${compact ? 'rounded-xl' : ''}`;

  return (
    <div
      className={containerClass}
      style={{
        ...(height ? { height } : {}),
        ...(video && reducedMotion ? { position: 'relative' } : {}),
      }}
    >
      {video
        ? (
          <>
            <video ref={videoRef} src={src} className={mediaClass} style={{ objectPosition: isPortraitVideo ? 'center top' : 'center center' }} autoPlay={!reducedMotion} loop muted playsInline preload="auto" />
            {reducedMotion && !manuallyPlaying && (
              <button
                aria-label="Play video"
                onClick={(e) => { e.stopPropagation(); videoRef.current?.play(); setManuallyPlaying(true); }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <span
                  style={{
                    width: 48, height: 48, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, paddingLeft: 4,
                  }}
                >
                  ▶
                </span>
              </button>
            )}
          </>
        )
        : <img src={src} alt={alt} className={mediaClass} />
      }
    </div>
  );
}
