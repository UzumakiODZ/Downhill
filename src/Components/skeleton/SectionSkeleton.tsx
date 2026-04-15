interface SectionSkeletonProps {
  lines?: number;
}

export default function SectionSkeleton({ lines = 4 }: SectionSkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]">
          {/* Main line */}
          <div className="h-6 bg-gradient-to-r from-[#2a2a2a] via-[#1e1e1e] to-[#2a2a2a] rounded w-3/4 mb-3 shimmer"></div>

          {/* Secondary lines */}
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-[#2a2a2a] via-[#1e1e1e] to-[#2a2a2a] rounded w-full shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-[#2a2a2a] via-[#1e1e1e] to-[#2a2a2a] rounded w-5/6 shimmer"></div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .shimmer {
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
