const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(src);

export function MediaImage({ src, alt, tall = false, fill = false, fit = 'object-cover', compact = false, padded = false, height, videoAspect, imageAspect, square = false, fluid = false, natural = false }) {
  const video = isVideo(src);
  const containerClass = video
    ? `${videoAspect || 'aspect-[9/16]'} ${fluid ? 'w-full' : 'max-w-[220px] mx-auto'} ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} flex-shrink-0`
    : natural
      ? `w-full ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} flex-shrink-0`
      : `w-full ${imageAspect ? imageAspect : square ? "aspect-square" : fill ? "flex-1" : tall ? "h-[239px]" : "h-[184px]"} ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} ${padded ? 'p-2 bg-gray-50' : ''} flex-shrink-0`;
  const mediaClass = natural
    ? `w-full h-auto ${compact ? 'rounded-xl' : ''}`
    : `w-full h-full ${video ? 'object-cover' : padded ? 'object-contain' : fit} ${compact ? 'rounded-xl' : ''}`;

  return (
    <div className={containerClass} style={height ? { height } : undefined}>
      {video
        ? <video src={src} className={mediaClass} autoPlay loop muted playsInline preload="auto" />
        : <img src={src} alt={alt} className={mediaClass} />
      }
    </div>
  );
}
