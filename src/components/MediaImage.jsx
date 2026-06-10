export function MediaImage({ src, alt, tall = false, fill = false, fit = 'object-cover', compact = false }) {
  return (
    <div
      className={`w-full ${fill ? "flex-1" : tall ? "h-52" : "h-40"} ${compact ? 'rounded-xl' : 'rounded-xl overflow-hidden my-3'} flex-shrink-0`}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full ${fit} ${compact ? 'rounded-xl' : ''}`}
      />
    </div>
  );
}
