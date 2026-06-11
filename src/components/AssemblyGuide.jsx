import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function AssemblyGuide({ src = '/assembly-guide.md' }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(src)
      .then((r) => r.text())
      .then(setContent)
      .catch(() => setContent('_Could not load assembly guide._'));
  }, [src]);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden my-3 flex flex-col" style={{ height: '260px' }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-white/80 flex-shrink-0">
        <div className="flex gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <span className="text-[10px] text-gray-400 font-mono">assembly-guide.md</span>
      </div>
      <div className="overflow-y-auto px-4 py-3 flex-1 min-h-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => <h1 className="text-sm font-bold text-gray-800 mt-3 mb-1 first:mt-0">{children}</h1>,
            h2: ({ children }) => <h2 className="text-xs font-bold text-gray-700 mt-2 mb-1 uppercase tracking-wide">{children}</h2>,
            h3: ({ children }) => <h3 className="text-xs font-semibold text-gray-600 mt-2 mb-0.5">{children}</h3>,
            p:  ({ children }) => <p  className="text-xs text-gray-600 leading-relaxed mb-1">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-1">{children}</ol>,
            li: ({ children }) => <li className="text-xs text-gray-600 leading-relaxed [&>p]:inline [&>p]:m-0">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
            img: ({ src: imgSrc, alt }) => (
              <img
                src={imgSrc}
                alt={alt}
                className="w-full rounded-lg my-1.5 border border-gray-200"
              />
            ),
            code: ({ children }) => <code className="bg-gray-200 text-gray-700 text-[10px] px-1 rounded font-mono">{children}</code>,
            hr: () => <hr className="border-gray-200 my-2" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
