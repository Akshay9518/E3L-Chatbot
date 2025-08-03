import React from 'react'

const SkeletonLoader = () => {
  return (
    <div className="min-h-screen  text-white p-6 rounded-xl">
      <div className="animate-pulse">
        {/* Tab List Skeleton (optional, remove if not needed) */}
        <div className="flex gap-4 border-b border-gray-600 pb-2">
          <div className="h-10 w-24 bg-[#3a3a3a] rounded-t-lg"></div>
          <div className="h-10 w-24 bg-[#3a3a3a] rounded-t-lg"></div>
        </div>
        
        {/* Content Skeleton */}
        <div className="mt-4 space-y-6">
          {[1, 2].map((_, i) => (
            <div key={i} className="bg-[#2a2a2a] rounded-lg p-5 shadow border border-gray-600">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 w-48 bg-[#3a3a3a] rounded"></div>
                <div className="h-4 w-32 bg-[#3a3a3a] rounded"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((_, j) => (
                  <div key={j} className="bg-[#2a2a2a] rounded-lg p-4 flex flex-col gap-2 border border-gray-600">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-[#3a3a3a] h-10 w-10"></div>
                      <div className="h-4 w-40 bg-[#3a3a3a] rounded"></div>
                    </div>
                    <div className="flex items-center gap-2 pl-11">
                      <div className="h-4 w-4 bg-[#3a3a3a] rounded-full"></div>
                      <div className="h-4 w-20 bg-[#3a3a3a] rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader