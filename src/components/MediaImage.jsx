export function MediaImage({ src, alt, tall = false, fill = false }) {
  return (
    <div
      className={`w-full ${fill ? "flex-1" : tall ? "h-52" : "h-40"} rounded-xl overflow-hidden my-3 flex-shrink-0`}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
