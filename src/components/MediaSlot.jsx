import { MediaImage } from "./MediaImage";

function MediaPlaceholderFallback({ label, tall }) {
  return (
    <div
      className={`w-full ${tall ? "h-52" : "h-40"} rounded-xl bg-slate-100 border border-gray-200 flex items-center justify-center my-3 flex-shrink-0`}
    >
      <span className="text-gray-400 text-xs font-mono text-center px-4 leading-relaxed">
        TEMP: {label}
      </span>
    </div>
  );
}

export function MediaSlot({ label, src = null, tall = false }) {
  if (src) {
    return <MediaImage src={src} alt={label} tall={tall} />;
  }
  return <MediaPlaceholderFallback label={label} tall={tall} />;
}
