import { MediaImage } from "./MediaImage";

function MediaPlaceholderFallback({ label, tall, fill = false }) {
  return (
    <div
      className={`w-full ${fill ? "flex-1" : tall ? "h-52" : "h-28"} rounded-2xl bg-slate-100 border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm`}
    >
      <span className="text-gray-400 text-xs font-mono text-center px-4 leading-relaxed">
        TEMP: {label}
      </span>
    </div>
  );
}

export function MediaSlot({ label, src = null, tall = false, fill = false }) {
  if (src) {
    return <MediaImage src={src} alt={label} tall={tall} fill={fill} />;
  }
  return <MediaPlaceholderFallback label={label} tall={tall} fill={fill} />;
}
