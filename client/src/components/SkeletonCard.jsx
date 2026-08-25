import React from "react";

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="w-full h-40 rounded-xl skeleton-shimmer mb-4" />
            <div className="w-3/4 h-5 rounded skeleton-shimmer mb-2" />
            <div className="w-1/2 h-4 rounded skeleton-shimmer mb-4" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <div className="w-1/3 h-6 rounded skeleton-shimmer" />
            <div className="w-24 h-9 rounded-xl skeleton-shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}
