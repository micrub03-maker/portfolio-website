import React, { useState, useEffect } from 'react';

const RecentReads = () => {
  const [currentRead, setCurrentRead] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);

  useEffect(() => {
    // Logan's recent reads - classic and sci-fi literature
    const recentReads = [
      {
        id: 1,
        title: "Letters from a Stoic",
        author: "Seneca",
        cover: "/images/seneca.jpg"
      },
      {
        id: 2,
        title: "The Odyssey",
        author: "Homer",
        cover: "/images/odyssey.jpg"
      },
      {
        id: 3,
        title: "Dune Messiah",
        author: "Frank Herbert",
        cover: "/images/dune-messiah.jpeg"
      },
      {
        id: 4,
        title: "Dune",
        author: "Frank Herbert",
        cover: "/images/dune.jpg"
      }
    ];

    setRecentBooks(recentReads);
  }, []);

  return (
    <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-white/20 hover:scale-105 transition-all h-full overflow-hidden">
      <div className="widget-gradient"></div>
      <div className="relative z-10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <p className="text-white font-semibold text-xs uppercase tracking-wide">Current Reads</p>
        </div>
        <span className="text-white/60 text-[11px] uppercase tracking-wide">4 most recent</span>
      </div>

      <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
        {recentBooks.map((book, index) => (
          <div
            key={book.id}
            className="group border border-white/10 rounded-xl overflow-hidden bg-white/5 flex flex-col"
          >
            <div className="relative h-32 overflow-hidden bg-black">
              {book.cover ? (
                <>
                  <img
                    src={book.cover}
                    alt={`${book.title} cover`}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div
                    className="absolute inset-0 hidden items-center justify-center bg-white/10"
                  >
                    <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/10">
                  <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5">
                <p className="text-white text-xs font-semibold leading-tight line-clamp-1">
                  {book.title}
                </p>
                <p className="text-white/70 text-[11px] leading-tight">
                  {book.author}
                </p>
              </div>
            </div>

            {index < 2 ? (
              <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-emerald-300 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-300 animate-pulse"></span>
                Now reading
              </div>
            ) : (
              <div className="px-3 py-2 text-[11px] text-white/50">
                #{book.id}
              </div>
            )}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};

export default RecentReads;
