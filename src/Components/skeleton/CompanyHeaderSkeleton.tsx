export default function CompanyHeaderSkeleton() {
  return (
    <div className="bg-[#1a1a1a] rounded-lg p-8 mb-8 animate-pulse border border-[#2a2a2a]">
      {/* Logo & Name Shimmer */}
      <div className="flex items-start gap-6 mb-6">
        {/* Logo placeholder */}
        <div className="w-24 h-24 bg-gradient-to-r from-[#2a2a2a] via-[#1e1e1e] to-[#2a2a2a] rounded-lg shimmer"></div>

        {/* Name & Info */}
        <div className="flex-1">
          <div className="h-8 bg-gradient-to-r from-[#2a2a2a] via-[#1e1e1e] to-[#2a2a2a] rounded w-1/3 mb-4 shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-[#2a2a2a] via-[#1e1e1e] to-[#2a2a2a] rounded w-1/4 mb-4 shimmer"></div>
          <div className="h-4 bg-gradient-to-r from-[#2a2a2a] via-[#1e1e1e] to-[#2a2a2a] rounded w-1/5 shimmer"></div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-[#2a2a2a] rounded-lg p-4">
            <div className="h-6 bg-gradient-to-r from-[#1e1e1e] via-[#1a1a1a] to-[#1e1e1e] rounded w-2/3 mb-2 shimmer"></div>
            <div className="h-4 bg-gradient-to-r from-[#1e1e1e] via-[#1a1a1a] to-[#1e1e1e] rounded w-1/2 shimmer"></div>
          </div>
        ))}
      </div>

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
