const isVideo = (src) => /\.(mp4|webm|ogg|mov)$/i.test(src);

export function MediaImage({ src, alt, tall = false, fill = false, fit = 'object-cover', compact = false, padded = false, height, videoAspect, square = false, fluid = false }) {
  const video = isVideo(src);
  const containerClass = video
    ? `${videoAspect || 'aspect-[9/16]'} ${fluid ? 'w-full' : 'max-w-[220px] mx-auto'} ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} flex-shrink-0`
    : `w-full ${square ? "aspect-square" : fill ? "flex-1" : tall ? "h-[239px]" : "h-[184px]"} ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} ${padded ? 'p-2 bg-gray-50' : ''} flex-shrink-0`;
  const mediaClass = `w-full h-full ${video ? 'object-cover' : padded ? 'object-contain' : fit} ${compact ? 'rounded-xl' : ''}`;

  return (
    <div className={containerClass} style={height ? { height } : undefined}>
      {video
        ? <video src={src} className={mediaClass} autoPlay loop muted playsInline />
        : <img src={src} alt={alt} className={mediaClass} />
      }
    </div>
  );
}
